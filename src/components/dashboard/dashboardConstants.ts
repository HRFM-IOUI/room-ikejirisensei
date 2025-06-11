// 1. ブロック型・定義
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

// 2. 多言語型（韓国語含む、世界標準）
export type SupportedLang = "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";

// 3. 言語選択肢定数（UIのドロップダウン等で利用）
export const LANGUAGE_OPTIONS: { label: string; value: SupportedLang }[] = [
  { label: "日本語", value: "ja" },
  { label: "English", value: "en" },
  { label: "Türkçe", value: "tr" },
  { label: "中文", value: "zh" },
  { label: "한국어", value: "ko" },   // ←韓国語
  { label: "Русский", value: "ru" },
  { label: "العربية", value: "ar" },
];

// 4. フォント選択肢（多言語・韓国語拡張例も含む）
export const FONT_OPTIONS = [
  { label: "Noto Sans JP", value: "'Noto Sans JP', 'Meiryo', sans-serif" },
  { label: "Noto Serif JP", value: "'Noto Serif JP', 'Yu Mincho', serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Roboto", value: "Roboto, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Truetype Turkish", value: "'Arial', 'Helvetica Neue', Helvetica, sans-serif" },
  { label: "Noto Sans KR", value: "'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" }, // 韓国語向け
  // ...必要に応じてさらに拡張
];

// 5. フォントサイズ選択肢
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

// 6. カラープリセット（ブランドカラー含む全24色推奨）
export const COLOR_PRESETS = [
  { label: "ブランド濃紺", value: "#192349" },
  { label: "標準", value: "#222222" },
  { label: "ホワイト", value: "#ffffff" },
  { label: "ブランドブルー", value: "#5b8dee" },
  { label: "レッド", value: "#e17055" },
  { label: "グリーン", value: "#00b894" },
  { label: "オレンジ", value: "#fca311" },
  { label: "イエロー", value: "#ffe066" },
  { label: "パープル", value: "#9d4edd" },
  { label: "グレー", value: "#b2bec3" },
  { label: "ライトグレー", value: "#f1f2f6" },
  // ...必要に応じて全24色
];

// 7. 背景色プリセット
export const BG_COLOR_PRESETS = [
  { label: "なし", value: "" },
  { label: "白", value: "#ffffff" },
  { label: "ライトブルー", value: "#eaf4fb" },
  { label: "薄グレー", value: "#f6f6f6" },
  { label: "淡イエロー", value: "#fffbe7" },
  { label: "淡ピンク", value: "#fff1f3" },
  { label: "淡グリーン", value: "#f3fff1" },
];

// 8. ブロックテンプレートリスト（新規追加用）
export const blockTemplates: { type: BlockType; label: string }[] = [
  { type: "heading", label: "見出し" },
  { type: "text", label: "テキスト" },
  { type: "image", label: "画像" },
  { type: "video", label: "動画" }
];

// 9. ブロック生成ユーティリティ（ID一意・初期値付き）
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
