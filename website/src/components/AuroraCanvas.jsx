import { useEffect, useRef } from 'react';

/** Canvas 极光背景 — 基于 react-bits 风格 */
export default function AuroraCanvas({
  colorStops = ['#E85D3A', '#FF8C5A', '#1a1a2e', '#16213e'],
  amplitude = 0.8,
  speed = 0.6,
  blend = 0.6,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += speed * 0.01;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const layers = 4;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const offset = l * (Math.PI / layers) + time * 0.5;
        const a = amplitude * (1 - l * 0.15);

        for (let x = 0; x <= w; x += 2) {
          const y = h / 2
            + Math.sin(x * 0.008 + offset) * a * 30
            + Math.sin(x * 0.015 + offset * 0.7) * a * 20
            + Math.sin(x * 0.003 + offset * 1.3 + l) * a * 15;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, w, 0);
        const stops = colorStops.slice(l % (colorStops.length - 2), l % (colorStops.length - 2) + 2);
        stops.forEach((stop, i) => grad.addColorStop(i, stop));
        ctx.fillStyle = grad;
        ctx.globalAlpha = blend * (0.4 - l * 0.08);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [colorStops, amplitude, speed, blend]);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
}
