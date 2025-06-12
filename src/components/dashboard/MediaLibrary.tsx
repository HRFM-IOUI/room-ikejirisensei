"use client";
import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";

const LANG = "ja";
const LABELS = {
  upload:      { ja: "画像/動画をアップロード", en: "Upload Image/Video", /* ...省略... */ },
  uploading:   { ja: "アップロード中...",         en: "Uploading...", /* ... */ },
  uploaded:    { ja: "アップロード完了",          en: "Upload complete", /* ... */ },
  uploadError: { ja: "アップロード失敗",          en: "Upload failed", /* ... */ },
  searchPlaceholder: { ja: "タイトルまたはタグ", en: "Title or tag", /* ... */ },
  urlCopied:   { ja: "URLをコピーしました！",     en: "URL copied!", /* ... */ },
  save:        { ja: "保存",                     en: "Save", /* ... */ },
  cancel:      { ja: "キャンセル",               en: "Cancel", /* ... */ },
  edit:        { ja: "編集",                     en: "Edit", /* ... */ },
  delete:      { ja: "削除",                     en: "Delete", /* ... */ },
  deleted:     { ja: "削除しました",             en: "Deleted", /* ... */ },
  deleteConfirm: { ja: "本当に削除しますか？",   en: "Are you sure to delete?", /* ... */ },
  editing:     { ja: "編集中...",                en: "Editing...", /* ... */ },
  saveSuccess: { ja: "保存しました",             en: "Saved", /* ... */ },
  saveError:   { ja: "保存失敗",                 en: "Save failed", /* ... */ },
  items:       { ja: "件表示中",                 en: "items", /* ... */ },
  preview:     { ja: "プレビュー",               en: "Preview", /* ... */ }
};

const TAG_COLORS = ["#5b8dee", "#f56c6c", "#1abc9c", "#fbc531", "#e17055", "#00b894", "#192349"];

