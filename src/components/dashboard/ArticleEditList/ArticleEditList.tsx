'use client';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/firebase";
import {
  collection, getDocs, doc, updateDoc, deleteDoc, addDoc, QueryDocumentSnapshot, DocumentData, Timestamp
} from "firebase/firestore";
import { Block } from "../dashboardConstants";
import toast from "react-hot-toast";
import ArticleListItem from "./ArticleListItem";
import FilterBar from "./FilterBar";
import styles from "./ArticleEditList.module.css";

type Post = {
  id: string;
  blocks: Block[];
  tags?: string[];
  createdAt?: Date | null;
  status?: "published" | "draft";
};

export default function ArticleEditList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // isSavingは現状未使用→削除

  // 記事リスト取得
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "posts"));
      setPosts(
        snap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          let createdAt: Date | null = null;
          if (data.createdAt instanceof Timestamp) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt && typeof data.createdAt.seconds === "number") {
            createdAt = new Date(data.createdAt.seconds * 1000);
          }
          return {
            id: doc.id,
            blocks: (data.blocks || []) as Block[],
            tags: (data.tags || []) as string[],
            createdAt,
            status: data.status === "published" ? "published" : "draft",
          };
        })
      );
    } catch (e) {
      toast.error("記事取得エラー: " + (e instanceof Error ? e.message : String(e)));
      console.error(e);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // 全タグ抽出
  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap(post => post.tags ?? []))).filter(Boolean),
    [posts]
  );

  // フィルタリング
  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (filterTag) filtered = filtered.filter(post => post.tags?.includes(filterTag));
    if (searchText.trim()) {
      const lower = searchText.trim().toLowerCase();
      filtered = filtered.filter(post =>
        post.blocks?.some(b => typeof b.content === "string" && b.content.toLowerCase().includes(lower))
      );
    }
    return filtered;
  }, [posts, filterTag, searchText]);

  // 記事保存（将来的に使うならonEdit内でsetEditingPostとセットで利用可能）
  const handleSave = async () => {
    if (!editingPost) return;
    if (editBlocks.length === 0) {
      toast.error("本文が空です。");
      return;
    }
    try {
      await updateDoc(doc(db, "posts", editingPost.id), { blocks: editBlocks, tags: editTags });
      toast.success("記事を更新しました！");
      setEditingPost(null);
      await fetchPosts();
    } catch (e) {
      toast.error("保存エラー: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // 単一記事削除
  const handleDelete = async (id: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "posts", id));
      toast.success("記事を削除しました。");
      await fetchPosts();
      setSelectedIds(selectedIds => selectedIds.filter(selectedId => selectedId !== id));
    } catch (e) {
      toast.error("削除エラー: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  // 複数選択削除
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`選択した${selectedIds.length}件を削除します。よろしいですか？`)) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deleteDoc(doc(db, "posts", id))));
      toast.success("選択した記事を削除しました。");
      await fetchPosts();
      setSelectedIds([]);
    } catch (e) {
      toast.error("一括削除エラー: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  // ステータス切り替え
  const handleToggleStatus = async (post: Post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await updateDoc(doc(db, "posts", post.id), { status: newStatus });
      toast.success(`ステータスを${newStatus === "published" ? "公開" : "下書き"}に変更しました。`);
      await fetchPosts();
    } catch (e) {
      toast.error("ステータス変更エラー: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // 複製
  const handleDuplicate = async (post: Post) => {
    try {
      await addDoc(collection(db, "posts"), {
        blocks: post.blocks,
        tags: post.tags || [],
        createdAt: new Date(),
        status: "draft",
      });
      toast.success("記事を複製しました。");
      await fetchPosts();
    } catch (e) {
      toast.error("複製エラー: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // モバイル判定
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 600);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // 全選択
  const isAllSelected = filteredPosts.length > 0 && filteredPosts.every(p => selectedIds.includes(p.id));
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredPosts.map(p => p.id) : []);
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>記事の編集・管理</h2>
      <div className={styles.batchDeleteBar}>
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={e => handleSelectAll(e.target.checked)}
          disabled={filteredPosts.length === 0}
        />
        <span>全選択</span>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={loading || selectedIds.length === 0}
          className={styles.deleteButton}
        >
          🗑️ 選択した記事を削除
        </button>
        <span className={styles.note}>
          ※選択した記事だけ削除されます
        </span>
      </div>
      <FilterBar
        searchText={searchText}
        setSearchText={setSearchText}
        allTags={allTags}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        isMobile={isMobile}
      />
      {loading ? (
        <div className={styles.loading}>読み込み中...</div>
      ) : filteredPosts.length === 0 ? (
        <div className={styles.empty}>記事がありません。</div>
      ) : (
        <ul className={styles.list}>
          {filteredPosts.map(post => (
            <ArticleListItem
              key={post.id}
              post={post}
              selected={selectedIds.includes(post.id)}
              onEdit={() => {
                setEditingPost(post);
                setEditBlocks(post.blocks || []);
                setEditTags(post.tags || []);
              }}
              onDelete={() => handleDelete(post.id)}
              onToggleStatus={() => handleToggleStatus(post)}
              onDuplicate={() => handleDuplicate(post)}
              onSelect={checked => handleSelectOne(post.id, checked)}
              isMobile={isMobile}
            />
          ))}
        </ul>
      )}
      {/* 編集モーダルや他のUIはこの後追加 */}
    </section>
  );
}
