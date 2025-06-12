import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DefaultEditor from "../editor/DefaultEditor";
import NoteEditor from "../editor/NoteEditor";
import GenkouViewer from "../editor/GenkouViewer";
import EditorControlButton from "../editor/EditorControlButton";
import EditorControlModal from "../editor/EditorControlModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Toaster, toast } from "react-hot-toast";

export type EditorMode = "default" | "note" | "genkou";

type Rubi = { index: number; length: number; ruby: string };

type Props = {
  open: boolean;
  value: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  onClose: () => void;
  onSave: (value: string) => void;
  language?: "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";
  rubiList?: Rubi[];
};

const PDF_LABELS: Record<NonNullable<Props["language"]>, string> = {
  ja: "PDF変換",
  en: "Export PDF",
  tr: "PDF'ye Aktar",
  zh: "导出PDF",
  ko: "PDF 내보내기",
  ar: "تصدير PDF",
  ru: "Экспорт PDF"
};
const PDF_SAVED_LABELS: Record<NonNullable<Props["language"]>, string> = {
  ja: "PDFをダウンロードしました。",
  en: "PDF downloaded.",
  tr: "PDF indirildi.",
  zh: "PDF已下载。",
  ko: "PDF가 다운로드되었습니다。",
  ar: "تم تنزيل PDF.",
  ru: "PDF загружен."
};
const PDF_FAIL_LABELS: Record<NonNullable<Props["language"]>, string> = {
  ja: "PDF変換に失敗しました。もう一度お試しください。",
  en: "PDF export failed. Please try again.",
  tr: "PDF aktarımı başarısız oldu. Lütfen tekrar deneyin.",
  zh: "PDF导出失败，请重试。",
  ko: "PDF 내보내기에 실패했습니다. 다시 시도해 주세요。",
  ar: "فشل تصدير PDF. الرجاء المحاولة مرة أخرى.",
  ru: "Не удалось экспортировать PDF. Пожалуйста, попробуйте еще раз."
};

