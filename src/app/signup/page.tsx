"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider"; // 🔸ログイン状態確認用
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig"; // ← signup ファイルの位置に応じてパス修正

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const { user } = useAuth(); // 🔸ログインユーザー確認

  // 🔒 すでにログインしていればトップへ
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users" , user.uid), {
        email: user.email,
        displayName,
        createdAt: serverTimestamp(),
      });
      console.log("✅ Firestore: users コレクションに保存しました");
      
      alert("✅ 新規登録に成功しました！");
      router.push("/"); // 🔁 ホームに遷移
    } catch (error: any) {
      alert("❌ 登録エラー: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <form
        onSubmit={handleSignUp}
        className="bg-gray-100 p-8 rounded shadow-md space-y-4 w-full max-w-sm"
      >
        <h1 className="text-xl font-semibold text-center">新規登録</h1>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="表示名（ニックネーム）"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          登録
        </button>

        {/* 🔗 ログイン画面へのリンク */}
        <p className="text-sm mt-4 text-center">
          すでにアカウントをお持ちですか？{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            ログインはこちら
          </Link>
        </p>
      </form>
    </div>
  );
}
