import React from "react";

// 言語ごとの色名ラベル
const COLOR_LABELS: Record<string, Record<string, string>> = {
  ja: {
    green: "グリーン",
    cyan: "シアン",
    yellow: "イエロー",
    magenta: "マゼンタ",
    orange: "オレンジ",
    blue: "ブルー",
    white: "ホワイト"
  },
  en: {
    green: "Green",
    cyan: "Cyan",
    yellow: "Yellow",
    magenta: "Magenta",
    orange: "Orange",
    blue: "Blue",
    white: "White"
  },
  tr: {
    green: "Yeşil",
    cyan: "Camgöbeği",
    yellow: "Sarı",
    magenta: "Macenta",
    orange: "Turuncu",
    blue: "Mavi",
    white: "Beyaz"
  },
  ko: {
    green: "그린",
    cyan: "시안",
    yellow: "옐로우",
    magenta: "마젠타",
    orange: "오렌지",
    blue: "블루",
    white: "화이트"
  },
  zh: {
    green: "绿色",
    cyan: "青色",
    yellow: "黄色",
    magenta: "洋红",
    orange: "橙色",
    blue: "蓝色",
    white: "白色"
  },
  ar: {
    green: "أخضر",
    cyan: "سماوي",
    yellow: "أصفر",
    magenta: "أرجواني",
    orange: "برتقالي",
    blue: "أزرق",
    white: "أبيض"
  }
  // 必要なら他の言語も追加可能
};

type ColorKey = "green" | "cyan" | "yellow" | "magenta" | "orange" | "blue" | "white";

const COLOR_OPTIONS: { value: string; key: ColorKey }[] = [
  { value: "#00FF00", key: "green" },
  { value: "#00D1FF", key: "cyan" },
  { value: "#FFD700", key: "yellow" },
  { value: "#FF00B8", key: "magenta" },
  { value: "#FF4500", key: "orange" },
  { value: "#1a1aff", key: "blue" },
  { value: "#ffffff", key: "white" },
];

export type DashboardColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
  lang?: string; // "ja" | "en" | "tr" | "ko" | "zh" | "ar"
};

const COLOR_PICKER_LABELS: Record<string, string> = {
  ja: "テーマカラー",
  en: "Theme Color",
  tr: "Tema Rengi",
  ko: "테마 색상",
  zh: "主题颜色",
  ar: "لون السمة"
};

const ARIA_LABELS: Record<string, (color: string) => string> = {
  ja: (color) => `テーマカラーを${color}に変更`,
  en: (color) => `Change theme color to ${color}`,
  tr: (color) => `Tema rengini ${color} olarak değiştir`,
  ko: (color) => `테마 색상을 ${color}(으)로 변경`,
  zh: (color) => `将主题颜色更改为${color}`,
  ar: (color) => `تغيير لون السمة إلى ${color}`
};

const DashboardColorPicker: React.FC<DashboardColorPickerProps> = ({
  color,
  onChange,
  lang = "ja"
}) => {
  const labels = COLOR_LABELS[lang] || COLOR_LABELS.ja;
  const pickerLabel = COLOR_PICKER_LABELS[lang] || COLOR_PICKER_LABELS.ja;
  const ariaLabelFn = ARIA_LABELS[lang] || ARIA_LABELS.ja;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ fontWeight: 700, color: "#192349", fontSize: 15 }}>
        {pickerLabel}
      </span>
      {COLOR_OPTIONS.map(opt => (
        <button
          key={opt.value}
          title={labels[opt.key]}
          aria-label={ariaLabelFn(labels[opt.key])}
          onClick={() => onChange(opt.value)}
          style={{
            width: 36,
            height: 36,
            border: color === opt.value ? "3px solid #192349" : "2px solid #e0e0e0",
            borderRadius: "50%",
            outline: "none",
            cursor: "pointer",
            background: opt.value,
            marginRight: 2,
            boxShadow: color === opt.value ? "0 2px 10px #19234944" : undefined,
          }}
        />
      ))}
    </div>
  );
};

export default DashboardColorPicker;
