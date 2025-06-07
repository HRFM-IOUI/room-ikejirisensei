"use client"; 
import React, { useState, useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";
import DashboardCarouselTabs from "./DashboardCarouselTabs";
import DashboardColorPicker from "./DashboardColorPicker";
import MatrixLanguageRain from "./MatrixLanguageRain";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./DashboardCarouselTabs.css";
import ArticleEditor from "./ArticleEditor";
import DashboardSidebar from "./DashboardSidebar";
import DashboardRightPanel from "./DashboardRightPanel";
import DashboardFooter from "./DashboardFooter";
import FullscreenEditorModal from "./FullscreenEditorModal";
import PreviewModal from "./PreviewModal";
import VideoEditor from "./VideoEditor";
import MediaLibrary from "./MediaLibrary";
import { EffectFade } from "swiper/modules";
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
import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// 記事リスト用型
type ArticleListItem = {
  id: string;
  title: string;
  createdAt?: Date | { toDate(): Date }; // ← ここを any→Date|toDate()型に
  blocks: Block[];
};

const TABS = [
  { key: "articles", label: "記事投稿" },
  { key: "edit", label: "記事編集" },
  { key: "videos", label: "動画投稿" },
  { key: "articlesList", label: "記事一覧" },
  { key: "videosList", label: "動画一覧" },
  { key: "members", label: "会員管理" },
  { key: "community", label: "コミュニティ" },
  { key: "media", label: "メディアライブラリ" },
  { key: "analytics", label: "アナリティクス" },
];

const TAB_COLORS = [
  "#00FF00", "#00D1FF", "#FFD700", "#FF00B8", "#FF4500", "#1a1aff", "#192349", "#fff"
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].key);
  const [selectedColor, setSelectedColor] = useState<string>(TAB_COLORS[0]);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 記事編集用
  const [articleList, setArticleList] = useState<ArticleListItem[]>([]);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [selectedArticleIdx, setSelectedArticleIdx] = useState<number>(0);

  const router = useRouter();

  // 記事リストを取得
  useEffect(() => {
    if (activeTab === "edit") {
      setLoadingArticles(true);
      getDocs(collection(db, "posts")).then(snapshot => {
        const list: ArticleListItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: (doc.data().blocks?.[0]?.content?.slice(0, 20) || "無題記事"),
          createdAt: doc.data().createdAt,
          blocks: doc.data().blocks || [],
        }));
        setArticleList(list);
        if (list.length > 0) {
          setSelectedArticleIdx(0);
          setEditBlocks(list[0].blocks);
          setEditDocId(list[0].id);
        } else {
          setEditBlocks([]);
          setEditDocId(null);
        }
        setLoadingArticles(false);
      });
    }
  }, [activeTab]);

  // 記事リストの選択切替
  const handleSelectArticle = (idx: number) => {
    const article = articleList[idx];
    setSelectedArticleIdx(idx);
    setEditBlocks(article.blocks);
    setEditDocId(article.id);
  };

  // 編集保存
  const handleEditSave = async (updatedBlocks: Block[]) => {
    if (!editDocId) {
      alert("編集対象の記事がありません。");
      return;
    }
    try {
      await updateDoc(doc(db, "posts", editDocId), {
        blocks: updatedBlocks,
        updatedAt: serverTimestamp()
      });
      alert("編集内容を保存しました！");
      setEditBlocks(updatedBlocks);
      setArticleList(list =>
        list.map((item, idx) =>
          idx === selectedArticleIdx ? { ...item, blocks: updatedBlocks } : item
        )
      );
    } catch (e) {
      alert("保存エラー: " + (e as Error).message);
    }
  };

  // 記事投稿系
  const handleAddBlock = (type: BlockType) => {
    setBlocks([...blocks, createBlock(type)]);
  };
  const handleEditBlock = (id: string, value: string) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, content: value } : b));
  };
  const handleBlockStyle = (id: string, style: Partial<Block['style']>) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, style: { ...b.style, ...style } } : b));
  };
  const handleDelete = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

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

  const selectedBlock = blocks.find(b => b.id === selectedId);

  const handleSaveFullscreen = (value: string) => {
    if (selectedBlock) {
      handleEditBlock(selectedBlock.id, value);
    }
    setFullscreenEdit(false);
  };

  const handlePublish = async () => {
    try {
      await addDoc(collection(db, "posts"), {
        blocks,
        createdAt: serverTimestamp(),
        status: "published"
      });
      alert("記事を公開しました！");
      setBlocks([]);
      setSelectedId(null);
    } catch (e) {
      alert("投稿エラー:" + (e as Error).message);
    }
  };
  const handleSaveDraft = async () => {
    try {
      await addDoc(collection(db, "posts"), {
        blocks,
        createdAt: serverTimestamp(),
        status: "draft"
      });
      alert("下書きを保存しました！");
    } catch (e) {
      alert("保存エラー:" + (e as Error).message);
    }
  };
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleGoTop = () => {
    router.push("/");
  };

  const isWhiteTheme = selectedColor === "#fff" || selectedColor?.toLowerCase() === "white";

  return (
    <div className={styles.dashboardWrapper} style={{ background: isWhiteTheme ? "#fff" : undefined }}>
      {/* 背景 */}
      {!isWhiteTheme && <MatrixLanguageRain color={selectedColor} />}
      {/* ヘッダー部 */}
      <div style={{ padding: "34px 0 10px 0", zIndex: 2, position: "relative" }}>
        <DashboardCarouselTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          color={selectedColor}
        />
        <div style={{
          marginTop: 24,
          textAlign: "right",
          display: "flex",
          alignItems: "center",
          gap: 14,
          justifyContent: "flex-end"
        }}>
          <DashboardColorPicker color={selectedColor} onChange={setSelectedColor} />
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
        </div>
      </div>
      {/* メイン */}
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
          {/* 記事投稿タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <DashboardSidebar handleAddBlock={handleAddBlock} />
              <div className={styles.dashboardMain}>
                <ArticleEditor
                  blocks={blocks}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  handleEditBlock={handleEditBlock}
                  handleDelete={handleDelete}
                />
                <DashboardFooter
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  onPreview={handlePreview}
                />
                <PreviewModal
                  open={previewOpen}
                  blocks={blocks}
                  onClose={() => setPreviewOpen(false)}
                />
              </div>
              <DashboardRightPanel
                selectedBlock={selectedBlock}
                handleBlockStyle={handleBlockStyle}
                FONT_OPTIONS={FONT_OPTIONS}
                FONT_SIZE_OPTIONS={FONT_SIZE_OPTIONS}
                COLOR_PRESETS={COLOR_PRESETS}
                BG_COLOR_PRESETS={BG_COLOR_PRESETS}
                onFullscreenEdit={() => setFullscreenEdit(true)}
              />
              {selectedBlock && (
                <FullscreenEditorModal
                  open={fullscreenEdit}
                  value={selectedBlock.content}
                  fontFamily={selectedBlock.style?.fontFamily}
                  fontSize={selectedBlock.style?.fontSize}
                  color={selectedBlock.style?.color}
                  onClose={() => setFullscreenEdit(false)}
                  onSave={handleSaveFullscreen}
                />
              )}
            </div>
          </SwiperSlide>
          {/* 記事編集タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              {/* 記事リスト */}
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
                {loadingArticles ? (
                  <div style={{ color: "#aaa" }}>読み込み中...</div>
                ) : articleList.length === 0 ? (
                  <div style={{ color: "#888" }}>記事がありません。</div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {articleList.map((item, idx) => (
                      <li
                        key={item.id}
                        onClick={() => handleSelectArticle(idx)}
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
                          transition: "background .17s, border .17s"
                        }}
                      >
                        {item.title}
                        <span style={{
                          fontSize: 12, color: "#aaa", marginLeft: 8,
                          fontWeight: 400
                        }}>
                          {item.createdAt && typeof item.createdAt === "object" && "toDate" in item.createdAt
                            ? (item.createdAt as { toDate(): Date }).toDate().toLocaleString()
                            : item.createdAt instanceof Date
                              ? item.createdAt.toLocaleString()
                              : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* 編集エディタ */}
              <div className={styles.dashboardMain}>
                <ArticleEditor
                  blocks={editBlocks}
                  isEditMode
                  onSave={handleEditSave}
                />
              </div>
            </div>
          </SwiperSlide>
          {/* 動画投稿タブ */}
          <SwiperSlide>
            <div className={styles.dashboardRoot}>
              <div className={styles.dashboardMain}>
                <VideoEditor />
              </div>
            </div>
          </SwiperSlide>
          {/* 記事一覧タブ */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect">
              記事一覧（仮実装）
            </div>
          </SwiperSlide>
          {/* 動画一覧タブ */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect">
              動画一覧（仮実装）
            </div>
          </SwiperSlide>
          {/* 会員管理タブ */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect">
              会員管理（仮実装）
            </div>
          </SwiperSlide>
          {/* コミュニティタブ */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect">
              コミュニティ管理（仮実装）
            </div>
          </SwiperSlide>
          {/* メディアライブラリ */}
          <SwiperSlide>
            <MediaLibrary />
          </SwiperSlide>
          {/* アナリティクス */}
          <SwiperSlide>
            <div className="carousel-pane glitch-effect">
              アナリティクス（仮実装）
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
