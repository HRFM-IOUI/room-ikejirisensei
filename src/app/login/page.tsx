"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      // Firebase Authでログイン
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      // サーバーAPIでIDトークンをCookieにセット
      await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/dashboard");
    } catch {
      setError("ログインに失敗しました");
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
      <style>
        {`
          input::placeholder {
            color: #192349;
            opacity: 0.65;
          }
        `}
      </style>
      <div className="w-full max-w-md bg-white rounded shadow-md p-8 mt-12">
        <h1 className="text-2xl font-bold text-center mb-8">会員ログイン</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1" style={{ color: "#192349" }}>
              メールアドレス
            </label>
            <input
              type="email"
              autoComplete="username"
              className="w-full border border-gray-300 rounded px-3 py-2"
              style={{ color: "#192349" }}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@example.com"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" style={{ color: "#192349" }}>
              パスワード
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              style={{ color: "#192349" }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold rounded px-5 py-3 hover:bg-blue-800 transition"
          >
            ログイン
          </button>
          {error && <div className="mt-3 text-red-500 text-center">{error}</div>}
        </form>
        <div className="mt-6 text-center text-sm">
          <Link href="/signup" className="text-green-700 font-bold hover:underline">
            新規登録はこちら
          </Link>
          <span className="mx-2 text-gray-400">|</span>
          <Link href="#" className="text-blue-700 hover:underline">
            パスワードをお忘れですか？
          </Link>
        </div>
      </div>
    </div>
  );
}
