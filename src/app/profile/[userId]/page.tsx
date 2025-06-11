"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

// プロフィール型を明示
type Profile = {
  name: string;
  bio?: string;
  icon?: string;
};

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name ?? "",
          bio: data.bio ?? "",
          icon: data.icon ?? data.iconUrl ?? "", // 互換性のため
        });
        setName(data.name ?? "");
        setBio(data.bio ?? "");
      }
    })();
  }, [userId]);

  const handleSave = async () => {
    if (!user || !userId) return;
    await updateDoc(doc(db, "users", userId), { name, bio });
    setEditMode(false);
    setProfile(prev => prev ? { ...prev, name, bio } : null);
  };

  if (!profile) return <div>Loading...</div>;

  const isMine = user?.uid === userId;

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "44px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 20px #1888ee12",
        padding: 32,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 22,
          color: "#197ec7",
          marginBottom: 14,
        }}
      >
        プロフィール
      </div>
      {/* アイコン */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#dce8f7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 32,
            color: "#5792e0",
            overflow: "hidden",
          }}
        >
          {profile.icon ? (
            <Image
              src={profile.icon}
              alt="icon"
              width={90}
              height={90}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              unoptimized
            />
          ) : (
            profile.name?.[0]?.toUpperCase() ?? "？"
          )}
        </div>
      </div>
      {editMode ? (
        <>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="名前"
            style={{
              width: "100%",
              marginBottom: 10,
              padding: 9,
              borderRadius: 7,
              border: "1.3px solid #c6e3f6",
              fontSize: 17,
            }}
          />
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="自己紹介"
            rows={3}
            style={{
              width: "100%",
              marginBottom: 10,
              padding: 9,
              borderRadius: 7,
              border: "1.3px solid #c6e3f6",
              fontSize: 16,
            }}
          />
          <button
            onClick={handleSave}
            style={{
              padding: "10px 26px",
              borderRadius: 9,
              background: "#2397e6",
              color: "#fff",
              fontWeight: 800,
              border: "none",
            }}
          >
            保存
          </button>
          <button
            onClick={() => setEditMode(false)}
            style={{ marginLeft: 10 }}
            type="button"
          >
            キャンセル
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              fontWeight: 800,
              fontSize: 18,
              color: "#234",
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#666",
              marginBottom: 12,
            }}
          >
            {profile.bio ?? "（自己紹介未記入）"}
          </div>
          {isMine && (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: "8px 20px",
                borderRadius: 9,
                background: "#2991ec",
                color: "#fff",
                fontWeight: 800,
                border: "none",
              }}
              type="button"
            >
              編集
            </button>
          )}
        </>
      )}
    </div>
  );
}
