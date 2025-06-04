import React from "react";

const COLS_PER_PAGE = 20;
const ROWS = 20;
const CELL_SIZE = 42; // 読みやすい大きさ
const GRID_WIDTH = COLS_PER_PAGE * CELL_SIZE;
const GRID_HEIGHT = ROWS * CELL_SIZE;
const STROKE_MAIN = "#b9cbe9";
const STROKE_CENTER = "#ddbb4b";

type Props = {
  text: string;
  page: number;
};

function getPageChars(text: string, page: number) {
  const chars = text.replace(/[\r\n]/g, "").split("");
  const start = page * COLS_PER_PAGE * ROWS;
  return chars.slice(start, start + COLS_PER_PAGE * ROWS);
}

const GenkouViewer: React.FC<Props> = ({ text, page }) => {
  const chars = getPageChars(text, page);

  // 右→左、上→下の縦書きループ
  const charsSVG: React.ReactNode[] = [];
  for (let col = COLS_PER_PAGE - 1; col >= 0; --col) {
    for (let row = 0; row < ROWS; ++row) {
      const idx = (COLS_PER_PAGE - 1 - col) * ROWS + row;
      const ch = chars[idx] || "";
      if (ch) {
        charsSVG.push(
          <text
            key={`ch-${col}-${row}`}
            x={col * CELL_SIZE + CELL_SIZE / 2}
            y={row * CELL_SIZE + CELL_SIZE * 0.72}
            textAnchor="middle"
            fontSize="28"
            fontFamily="'Noto Serif JP', serif"
            fill="#192349"
            style={{ userSelect: "none", pointerEvents: "none" }}
          >
            {ch}
          </text>
        );
      }
    }
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
        background: "#fcfcf6",
        borderRadius: 18,
        border: "3px solid #e7e3bb",
        boxShadow: "0 6px 30px #e7e6b7a0",
        overflow: "auto",
        padding: 12,
        maxHeight: "78vh", // 画面の約8割まで
      }}
    >
      <svg
        viewBox={`0 0 ${GRID_WIDTH} ${GRID_HEIGHT}`}
        style={{
          display: "block",
          width: "100%",
          maxWidth: "100vw",
          height: "auto",
          maxHeight: "74vh",
          background: "#fcfcf6",
          borderRadius: 14,
          margin: 0,
        }}
      >
        {[...Array(COLS_PER_PAGE + 1)].map((_, x) => (
          <line
            key={`v${x}`}
            x1={x * CELL_SIZE}
            y1={0}
            x2={x * CELL_SIZE}
            y2={GRID_HEIGHT}
            stroke={x === 10 ? STROKE_CENTER : STROKE_MAIN}
            strokeWidth={x === 10 ? 4 : 1.5}
          />
        ))}
        {[...Array(ROWS + 1)].map((_, y) => (
          <line
            key={`h${y}`}
            x1={0}
            y1={y * CELL_SIZE}
            x2={GRID_WIDTH}
            y2={y * CELL_SIZE}
            stroke={STROKE_MAIN}
            strokeWidth={1.5}
          />
        ))}
        {/* 綴じマーク */}
        <rect
          x={GRID_WIDTH / 2 - 10}
          y={CELL_SIZE * 2.8}
          width={20}
          height={10}
          rx={4}
          fill={STROKE_CENTER}
          opacity={0.3}
        />
        <rect
          x={GRID_WIDTH / 2 - 10}
          y={GRID_HEIGHT - CELL_SIZE * 2.8 - 10}
          width={20}
          height={10}
          rx={4}
          fill={STROKE_CENTER}
          opacity={0.3}
        />
        {charsSVG}
      </svg>
    </div>
  );
};

export default GenkouViewer;
