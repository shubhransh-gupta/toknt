import { useEffect, useRef } from 'react';

type BlockType = 'grass' | 'dirt' | 'stone' | 'diamond' | 'gold' | 'log' | 'leaves' | 'cloud';

interface FloatingBlock {
  x: number;
  y: number;
  size: number;
  type: BlockType;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  phase: number;
}

interface Cloud {
  x: number;
  y: number;
  scale: number;
  speed: number;
  blocks: { dx: number; dy: number }[];
}

interface Tree {
  x: number;
  groundY: number;
}

interface Particle {
  x: number;
  y: number;
  vy: number;
  life: number;
  color: string;
}

const BLOCK_COLORS: Record<BlockType, [string, string, string]> = {
  grass: ['#5d9e2f', '#4a7c23', '#8b6914'],
  dirt: ['#8b6914', '#6b4f10', '#4a3508'],
  stone: ['#9a9a9a', '#7f7f7f', '#555555'],
  diamond: ['#6ef0ff', '#4ee4ef', '#2a9aa0'],
  gold: ['#ffe566', '#ffd700', '#c9a800'],
  log: ['#6b4423', '#5c4033', '#3d2817'],
  leaves: ['#3d8b40', '#2d6b30', '#1d4b20'],
  cloud: ['#ffffff', '#eef6ff', '#dceeff'],
};

function drawBlockFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: BlockType,
  face: 'top' | 'front' | 'side'
) {
  const [c1, c2, c3] = BLOCK_COLORS[type];
  const color = face === 'top' ? c1 : face === 'front' ? c2 : c3;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

  if (type === 'grass' && face === 'top') {
    ctx.fillStyle = '#6eb54a';
    ctx.fillRect(x + 2, y + 2, size - 4, 3);
  }
  if (type === 'diamond' && face === 'top') {
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(x + size * 0.25, y + size * 0.2, size * 0.2, size * 0.15);
  }
}

function drawIsoBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, type: BlockType) {
  const h = size * 0.55;
  drawBlockFace(ctx, cx - size / 2, cy - size - h, size, type, 'top');
  drawBlockFace(ctx, cx - size / 2, cy - h, size, type, 'front');
  drawBlockFace(ctx, cx + size / 2 - size * 0.35, cy - h + size * 0.15, size * 0.35, type, 'side');
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud) {
  const bs = 14 * cloud.scale;
  for (const b of cloud.blocks) {
    drawBlockFace(ctx, cloud.x + b.dx * bs, cloud.y + b.dy * bs, bs, 'cloud', 'top');
  }
}

function drawTree(ctx: CanvasRenderingContext2D, tree: Tree, groundY: number, blockSize: number) {
  const bs = blockSize;
  const x = tree.x;
  const y = groundY - bs;

  for (let i = 0; i < 3; i++) {
    drawBlockFace(ctx, x, y - i * bs, bs, 'log', 'front');
  }

  const leafY = y - 3 * bs;
  for (let row = -1; row <= 1; row++) {
    for (let col = -1; col <= 1; col++) {
      if (Math.abs(row) + Math.abs(col) <= 1 || row === 0) {
        drawBlockFace(ctx, x + col * bs - bs, leafY + row * bs, bs, 'leaves', 'top');
      }
    }
  }
  drawBlockFace(ctx, x - bs, leafY - bs, bs, 'leaves', 'top');
  drawBlockFace(ctx, x, leafY - bs, bs, 'leaves', 'top');
  drawBlockFace(ctx, x + bs, leafY - bs, bs, 'leaves', 'top');
}

function initClouds(width: number): Cloud[] {
  const patterns = [
    [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }, { dx: 1, dy: -1 }],
    [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 2, dy: 0 }],
    [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }, { dx: 2, dy: 0 }],
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    x: (width / 8) * i + Math.random() * 120,
    y: 40 + Math.random() * 80 + i * 12,
    scale: 0.8 + Math.random() * 0.6,
    speed: 0.15 + Math.random() * 0.25,
    blocks: patterns[i % patterns.length],
  }));
}

function initFloatingBlocks(width: number, height: number): FloatingBlock[] {
  const types: BlockType[] = ['grass', 'dirt', 'stone', 'diamond', 'gold'];
  return Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * width,
    y: height * 0.15 + Math.random() * height * 0.55,
    size: 18 + Math.random() * 16,
    type: types[i % types.length],
    vx: (Math.random() - 0.5) * 0.4,
    vy: Math.sin(i) * 0.15,
    rot: Math.random() * Math.PI,
    rotSpeed: (Math.random() - 0.5) * 0.008,
    phase: Math.random() * Math.PI * 2,
  }));
}

