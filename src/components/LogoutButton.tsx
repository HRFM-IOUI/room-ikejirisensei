// 任意のファイル（例：src/components/LogoutButton.tsx）

"use client";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // パスはプロジェクト構成に合わせて

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut(auth);
    // 任意でリダイレクト（例: トップに戻す場合）
    window.location.href = "/";
  };

  return (
    <button onClick={handleLogout}>
      ログアウト
    </button>
  );
}
