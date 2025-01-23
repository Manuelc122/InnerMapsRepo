import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioData: Float32Array | null;
}

export function AudioVisualizer({ audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3B82F6'; // Blue-500

    // Draw visualization
    const barWidth = 2;
    const barGap = 1;
    const bars = Math.floor(canvas.width / (barWidth + barGap));
    const step = Math.floor(audioData.length / bars);

    for (let i = 0; i < bars; i++) {
      const dataIndex = i * step;
      const value = Math.abs(audioData[dataIndex] || 0);
      const height = value * (canvas.height / 2);
      const x = i * (barWidth + barGap);
      const y = (canvas.height - height) / 2;

      ctx.fillRect(x, y, barWidth, height);
    }
  }, [audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="rounded bg-blue-50"
    />
  );
}