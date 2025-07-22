import React from "react";

export default function SplashScreen() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "#00AEEF", // 원하는 배경색
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}>
      <img src="/fairy_bot_enlarged_plus2cm.gif" alt="logo" style={{ width: 200, height: 200 }} />
    </div>
  );
}