type MediaItem = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  type: "image" | "video";
  tags?: string[];
  createdAt?: Date | { toDate(): Date } | null;
};

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState<string>("");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 一覧取得
  useEffect(() => { fetchMedia(); }, []);
  // 検索フィルタリング
  useEffect(() => {
    let list = [...mediaList];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        m => m.name?.toLowerCase().includes(s)
          || (m.tags && m.tags.some(tag => tag.toLowerCase().includes(s)))
      );
    }
    setFiltered(list);
  }, [search, mediaList]);

  async function fetchMedia() {
    const snap = await getDocs(query(collection(db, "media"), orderBy("createdAt", "desc")));
    setMediaList(snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt?.toDate?.() ?? d.data().createdAt) ?? null
    } as MediaItem)));
  }

  // 動画サムネ自動生成
  function extractThumbnail(file: File, seekTo = 1.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.currentTime = seekTo;
      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("サムネイル生成失敗")), "image/jpeg", 0.92);
      };
      video.onerror = () => reject(new Error("動画読み込み失敗"));
    });
  }

  // アップロード処理
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.loading(LABELS.uploading[LANG], { id: "upload" });
    const ext = file.type.startsWith("image") ? "image" : "video";
    const now = Date.now();
    const fileRef = ref(storage, `media/${file.name}_${now}`);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      let thumbnailUrl: string | undefined;
      if (ext === "video") {
        try {
          const thumbBlob = await extractThumbnail(file, 1.0);
          const thumbRef = ref(storage, `media/${file.name}_${now}_thumb.jpg`);
          await uploadBytes(thumbRef, thumbBlob);
          thumbnailUrl = await getDownloadURL(thumbRef);
        } catch (thumbErr) {
          console.warn("サムネイル自動生成に失敗", thumbErr);
        }
      }
      const data: Omit<MediaItem, "id"> = {
        url,
        name: file.name,
        type: ext,
        tags: [],
        createdAt: new Date(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      };
      await addDoc(collection(db, "media"), data);
      fetchMedia();
      toast.success(LABELS.uploaded[LANG], { id: "upload" });
    } catch {
      toast.error(LABELS.uploadError[LANG], { id: "upload" });
    }
    setUploading(false);
  }

  async function handleDelete(item: MediaItem) {
    if (!window.confirm(LABELS.deleteConfirm[LANG])) return;
    try {
      await deleteDoc(doc(db, "media", item.id));
      fetchMedia();
      toast.success(LABELS.deleted[LANG]);
    } catch {
      toast.error(LABELS.saveError[LANG]);
    }
  }

  function startEdit(item: MediaItem) {
    setEditId(item.id);
    setEditTitle(item.name);
    setEditTags((item.tags || []).join(" "));
  }

  async function saveEdit(id: string) {
    toast.loading(LABELS.editing[LANG], { id: "save" });
    try {
      await updateDoc(doc(db, "media", id), {
        name: editTitle.trim(),
        tags: editTags.split(" ").map(t => t.trim()).filter(Boolean),
      });
      setEditId(null); setEditTitle(""); setEditTags("");
      fetchMedia();
      toast.success(LABELS.saveSuccess[LANG], { id: "save" });
    } catch {
      toast.error(LABELS.saveError[LANG], { id: "save" });
    }
  }

  function openPreview(item: MediaItem) {
    setPreviewUrl(item.thumbnailUrl || item.url);
    setPreviewType(item.type);
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    toast.success(LABELS.urlCopied[LANG]);
  }

  function filterByTag(tag: string) { setSearch(tag); }

  // --- UI ---
  return (
    <div style={{
      display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", width: "100%", minHeight: 400
    }}>
      <Toaster position="top-center" />
      {/* サイドバー */}
      <aside style={{
        minWidth: 220, maxWidth: 270, borderRight: "1px solid #eee", padding: 16
      }}>
        <div style={{ fontWeight: 800, color: "#192349", fontSize: 18, marginBottom: 12 }}>
          検索・タグ
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={LABELS.searchPlaceholder[LANG]}
          style={{
            width: "100%", marginBottom: 18, padding: 8,
            borderRadius: 8, border: "1px solid #d7e2ed", fontSize: 16, color: "#192349"
          }}
          aria-label={LABELS.searchPlaceholder[LANG]}
        />
        <div style={{ fontWeight: 700, fontSize: 14, color: "#192349", marginBottom: 6 }}>タグで絞込</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {[...new Set(mediaList.flatMap(i => i.tags || []))].map((tag, i) => (
            <span key={`tag-${tag}-${i}`}
              onClick={() => filterByTag(tag)}
              style={{
                background: TAG_COLORS[i % TAG_COLORS.length],
                color: "#fff", fontWeight: 700, borderRadius: 9,
                padding: "4px 13px", fontSize: 13, cursor: "pointer",
                marginBottom: 3
              }}
              aria-label={`Filter by tag: #${tag}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </aside>
      {/* メイン */}
      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
        {/* アップロードUI */}
        <div style={{
          marginBottom: 22, padding: 14, background: "#f8f8f8",
          borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={handleUpload}
            aria-label={LABELS.upload[LANG]}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "#00bbee",
              color: "#fff", fontWeight: 800, padding: "11px 29px",
              border: "none", borderRadius: 8, fontSize: 16,
              cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1,
            }}
            aria-label={LABELS.upload[LANG]}
          >
            {uploading ? LABELS.uploading[LANG] : LABELS.upload[LANG]}
          </button>
          <span style={{ fontSize: 15, color: "#888", marginLeft: 12 }}>
            {filtered.length}{LABELS.items[LANG]}
          </span>
        </div>
        {/* メディアグリッド */}
        <div className="media-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 22, width: "100%"
        }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: "#fff", borderRadius: 11, boxShadow: "0 2px 14px #2221bb0d",
              padding: 14, display: "flex", flexDirection: "column", alignItems: "center", position: "relative"
            }}>
              <div style={{ width: "100%", cursor: "pointer" }} onClick={() => openPreview(item)} aria-label={LABELS.preview[LANG]}>
                {item.type === "image" ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={320}
                    height={180}
                    style={{
                      maxWidth: "100%", borderRadius: 8, objectFit: "cover", marginBottom: 10
                    }}
                  />
                ) : (
                  <video
                    src={item.thumbnailUrl || item.url}
                    poster={item.thumbnailUrl}
                    controls
                    style={{ width: "100%", minHeight: 120, borderRadius: 8, background: "#000", marginBottom: 10 }}
                  />
                )}
              </div>
              {/* タイトル編集 or 表示 */}
              {editId === item.id ? (
                <div style={{ width: "100%", marginBottom: 8 }}>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{
                      width: "100%", padding: 6, borderRadius: 7, border: "1px solid #d7e2ed",
                      fontSize: 15, color: "#192349", fontWeight: 700
                    }}
                    aria-label="タイトル編集"
                  />
                  <input
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    placeholder="タグ(半角スペース区切り)"
                    style={{
                      width: "100%", marginTop: 7, padding: 6, borderRadius: 7, border: "1px solid #eaeaea",
                      fontSize: 14, color: "#192349"
                    }}
                    aria-label="タグ編集"
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => saveEdit(item.id)}
                      style={{
                        background: "#5b8dee", color: "#fff", border: "none",
                        padding: "6px 15px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer"
                      }}
                      aria-label={LABELS.save[LANG]}
                    >{LABELS.save[LANG]}</button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      style={{
                        background: "#eee", color: "#192349", border: "none",
                        padding: "6px 15px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer"
                      }}
                      aria-label={LABELS.cancel[LANG]}
                    >{LABELS.cancel[LANG]}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, color: "#192349", fontSize: 16, marginBottom: 4, width: "100%" }}>
                    {item.name}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6, width: "100%" }}>
                    {(item.tags || []).map((tag, i) => (
                      <span key={`tagval-${tag}-${i}`} style={{
                        background: TAG_COLORS[i % TAG_COLORS.length],
                        color: "#fff", borderRadius: 7, padding: "2px 9px", fontSize: 13, fontWeight: 600
                      }}>#{tag}</span>
                    ))}
                  </div>
                </>
              )}
              <div style={{
                display: "flex", gap: 8, width: "100%", marginTop: 2,
                justifyContent: "flex-end", flexWrap: "wrap"
              }}>
                <button
                  type="button"
                  onClick={() => handleCopy(item.url)}
                  style={{
                    background: "#e3eaf6", color: "#192349", border: "none", borderRadius: 7,
                    padding: "6px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer"
                  }}
                  aria-label={LABELS.urlCopied[LANG]}
                >URLコピー</button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  style={{
                    background: "#f6e58d", color: "#192349", border: "none", borderRadius: 7,
                    padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}
                  aria-label={LABELS.edit[LANG]}
                >{LABELS.edit[LANG]}</button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  style={{
                    background: "#ffeaea", color: "#c00", border: "none", borderRadius: 7,
                    padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer"
                  }}
                  aria-label={LABELS.delete[LANG]}
                >{LABELS.delete[LANG]}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* プレビューモーダル */}
      {previewUrl && (
        <div
          style={{
            position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
            background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
          }}
          onClick={() => {
            setPreviewUrl(null);
            setPreviewType(null);
          }}
          aria-label={LABELS.preview[LANG]}
        >
          <div style={{
            background: "#fff", borderRadius: 13, padding: 35, maxWidth: "96vw", maxHeight: "95vh"
          }}>
            {previewType === "video" ? (
              <video src={previewUrl} controls style={{ maxWidth: 600, maxHeight: 420, background: "#000" }} />
            ) : (
              <Image
                src={previewUrl}
                alt="media"
                width={500}
                height={400}
                style={{
                  maxWidth: 500, maxHeight: 400, borderRadius: 13,
                  objectFit: "contain", border: "1px solid #ddd"
                }}
              />
            )}
          </div>
        </div>
      )}
      <div style={{ height: 38, width: "100%" }} />
      <style>{`
        @media (max-width: 800px) {
          aside { min-width: 0 !important; max-width: 100vw !important; border: none !important; }
          div[style*="display: flex"][style*="gap: 24px"] { flex-direction: column !important; }
          .media-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; }
        }
      `}</style>
    </div>
  );
}
