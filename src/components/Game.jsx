import { useRef, useEffect, useCallback } from "react";
import { Engine, Bodies, Composite, Body } from 'matter-js';

export default function Game() {

  const canvasRef = useRef(null);

  const xRef= useRef(50);
  const yRef = useRef(50);
  const targetRef = useRef({ x: 200, y: 120, size: 16 });
  const playerBodyRef = useRef(null);


  const gameBoyBackground = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
    const baseboardH = Math.max(2, Math.floor(H * 0.006));
    ctx.fillStyle = '#FDF2E9';
    ctx.fillRect(0, floorY - baseboardH, W, baseboardH);
  };

  const drawRoom = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
    const baseboardH = Math.max(2, Math.floor(H * 0.006));

    // pastelowy gradient: róż → jasny błękit → lawenda/fiolet
    const wall = ctx.createLinearGradient(0, 0, 0, floorY - baseboardH);
    wall.addColorStop(0,   '#FFD6E8'); // pink
    wall.addColorStop(0.5, '#CDEAFB'); // baby blue
    wall.addColorStop(1,   '#C39BFF'); // soft purple
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, floorY - baseboardH);

    // listwa w jasnym kremie
    ctx.fillStyle = '#FDF2E9';
    ctx.fillRect(0, floorY - baseboardH, W, baseboardH);

    // podłoga – ciepły pastelowy róż/beż
    ctx.fillStyle = '#ffeea8';
    ctx.fillRect(0, floorY, W, H - floorY);
  };

  // Rysuje „zabudowę” (ramkę) dookoła ekranu wewnątrz canvasa,
  // tak by widoczny obszar gry był mniejszy – jak w ekranie urządzenia.
  const drawBezel = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    // niezależne marginesy obudowy
    const marginLeft = 65;
    const marginRight = 65;
    const marginTop = 65;
    const marginBottom = 90; // większy dół
    ctx.fillStyle = '#6ec6ff'; // kolor obudowy (niebieski)
    // paski wokół „okna” ekranu
    ctx.fillRect(0, 0, W, marginTop);                                    // góra
    ctx.fillRect(0, H - marginBottom, W, marginBottom);                  // dół
    ctx.fillRect(0, marginTop, marginLeft, H - marginTop - marginBottom); // lewo
    ctx.fillRect(W - marginRight, marginTop, marginRight, H - marginTop - marginBottom); // prawo
  };

  const bookShelf1 = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
const shelfW = Math.floor(W * 0.2);
    const shelfH = Math.max(8, Math.floor(H * 0.015));
    const x = Math.floor((W - shelfW) / 2);
const y = Math.max(20, floorY - 90);
ctx.fillStyle = '#F4EBE5';
    ctx.fillRect(x, y, shelfW, shelfH);
  };

    const bookShelf2 = (ctx) => {
      const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
const shelfW = Math.floor(W * 0.4);
    const shelfH = Math.max(8, Math.floor(H * 0.015));
const x = Math.floor((W - shelfW) / 2 + 100);
const y = Math.max(20, floorY - 180);
ctx.fillStyle = '#FDC6CB';
    ctx.fillRect(x, y, shelfW, shelfH);
  };

  const bookShelf3 = (ctx) => {
    const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const floorY = Math.floor(H * 0.66);
const shelfW = Math.floor(W * 0.1);
  const shelfH = Math.max(8, Math.floor(H * 0.015));
const x = Math.floor((W - shelfW) / 5 - 100);
const y = Math.max(20, floorY - 180);
ctx.fillStyle = '#FDF2E9';
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

  const cactus = (ctx) => {
    const W = ctx.canvas.width;
    const H = ctx.canvas.height;
    const floorY = Math.floor(H * 0.66);
  
    // === SKALA (mniejszy) ===
    const bodyW = Math.floor(W * 0.06);
    const bodyH = Math.floor(H * 0.12);
  
    //polozenie wzgledem lewego gornego rogu
    const x = Math.floor(W * 0.08);
    const y = floorY - bodyH - bodyH * 0.35;
  
    // === DONICZKA ===
    const potH = bodyH * 0.35;
    const potW = bodyW * 1.4;
    const potX = x - (potW - bodyW) / 2;
    const potY = floorY - potH;
  
    // dół doniczki
    ctx.fillStyle = '#C68642';
    ctx.beginPath();
    ctx.roundRect(potX, potY, potW, potH, 8);
    ctx.fill();
  
    // rant
    ctx.fillStyle = '#D89B5A';
    ctx.beginPath();
    ctx.roundRect(
      potX - potW * 0.05,
      potY - potH * 0.3,
      potW * 1.1,
      potH * 0.35,
      8
    );
    ctx.fill();
  
    // === CIAŁO KAKTUSA ===
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.roundRect(x, y, bodyW, bodyH, bodyW / 2);
    ctx.fill();
  
    // === RAMIONA ===
    ctx.fillStyle = '#43A047';
  
    // lewe
    ctx.beginPath();
    ctx.roundRect(
      x - bodyW * 0.3,
      y + bodyH * 0.4,
      bodyW * 0.35,
      bodyH * 0.22,
      bodyW * 0.2
    );
    ctx.fill();
  
    // prawe
    ctx.beginPath();
    ctx.roundRect(
      x + bodyW * 0.95,
      y + bodyH * 0.35,
      bodyW * 0.35,
      bodyH * 0.22,
      bodyW * 0.2
    );
    ctx.fill();
  
    // === OCZKA ===
    ctx.fillStyle = '#222';
    const eyeY = y + bodyH * 0.45;
  
    ctx.beginPath();
    ctx.arc(x + bodyW * 0.35, eyeY, bodyW * 0.055, 0, Math.PI * 2);
    ctx.arc(x + bodyW * 0.65, eyeY, bodyW * 0.055, 0, Math.PI * 2);
    ctx.fill();
  
    // === RUMIEŃCE ===
    ctx.fillStyle = 'rgba(255, 160, 160, 0.6)';
    ctx.beginPath();
    ctx.arc(x + bodyW * 0.25, eyeY + bodyH * 0.08, bodyW * 0.07, 0, Math.PI * 2);
    ctx.arc(x + bodyW * 0.75, eyeY + bodyH * 0.08, bodyW * 0.07, 0, Math.PI * 2);
    ctx.fill();
  
    // === UŚMIECH ===
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + bodyW / 2, eyeY + bodyH * 0.05, bodyW * 0.12, 0, Math.PI);
    ctx.stroke();
  };
  

