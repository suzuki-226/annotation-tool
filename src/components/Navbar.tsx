"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const [userDisplayName, setUserDisplayName] = useState<string | null>("loading");

  // ✅ ログイン状態とユーザー名の取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserDisplayName(userDoc.data().displayName || user.email || "");
          } else {
            setUserDisplayName(user.email || "ユーザー");
          }
        } catch (error) {
          console.error("ユーザー情報の取得に失敗:", error);
          setUserDisplayName(user.email || "ユーザー");
        }
      } else {
        setUserDisplayName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUserDisplayName(null);
  };

  const linkClass = (path: string) =>
    `hover:underline px-2 py-1 rounded ${
      pathname === path ? "bg-blue-200 font-bold text-black" : "text-gray-700"
    }`;

  return (
    <nav className="bg-gray-100 border-b px-6 py-3 flex justify-between items-center shadow">
      {/* 左側リンク */}
      <div className="space-x-4">
        <Link href="/" className={linkClass("/")}>
          🏠 ホーム（アノテーション）
        </Link>
        <Link href="/upload" className={linkClass("/upload")}>
          ⬆️ アップロード
        </Link>
        <Link href="/videos" className={linkClass("/videos")}>
          📁 動画一覧
        </Link>
        <Link href="/profile" className={linkClass("/profile")}>
          ⚙️ プロフィール
        </Link>
      </div>

      {/* 右側：ユーザー情報とログアウト */}
      {userDisplayName === "loading" ? null : userDisplayName ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-800">👤 {userDisplayName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-600 hover:underline"
          >
            ログアウト
          </button>
        </div>
      ) : null}
    </nav>
  );
}
