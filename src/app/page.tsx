"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import AnnotationTool from "../components/AnnotationTool";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./providers/AuthProvider";
import { useRouter } from "next/navigation";
import React from 'react';
// import VideoTrimTool from '../../trim-tool/src/components/VideoTrimTool';

/*const VideoTrimTool = dynamic(() => import('@/components/VideoTrimTool'), {
  ssr: false,
});*/

const VideoPlayer = dynamic(() => import("../components/VideoPlayer"), {
  ssr: false,
});

type VideoData = { title: string; url: string;userEmail?: string; };

export default function Home() {
  const [videoList, setVideoList] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [allAnnotations, setAllAnnotations] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  const playerRef = useRef(null);
  const [hasLoadedFromLocalStorage, setHasLoadedFromLocalStorage] = useState(false);

  const { currentUser, isAuthLoading } = useAuth();
  const router = useRouter();

  // 🔽 認証状態が false の場合、ログインへリダイレクト
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push("/login");
    }
  }, [isAuthLoading, currentUser, router]);

  // 🔽 Firestore から動画一覧取得
  useEffect(() => {
    const fetchVideos = async () => {
      const snapshot = await getDocs(collection(db, "videos"));
      const videos = snapshot.docs.map((doc) => doc.data() as VideoData);
      setVideoList(videos);
      if (videos.length > 0) setSelectedVideo(videos[0].url);
    };
    fetchVideos();
  }, []);

  // 🔽 Firestore からアノテーション取得
  const fetchAnnotations = async () => {
    const data = await getDocs(collection(db, "annotations"));
    const loaded = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const grouped = loaded.reduce((acc, annotation) => {
      const video = annotation.videoUrl;
      if (!acc[video]) acc[video] = [];
      acc[video].push(annotation);
      return acc;
    }, {});
    setAllAnnotations(grouped);
  };

  // 🔽 ローカルストレージから読み込み
  useEffect(() => {
    const stored = localStorage.getItem("annotations");
    if (stored) setAllAnnotations(JSON.parse(stored));
    setHasLoadedFromLocalStorage(true);
  }, []);

  // 🔽 Firestore 読み込み
  useEffect(() => {
    if (hasLoadedFromLocalStorage) {
      fetchAnnotations();
    }
  }, [hasLoadedFromLocalStorage]);

  // 🔽 ローカルストレージへ保存
  useEffect(() => {
    localStorage.setItem("annotations", JSON.stringify(allAnnotations));
  }, [allAnnotations]);

  const annotations = allAnnotations[selectedVideo] || [];

  const handleSetAnnotations = (newAnnotations) => {
    setAllAnnotations({
      ...allAnnotations,
      [selectedVideo]: newAnnotations,
    });
  };

  const handleVideoChange = (e) => {
    setSelectedVideo(e.target.value);
  };

  // ✅ 認証完了までは何も表示しない（この位置で return）
  if (isAuthLoading || !currentUser) return null;

  return (
    <div className="p-8 h-screen bg-white">
      <h1 className="text-2xl font-semibold mb-4 text-black">動画アノテーション</h1>

      <select
        onChange={handleVideoChange}
        value={selectedVideo}
        className="mb-4 p-2 border rounded text-black bg-white"
      >
        {videoList.map((video, idx) => (
          <option key={idx} value={video.url}>
            🎞️ {video.title}
          </option>
        ))}
      </select>

      {videoList.length > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          👤 投稿者:{" "}
          {videoList.find((v) => v.url === selectedVideo)?.userEmail || "不明"}
        </p>
      )}

      <div className="flex space-x-4">
        {/* 動画プレイヤー */}
        <div className="flex-1">
          <div className="max-h-[60vh]">
            {selectedVideo ? (
              <VideoPlayer
                videoUrl={selectedVideo}
                onTimeUpdate={setCurrentTime}
                playerRef={playerRef}
                onReady={setPlayer}
              />
            ) : (
              <p>動画を読み込み中...</p>
            )}
          </div>

          {/* 表示中のアノテーション */}
          <div className="my-4">
            {annotations
              .filter((a) => Math.abs(a.time - currentTime) < 1)
              .map((a, i) => (
                <div key={i} className="p-2 bg-blue-300 text-black rounded my-1">
                  <p className="text-lg">
                    {a.type === "?" ? "❓" : a.type === "!" ? "❗" : ""}
                    ⏱ {a.text}
                  </p>
                  <p className="text-xs text-gray-700">👤 {a.userEmail}</p> {/* ← 表示追加 */}
                </div>
              ))}
          </div>
        </div>

        {/* アノテーションツール */}
        <div className="w-1/3">
          <AnnotationTool
            annotations={annotations}
            setAnnotations={handleSetAnnotations}
            player={player}
            videoUrl={selectedVideo}
            refreshAnnotations={fetchAnnotations}
          />
        </div>
      </div>
    </div>
  );
}
