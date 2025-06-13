import React, { useEffect, useState } from "react";

// 多言語・各国向け原稿用紙設定（省略なし）
const LANG_CONFIG = {
  ja: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
    direction: "vertical-rl", writingMode: "vertical-rl", rtl: false,
    cellSize: 46, fontSize: 29, title: "原稿用紙", aspect: "landscape",
  },
  en: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif', 'Times New Roman', serif",
    direction: "ltr", writingMode: "horizontal-tb", rtl: false,
    cellSize: 46, fontSize: 22, title: "GENKOU-YOUSHI", aspect: "landscape",
  },
  tr: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif', 'Times New Roman', serif",
    direction: "ltr", writingMode: "horizontal-tb", rtl: false,
    cellSize: 46, fontSize: 22, title: "GENKOU-YOUSHI", aspect: "landscape",
  },
  zh: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif SC', 'Noto Serif', 'SimSun', serif",
    direction: "vertical-rl", writingMode: "vertical-rl", rtl: false,
    cellSize: 46, fontSize: 28, title: "稿用纸", aspect: "landscape",
  },
  ko: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif KR', 'Noto Serif', 'Malgun Gothic', serif",
    direction: "vertical-rl", writingMode: "vertical-rl", rtl: false,
    cellSize: 46, fontSize: 28, title: "원고지", aspect: "landscape",
  },
  ru: {
    cols: 20, rows: 20, fontFamily: "'Noto Serif', 'Times New Roman', serif",
    direction: "ltr", writingMode: "horizontal-tb", rtl: false,
    cellSize: 46, fontSize: 22, title: "ГЕНКОЙ-ЁСИ", aspect: "landscape",
  },
  ar: {
    cols: 20, rows: 20, fontFamily: "'Noto Naskh Arabic', 'Noto Serif', serif",
    direction: "rtl", writingMode: "horizontal-tb", rtl: true,
    cellSize: 46, fontSize: 22, title: "ورقة المخطوطة", aspect: "landscape",
  },
};

type SupportedLang = keyof typeof LANG_CONFIG;

type Rubi = { index: number; length: number; ruby: string; };

type Props = {
  text: string;
  page: number;
  lang?: SupportedLang;
  cursorIndex?: number;
  onGridClick?: (textIdx: number) => void;
  rubiList?: Rubi[];
};

const STROKE_MAIN = "#b9cbe9";
const STROKE_CENTER = "#ddbb4b";
const CURSOR_HIGHLIGHT = "#43aaff";
const KINSOKU_HEAD = ["。", "、", ")", "]", "）", "」", "』", "】", "〙", "〗", "’", "”", "›", "≫", "》"];

// --- ここからロジック ---
function splitTextToPagesWithIndentAndKinsoku(
  text: string,
  cols: number,
  rows: number,
  lang: SupportedLang = "ja"
): { pages: string[][]; textToGrid: number[]; gridToText: number[] } {
  const pages: string[][] = [];
  const grid: string[] = [];
  const textToGrid: number[] = [];
  const gridToText: number[] = [];
  const paragraphs = text.split(/\r?\n/);
  let textIdx = 0;

  paragraphs.forEach((p, i) => {
    if (i > 0) {
      const fill = cols - (grid.length % cols);
      if (fill < cols) {
        for (let f = 0; f < fill; ++f) {
          grid.push("");
          gridToText.push(-1);
        }
      }
    }
    if (p.length > 0 && lang === "ja") {
      grid.push("");
      gridToText.push(-1);
    }
    for (let ci = 0; ci < p.length; ++ci) {
      if (
        lang === "ja" &&
        grid.length % cols === 0 &&
        KINSOKU_HEAD.includes(p[ci])
      ) {
        if (grid.length > 0) {
          textToGrid[textIdx] = grid.length - 1;
          grid[grid.length - 1] = p[ci];
          gridToText[grid.length - 1] = textIdx;
        } else {
          textToGrid[textIdx] = grid.length;
          grid.push(p[ci]);
          gridToText.push(textIdx);
        }
      } else {
        textToGrid[textIdx] = grid.length;
        grid.push(p[ci]);
        gridToText.push(textIdx);
      }
      textIdx++;
    }
  });

  const pageSize = cols * rows;
  for (let i = 0; i < grid.length; i += pageSize) {
    pages.push(grid.slice(i, i + pageSize));
  }
  return { pages: pages.length > 0 ? pages : [[]], textToGrid, gridToText };
}