export default function FullscreenEditorModal({
  open,
  value,
  fontFamily,
  fontSize,
  color,
  onClose,
  onSave,
  language = "ja",
  rubiList = [],
}: Props) {
  const [content, setContent] = useState(value);
  const [mode, setMode] = useState<EditorMode>("default");
  const [currentPage, setCurrentPage] = useState(0);
  const [controlOpen, setControlOpen] = useState(false);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // スマホキーボードで高さが減った場合にも調整
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handler = () => {
        if (window.visualViewport) {
          setViewportHeight(window.visualViewport.height);
        } else {
          setViewportHeight(null);
        }
      };
      window.visualViewport?.addEventListener("resize", handler);
      handler();
      return () => {
        window.visualViewport?.removeEventListener("resize", handler);
      };
    }
  }, []);

  // bodyスクロール禁止
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "auto";
      };
    }
  }, [open]);

  const perPage = {
    ja: 400, zh: 400, ko: 400, en: 400, tr: 400, ru: 400, ar: 396,
  }[language] || 400;

  const getPageCount = () => {
    return Math.max(1, Math.ceil(content.replace(/[\r\n]/g, "").length / perPage));
  };

  useEffect(() => {
    if (open) {
      setContent(value);
      setCurrentPage(0);
      setMode("default");
      setControlOpen(false);
      setCursorIndex(null);
    }
  }, [open, value]);

  const handleTextareaEvents = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    setCursorIndex(target.selectionStart ?? 0);
  };

  useEffect(() => {
    if (cursorIndex !== null && perPage > 0) {
      const start = currentPage * perPage;
      if (cursorIndex < start || cursorIndex >= start + perPage) {
        setCursorIndex(start);
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, start);
          textareaRef.current.focus();
        }
      }
    }
    // eslint-disable-next-line
  }, [currentPage]);

  // SVG原稿用紙マスクリック時 → textareaキャレットジャンプ
  const handleGridClick = (textIdx: number) => {
    setCursorIndex(textIdx);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textIdx, textIdx);
    }
  };

  // PDF変換処理
  const handlePdfExport = async () => {
    setPdfLoading(true);
    toast.loading(PDF_LABELS[language] || PDF_LABELS.ja, { id: "pdf" });
    try {
      const pageCount = getPageCount();
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pageCount; i++) {
        const ref = pageRefs.current[i];
        if (!ref) continue;
        const canvas = await html2canvas(ref, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgAspect = canvas.width / canvas.height;
        let w = pageWidth, h = pageWidth / imgAspect;
        if (h > pageHeight) {
          h = pageHeight;
          w = h * imgAspect;
        }
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;
        pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "FAST");
        if (i < pageCount - 1) pdf.addPage();
      }
      pdf.save(`genkou_${new Date().toISOString().slice(0, 7).replace("-", "")}.pdf`);
      toast.success(PDF_SAVED_LABELS[language] || PDF_SAVED_LABELS.ja, { id: "pdf" });
    } catch {
      toast.error(PDF_FAIL_LABELS[language] || PDF_FAIL_LABELS.ja, { id: "pdf" });
    }
    setPdfLoading(false);
  };

  if (!open) return null;

  const charCount = content.replace(/[\r\n]/g, "").length;
  const pageCount = getPageCount();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 750;

  const usableHeight = viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 800);

  // 全ページを画面外で描画（PDF用）
  const renderAllPagesForPdf = () =>
    Array.from({ length: pageCount }).map((_, i) => (
      <div
        key={`pdfpage_${i}`}
        ref={el => { pageRefs.current[i] = el; }}
        style={{
          position: "absolute",
          top: 0,
          left: "-200vw",
          width: 1200,
          zIndex: -9999,
          background: "#ffffff"
        }}
      >
        <GenkouViewer
          text={content}
          page={i}
          lang={language}
          cursorIndex={undefined}
          rubiList={rubiList}
        />
      </div>
    ));

  // --- レイアウト ---
  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100vw",
    height: usableHeight,
    background: "rgba(24, 28, 44, 0.96)",
    zIndex: 2147483647,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    margin: 0,
    padding: 0,
    touchAction: "manipulation",
  };

  const modalStyle: React.CSSProperties = {
    width: "100vw",
    height: usableHeight,
    maxWidth: "100vw",
    maxHeight: usableHeight,
    minWidth: "100vw",
    minHeight: usableHeight,
    position: "relative",
    background: "#fff",
    borderRadius: 0,
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const innerStyle: React.CSSProperties = {
    flex: 1,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: isMobile ? "0 0 9vw 0" : "0",
    overflow: "auto",
    minHeight: 0,
    position: "relative",
    gap: isMobile ? 16 : 24,
    transition: "padding .2s",
  };

  const leftButtonGroupStyle: React.CSSProperties = {
    position: isMobile ? "static" : "absolute",
    left: isMobile ? undefined : 30,
    bottom: isMobile ? undefined : 30,
    margin: isMobile ? "16px auto" : undefined,
    display: "flex",
    gap: isMobile ? 11 : 12,
    zIndex: 10,
    flexDirection: "row",
    width: isMobile ? "98%" : undefined,
    justifyContent: isMobile ? "space-around" : undefined,
  };

  const editorControlButtonStyle: React.CSSProperties = {
    position: isMobile ? "static" : "absolute",
    right: isMobile ? undefined : 30,
    bottom: isMobile ? undefined : 30,
    zIndex: 11,
    margin: isMobile ? "8px auto" : undefined,
    width: isMobile ? "98%" : undefined,
    display: isMobile ? "flex" : undefined,
    justifyContent: isMobile ? "flex-end" : undefined,
  };

  const paginationStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? 12 : 22,
    margin: isMobile ? "10px 0 0 0" : "18px 0 0 0",
    width: "100%",
    userSelect: "none",
  };

  const paginationButtonStyle: React.CSSProperties = {
    padding: isMobile ? "12px 16px" : "7px 19px",
    borderRadius: 10,
    background: "#f1f3fa",
    border: "1.7px solid #b9cbe9",
    fontWeight: 700,
    fontSize: isMobile ? 17 : 17,
    color: "#192349",
    cursor: "pointer",
    minWidth: isMobile ? 50 : 62,
    outline: "none",
    transition: "background .14s",
    touchAction: "manipulation",
  };

  const textareaStyle: React.CSSProperties = {
    width: isMobile ? "98vw" : "98%",
    minHeight: isMobile ? 60 : 85,
    fontSize: isMobile ? 18 : 22,
    fontFamily: "'Noto Serif JP', serif",
    background: "#f8fafc",
    border: "2px solid #e7e3bb",
    borderRadius: 10,
    margin: isMobile ? "0 auto 10px auto" : "0 auto 12px auto",
    padding: isMobile ? "11px 10px" : "13px 20px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    display: "block",
    color: "#192349",
    lineHeight: 1.5,
    transition: "font-size .18s",
    touchAction: "manipulation",
  };

  const modal = (
    <div style={containerStyle} onClick={onClose}>
      <Toaster />
      <div style={modalStyle} onClick={event => event.stopPropagation()}>
        <div style={editorControlButtonStyle}>
          <EditorControlButton onClick={() => setControlOpen(true)} position="right" />
        </div>
        <EditorControlModal
          open={controlOpen}
          mode={mode}
          setMode={setMode}
          currentPage={currentPage}
          totalPages={pageCount}
          setCurrentPage={setCurrentPage}
          onSave={() => { onSave(content); setControlOpen(false); }}
          onCancel={() => { onClose(); setControlOpen(false); }}
          onClose={() => setControlOpen(false)}
        />
        <div style={innerStyle}>
          {mode === "default" && (
            <DefaultEditor
              value={content}
              onChange={setContent}
              fontFamily={fontFamily}
              fontSize={fontSize}
              color={color}
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
          {mode === "note" && (
            <NoteEditor
              value={content}
              onChange={setContent}
              fontFamily={fontFamily}
              fontSize={fontSize}
              color={color}
              onFocus={() => {}}
              onBlur={() => {}}
            />
          )}
          {mode === "genkou" && (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  handleTextareaEvents(e);
                }}
                onSelect={handleTextareaEvents}
                onKeyUp={handleTextareaEvents}
                placeholder="本文を入力（エンターで段落・ページ自動増加・全言語）"
                style={textareaStyle}
                spellCheck={false}
              />
              <GenkouViewer
                text={content}
                page={currentPage}
                lang={language}
                cursorIndex={cursorIndex !== null ? cursorIndex : undefined}
                onGridClick={handleGridClick}
                rubiList={rubiList}
              />
              {pageCount > 1 && (
                <div style={paginationStyle}>
                  <button
                    type="button"
                    style={{
                      ...paginationButtonStyle,
                      opacity: currentPage === 0 ? 0.44 : 1,
                      pointerEvents: currentPage === 0 ? "none" : "auto"
                    }}
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  >
                    前のページ
                  </button>
                  <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18 }}>
                    {currentPage + 1} / {pageCount} ページ
                  </span>
                  <button
                    type="button"
                    style={{
                      ...paginationButtonStyle,
                      opacity: currentPage === pageCount - 1 ? 0.44 : 1,
                      pointerEvents: currentPage === pageCount - 1 ? "none" : "auto"
                    }}
                    onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))}
                  >
                    次のページ
                  </button>
                </div>
              )}
              <div style={{ marginTop: isMobile ? 14 : 28, fontSize: isMobile ? 14 : 16, color: "#666", textAlign: "center" }}>
                文字数：{charCount}字
              </div>
              <div style={leftButtonGroupStyle}>
                <button
                  type="button"
                  style={{
                    padding: isMobile ? "11px 13px" : "13px 36px",
                    borderRadius: 11,
                    background: "#7c80ff",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: isMobile ? 14 : 18,
                    letterSpacing: 1.1,
                    cursor: "pointer"
                  }}
                  aria-label="AI校正"
                  disabled
                  title="AI校正（近日リリース）"
                >
                  AI校正
                </button>
                <button
                  type="button"
                  onClick={handlePdfExport}
                  disabled={pdfLoading}
                  aria-label={PDF_LABELS[language]}
                  title={PDF_LABELS[language]}
                  style={{
                    padding: isMobile ? "11px 13px" : "13px 36px",
                    borderRadius: 11,
                    background: "#43aaff",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: isMobile ? 14 : 18,
                    letterSpacing: 1.1,
                    cursor: pdfLoading ? "wait" : "pointer"
                  }}
                >
                  {pdfLoading ? "..." : PDF_LABELS[language]}
                </button>
                <button
                  type="button"
                  style={{
                    padding: isMobile ? "11px 13px" : "13px 36px",
                    borderRadius: 11,
                    background: "#3eb47c",
                    color: "#fff",
                    border: "none",
                    fontWeight: 800,
                    fontSize: isMobile ? 14 : 18,
                    letterSpacing: 1.1,
                    cursor: "not-allowed"
                  }}
                  aria-label="公開販売"
                  disabled
                  title="公開販売（近日リリース）"
                >
                  公開販売
                </button>
              </div>
              {/* --- 画面外に全ページを一時的に描画 --- */}
              <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: -9999 }}>
                {renderAllPagesForPdf()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
