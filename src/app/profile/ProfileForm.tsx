"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

export default function ProfileForm() {
  const [user] = useAuthState(auth);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ブロックリスト
  const [blocked, setBlocked] = useState<{ uid: string, name: string }[]>([]);

  // プロフィール取得
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const fetch = async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setName(snap.data().name || "");
        setBio(snap.data().bio || "");
        setIcon(snap.data().icon || user.photoURL || "");
      } else {
        setName(user.displayName || "");
        setBio("");
        setIcon(user.photoURL || "");
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  // ブロックリスト取得
  useEffect(() => {
    if (!user) return;
    const blocksRef = collection(db, "users", user.uid, "blocks");
    return onSnapshot(blocksRef, async snap => {
      const blocks = await Promise.all(
        snap.docs.map(async d => {
          const userRef = doc(db, "users", d.id);
          const userSnap = await getDoc(userRef);
          return { uid: d.id, name: userSnap.exists() ? userSnap.data().name || d.id : d.id };
        })
      );
      setBlocked(blocks);
    });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, {
      name,
      bio,
      icon,
      updatedAt: new Date()
    }, { merge: true });
    toast.success("プロフィールを保存しました！");
  }

  // プロフィール画像アップロード
  async function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      toast.error("画像ファイル(jpg/png/gif)・10MB以内で選択してください");
      return;
    }
    setUploading(true);
    try {
      const storage = getStorage();
      const ext = file.name.split(".").pop();
      const path = `profileIcons/${user.uid}_${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setIcon(url);
      await setDoc(doc(db, "users", user.uid), { icon: url }, { merge: true });
      toast.success("プロフィール画像を変更しました！");
    } catch (err: any) {
      toast.error("画像のアップロードに失敗しました");
    }
    setUploading(false);
  }

  // ブロック解除
  async function handleUnblock(uid: string) {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "blocks", uid));
    toast.success("ブロック解除しました");
  }

  if (!user) return <div>ログインが必要です。</div>;
  if (loading) return <div>読込中...</div>;

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 410, margin: "0 auto" }}>
      {/* プロフィール画像 */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <label style={{ cursor: "pointer" }}>
          <img
            src={icon || "/default-icon.png"}
            alt="プロフィール画像"
            width={92}
            height={92}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #b5d6ff",
              boxShadow: "0 2px 12px #b1d8ff38",
              marginBottom: 6,
            }}
          /><br />
          <input
            type="file"
            accept="image/*"
            onChange={handleIconChange}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <span style={{
            display: "inline-block", marginTop: 2,
            color: "#2370bc", fontWeight: 700, fontSize: 14,
            border: "1px solid #bde0fa", borderRadius: 7, padding: "3px 14px", background: "#eaf4ff", cursor: uploading ? "not-allowed" : "pointer"
          }}>
            {uploading ? "アップロード中…" : "画像変更"}
          </span>
        </label>
      </div>

      {/* 名前 */}
      <div>
        <label style={{ fontWeight: 700, fontSize: 15, color: "#2370bc" }}>
          名前
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{
            width: "100%", padding: 11, borderRadius: 9,
            border: "1.3px solid #bde0fa", marginTop: 6, fontSize: 15
          }}
        />
      </div>
      {/* 自己紹介 */}
      <div>
        <label style={{ fontWeight: 700, fontSize: 15, color: "#2370bc" }}>
          自己紹介
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={4}
          style={{
            width: "100%", padding: 11, borderRadius: 9,
            border: "1.3px solid #bde0fa", marginTop: 6, fontSize: 15
          }}
        />
      </div>
      {/* ブロックリスト */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, color: "#c44", marginBottom: 4, fontSize: 15 }}>
          ブロック中のユーザー
        </div>
        {blocked.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 14 }}>ブロック中のユーザーはいません。</div>
        ) : (
          <ul style={{ paddingLeft: 12 }}>
            {blocked.map(u => (
              <li key={u.uid} style={{ marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#2566c8" }}>{u.name}</span>
                <button
                  onClick={() => handleUnblock(u.uid)}
                  type="button"
                  style={{
                    background: "#e3f0fa",
                    border: "1px solid #aad2fa",
                    borderRadius: 8,
                    padding: "3px 12px",
                    color: "#2690db",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >解除</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        style={{
          background: "#2593e1",
          color: "#fff",
          fontWeight: 900,
          fontSize: 16,
          border: "none",
          borderRadius: 10,
          padding: "12px 0",
          marginTop: 8
        }}
        disabled={uploading}
      >
        保存
      </button>
    </form>
  );
}
