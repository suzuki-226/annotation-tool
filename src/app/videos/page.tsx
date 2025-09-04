"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

type VideoData = {
  id: string;
  title: string;
  url: string;
};

export default function VideoListPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);

  // 🔄 動画リスト取得
  const fetchVideos = async () => {
    const snapshot = await getDocs(collection(db, "videos"));
    const videoData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<VideoData, "id">),
    }));
    setVideos(videoData);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 🧹 削除処理（動画 + アノテーション）
  const handleDeleteVideo = async (id: string, videoUrl: string) => {
    const confirmDelete = window.confirm("この動画を削除しますか？アノテーションも同時に削除されます。");
    if (!confirmDelete) return;

    try {
      // 動画削除
      await deleteDoc(doc(db, "videos", id));
      console.log("✅ Firestoreから動画を削除");

      // アノテーション削除（videoUrlが一致するもの）
      const annotationsSnapshot = await getDocs(collection(db, "annotations"));
      const batch = writeBatch(db);
      annotationsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.videoUrl === videoUrl) {
          batch.delete(doc(db, "annotations", docSnap.id));
        }
      });
      await batch.commit();
      console.log("✅ 関連アノテーションも削除");

      alert("削除完了");
      fetchVideos(); // リスト再読み込み
    } catch (error) {
      console.error("❌ 削除に失敗:", error);
      alert("削除に失敗しました");
    }
  };

  // 🎞️ Cloudinary サムネイル生成
  const getThumbnailUrl = (videoUrl: string) => {
    return videoUrl
      .replace("/upload/", "/upload/so_2/")
      .replace(".mp4", ".jpg");
  };

  return (
    <div className="p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">📁 アップロードされた動画一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="border p-4 rounded shadow">
            <p className="mb-1 font-medium">🎞️ {video.title}</p>
            <p className="text-sm text-gray-600">👤 アップロード者: {video.userEmail}</p> {/* ← 表示追加 */}
            <img
              src={getThumbnailUrl(video.url)}
              alt={`${video.title} のサムネイル`}
              className="w-32 h-auto rounded mx-auto mb-2"
            />
            <button
              onClick={() => handleDeleteVideo(video.id, video.url)} // ✅ 修正点
              className="text-red-600 hover:underline text-sm"
            >
              🗑️ 削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
