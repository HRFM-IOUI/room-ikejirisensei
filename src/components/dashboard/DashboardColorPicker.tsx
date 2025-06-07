import React from "react";

export type DashboardColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

const COLOR_OPTIONS = [
  { value: "#00FF00", label: "グリーン" },
  { value: "#00D1FF", label: "シアン" },
  { value: "#FFD700", label: "イエロー" },
  { value: "#FF00B8", label: "マゼンタ" },
  { value: "#FF4500", label: "オレンジ" },
  { value: "#1a1aff", label: "ブルー" },
  { value: "#192349", label: "ブランド色" },
  // ←ここ！レインボーやめて白ボタンに
  { value: "#fff", label: "ホワイト" },
];

const DashboardColorPicker: React.FC<DashboardColorPickerProps> = ({
  color,
  onChange
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ fontWeight: 700, color: "#192349", fontSize: 15 }}>テーマカラー</span>
      {COLOR_OPTIONS.map(opt => (
        <button
          key={opt.value}
          title={opt.label}
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
