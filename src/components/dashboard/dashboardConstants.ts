// src/components/dashboard/dashboardConstants.ts

export type BlockType = "heading" | "text" | "image" | "video";
export type Block = {
  id: string;
  type: BlockType;
  content: string;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    fontStyle?: string;
    color?: string;
    backgroundColor?: string;
    textDecoration?: string;
  };
};

// 日本語・デザイナー・欧文フォントセット（WordPress超え）
export const FONT_OPTIONS = [
  { label: "Noto Sans JP", value: "'Noto Sans JP', 'Meiryo', sans-serif" },
  { label: "Noto Serif JP", value: "'Noto Serif JP', 'Yu Mincho', serif" },
  { label: "源ノ角ゴシック", value: "'Source Han Sans JP', 'Noto Sans JP', sans-serif" },
  { label: "源ノ明朝", value: "'Source Han Serif JP', 'Noto Serif JP', serif" },
  { label: "M PLUS 1p", value: "'M PLUS 1p', 'Noto Sans JP', sans-serif" },
  { label: "Kosugi Maru", value: "'Kosugi Maru', 'Noto Sans JP', sans-serif" },
  { label: "Sawarabi Mincho", value: "'Sawarabi Mincho', serif" },
  { label: "Zen Kaku Gothic", value: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif" },
  { label: "ロゴタイプゴシック", value: "'Reggae One', 'Noto Sans JP', sans-serif" },
  { label: "RocknRoll One", value: "'RocknRoll One', 'Noto Sans JP', sans-serif" },
  { label: "Yomogi", value: "'Yomogi', cursive" },
  { label: "Kiwi Maru", value: "'Kiwi Maru', serif" },
  { label: "Rampart One", value: "'Rampart One', cursive" },
  { label: "Anton", value: "Anton, 'Arial Black', sans-serif" },
  { label: "Bebas Neue", value: "'Bebas Neue', Arial, sans-serif" },
  { label: "Roboto", value: "Roboto, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive, sans-serif" },
  { label: "MS ゴシック", value: "'MS Gothic', 'ＭＳ ゴシック', Osaka, monospace" },
  { label: "MS 明朝", value: "'MS Mincho', 'ＭＳ 明朝', serif" },
];

// フォントサイズ例
export const FONT_SIZE_OPTIONS = [
  { label: "小 (12px)", value: "12px" },
  { label: "標準 (14px)", value: "14px" },
  { label: "やや大 (16px)", value: "16px" },
  { label: "大 (18px)", value: "18px" },
  { label: "特大 (20px)", value: "20px" },
  { label: "超特大 (24px)", value: "24px" },
  { label: "見出し (32px)", value: "32px" },
  { label: "超見出し (40px)", value: "40px" },
  { label: "最小 (10px)", value: "10px" },
];

// 24色（ブランドカラー#192349含む・和風/欧風/アクセント全網羅）
export const COLOR_PRESETS = [
  { label: "ブランド濃紺", value: "#192349" }, // 追加
  { label: "標準", value: "#222" },
  { label: "ホワイト", value: "#fff" },
  { label: "ブランドブルー", value: "#5b8dee" },
  { label: "レッド", value: "#e17055" },
  { label: "グリーン", value: "#00b894" },
  { label: "オレンジ", value: "#fca311" },
  { label: "イエロー", value: "#ffe066" },
  { label: "パープル", value: "#9d4edd" },
  { label: "グレー", value: "#b2bec3" },
  { label: "ライトグレー", value: "#f1f2f6" },
  { label: "桜ピンク", value: "#fcb1b1" },
  { label: "萌黄色", value: "#a3c77b" },
  { label: "浅葱色", value: "#00a3af" },
  { label: "紺色", value: "#1b263b" },
  { label: "若竹色", value: "#b6d7a8" },
  { label: "黄金", value: "#ffd700" },
  { label: "紫紺", value: "#46006b" },
  { label: "茜色", value: "#b7282e" },
  { label: "藍色", value: "#165baa" },
  { label: "群青", value: "#4169e1" },
  { label: "ターコイズ", value: "#40e0d0" },
  { label: "ベージュ", value: "#f5e6cc" },
  { label: "コーラル", value: "#ff7675" },
  { label: "カナリア", value: "#ffe900" },
];

// 背景色
export const BG_COLOR_PRESETS = [
  { label: "なし", value: "" },
  { label: "白", value: "#fff" },
  { label: "ライトブルー", value: "#eaf4fb" },
  { label: "薄グレー", value: "#f6f6f6" },
  { label: "淡イエロー", value: "#fffbe7" },
  { label: "淡ピンク", value: "#fff1f3" },
  { label: "淡グリーン", value: "#f3fff1" },
];

// ブロックテンプレート
export const blockTemplates: { type: BlockType; label: string }[] = [
  { type: "heading", label: "見出し" },
  { type: "text", label: "テキスト" },
  { type: "image", label: "画像" },
  { type: "video", label: "動画" }
];

// ブロックファクトリ
export function createBlock(type: BlockType): Block {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    content:
      type === "heading"
        ? "見出しテキスト"
        : type === "text"
        ? "本文テキスト"
        : "",
    style: {
      fontFamily: "",
      fontSize: "",
      fontWeight: type === "heading" ? "bold" : "normal",
      fontStyle: "normal",
      color: "#222",
      backgroundColor: "",
      textDecoration: "",
    }
  };
}
