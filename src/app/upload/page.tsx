"use client";

import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // ← パスは相対パスで確認
import { auth } from"../../firebase/firebaseConfig";

export default function UploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // ✅ ローディング状態追加
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("upload_preset", "my_unsigned_preset");

    setIsUploading(true); // ✅ アップロード開始

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dntxoigaf/video/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("✅ アップロード完了:", data.secure_url);
       // 🔽 Firestore 保存前にログ追加
      console.log("📦 Firestore に保存します");
      setUploadedUrl(data.secure_url);
      // 🔽 Firestore に保存
      await addDoc(collection(db, "videos"), {
        title: videoFile.name,
        url: data.secure_url,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || null,
        userEmail: auth.currentUser?.email || null,
      });
      console.log("✅ Firestore 保存成功");
    } catch (error) {
      console.error("❌ アップロードまたは保存失敗:", error);
    } finally {
      setIsUploading(false); // ✅ 終了時に戻す
    }
  };

  return (
    <div className="p-4 bg-white text-black min-h-screen">
      {/* ← ここから下が中身 */}

      <h1 className="text-2xl mb-4">🎥 動画アップロード</h1>

      <div className="flex items-center space-x-4 mb-4 ml-8">
        {/* ファイル選択ラベル */}
        <label
          htmlFor="video-upload"
          className="block w-72 p-3 text-center border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100"
        >
          {videoFile ? `🎞️ ${videoFile.name.slice(0, 20)}${videoFile.name.length > 20 ? "..." : ""}` : "🎬 動画を選択"}
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* アップロードボタン */}
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`px-4 py-2 rounded text-white whitespace-nowrap ${
            isUploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isUploading ? "アップロード中..." : "アップロード"}
        </button>
      </div>

      {/* 動画プレビュー */}
      {uploadedUrl && (
        <video
          src={uploadedUrl}
          controls
          className="mt-4 mx-auto max-w-full max-h-[600px] rounded shadow"
        />
      )}
    </div>
  );
}
