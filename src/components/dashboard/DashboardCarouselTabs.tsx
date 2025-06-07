import React, { useRef, useEffect, useState } from "react";
import "./DashboardCarouselTabs.css";

type Tab = { key: string; label: string };

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  color: string;
};

export default function DashboardCarouselTabs({
  tabs,
  activeTab,
  onTabChange,
  color,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex(t => t.key === activeTab);

  // テーマが白か判定
  const isWhiteTheme = color === "#fff" || color.toLowerCase() === "white";

  // 中央寄せ
  useEffect(() => {
    if (containerRef.current && activeIndex >= 0) {
      const tabEl = containerRef.current.querySelectorAll<HTMLDivElement>(".carousel-tab-card")[activeIndex];
      if (tabEl) {
        const { offsetLeft, offsetWidth } = tabEl;
        const { clientWidth } = containerRef.current;
        containerRef.current.scrollTo({
          left: offsetLeft - clientWidth / 2 + offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex, tabs.length]);

  // モバイル
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ドロップダウン
  const [mobileOpen, setMobileOpen] = useState(false);

  // グリッチ／カルーセルデザインは絶対維持
  const getTabStyle = (isActive: boolean): React.CSSProperties =>
    isWhiteTheme
      ? {
          background: "#fff",
          color: "#192349",
          fontWeight: isActive ? 900 : 600,
          fontSize: 18,
          border: isActive ? "2.2px solid #192349" : "1px solid #e0e4ef",
          borderRadius: 16,
          marginRight: 18,
          cursor: "pointer",
          boxShadow: isActive
            ? "0 2px 20px #1923491a"
            : "0 1.5px 7px 0 rgba(32,56,56,0.06)",
          letterSpacing: 1.2,
          outline: "none",
          userSelect: "none",
          minWidth: 106,
          minHeight: 42,
          position: "relative",
          transition: "all .2s cubic-bezier(0.44,1.54,.85,1)",
          zIndex: isActive ? 2 : 1,
        }
      : {
          transform: isActive ? "scale(1.13) translateY(-12px)" : "scale(1) translateY(0)",
          boxShadow: isActive
            ? "0 6px 24px #2de37680"
            : "0 2px 12px #1118",
          background: isActive
            ? color
            : "#181822",
          color: isActive ? "#fff" : "#7cf2b7",
          marginRight: 18,
          minWidth: 102,
          minHeight: 42,
          fontWeight: isActive ? 800 : 600,
          fontSize: isActive ? 17.5 : 15.5,
          borderRadius: 13,
          cursor: "pointer",
          letterSpacing: 1.15,
          textAlign: "center" as const,
          userSelect: "none",
          transition: "all .22s cubic-bezier(0.44,1.54,.85,1)",
          zIndex: isActive ? 3 : 1,
          outline: isActive ? `2px solid ${color}` : "none",
          border: "none",
          position: "relative" as const,
        };

  // --- レンダリング ---
  // モバイル
  if (isMobile) {
    return (
      <div
        className="carousel-tabs-mobile"
        style={{
          margin: "0 0 12px 0",
          width: "100%",
        }}
      >
        <button
          className="carousel-tabs-mobile-toggle"
          aria-haspopup="listbox"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(open => !open)}
          style={{
            width: "100%",
            background: "#fff",
            color: "#192349",
            fontWeight: 800,
            fontSize: 17,
            border: "2px solid #192349",
            borderRadius: 12,
            padding: "12px 22px",
            boxShadow: "0 2px 18px #19234916",
            textAlign: "left",
            position: "relative",
          }}
        >
          {tabs[activeIndex]?.label ?? "メニュー"}
          <span style={{
            float: "right",
            fontWeight: 900,
            fontSize: 15,
            marginLeft: 10,
          }}>▼</span>
        </button>
        {mobileOpen && (
          <ul
            className="carousel-tabs-mobile-list"
            style={{
              background: "#fff",
              border: "1.3px solid #192349",
              borderRadius: 10,
              margin: 0,
              marginTop: 2,
              padding: 0,
              listStyle: "none",
              zIndex: 2000,
              boxShadow: "0 8px 28px #19234918",
            }}
            role="listbox"
          >
            {tabs.map((tab) => (
              <li
                key={tab.key}
                role="option"
                aria-selected={activeTab === tab.key}
                tabIndex={0}
                className={`carousel-tabs-mobile-item${activeTab === tab.key ? " active" : ""}`}
                onClick={() => {
                  setMobileOpen(false);
                  onTabChange(tab.key);
                }}
                style={{
                  background: "#fff",
                  color: "#192349",
                  fontWeight: activeTab === tab.key ? 900 : 600,
                  fontSize: 16,
                  borderBottom: activeTab === tab.key ? "2px solid #192349" : "none",
                  padding: "14px 26px",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // デスクトップ・カルーセルタブ（演出維持、白テーマ時だけ配色反映）
  return (
    <nav
      className="carousel-tabs-bg"
      aria-label="ダッシュボードタブ"
      style={{
        background: isWhiteTheme ? "#fff" : undefined,
        borderRadius: isWhiteTheme ? 18 : undefined,
        boxShadow: isWhiteTheme ? "0 2px 16px #19234914" : undefined,
        padding: isWhiteTheme ? "6px 2vw" : undefined,
        transition: "background .23s",
        marginBottom: 18,
        width: "100%",
        overflowX: "auto",
      }}
    >
      <div
        className="carousel-tabs"
        ref={containerRef}
        style={{
          display: "flex",
          alignItems: "flex-end",
          overflowX: "auto",
          whiteSpace: "nowrap",
          gap: 0,
          background: isWhiteTheme ? "#fff" : undefined,
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={tab.key}
            className={`carousel-tab-card${i === activeIndex ? " active" : ""}`}
            style={getTabStyle(i === activeIndex)}
            onClick={() => onTabChange(tab.key)}
            tabIndex={0}
            aria-current={activeTab === tab.key ? "page" : undefined}
          >
            {tab.label}
            {/* 残像・グリッチ・光演出はclassとcss側で維持 */}
            {!isWhiteTheme && (
              <div className="carouselPanelGlitch" />
            )}
            {!isWhiteTheme && (
              <div className="carouselTabGlow" />
            )}
          </div>
        ))}
        {/* 左右矢印 */}
        <button
          className="carousel-arrow left"
          style={{
            background: isWhiteTheme ? "#fff" : undefined,
            color: isWhiteTheme ? "#192349" : undefined,
            border: isWhiteTheme ? "1px solid #192349" : undefined,
          }}
          onClick={() =>
            onTabChange(tabs[(activeIndex + tabs.length - 1) % tabs.length].key)
          }
          aria-label="前のタブ"
        >←</button>
        <button
          className="carousel-arrow right"
          style={{
            background: isWhiteTheme ? "#fff" : undefined,
            color: isWhiteTheme ? "#192349" : undefined,
            border: isWhiteTheme ? "1px solid #192349" : undefined,
          }}
          onClick={() =>
            onTabChange(tabs[(activeIndex + 1) % tabs.length].key)
          }
          aria-label="次のタブ"
        >→</button>
      </div>
    </nav>
  );
}