const GenkouViewer: React.FC<Props> = ({
  text,
  page,
  lang = "ja",
  cursorIndex,
  onGridClick,
  rubiList = [],
}) => {
  const cfg = LANG_CONFIG[lang] || LANG_CONFIG["ja"];
  const { cols, rows, cellSize, fontFamily, direction, writingMode, rtl, fontSize, title } = cfg;

  // ページ状態
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 850 });
  const [currentPage, setCurrentPage] = useState(page);

  // 1. テキスト分割（必ず先に宣言！）
  const { pages, textToGrid, gridToText } = splitTextToPagesWithIndentAndKinsoku(text, cols, rows, lang);
  const chars = pages[currentPage] || [];

  // 2. カーソル位置
  let pageCursorGridIdx: number | null = null;
  if (typeof cursorIndex === "number") {
    const pageStartIdx = currentPage * (cols * rows);
    const gridIdx =
      cursorIndex < textToGrid.length
        ? textToGrid[cursorIndex]
        : textToGrid.length > 0
        ? textToGrid[textToGrid.length - 1] + 1
        : 0;
    if (
      gridIdx >= pageStartIdx &&
      gridIdx < pageStartIdx + cols * rows
    ) {
      pageCursorGridIdx = gridIdx - pageStartIdx;
    }
  }

  // 3. ページ送り機能
  const goToNextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // 4. サイズ調整
  useEffect(() => {
    const handleResize = () => {
      const sidebar = 280, margin = 28;
      let maxW = window.innerWidth - sidebar - margin + (37.8 * 12);
      let maxH = window.innerHeight - 96 - (37.8 * 2);
      maxW = Math.max(400, Math.min(maxW, 1800));
      maxH = Math.max(350, Math.min(maxH, 1050));
      const ratio = 297 / 210;
      let w = maxW, h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      setContainerSize({ width: w, height: h });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const paperWidth = containerSize.width;
  const paperHeight = containerSize.height;
  const SVG_WIDTH = rows * cellSize;
  const SVG_HEIGHT = cols * cellSize;

  // 5. ルビ
  const rubiRenderList: { gridIdx: number; ruby: string; length: number }[] = [];
  for (const r of rubiList) {
    const startTextIdx = r.index;
    const gridStart = textToGrid[startTextIdx];
    const pageStart = currentPage * cols * rows;
    const pageEnd = (currentPage + 1) * cols * rows;
    if (
      gridStart !== undefined &&
      gridStart >= pageStart &&
      gridStart < pageEnd
    ) {
      rubiRenderList.push({
        gridIdx: gridStart - pageStart,
        ruby: r.ruby,
        length: r.length,
      });
    }
  }

  // 6. SVG生成
  const charsSVG: React.ReactNode[] = [];
  if (direction === "vertical-rl" || writingMode === "vertical-rl") {
    for (let col = rows - 1; col >= 0; --col) {
      for (let row = 0; row < cols; ++row) {
        const idx = (rows - 1 - col) * cols + row;
        const ch = chars[idx] || "";
        const isCursor = pageCursorGridIdx === idx;
        const textIdx = gridToText[currentPage * cols * rows + idx];
        const rubi = rubiRenderList.find(r => r.gridIdx === idx);
        charsSVG.push(
          <g key={`ch-${col}-${row}`}>
            {isCursor && (
              <rect
                x={col * cellSize}
                y={row * cellSize}
                width={cellSize}
                height={cellSize}
                fill={CURSOR_HIGHLIGHT}
                opacity={0.21}
                rx={7}
              />
            )}
            {rubi && (
              <text
                x={col * cellSize + cellSize / 2}
                y={row * cellSize + cellSize * 0.3}
                textAnchor="middle"
                fontSize={fontSize * 0.48}
                fontFamily={fontFamily}
                fill="#cf8e1c"
                style={{ userSelect: "none", pointerEvents: "none", fontWeight: 700 }}
              >
                {rubi.ruby}
              </text>
            )}
            <rect
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="transparent"
              style={{ cursor: !!onGridClick && textIdx >= 0 ? "pointer" : "default" }}
              onClick={
                !!onGridClick && textIdx >= 0
                  ? (e) => { e.stopPropagation(); onGridClick(textIdx); }
                  : undefined
              }
            />
            <text
              x={col * cellSize + cellSize / 2}
              y={row * cellSize + cellSize * 0.75}
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily={fontFamily}
              fill="#192349"
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {ch}
            </text>
          </g>
        );
      }
    }
  } else {
    for (let row = 0; row < rows; ++row) {
      for (let col = 0; col < cols; ++col) {
        const x = rtl ? SVG_WIDTH - row * cellSize - cellSize / 2 : row * cellSize + cellSize / 2;
        const y = col * cellSize + cellSize * 0.75;
        const idx = col * rows + (rtl ? rows - 1 - row : row);
        const ch = chars[idx] || "";
        const isCursor = pageCursorGridIdx === idx;
        const textIdx = gridToText[currentPage * cols * rows + idx];
        const rubi = rubiRenderList.find(r => r.gridIdx === idx);
        charsSVG.push(
          <g key={`ch-${row}-${col}`}>
            {isCursor && (
              <rect
                x={rtl ? SVG_WIDTH - (row + 1) * cellSize : row * cellSize}
                y={col * cellSize}
                width={cellSize}
                height={cellSize}
                fill={CURSOR_HIGHLIGHT}
                opacity={0.21}
                rx={7}
              />
            )}
            {rubi && (
              <text
                x={x}
                y={col * cellSize + cellSize * 0.3}
                textAnchor="middle"
                fontSize={fontSize * 0.52}
                fontFamily={fontFamily}
                fill="#cf8e1c"
                style={{ userSelect: "none", pointerEvents: "none", fontWeight: 700 }}
              >
                {rubi.ruby}
              </text>
            )}
            <rect
              x={rtl ? SVG_WIDTH - (row + 1) * cellSize : row * cellSize}
              y={col * cellSize}
              width={cellSize}
              height={cellSize}
              fill="transparent"
              style={{ cursor: !!onGridClick && textIdx >= 0 ? "pointer" : "default" }}
              onClick={
                !!onGridClick && textIdx >= 0
                  ? (e) => { e.stopPropagation(); onGridClick(textIdx); }
                  : undefined
              }
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              fontSize={fontSize}
              fontFamily={fontFamily}
              fill="#192349"
              style={{ userSelect: "none", pointerEvents: "none" }}
              direction={direction}
            >
              {ch}
            </text>
          </g>
        );
      }
    }
  }

  // 列番号
  const lineNumberSVG: React.ReactNode[] = [];
  const lineNumFont = `${Math.max(13, fontSize * 0.9)}px ${fontFamily}`;
  const lineNumColor = "#bcb893";
  if (direction === "vertical-rl" || writingMode === "vertical-rl") {
    for (let col = rows - 1, colNum = 1; col >= 0; --col, ++colNum) {
      lineNumberSVG.push(
        <text
          key={`line-vert-${col}`}
          x={col * cellSize + cellSize / 2}
          y={cellSize * 0.75 - 18}
          fontSize={lineNumFont}
          fill={lineNumColor}
          fontFamily={fontFamily}
          textAnchor="middle"
          style={{ userSelect: "none", pointerEvents: "none", fontWeight: 700, opacity: 0.7 }}
        >
          {colNum}
        </text>
      );
    }
  } else {
    for (let row = 0; row < rows; ++row) {
      lineNumberSVG.push(
        <text
          key={`line-horz-${row}`}
          x={row * cellSize + cellSize / 2}
          y={cellSize * 0.6}
          fontSize={lineNumFont}
          fill={lineNumColor}
          fontFamily={fontFamily}
          textAnchor="middle"
          style={{ userSelect: "none", pointerEvents: "none", fontWeight: 700, opacity: 0.7 }}
        >
          {row + 1}
        </text>
      );
    }
  }

  // --- JSX ---
  return (
    <div
      style={{
        width: "100%", minHeight: 0, minWidth: 0, display: "flex",
        justifyContent: "center", alignItems: "center",
        background: "#e8e6d3", padding: "0", boxSizing: "border-box",
        flexDirection: "column"
      }}
      aria-label="原稿用紙プレビュー"
    >
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <button onClick={goToPreviousPage} disabled={currentPage === 0}>← 前のページ</button>
        <span style={{ margin: "0 16px" }}>
          {currentPage + 1} / {pages.length}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= pages.length - 1}>次のページ →</button>
      </div>
      <div
        style={{
          width: paperWidth,
          height: paperHeight,
          background: "linear-gradient(180deg,#fcfcf6 90%,#e7e3bb 100%)",
          borderRadius: 18,
          boxShadow: "0 8px 40px #d6d4ac77, 0 2px 4px #e7e3bbcc",
          border: "3px solid #dfdbad",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          aspectRatio: "297/210",
          transition: "width .2s, height .2s",
        }}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{
            display: "block",
            width: "95%",
            height: "95%",
            background: "#fffdf7",
            borderRadius: 13,
            margin: 0,
            boxShadow: "0 2px 14px #e0ddbd66",
          }}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
        >
          {/* タイトル */}
          <text
            x={SVG_WIDTH - 8}
            y={26}
            fontSize={fontSize * 1.08}
            fontFamily={fontFamily}
            fill="#9c8d3f"
            textAnchor="end"
            style={{ userSelect: "none", pointerEvents: "none", fontWeight: 700, letterSpacing: 2 }}
          >
            {title}
          </text>
          {/* 列番号 */}
          {lineNumberSVG}
          {/* 罫線 */}
          {[...Array(rows + 1)].map((_, x) => (
            <line
              key={`v${x}`}
              x1={x * cellSize}
              y1={0}
              x2={x * cellSize}
              y2={SVG_HEIGHT}
              stroke={x === Math.floor(rows / 2) ? STROKE_CENTER : STROKE_MAIN}
              strokeWidth={x === Math.floor(rows / 2) ? 4 : 1.5}
            />
          ))}
          {[...Array(cols + 1)].map((_, y) => (
            <line
              key={`h${y}`}
              x1={0}
              y1={y * cellSize}
              x2={SVG_WIDTH}
              y2={y * cellSize}
              stroke={STROKE_MAIN}
              strokeWidth={1.5}
            />
          ))}
          {/* 綴じマーク */}
          <rect
            x={SVG_WIDTH / 2 - 10}
            y={cellSize * 2.2}
            width={20}
            height={10}
            rx={4}
            fill={STROKE_CENTER}
            opacity={0.3}
          />
          <rect
            x={SVG_WIDTH / 2 - 10}
            y={SVG_HEIGHT - cellSize * 2.2 - 10}
            width={20}
            height={10}
            rx={4}
            fill={STROKE_CENTER}
            opacity={0.3}
          />
          {/* 本文・ルビ・カーソル */}
          {charsSVG}
        </svg>
        {/* 用紙の縁取り/質感エフェクト */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            boxShadow: "inset 0 2px 14px #f4ecd833, 0 0px 0px #fff0",
            border: "2.2px solid #efe8b6",
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
};

export default GenkouViewer;
