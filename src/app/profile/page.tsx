"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDisplayName(docSnap.data().displayName || "");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
      });
      alert("✅ 表示名を更新しました！");
    } catch (error) {
      console.error("❌ 更新エラー:", error);
    }
  };

  if (loading) return <p className="p-4">読み込み中...</p>;

  return (
    <div className="p-8 text-black">
      <h1 className="text-xl font-bold mb-4">プロフィール編集</h1>
      <p>ここでニックネームの変更ができます。</p>
      <label className="block mb-2">表示名（ニックネーム）</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        保存
      </button>
    </div>
  );
}
