import { useRef, useEffect, useCallback } from "react";
import { Engine, Bodies, Composite, Body } from 'matter-js';

export default function Game() {

  const canvasRef = useRef(null);

  const xRef= useRef(50);
  const yRef = useRef(50);
  const targetRef = useRef({ x: 200, y: 120, size: 16 });
  const playerBodyRef = useRef(null);

  const drawRoom = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
    const baseboardH = Math.max(2, Math.floor(H * 0.006));

    const wall = ctx.createLinearGradient(0, 0, 0, floorY - baseboardH);
    wall.addColorStop(0, '#A3A1A6'); // szary u góry
    wall.addColorStop(1, '#FFD6E8'); // róż na dole
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, floorY - baseboardH);

    ctx.fillStyle = 'yellow';
    ctx.fillRect(0, floorY - baseboardH, W, baseboardH);

    ctx.fillStyle = '#D6C8E3';
    ctx.fillRect(0, floorY, W, H - floorY);
  };

  const bookShelf = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
    const shelfW = Math.floor(W * 0.5);
    const shelfH = Math.max(8, Math.floor(H * 0.015));
    const x = Math.floor((W - shelfW) / 2);
    const y = Math.max(20, floorY - 80);
    ctx.fillStyle = 'yellow';
    ctx.fillRect(x, y, shelfW, shelfH);
  };

  const drawPot = (ctx, x, y, s) => {
    const w = s * 0.8;
    const h = s * 0.7;
    const px = x + (s - w) / 2;
    const py = y + s - h;

    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(px, py, w, h);
    ctx.fillStyle = '#a86b39';
    ctx.fillRect(px - w * 0.05, py - h * 0.15, w * 1.1, h * 0.15);
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x + s * 0.4, py - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + s * 0.6, py - 5, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlayerCat = (ctx, x, y) => {
    ctx.fillStyle = '#ffd6e8';
    ctx.fillRect(x + 6, y + 14, 20, 14);
    ctx.fillRect(x + 4, y + 4, 24, 16);
    ctx.fillRect(x + 6, y, 6, 6);
    ctx.fillRect(x + 20, y, 6, 6);
    ctx.fillStyle = '#ffb6d5';
    ctx.fillRect(x + 7, y + 1, 4, 4);
    ctx.fillRect(x + 21, y + 1, 4, 4);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x + 10, y + 10, 3, 3);
    ctx.fillRect(x + 19, y + 10, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 11, y + 10, 1, 1);
    ctx.fillRect(x + 20, y + 10, 1, 1);
    ctx.fillStyle = '#ff7aa2';
    ctx.fillRect(x + 15, y + 14, 2, 2);
    ctx.strokeStyle = '#ff7aa2';
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 16);
    ctx.lineTo(x + 14, y + 18);
    ctx.moveTo(x + 16, y + 16);
    ctx.lineTo(x + 18, y + 18);
    ctx.stroke();
    ctx.fillStyle = '#ffd6e8';
    ctx.fillRect(x + 26, y + 18, 6, 4);
  };

  const drawCat = useCallback((ctx, x, y) => {
    const t = targetRef.current;
    drawRoom(ctx);
    bookShelf(ctx);
    drawPot(ctx, t.x, t.y, t.size);
    drawPlayerCat(ctx, x, y);
  }, []);

  const overlaps = (ax, ay, as, bx, by, bs) =>
    ax < bx + bs && ax + as > bx && ay < by + bs && ay + as > by;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const engine = Engine.create();
engine.gravity.y = 0; // brak grawitacji w pokoju

// rozmiary canvasa
const W = canvas.width;
const H = canvas.height;

// gracz (32x32), środek ciała w środku kwadratu
const player = Bodies.rectangle(xRef.current + 16, yRef.current + 16, 32, 32, {
  inertia: Infinity,   // brak obracania
  frictionAir: 0.12,   // lekki opór powietrza
  restitution: 0.0
});
playerBodyRef.current = player;

// ściany (statyczne)
const thick = 50;
const walls = [
  Bodies.rectangle(W/2, -thick/2, W, thick, { isStatic: true }),         // top
  Bodies.rectangle(W/2, H+thick/2, W, thick, { isStatic: true }),        // bottom
  Bodies.rectangle(-thick/2, H/2, thick, H, { isStatic: true }),         // left
  Bodies.rectangle(W+thick/2, H/2, thick, H, { isStatic: true })         // right
];

Composite.clear(engine.world, false);
Composite.add(engine.world, [player, ...walls]);

let last = performance.now();
let rafId;

const loop = (now) => {
  const dt = Math.min(0.033, (now - last) / 1000); // max 33ms
  last = now;

  Engine.update(engine, dt * 1000);

  // synchronizacja pozycji do rysowania (z ciała fizyki -> xRef/yRef lewy-górny róg)
  xRef.current = player.position.x - 16;
  yRef.current = player.position.y - 16;

  // kolizja z doniczką (AABB jak wcześniej)
  const t = targetRef.current;
  if (overlaps(xRef.current, yRef.current, 32, t.x, t.y, t.size)) {
    t.x = Math.floor(Math.random() * (canvas.width  - t.size));
    t.y = Math.floor(Math.random() * (canvas.height - t.size));
  }

  drawCat(ctx, xRef.current, yRef.current);
  rafId = requestAnimationFrame(loop);
};

rafId = requestAnimationFrame(loop);

    const keyDownHandler=(e)=>{
      const force = 0.015;
      if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){
        Body.applyForce(player, player.position, { x:  force, y: 0 });
      }
      if(e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A'){
        Body.applyForce(player, player.position, { x: -force, y: 0 });
      }
      if(e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W'){
        Body.applyForce(player, player.position, { x: 0, y: -force });
      }
      if(e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S'){
        Body.applyForce(player, player.position, { x: 0, y:  force });
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return ()=>{
      window.removeEventListener('keydown', keyDownHandler);
      cancelAnimationFrame(rafId);
      Composite.clear(engine.world, false);
      // Engine.clear(engine); // opcjonalnie
    };
  }, [drawCat]);

  return <canvas ref={canvasRef} width={660} height={550} className="game-canvas" />;
}