const drawClock = (ctx) => {
const x = 580; // Pozycja X środka zegara
const y = 80; // Pozycja Y środka zegara
const radius = 30;
  
    // 1. Uszka (kawaii touch!)
    ctx.fillStyle = '#FFB7D5'; // Pastelowy różowy
    ctx.beginPath();
ctx.arc(x - 24, y - 35, 15, 0, Math.PI * 2);
ctx.arc(x + 24, y - 35, 15, 0, Math.PI * 2);
    ctx.fill();
  
    // 2. Główna tarcza zegara
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.fillStyle = '#F3E5F5'; // Bardzo jasny pastelowy fiolet
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset cienia
  
    // 3. Obramowanie tarczy
    ctx.strokeStyle = '#D1C4E9'; // Ciemniejszy pastelowy fiolet
    ctx.lineWidth = 4;
    ctx.stroke();
  
    // 4. Kropki zamiast cyfr (dla minimalistycznego stylu kawaii)
    ctx.fillStyle = '#9575CD';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const dotX = x + Math.cos(angle) * (radius - 10);
      const dotY = y + Math.sin(angle) * (radius - 10);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  
    // 5. Wskazówki
    ctx.lineCap = 'round';
    
    // Godzinowa (krótka)
    ctx.strokeStyle = '#FF80AB'; // Intensywniejszy pastelowy róż
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 15, y + 10);
    ctx.stroke();
  
    // Minutowa (długa)
    ctx.strokeStyle = '#9575CD';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 25);
    ctx.stroke();
  
    // 6. Środek zegara (nosek)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
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
    gameBoyBackground(ctx);
    drawRoom(ctx);
    drawBezel(ctx); // „zabudowanie” – obudowa GameBoy w canvasie
    bookShelf1(ctx);
    bookShelf2(ctx);
    bookShelf3(ctx);
    cactus(ctx);
drawClock(ctx);
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
// „okno” ekranu – mniejszy obszar gry wewnątrz obudowy (niezależne marginesy)
const marginLeft = 65;
const marginRight = 65;
const marginTop = 65;
const marginBottom = 90;
const innerW = W - marginLeft - marginRight;
const innerH = H - marginTop - marginBottom;

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
  // górna krawędź okna
  Bodies.rectangle(W / 2, marginTop - thick / 2, innerW, thick, { isStatic: true }),
  // dolna krawędź okna
  Bodies.rectangle(W / 2, H - marginBottom + thick / 2, innerW, thick, { isStatic: true }),
  // lewa krawędź okna
  Bodies.rectangle(marginLeft - thick / 2, H / 2, thick, innerH, { isStatic: true }),
  // prawa krawędź okna
  Bodies.rectangle(W - marginRight + thick / 2, H / 2, thick, innerH, { isStatic: true })
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

  return (
    <div className="gameboy">
      <div className="gb-screen">
        <canvas ref={canvasRef} width={660} height={550} className="game-canvas" />
      </div>
    </div>
  );
}