"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // ✅ ログイン後にホームへ遷移
    } catch (err: any) {
      alert("ログイン失敗: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">ログイン</h1>
        
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>

        {/* 🔽 ボタンの下に表示される新規登録リンク */}
        <p className="text-sm mt-4 text-center">
          アカウントをお持ちでない方は{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            こちらから登録
          </a>
        </p>
      </div>
    </div>
  );
}
