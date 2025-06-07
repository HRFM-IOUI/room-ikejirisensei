import React, { useRef, useEffect } from "react";

type MatrixLanguageRainProps = {
  color: string; // タブ・ユーザー選択カラーを反映
};

const LANG_GREETINGS: string[] = [
  "Hello", "こんにちは", "H", "你好", "안녕하세요", "i", "Привет", "Hola", "مرحبا", "Bonjour",
  "Ciao", "R", "Merhaba", "Guten Tag", "שלום", "नमस्ते", "Hej", "Olá", "Selam", "Sawubona",
  "γειά", "O", "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", "Xin chào", "Szia", "Hallo", "Kamusta", "سلام", "สวัสดี",
  "Aloha", "Halo", "Bună", "Hej", "Tere", "Sveiki", "გამარჯობა", "Saluton",
];

// レインボーグラデの生成
const getRainbowGradient = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number
) => {
  const grad = ctx.createLinearGradient(x, y, x, y + len);
  grad.addColorStop(0, "#e66465");
  grad.addColorStop(0.25, "#fcaf3e");
  grad.addColorStop(0.5, "#fffb00");
  grad.addColorStop(0.75, "#00ff85");
  grad.addColorStop(1, "#00baff");
  return grad;
};

export default function MatrixLanguageRain({ color }: MatrixLanguageRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let running = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // レインカラム
    const fontSize = 26;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.random() * (height / fontSize)
    );

    // カラー判定
    const useRainbow = color === "rainbow";

    function draw() {
      if (!ctx || !running) return;
      // 背景の半透明塗り（トレイル演出）
      ctx.fillStyle = "rgba(16,18,32,0.27)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'Noto Sans JP', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      for (let i = 0; i < columns; i++) {
        const greet = LANG_GREETINGS[Math.floor(Math.random() * LANG_GREETINGS.length)];
        const x = i * fontSize + fontSize / 2;
        const y = drops[i] * fontSize;

        // カラー
        ctx.fillStyle = useRainbow
          ? getRainbowGradient(ctx, x, y, fontSize * 1.5)
          : color;

        ctx.fillText(greet, x, y);

        // Y進行
        if (y > height && Math.random() > 0.96) {
          drops[i] = 0;
        } else {
          drops[i] += Math.random() * 0.55 + 0.75;
        }
      }
    }

    let animationId: number;
    function animate() {
      draw();
      animationId = window.requestAnimationFrame(animate);
    }
    animate();

    // リサイズ対応
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.52,
        transition: "opacity 0.33s",
        background: "transparent",
      }}
      aria-hidden="true"
    />
  );
}
