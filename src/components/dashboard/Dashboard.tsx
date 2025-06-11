"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";
import LogoutButton from "../LogoutButton";
import DashboardSidebar from "./DashboardSidebar";
import DashboardRightPanel from "./DashboardRightPanel";
import DashboardFooter from "./DashboardFooter";
import FullscreenEditorModal from "./FullscreenEditorModal";
import PreviewModal from "./PreviewModal";
import ArticleEditor from "./ArticleEditor";
import DashboardCarouselTabs from "./DashboardCarouselTabs";
import DashboardColorPicker from "./DashboardColorPicker";
import MatrixLanguageRain from "./MatrixLanguageRain";
import VideoEditor from "./VideoEditor";
import MediaLibrary from "./MediaLibrary";
import AdminUserManager from "../admin/AdminUserManager";
import AnalyticsArticleRanking from "./AnalyticsArticleRanking";
import AnalyticsReferralSources from "./AnalyticsReferralSources";
import AnalyticsUserCount from "./AnalyticsUserCount";
import AnalyticsVideoRanking from "./AnalyticsVideoRanking";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./DashboardCarouselTabs.css";

import {
  createBlock,
  Block,
  BlockType,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PRESETS,
  BG_COLOR_PRESETS,
} from "./dashboardConstants";

import { db } from "@/firebase";
import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// テーマ定義
const THEMES = [
  {
    key: "gentle",
    label: "デフォルト",
    background: "linear-gradient(135deg, #e8f6ef 0%, #f9fbf4 100%)",
    panel: "rgba(255,255,255,0.95)",
    text: "#223366",
    accent: "#8fd6b3",
    tabActive: "#63c6a6",
    tabInactive: "#eaf5ec",
    effect: null,
  },
  {
    key: "matrix",
    label: "WM*MX",
    background: "#181c24",
    panel: "rgba(16,18,32,0.97)",
    text: "#e8ffe8",
    accent: "#00FF00",
    tabActive: "#00FF00",
    tabInactive: "#181c24",
    effect: "matrix",
  },
  // 他テーマ追加可
];

const TABS = [
  { key: "articles", label: "記事投稿" },
  { key: "edit", label: "記事編集" },
  { key: "videos", label: "動画投稿" },
  { key: "media", label: "メディアライブラリ" },
  { key: "community", label: "コミュニティ" },
  { key: "admin", label: "会員管理" },
  { key: "analytics", label: "アナリティクス" }
];

