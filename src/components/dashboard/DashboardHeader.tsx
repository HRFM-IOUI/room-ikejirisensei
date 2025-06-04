import React from "react";

export default function DashboardHeader() {
  const labelColor = "#192349";
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", marginBottom: 18, marginTop: 8
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, color: labelColor, letterSpacing: 1.5 }}>
        池尻先生サイト管理ダッシュボード 
      </div>
      <div>
        <span style={{ marginRight: 16, color: "#192349", fontWeight: 300 }}> for WMI</span>
        <button style={{
          background: "#00b894", color: "#fff", border: "none", borderRadius: 5, padding: "9px 18px",
          fontWeight: 700, fontSize: 17, letterSpacing: 1
        }}>保存</button>
      </div>
    </header>
  );
}
