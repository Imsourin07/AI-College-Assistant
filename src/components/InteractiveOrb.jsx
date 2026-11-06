import React, { useEffect, useRef } from 'react';

export default function InteractiveOrb({ size = 180, isAnalyzing = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let angleX = 0;
    let angleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Generate 3D sphere points (neural nodes)
    const nodeCount = 56;
    const radius = size * 0.38;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodes.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        baseRadius: 2.2 + (i % 3) * 0.8
      });
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - size / 2) * 0.0015;
      mouseY = (e.clientY - rect.top - size / 2) * 0.0015;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const speed = isAnalyzing ? 0.035 : 0.012;
      angleX += speed + mouseY * 0.3;
      angleY += speed * 1.3 + mouseX * 0.3;

      const centerX = size / 2;
      const centerY = size / 2;

      // Draw outer ambient glowing halo
      const radialGradient = ctx.createRadialGradient(
        centerX, centerY, radius * 0.2,
        centerX, centerY, radius * 1.25
      );
      radialGradient.addColorStop(0, 'rgba(129, 140, 248, 0.28)');
      radialGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.12)');
      radialGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = radialGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Project & transform 3D points
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projectedNodes = nodes.map((node) => {
        // Rotation around Y
        const x1 = node.x * cosY + node.z * sinY;
        const z1 = -node.x * sinY + node.z * cosY;

        // Rotation around X
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 260;
        const scale = fov / (fov + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;

        return { px, py, z: z2, scale, radius: node.baseRadius };
      });

      // Sort by Z for realistic depth
      projectedNodes.sort((a, b) => a.z - b.z);

      // Draw neural connections between close nodes
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].px - projectedNodes[j].px;
          const dy = projectedNodes[i].py - projectedNodes[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < size * 0.18) {
            const alpha = (1 - dist / (size * 0.18)) * 0.22 * Math.min(projectedNodes[i].scale, projectedNodes[j].scale);
            ctx.strokeStyle = isAnalyzing ? `rgba(6, 182, 212, ${alpha * 1.5})` : `rgba(165, 180, 252, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(projectedNodes[i].px, projectedNodes[i].py);
            ctx.lineTo(projectedNodes[j].px, projectedNodes[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of projectedNodes) {
        const nodeAlpha = Math.max(0.2, (node.z + radius) / (2 * radius));
        ctx.beginPath();
        ctx.arc(node.px, node.py, Math.max(1, node.radius * node.scale), 0, Math.PI * 2);

        if (isAnalyzing) {
          ctx.fillStyle = `rgba(56, 189, 248, ${nodeAlpha * 0.95})`;
        } else {
          ctx.fillStyle = `rgba(192, 132, 252, ${nodeAlpha * 0.85})`;
        }
        ctx.fill();
      }

      // Draw inner core pulse
      const corePulse = Math.sin(Date.now() * 0.003) * 3;
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 0.35 + corePulse
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.35, '#818cf8');
      coreGradient.addColorStop(0.7, '#6366f1');
      coreGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.35 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [size, isAnalyzing]);

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px`, display: 'block' }}
      />
    </div>
  );
}
