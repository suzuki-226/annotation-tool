"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";

export default function AnnotationTool({
  annotations,
  setAnnotations,
  player,
  videoUrl,
  refreshAnnotations,
}) {
  const [newAnnotation, setNewAnnotation] = useState("");
  const [annotationType, setAnnotationType] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");

  // 🔽 表示名を取得
  useEffect(() => {
    const fetchName = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setUserDisplayName(docSnap.data().displayName || "");
      }
    };
    fetchName();
  }, []);

  // 🔽 追加処理
  const addAnnotation = async () => {
    if (!player || typeof player.currentTime !== "function") {
      console.warn("playerが無効か、タイプが未選択です");
      return;
    }

    const time = player.currentTime();
    const annotationData = {
      text: newAnnotation,
      time,
      type: annotationType || "",
      videoUrl: videoUrl || "",
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || null,
      userEmail: auth.currentUser?.email || null,
      userDisplayName: userDisplayName || "",
    };

    try {
      const docRef = await addDoc(collection(db, "annotations"), annotationData);
      console.log("アノテーション保存成功:", docRef.id);
      setNewAnnotation("");
      setAnnotationType("");
      if (refreshAnnotations) await refreshAnnotations();
    } catch (error) {
      console.error("Firestore 保存失敗:", error);
    }
  };

  const deleteAnnotation = async (id) => {
    try {
      await deleteDoc(doc(db, "annotations", id));
      setAnnotations(annotations.filter((a) => a.id !== id));
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const jumpTo = (time) => {
    if (!player) return;
    setTimeout(() => {
      if (!player) return;
      player.currentTime(time);
      player.pause();
    }, 300);
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2 text-black">アノテーションツール</h2>
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value={newAnnotation}
          onChange={(e) => setNewAnnotation(e.target.value)}
          placeholder="アノテーションを追加"
          className="p-2 border rounded w-full text-black bg-white"
        />

        <div className="flex space-x-2">
          <button
            onClick={() => setAnnotationType("?")}
            className={`px-4 py-2 rounded ${annotationType === "?" ? "bg-yellow-500 text-white" : "bg-gray-400 hover:bg-yellow-600"}`}
          >
            ?
          </button>
          <button
            onClick={() => setAnnotationType("!")}
            className={`px-4 py-2 rounded ${annotationType === "!" ? "bg-red-500 text-white" : "bg-gray-400 hover:bg-red-300"}`}
          >
            !
          </button>
        </div>

        <button
          onClick={addAnnotation}
          disabled={!player || typeof player.currentTime !== "function"}
          className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 ml-2"
        >
          追加
        </button>
      </div>

      {/* 🔽 一覧表示 */}
      <ul className="space-y-1">
        {annotations.map((a, index) => (
          <li
            key={a.id || index}
            onClick={() => jumpTo(a.time)}
            className="text-base text-black cursor-pointer hover:bg-blue-100 rounded px-2 py-1 flex justify-between items-center"
          >
            <span>
              {a.type === "?" ? "❓" : a.type === "!" ? "❗" : ""}
              ⏱ [{a.time.toFixed(1)}秒] {a.text}
              <span className="block text-xs text-gray-600">
                👤 {a.userDisplayName || "（不明）"}
              </span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAnnotation(a.id);
              }}
              className="ml-2 text-red-500 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