export default function Dashboard() {
  const [themeKey, setThemeKey] = useState(THEMES[0].key); // デフォルト gentle
  const currentTheme = THEMES.find(t => t.key === themeKey) || THEMES[0];
  const [selectedColor, setSelectedColor] = useState(currentTheme.accent);

  const [activeTab, setActiveTab] = useState<string>(TABS[0].key);
  const swiperRef = useRef<SwiperInstance | null>(null);

  // 投稿用
  const [title, setTitle] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  const [fullscreenEditBlockId, setFullscreenEditBlockId] = useState<string | null>(null);
  const [fullscreenLanguage, setFullscreenLanguage] = useState<"ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar">("ja");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // 編集用
  const [articleList, setArticleList] = useState<any[]>([]);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [selectedArticleIdx, setSelectedArticleIdx] = useState<number>(0);

  // 複数選択削除用
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 右パネル・モバイルUI
  const [showRightPanel, setShowRightPanel] = useState(false);

  const router = useRouter();

  
  // 記事リストを取得
  useEffect(() => {
    if (activeTab === "edit") {
      setLoadingArticles(true);
      getDocs(collection(db, "posts")).then(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || (doc.data().blocks?.[0]?.content?.slice(0, 20) || "無題記事"),
          createdAt: doc.data().createdAt,
          blocks: doc.data().blocks || [],
          tags: doc.data().tags || [],
        }));
        setArticleList(list);
        if (list.length > 0) {
          setSelectedArticleIdx(0);
          setEditTitle(list[0].title);
          setEditBlocks(list[0].blocks);
          setEditTags(list[0].tags ?? []);
          setEditDocId(list[0].id);
        } else {
          setEditTitle("");
          setEditBlocks([]);
          setEditTags([]);
          setEditDocId(null);
        }
        setLoadingArticles(false);
        setSelectedIds([]); // 取得時リセット
      });
    }
  }, [activeTab]);

  // 記事リストの選択切替
  const handleSelectArticle = (idx: number) => {
    const article = articleList[idx];
    setSelectedArticleIdx(idx);
    setEditTitle(article.title);
    setEditBlocks(article.blocks);
    setEditTags(article.tags ?? []);
    setEditDocId(article.id);
  };

  // 編集保存
  const handleEditSave = async (title: string, updatedBlocks: Block[], tags?: string[]) => {
    if (!editDocId) {
      alert("編集対象の記事がありません。");
      return;
    }
    try {
      await updateDoc(doc(db, "posts", editDocId), {
        title,
        blocks: updatedBlocks,
        tags: tags ?? [],
        updatedAt: serverTimestamp()
      });
      alert("編集内容を保存しました！");
      setEditTitle(title);
      setEditBlocks(updatedBlocks);
      setEditTags(tags ?? []);
      setArticleList(list =>
        list.map((item, idx) =>
          idx === selectedArticleIdx ? { ...item, title, blocks: updatedBlocks, tags: tags ?? [] } : item
        )
      );
    } catch (e) {
      alert("保存エラー: " + (e as Error).message);
    }
  };

  // 投稿系
  const handleAddBlock = (type: BlockType) => {
    setBlocks(bs => [...bs, createBlock(type)]);
  };
  const handleBlockChange = (id: string, value: string) => {
    setBlocks(bs =>
      bs.map(b => (b.id === id ? { ...b, content: value } : b))
    );
  };
  const handleDeleteBlock = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    setSelectedBlockId(null);
  };
  const handleSortBlocks = (activeId: string, overId: string) => {
    if (!overId || activeId === overId) return;
    const oldIndex = blocks.findIndex(b => b.id === activeId);
    const newIndex = blocks.findIndex(b => b.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    setBlocks(items => {
      const copy = [...items];
      const [moved] = copy.splice(oldIndex, 1);
      copy.splice(newIndex, 0, moved);
      return copy;
    });
  };

  // 新規記事保存・下書き
  const handlePublish = async (title: string, updatedBlocks: Block[], tags?: string[]) => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        blocks: updatedBlocks,
        tags: tags ?? [],
        createdAt: serverTimestamp(),
        status: "published"
      });
      alert("記事を公開しました！");
      setTitle("");
      setBlocks([]);
      setTags([]);
    } catch (e) {
      alert("投稿エラー:" + (e as Error).message);
    }
  };
  const handleSaveDraft = async (title: string, updatedBlocks: Block[], tags?: string[]) => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        blocks: updatedBlocks,
        tags: tags ?? [],
        createdAt: serverTimestamp(),
        status: "draft"
      });
      alert("下書きを保存しました！");
    } catch (e) {
      alert("保存エラー:" + (e as Error).message);
    }
  };

  // タブ切替
  const handleTabChange = (tabKey: string) => {
    const idx = TABS.findIndex(t => t.key === tabKey);
    setActiveTab(tabKey);
    if (swiperRef.current) {
      swiperRef.current.slideTo(idx);
    }
  };
  const handleSlideChange = (swiper: SwiperInstance) => {
    const idx = swiper.activeIndex;
    setActiveTab(TABS[idx].key);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleGoTop = () => {
    router.push("/");
  };

  // 右パネル表示管理
  useEffect(() => {
    if (selectedBlockId) setShowRightPanel(true);
  }, [selectedBlockId]);

  // レスポンシブ判定
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // フルスクリーン原稿用紙編集（多言語対応）
  const handleFullscreenEdit = (blockId: string, language: typeof fullscreenLanguage) => {
    setFullscreenEditBlockId(blockId);
    setFullscreenLanguage(language);
    setFullscreenEdit(true);
  };

  // 複数削除
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`選択した${selectedIds.length}件を削除します。よろしいですか？`)) return;
    try {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, "posts", id));
      }
      setArticleList(list => list.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      alert("選択した記事を削除しました。");
      // 編集対象の再セット
      if (articleList.length > 0) {
        setSelectedArticleIdx(0);
        setEditTitle(articleList[0]?.title ?? "");
        setEditBlocks(articleList[0]?.blocks ?? []);
        setEditTags(articleList[0]?.tags ?? []);
        setEditDocId(articleList[0]?.id ?? null);
      } else {
        setEditTitle("");
        setEditBlocks([]);
        setEditTags([]);
        setEditDocId(null);
      }
    } catch (e) {
      alert("削除エラー: " + (e as Error).message);
    }
  };

  // 全選択状態
  const isAllSelected = articleList.length > 0 && articleList.every(item => selectedIds.includes(item.id));
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? articleList.map(a => a.id) : []);
  };
  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  // テーマ切替時にカラーもセット
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value;
    const theme = THEMES.find(t => t.key === key);
    setThemeKey(key);
    setSelectedColor(theme?.accent ?? "#8fd6b3");
  };

  // ▼▼▼ INボタン実装 ▼▼▼
  const handleCommunityIn = () => {
    router.push("/community");
  };

  return (
    <div className={styles.dashboardWrapper}
      style={{
        background:
          currentTheme.key === "matrix"
            ? currentTheme.background
            : selectedColor,
        minHeight: "100vh",
        transition: "background 0.5s"
      }}
    >
      {/* 背景エフェクト */}
      {currentTheme.effect === "matrix" && (
        <MatrixLanguageRain color={selectedColor} />
      )}
      {/* ヘッダー */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "34px 0 10px 0",
        zIndex: 2,
        position: "relative"
      }}>
        {/* ▼ テーマ選択ドロップダウン */}
        <select
          value={themeKey}
          onChange={handleThemeChange}
          style={{
            padding: "10px 14px",
            borderRadius: 9,
            border: "1.5px solid #b3e0c9",
            background: "#f5fbf7",
            color: "#187964",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: "0 2px 10px #63c6a60c",
            marginRight: 0
          }}
        >
          {THEMES.map(theme =>
            <option key={theme.key} value={theme.key}>{theme.label}</option>
          )}
        </select>
        {/* ▼ カラーピッカー */}
        <DashboardColorPicker
          color={selectedColor}
          onChange={setSelectedColor}
        />
        <button
          onClick={handleGoTop}
          style={{
            marginLeft: 18,
            background: "#fff",
            color: "#192349",
            fontWeight: 800,
            fontSize: 16,
            border: "2px solid #192349",
            borderRadius: 12,
            padding: "12px 24px",
            boxShadow: "0 2px 18px #19234918",
            cursor: "pointer",
            transition: "background .16s",
            minWidth: 90
          }}
        >トップに戻る</button>
        <LogoutButton />
      </div>
      {/* タブエリア */}
      <DashboardCarouselTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        color={selectedColor}
      />
      {/* メイン（タブ切替式） */}
      <div className={styles.carouselContainer}>
        <Swiper
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={650}
          onSwiper={swiper => { swiperRef.current = swiper; }}
          onSlideChange={handleSlideChange}
          slidesPerView={1}
          allowTouchMove={true}
          className="dashboard-swiper"
          modules={[EffectFade]}
        >
          {/* 1. 記事投稿タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <DashboardSidebar onAddBlock={handleAddBlock} />
              <div className={styles.dashboardMain}>
                <ArticleEditor
                  title={title}
                  setTitle={setTitle}
                  blocks={blocks}
                  onSave={handlePublish}
                  tags={tags}
                  setTags={setTags}
                  onBlockSelect={setSelectedBlockId}
                  onFullscreenEdit={handleFullscreenEdit}
                  fullscreenLanguage={fullscreenLanguage}
                  onAddBlock={handleAddBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onBlockChange={handleBlockChange}
                  onSortBlocks={handleSortBlocks}
                />
                <DashboardFooter
                  onPublish={() => handlePublish(title, blocks, tags)}
                  onSaveDraft={() => handleSaveDraft(title, blocks, tags)}
                  onPreview={handlePreview}
                />
                <PreviewModal
                  open={previewOpen}
                  blocks={blocks}
                  onClose={() => setPreviewOpen(false)}
                />
              </div>
              {!isMobile && (
                <DashboardRightPanel
                  selectedBlock={selectedBlock}
                  handleBlockStyle={(id, style) => {
                    setBlocks(bs =>
                      bs.map(b =>
                        b.id === id ? { ...b, style: { ...b.style, ...style } } : b
                      )
                    );
                  }}
                  FONT_OPTIONS={FONT_OPTIONS}
                  FONT_SIZE_OPTIONS={FONT_SIZE_OPTIONS}
                  COLOR_PRESETS={COLOR_PRESETS}
                  BG_COLOR_PRESETS={BG_COLOR_PRESETS}
                  onFullscreenEdit={handleFullscreenEdit}
                  fullscreenLanguage={fullscreenLanguage}
                />
              )}
              {selectedBlock && (
                <FullscreenEditorModal
                  open={fullscreenEdit}
                  value={selectedBlock.content}
                  fontFamily={selectedBlock.style?.fontFamily}
                  fontSize={selectedBlock.style?.fontSize}
                  color={selectedBlock.style?.color}
                  onClose={() => setFullscreenEdit(false)}
                  onSave={val => {
                    setBlocks(bs =>
                      bs.map(b =>
                        b.id === selectedBlock.id ? { ...b, content: val } : b
                      )
                    );
                    setFullscreenEdit(false);
                  }}
                  language={fullscreenLanguage}
                />
              )}
              {isMobile && showRightPanel && selectedBlock && (
                <div className={styles.rightPanelMobile}>
                  <DashboardRightPanel
                    selectedBlock={selectedBlock}
                    handleBlockStyle={(id, style) => {
                      setBlocks(bs =>
                        bs.map(b =>
                          b.id === id ? { ...b, style: { ...b.style, ...style } } : b
                        )
                      );
                    }}
                    FONT_OPTIONS={FONT_OPTIONS}
                    FONT_SIZE_OPTIONS={FONT_SIZE_OPTIONS}
                    COLOR_PRESETS={COLOR_PRESETS}
                    BG_COLOR_PRESETS={BG_COLOR_PRESETS}
                    onFullscreenEdit={handleFullscreenEdit}
                    fullscreenLanguage={fullscreenLanguage}
                    show={showRightPanel}
                    mobile
                  />
                </div>
              )}
            </div>
          </SwiperSlide>
          {/* 2. 記事編集タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <div
                style={{
                  minWidth: 220,
                  maxWidth: 260,
                  background: "#fff",
                  borderRadius: 14,
                  boxShadow: "0 4px 16px rgba(20,36,80,0.10)",
                  padding: 22,
                  marginRight: 26,
                  marginTop: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  height: "100%",
                  minHeight: 320
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 18, color: "#192349", marginBottom: 12 }}>
                  記事一覧
                </div>
                <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    style={{ width: 17, height: 17, accentColor: "#5b8dee", verticalAlign: "middle" }}
                  />
                  <span style={{ fontSize: 13 }}>全選択</span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    style={{
                      background: "#ffeaea",
                      color: "#c00",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      padding: "6px 14px",
                      cursor: selectedIds.length === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    🗑️ 選択した記事を削除
                  </button>
                </div>
                {loadingArticles ? (
                  <div style={{ color: "#aaa" }}>読み込み中...</div>
                ) : articleList.length === 0 ? (
                  <div style={{ color: "#888" }}>記事がありません。</div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {articleList.map((item, idx) => (
                      <li
                        key={item.id}
                        style={{
                          padding: "7px 8px",
                          marginBottom: 7,
                          background: idx === selectedArticleIdx ? "#e7f5ff" : "#f5f8fb",
                          borderRadius: 8,
                          fontWeight: idx === selectedArticleIdx ? 800 : 600,
                          color: "#192349",
                          fontSize: 15,
                          cursor: "pointer",
                          border: idx === selectedArticleIdx ? "2.5px solid #5b8dee" : "1px solid #e2e7ef",
                          transition: "background .17s, border .17s",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={e => handleSelectOne(item.id, e.target.checked)}
                          style={{ marginRight: 7, accentColor: "#5b8dee" }}
                          onClick={e => e.stopPropagation()}
                        />
                        <div
                          style={{ flex: 1 }}
                          onClick={() => handleSelectArticle(idx)}
                        >
                          {item.title}
                          <span style={{
                            fontSize: 12, color: "#aaa", marginLeft: 8, fontWeight: 400
                          }}>
                            {item.createdAt && typeof item.createdAt === "object" && "toDate" in item.createdAt
                              ? (item.createdAt as { toDate(): Date }).toDate().toLocaleString()
                              : item.createdAt instanceof Date
                                ? item.createdAt.toLocaleString()
                                : ""}
                          </span>
                          {item.tags && item.tags.length > 0 && (
                            <span style={{ marginLeft: 10, fontSize: 13, color: "#192349", background: "#e3e8fc", borderRadius: 7, padding: "1px 7px" }}>
                              {item.tags.map((tag: string) => (
                                <span key={tag} style={{ marginRight: 4 }}>#{tag}</span>
                              ))}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.dashboardMain}>
                <ArticleEditor
                  title={editTitle}
                  setTitle={setEditTitle}
                  blocks={editBlocks}
                  isEditMode
                  onSave={handleEditSave}
                  tags={editTags}
                  setTags={setEditTags}
                  onAddBlock={type => setEditBlocks(bs => [...bs, createBlock(type)])}
                  onDeleteBlock={id => setEditBlocks(bs => bs.filter(b => b.id !== id))}
                  onBlockChange={(id, value) =>
                    setEditBlocks(bs => bs.map(b => (b.id === id ? { ...b, content: value } : b)))
                  }
                  onSortBlocks={(activeId, overId) => {
                    if (!overId || activeId === overId) return;
                    const oldIndex = editBlocks.findIndex(b => b.id === activeId);
                    const newIndex = editBlocks.findIndex(b => b.id === overId);
                    if (oldIndex === -1 || newIndex === -1) return;
                    setEditBlocks(items => {
                      const copy = [...items];
                      const [moved] = copy.splice(oldIndex, 1);
                      copy.splice(newIndex, 0, moved);
                      return copy;
                    });
                  }}
                />
              </div>
            </div>
          </SwiperSlide>
          {/* 3. 動画投稿タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <div className={styles.dashboardMain}>
                <VideoEditor />
              </div>
            </div>
          </SwiperSlide>
          {/* 4. メディアライブラリ */}
          <SwiperSlide>
            <MediaLibrary />
          </SwiperSlide>
          {/* 5. コミュニティタブ */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect" style={{ position: "relative", minHeight: 360 }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "70%",
                paddingTop: 50,
              }}>
                <button
                  onClick={handleCommunityIn}
                  style={{
                    fontWeight: 900,
                    fontSize: 22,
                    padding: "18px 64px",
                    background: "linear-gradient(90deg, #41e5b6 0%, #79baff 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 18,
                    boxShadow: "0 6px 32px #25b6e944",
                    cursor: "pointer",
                    marginBottom: 24,
                    letterSpacing: 3,
                    transition: "background .22s",
                  }}
                >IN</button>
                <div style={{
                  color: "#197e70",
                  fontWeight: 800,
                  fontSize: 17,
                  marginBottom: 8
                }}>
                  コミュニティルームへようこそ！
                </div>
                <div style={{
                  color: "#444",
                  fontSize: 14,
                  marginTop: 3,
                  opacity: 0.7
                }}>
                  ※「IN」でルームへ入室
                </div>
              </div>
            </div>
          </SwiperSlide>
          {/* 6. 会員管理タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <AdminUserManager />
            </div>
          </SwiperSlide>
          {/* 7. アナリティクスタブ */}
          <SwiperSlide>
            <div className={styles.analyticsTabPane}>
              <AnalyticsArticleRanking />
              <div style={{ height: 20 }} />
              <AnalyticsVideoRanking />
              <div style={{ height: 20 }} />
              <AnalyticsReferralSources />
              <div style={{ height: 20 }} />
              <AnalyticsUserCount />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

