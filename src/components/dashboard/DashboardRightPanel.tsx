import React from "react";
import { Block } from "./dashboardConstants";
import styles from "./Dashboard.module.css";
import { FaExpand } from "react-icons/fa";

// SupportedLang型（記事エディタと揃える）
type SupportedLang = "ja" | "en" | "tr" | "zh" | "ko" | "ru" | "ar";

type Option = { label: string; value: string };
type ColorPreset = { value: string };

type Props = {
  selectedBlock: Block | undefined;
  handleBlockStyle: (id: string, style: Partial<Block['style']>) => void;
  FONT_OPTIONS: Option[];
  FONT_SIZE_OPTIONS: Option[];
  COLOR_PRESETS: ColorPreset[];
  BG_COLOR_PRESETS: ColorPreset[];
  onFullscreenEdit?: (blockId: string, language: SupportedLang) => void; // ←ここ型厳密化
  show?: boolean;
  mobile?: boolean;
  fullscreenLanguage?: SupportedLang; // 言語も受け取れるように拡張
};

const LABEL_COLOR = "#192349";
const HINT_COLOR = "#7c8193";

export default function DashboardRightPanel({
  selectedBlock,
  handleBlockStyle,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_PRESETS,
  BG_COLOR_PRESETS,
  onFullscreenEdit,
  show = true,
  mobile = false,
  fullscreenLanguage = "ja", // デフォルト言語
}: Props) {
  // 下線/打消し線複合管理
  const updateTextDecoration = (
    id: string,
    key: "underline" | "line-through",
    checked: boolean
  ) => {
    const current = selectedBlock?.style?.textDecoration || "";
    let arr = current.split(" ").filter(Boolean);
    if (checked) {
      if (!arr.includes(key)) arr.push(key);
    } else {
      arr = arr.filter(v => v !== key);
    }
    handleBlockStyle(id, { textDecoration: arr.join(" ") });
  };

  if (!show) return null;

  return (
    <aside
      className={styles.dashboardRight}
      style={{
        background: "#f9fbfd",
        border: "1.5px solid #e2e8f6",
        borderRadius: 17,
        boxShadow: "0 10px 32px 0 rgba(30,40,80,0.09)",
        padding: mobile ? "26px 13px 18px 13px" : "38px 32px 30px 32px",
        minWidth: mobile ? 220 : 290,
        maxWidth: mobile ? 310 : 340,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <h3
        style={{
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 22,
          color: LABEL_COLOR,
          letterSpacing: 1.1,
        }}
      >
        ブロック設定
      </h3>
      {selectedBlock ? (
        <>
          <div style={{
            color: "#245f86",
            fontWeight: 700,
            marginBottom: 12,
            fontSize: 15,
            letterSpacing: 0.5,
          }}>
            タイプ: <span style={{ color: "#0e53be", fontWeight: 700 }}>{selectedBlock.type}</span>
          </div>
          {/* フルスクリーン編集ボタン */}
          {(selectedBlock.type === "heading" || selectedBlock.type === "text") && onFullscreenEdit && (
            <button
              onClick={() =>
                onFullscreenEdit(selectedBlock.id, fullscreenLanguage)
              }
              style={{
                margin: "6px 0 16px 0",
                padding: "8px 24px 8px 15px",
                background: "#1d6fd2",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 9,
                boxShadow: "0 2px 8px 0 rgba(29,111,210,0.10)",
                transition: "background .16s",
              }}
            >
              <FaExpand />
              フルスクリーン執筆モード
            </button>
          )}

          {(selectedBlock.type === "heading" || selectedBlock.type === "text") && (
            <div style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  color: LABEL_COLOR, fontWeight: 700, fontSize: 15, marginRight: 10
                }}>
                  フォントファミリー
                </label>
                <select
                  value={selectedBlock.style?.fontFamily || ""}
                  onChange={e =>
                    handleBlockStyle(selectedBlock.id, { fontFamily: e.target.value })
                  }
                  style={{
                    color: LABEL_COLOR,
                    fontWeight: 600,
                    borderRadius: 7,
                    border: "1.2px solid #e0e4ef",
                    padding: "6px 15px",
                    fontSize: 15,
                    outline: "none",
                    marginTop: 2,
                  }}
                >
                  {FONT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ color: LABEL_COLOR }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  color: LABEL_COLOR, fontWeight: 700, fontSize: 15, marginRight: 10
                }}>
                  フォントサイズ
                </label>
                <select
                  value={selectedBlock.style?.fontSize || ""}
                  onChange={e =>
                    handleBlockStyle(selectedBlock.id, { fontSize: e.target.value })
                  }
                  style={{
                    color: LABEL_COLOR,
                    fontWeight: 600,
                    borderRadius: 7,
                    border: "1.2px solid #e0e4ef",
                    padding: "6px 15px",
                    fontSize: 15,
                    outline: "none",
                    marginTop: 2,
                  }}
                >
                  {FONT_SIZE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ color: LABEL_COLOR }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{
                marginBottom: 16, color: LABEL_COLOR, fontWeight: 700, fontSize: 15
              }}>
                文字スタイル
                <span style={{ marginLeft: 18, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={selectedBlock.style?.fontWeight === "bold"}
                    onChange={e =>
                      handleBlockStyle(selectedBlock.id, {
                        fontWeight: e.target.checked ? "bold" : "normal",
                      })
                    }
                    style={{ marginRight: 6, accentColor: "#1d6fd2" }}
                  />太字
                </span>
                <span style={{ marginLeft: 18, fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={selectedBlock.style?.fontStyle === "italic"}
                    onChange={e =>
                      handleBlockStyle(selectedBlock.id, {
                        fontStyle: e.target.checked ? "italic" : "normal",
                      })
                    }
                    style={{ marginRight: 6, accentColor: "#1d6fd2" }}
                  />斜体
                </span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  color: LABEL_COLOR, fontWeight: 700, fontSize: 15, marginRight: 8
                }}>
                  文字色
                </label>
                <input
                  type="color"
                  value={selectedBlock.style?.color || "#222222"}
                  onChange={e =>
                    handleBlockStyle(selectedBlock.id, { color: e.target.value })
                  }
                  style={{
                    marginRight: 10,
                    width: 25,
                    height: 25,
                    border: "none",
                    verticalAlign: "middle",
                  }}
                />
                {COLOR_PRESETS.map(opt => (
                  <button
                    key={opt.value}
                    style={{
                      background: opt.value,
                      width: 18,
                      height: 18,
                      border: "1px solid #ccd2e7",
                      margin: "0 2px",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleBlockStyle(selectedBlock.id, { color: opt.value })
                    }
                    tabIndex={-1}
                  />
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  color: LABEL_COLOR, fontWeight: 700, fontSize: 15, marginRight: 8
                }}>
                  背景色
                </label>
                <input
                  type="color"
                  value={selectedBlock.style?.backgroundColor || "#ffffff"}
                  onChange={e =>
                    handleBlockStyle(selectedBlock.id, { backgroundColor: e.target.value })
                  }
                  style={{
                    marginRight: 10,
                    width: 25,
                    height: 25,
                    border: "none",
                    verticalAlign: "middle",
                  }}
                />
                {BG_COLOR_PRESETS.map(opt => (
                  <button
                    key={opt.value}
                    style={{
                      background: opt.value || "#ffffff",
                      width: 18,
                      height: 18,
                      border: "1px solid #ccd2e7",
                      margin: "0 2px",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleBlockStyle(selectedBlock.id, { backgroundColor: opt.value })
                    }
                    tabIndex={-1}
                  />
                ))}
              </div>
              <div style={{
                marginBottom: 10, color: LABEL_COLOR, fontWeight: 700, fontSize: 15
              }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedBlock.style?.textDecoration?.includes("underline") || false}
                    onChange={e =>
                      updateTextDecoration(selectedBlock.id, "underline", e.target.checked)
                    }
                    style={{ marginRight: 8, accentColor: "#1d6fd2" }}
                  />下線
                </label>
                <span style={{ marginLeft: 24 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedBlock.style?.textDecoration?.includes("line-through") || false}
                      onChange={e =>
                        updateTextDecoration(selectedBlock.id, "line-through", e.target.checked)
                      }
                      style={{ marginRight: 8, accentColor: "#1d6fd2" }}
                    />打消し線
                  </label>
                </span>
              </div>
              <div style={{
                marginTop: 15,
                color: HINT_COLOR,
                fontSize: 13,
                borderTop: "1px solid #ececec",
                paddingTop: 12,
              }}>※今後: 装飾項目は無限拡張可能（多言語原稿用紙・出版/AI校正拡張も想定）</div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            color: LABEL_COLOR,
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center",
            marginTop: 44,
          }}
        >
          ブロックを選択してください
        </div>
      )}
    </aside>
  );
}
