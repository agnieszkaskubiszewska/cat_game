import { useRef, useEffect, useCallback } from "react";
import { Engine, Bodies, Composite, Body, Events } from 'matter-js';

export default function Game() {

  const canvasRef = useRef(null);

  const xRef= useRef(50);
  const yRef = useRef(50);
  const playerBodyRef = useRef(null);
  // Fizyczna doniczka zarządzana przez Matter.js
  const potRef = useRef(null); // { body, size, tipped, tippedAt }
  // Wynik i limit
  const scoreRef = useRef(0);
  const spawnedRef = useRef(0);
  const endTimeRef = useRef(0);
  const gameOverRef = useRef(false);


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
ctx.fillStyle = '#E2CF88';
    ctx.fillRect(0, floorY - baseboardH, W, baseboardH);

    // podłoga – ciepły pastelowy róż/beż
    ctx.fillStyle = '#ffeea8';
    ctx.fillRect(0, floorY, W, H - floorY);
  };

  // (usunięto wewnętrzną niebieską ramkę – rysujemy pełnoekranową scenę)

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
    gameBoyBackground(ctx);
    drawRoom(ctx);
    bookShelf1(ctx);
    bookShelf2(ctx);
    bookShelf3(ctx);
    cactus(ctx);
drawClock(ctx);
    // Doniczka z fizyki (jeśli istnieje)
    if (potRef.current?.body) {
      const s = potRef.current.size;
      const bx = potRef.current.body.position.x - s / 2;
      const by = potRef.current.body.position.y - s / 2;
      drawPot(ctx, bx, by, s);
    }
    drawPlayerCat(ctx, x, y);
  }, []);

  // HUD: wynik i czas
  const drawHud = (ctx, timeLeftMs) => {
    ctx.fillStyle = '#333';
    ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.textBaseline = 'top';
    const secs = Math.max(0, Math.ceil(timeLeftMs / 1000));
    ctx.fillText(`Score: ${scoreRef.current}/20`, 10, 8);
    ctx.fillText(`Time: ${secs}s`, 10, 28);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const engine = Engine.create();
engine.gravity.y = 0; // grawitacja 0 – doniczka spada manualnie

// rozmiary canvasa
const W = canvas.width;
const H = canvas.height;
// pełny obszar gry – bez wewnętrznej ramki

// gracz (32x32), środek ciała w środku kwadratu
const player = Bodies.rectangle(xRef.current + 16, yRef.current + 16, 32, 32, {
  inertia: Infinity,   // brak obracania
  frictionAir: 0.12,   // lekki opór powietrza
  restitution: 0.0
});
playerBodyRef.current = player;

// ściany (statyczne) – na krawędziach canvasa
const thick = 50;
const walls = [
  Bodies.rectangle(W/2, -thick/2, W, thick, { isStatic: true }),         // top
  Bodies.rectangle(W/2, H+thick/2, W, thick, { isStatic: true }),        // bottom
  Bodies.rectangle(-thick/2, H/2, thick, H, { isStatic: true }),         // left
  Bodies.rectangle(W+thick/2, H/2, thick, H, { isStatic: true })         // right
];

// półki jako ciała statyczne (dopasowane do rysunku)
const floorY = Math.floor(H * 0.66);
const shelfH = Math.max(8, Math.floor(H * 0.015));
// shelf 1
const s1W = Math.floor(W * 0.2);
const s1X = Math.floor((W - s1W) / 2);
const s1Y = Math.max(20, floorY - 90);
// shelf 2
const s2W = Math.floor(W * 0.4);
const s2X = Math.floor((W - s2W) / 2 + 100);
const s2Y = Math.max(20, floorY - 180);
// shelf 3
const s3W = Math.floor(W * 0.1);
const s3X = Math.floor((W - s3W) / 5 - 100);
const s3Y = Math.max(20, floorY - 180);

const shelfBodies = [
  Bodies.rectangle(s1X + s1W / 2, s1Y + shelfH / 2, s1W, shelfH, { isStatic: true, label: 'shelf1' }),
  Bodies.rectangle(s2X + s2W / 2, s2Y + shelfH / 2, s2W, shelfH, { isStatic: true, label: 'shelf2' }),
  Bodies.rectangle(s3X + s3W / 2, s3Y + shelfH / 2, s3W, shelfH, { isStatic: true, label: 'shelf3' }),
];

Composite.clear(engine.world, false);
Composite.add(engine.world, [player, ...walls, ...shelfBodies]);

let last = performance.now();
let rafId;
// inicjalizacja gry
scoreRef.current = 0;
spawnedRef.current = 0;
gameOverRef.current = false;
endTimeRef.current = performance.now() + 60_000;

// Pomocnicze: tworzenie doniczki na górze w losowym X
const spawnPot = () => {
  if (gameOverRef.current) return;
  if (spawnedRef.current >= 20) return;
  const size = 28;
  const minX = size / 2 + 20;
  const maxX = W - size / 2 - 20;
  const x = Math.random() * (maxX - minX) + minX;
  // Spawnuj TUŻ W ŚRODKU planszy (poniżej górnej ściany), żeby było widać
  const y = size / 2 + 2;
  const pot = Bodies.rectangle(x, y, size, size, {
    restitution: 0.2,
    friction: 0.8,
    angle: 0,
    chamfer: { radius: 4 }
  });
  pot.label = 'pot';
  Composite.add(engine.world, pot);
  potRef.current = { body: pot, size, tipped: false, tippedAt: 0 };
  spawnedRef.current += 1;
};

// Start – pierwsza doniczka
spawnPot();

// Reakcja kolizji: kot uderza w doniczkę → przewróć i zaplanuj usunięcie
Events.on(engine, 'collisionStart', (evt) => {
  if (!potRef.current?.body) return;
  const potBody = potRef.current.body;
  evt.pairs.forEach((p) => {
    const a = p.bodyA;
    const b = p.bodyB;
    const hit =
      (a === player && b === potBody) ||
      (b === player && a === potBody);
    if (hit && !potRef.current.tipped) {
      const dir = player.position.x < potBody.position.x ? 1 : -1;
      Body.applyForce(potBody, potBody.position, { x: dir * 0.02, y: -0.01 });
      Body.setAngularVelocity(potBody, dir * 0.6);
      potRef.current.tipped = true;
      potRef.current.tippedAt = performance.now();
    }
  });
});

const loop = (now) => {
  const dt = Math.min(0.033, (now - last) / 1000); // max 33ms
  last = now;

  Engine.update(engine, dt * 1000);

  // synchronizacja pozycji do rysowania (z ciała fizyki -> xRef/yRef lewy-górny róg)
  xRef.current = player.position.x - 16;
  yRef.current = player.position.y - 16;

  // Doniczka: ręczne „opadanie”, usuwanie po przewróceniu i spawn nowej
  if (potRef.current?.body) {
    const potBody = potRef.current.body;
    // proste opadanie: delikatna siła w dół zamiast nadpisywania prędkości
    Body.applyForce(potBody, potBody.position, { x: 0, y: 0.002 });
    // jeśli przewrócona – po krótkim czasie zalicz, usuń i spawn kolejnej
    if (potRef.current.tipped && performance.now() - potRef.current.tippedAt > 400) {
      scoreRef.current += 1;
      Composite.remove(engine.world, potBody);
      potRef.current = null;
      if (spawnedRef.current < 20 && performance.now() < endTimeRef.current) {
        spawnPot();
      }
    }
  } else {
    // jeśli nie ma doniczki, a czas i limit pozwalają – spawn
    if (spawnedRef.current < 20 && performance.now() < endTimeRef.current) {
      spawnPot();
    }
  }

  // rysowanie sceny i HUD
  drawCat(ctx, xRef.current, yRef.current);
  const timeLeft = endTimeRef.current - performance.now();
  drawHud(ctx, timeLeft);
  if (timeLeft <= 0 || scoreRef.current >= 20) {
    gameOverRef.current = true;
  }
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