function initTrees(width: number): Tree[] {
  return Array.from({ length: Math.floor(width / 180) + 2 }, (_, i) => ({
    x: i * 160 + 40 + Math.random() * 60,
    groundY: 0,
  }));
}

export function MinecraftBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    clouds: [] as Cloud[],
    floaters: [] as FloatingBlock[],
    trees: [] as Tree[],
    particles: [] as Particle[],
    groundY: 0,
    blockSize: 24,
    time: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId = 0;
    let lastSpawn = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      s.width = w;
      s.height = h;
      s.groundY = h * 0.72;
      s.blockSize = Math.max(20, Math.min(28, w / 50));
      s.clouds = initClouds(w);
      s.floaters = initFloatingBlocks(w, h);
      s.trees = initTrees(w);
    };

    const spawnParticle = (now: number) => {
      if (now - lastSpawn < 400) return;
      lastSpawn = now;
      const s = stateRef.current;
      if (s.particles.length > 40) return;
      s.particles.push({
        x: Math.random() * s.width,
        y: s.groundY - 20,
        vy: -0.6 - Math.random() * 1.2,
        life: 1,
        color: Math.random() > 0.5 ? '#4ee4ef' : '#17dd62',
      });
    };

    const drawSky = (w: number, h: number, t: number) => {
      const cycle = (Math.sin(t * 0.0003) + 1) / 2;
      const top = `rgb(${90 + cycle * 20}, ${170 + cycle * 30}, ${255})`;
      const mid = `rgb(${120 + cycle * 15}, ${200 + cycle * 20}, ${255})`;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, top);
      grad.addColorStop(0.45, mid);
      grad.addColorStop(0.72, '#5d9e2f');
      grad.addColorStop(0.72, '#4a7c23');
      grad.addColorStop(1, '#3a6018');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const sunX = w * 0.78 + Math.sin(t * 0.0002) * 30;
      const sunY = h * 0.14 + Math.cos(t * 0.00015) * 10;
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(sunX, sunY, 36, 36);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sunX + 4, sunY + 4, 28, 28);
    };

    const drawTerrain = (w: number, groundY: number, bs: number, t: number) => {
      const scroll = (t * 0.02) % bs;
      for (let x = -bs; x < w + bs; x += bs) {
        const gx = x - scroll;
        drawBlockFace(ctx, gx, groundY, bs, 'grass', 'top');
        for (let d = 1; d <= 3; d++) {
          drawBlockFace(ctx, gx, groundY + d * bs, bs, d === 1 ? 'dirt' : 'stone', 'front');
        }
      }

      for (let x = 0; x < w; x += bs * 2) {
        const hillH = 2 + Math.floor((Math.sin(x * 0.02 + t * 0.0005) + 1) * 1.5);
        for (let i = 0; i < hillH; i++) {
          drawBlockFace(ctx, x, groundY - (i + 1) * bs, bs, i === hillH - 1 ? 'grass' : 'stone', 'front');
        }
      }
    };

    const tick = (now: number) => {
      const s = stateRef.current;
      s.time = now;
      const { width: w, height: h, groundY, blockSize: bs } = s;

      ctx.clearRect(0, 0, w, h);
      drawSky(w, h, now);

      for (const cloud of s.clouds) {
        cloud.x += cloud.speed;
        if (cloud.x > w + 200) cloud.x = -180;
        drawCloud(ctx, cloud);
      }

      drawTerrain(w, groundY, bs, now);

      for (const tree of s.trees) {
        const parallaxX = ((tree.x - (now * 0.015) % (w + 200)) + w + 200) % (w + 200) - 100;
        drawTree(ctx, { ...tree, x: parallaxX }, groundY, bs);
      }

      for (const floater of s.floaters) {
        floater.x += floater.vx;
        floater.y += Math.sin(now * 0.001 + floater.phase) * 0.35 + floater.vy * 0.1;
        floater.rot += floater.rotSpeed;

        if (floater.x < -60) floater.x = w + 60;
        if (floater.x > w + 60) floater.x = -60;

        ctx.save();
        ctx.translate(floater.x, floater.y);
        ctx.rotate(floater.rot);
        drawIsoBlock(ctx, 0, 0, floater.size, floater.type);
        ctx.restore();
      }

      spawnParticle(now);
      s.particles = s.particles.filter((p) => {
        p.y += p.vy;
        p.life -= 0.008;
        if (p.life <= 0) return false;
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = p.color;
        const sz = 6 + (1 - p.life) * 4;
        ctx.fillRect(p.x, p.y, sz, sz);
        ctx.globalAlpha = 1;
        return true;
      });

      frameId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="mc-world-canvas"
      aria-hidden="true"
    />
  );
}
