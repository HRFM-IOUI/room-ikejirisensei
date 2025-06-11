"use client";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { httpsCallable, getFunctions } from "firebase/functions";
import { collection, getDocs } from "firebase/firestore";

// --- User型
type User = {
  uid: string;
  email: string;
  displayName?: string;
  member?: boolean;
  phone_verified?: boolean;
  age?: number;
  kyc_verified?: boolean;
  admin?: boolean;
};

export default function AdminUserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 管理者認証チェック
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) window.location.href = "/";
    });
    return unsubscribe;
  }, []);

  // Firestoreからユーザー一覧取得
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "users"));
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User)));
      setLoading(false);
    }
    fetchUsers();
  }, []);

  // 属性付与（Cloud Functions経由）
  const handleSetClaims = async (uid: string, claims: Partial<User>) => {
    const functions = getFunctions();
    const setCustomClaims = httpsCallable(functions, "setCustomClaims");
    try {
      await setCustomClaims({ uid, claims });
      alert("クレーム付与に成功しました！");
    } catch (err: unknown) {
      alert("クレーム付与に失敗しました：" + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2471c7" }}>会員管理ダッシュボード</h2>
      {loading ? (
        <div>読込中…</div>
      ) : (
        <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eaf3ff", color: "#2471c7", fontWeight: 700 }}>
              <th style={{ padding: "8px 6px" }}>メールアドレス</th>
              <th style={{ padding: "8px 6px" }}>表示名</th>
              <th style={{ padding: "8px 6px" }}>承認</th>
              <th style={{ padding: "8px 6px" }}>属性（現状）</th>
              <th style={{ padding: "8px 6px" }}>アクション</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} style={{ borderBottom: "1px solid #e3e9f7" }}>
                <td style={{ padding: "8px 6px" }}>{u.email}</td>
                <td style={{ padding: "8px 6px" }}>{u.displayName || "-"}</td>
                <td style={{ padding: "8px 6px" }}>{u.member ? "承認済み" : "未承認"}</td>
                <td style={{ padding: "8px 6px", fontSize: 13 }}>
                  {[
                    u.phone_verified ? "電話認証" : "",
                    typeof u.age === "number" ? `年齢:${u.age}` : "",
                    u.kyc_verified ? "KYC済" : "",
                    u.admin ? "管理者" : "",
                  ].filter(Boolean).join("／")}
                </td>
                <td style={{ padding: "8px 6px" }}>
                  {!u.member && (
                    <button
                      style={{
                        color: "#fff",
                        background: "#47b2f2",
                        borderRadius: 8,
                        padding: "8px 16px",
                        border: "none"
                      }}
                      onClick={() => handleSetClaims(u.uid, { member: true })}
                    >
                      会員承認
                    </button>
                  )}
                  <button
                    style={{
                      color: "#fff",
                      background: "#65d184",
                      borderRadius: 8,
                      padding: "8px 12px",
                      border: "none",
                      marginLeft: 6
                    }}
                    onClick={() => handleSetClaims(u.uid, { phone_verified: true })}
                  >
                    電話認証付与
                  </button>
                  <button
                    style={{
                      color: "#fff",
                      background: "#f5c169",
                      borderRadius: 8,
                      padding: "8px 12px",
                      border: "none",
                      marginLeft: 6
                    }}
                    onClick={() => {
                      const ageStr = prompt("年齢を入力してください");
                      const age = ageStr ? parseInt(ageStr, 10) : NaN;
                      if (!isNaN(age)) handleSetClaims(u.uid, { age });
                    }}
                  >
                    年齢付与
                  </button>
                  <button
                    style={{
                      color: "#fff",
                      background: "#d77ba8",
                      borderRadius: 8,
                      padding: "8px 12px",
                      border: "none",
                      marginLeft: 6
                    }}
                    onClick={() => handleSetClaims(u.uid, { kyc_verified: true })}
                  >
                    KYC認証付与
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
