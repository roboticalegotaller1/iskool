"use client";

import React, { useEffect, useRef } from 'react';

interface BruxaPixiSpriteProps {
  className?: string;
  width?: number;
  height?: number;
}

export const BruxaPixiSprite: React.FC<BruxaPixiSpriteProps> = ({
  className = "w-28 h-28",
  width = 96,
  height = 112
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones de resolución interna del canvas
    canvas.width = width;
    canvas.height = height;

    let animFrameId: number;
    let currentFrame = 0;
    let lastFrameTime = performance.now();
    const frameDuration = 160; // ms por fotograma (~6 fps de animación idle)

    const img = new Image();
    img.src = '/images/caracteres/bruja/bruxa.png';

    let isLoaded = false;
    img.onload = () => {
      isLoaded = true;
    };

    const render = (time: number) => {
      if (isLoaded && ctx) {
        // Actualizar fotograma de animación
        if (time - lastFrameTime >= frameDuration) {
          currentFrame = (currentFrame + 1) % 4;
          lastFrameTime = time;
        }

        ctx.clearRect(0, 0, width, height);

        // Coordenadas en la hoja de sprites bruxa.png (400x200px = cuadrícula de 2x2 celdas de 200x100px)
        // El personaje de la bruja se ubica en la mitad derecha (100px) de cada celda de 200x100
        const row = Math.floor(currentFrame / 2);
        const col = currentFrame % 2;
        const srcX = col * 200 + 100;
        const srcY = row * 100;
        const srcW = 100;
        const srcH = 100;

        ctx.save();
        // Trasladar el origen al centro del canvas
        ctx.translate(width / 2, height / 2);
        // Reflejar horizontalmente para que la bruja mire a la derecha (hacia el jefe)
        ctx.scale(-1, 1);

        // Dibujar el cuadro recortado de 100x100 centrado a tamaño 80x80px (encaja perfecto sin recortes ni distorsión)
        const destW = 80;
        const destH = 80;
        ctx.drawImage(
          img,
          srcX, srcY, srcW, srcH,
          -destW / 2, -destH / 2, destW, destH
        );

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      img.onload = null;
      img.src = '';
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [width, height]);

  return (
    <div 
      role="img" 
      aria-label="Animación del personaje Helena Bruxa"
      className={`relative inline-flex items-center justify-center filter drop-shadow-[0_6px_12px_rgba(168,85,247,0.8)] overflow-visible ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};
