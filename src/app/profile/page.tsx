"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserProfile = {
  name: string;
  bio: string;
  icon?: string;
};

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    bio: "",
    icon: "",
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Firestoreから自分のプロフィールを取得
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name ?? user.displayName ?? "",
          bio: data.bio ?? "",
          icon: data.icon ?? user.photoURL ?? "",
        });
      } else {
        setProfile({
          name: user.displayName ?? "",
          bio: "",
          icon: user.photoURL ?? "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 44, textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#e24444" }}>
          ログインが必要です
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div
        style={{
          padding: 44,
          textAlign: "center",
          color: "#888",
          fontSize: 16,
        }}
      >
        読み込み中...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "54px auto",
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 20px #227ab918",
        padding: 32,
      }}
    >
      <h2
        style={{
          fontWeight: 900,
          fontSize: 22,
          marginBottom: 18,
          color: "#2294cb",
        }}
      >
        マイプロフィール
      </h2>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative" }}>
          {profile.icon ? (
            <Image
              src={profile.icon}
              alt="icon"
              width={68}
              height={68}
              style={{
                borderRadius: "50%",
                border: "2px solid #cce6fc",
                objectFit: "cover",
                boxShadow: "0 1px 7px #bde5ff33",
                cursor: "pointer",
              }}
              onClick={() => router.push("/profile/edit")}
              title="画像変更はこちら"
              unoptimized
            />
          ) : (
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#e3ebf3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#96a8be",
                fontSize: 28,
                marginRight: 14,
                cursor: "pointer",
              }}
              onClick={() => router.push("/profile/edit")}
              title="画像変更はこちら"
            >
              {profile.name?.slice(0, 1)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 19, color: "#298eea" }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 13, color: "#95adc5" }}>{user.email}</div>
        </div>
      </div>
      <div style={{ fontSize: 16, marginBottom: 10, color: "#444" }}>
        {profile.bio || (
          <span style={{ color: "#bbb" }}>（自己紹介が未入力です）</span>
        )}
      </div>
      <button
        onClick={() => router.push("/profile/edit")}
        style={{
          fontWeight: 900,
          fontSize: 15,
          color: "#fff",
          background: "#2294cb",
          border: "none",
          borderRadius: 10,
          padding: "10px 26px",
          cursor: "pointer",
          marginTop: 6,
        }}
        type="button"
      >
        プロフィール編集・ブロック管理はこちら
      </button>
    </div>
  );
}
