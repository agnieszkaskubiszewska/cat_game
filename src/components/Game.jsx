import { useRef, useEffect } from "react";

export default function Game() {

  const canvasRef = useRef(null);

  const xRef= useRef(50);
  const yRef = useRef(50); 
const targetRef = useRef({x:200,y:120, size:16});


const drawRoom =(ctx)=>{
    // ściana
    const wall = ctx.createLinearGradient(0, 0, 0, 118);
    wall.addColorStop(0, '#A3A1A6'); // szary u góry
    wall.addColorStop(1, '#FFD6E8'); // róż na dole (pastelowy)
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, 320, 118);
    // listwa przy podłodze
    ctx.fillStyle = 'yellow';
    ctx.fillRect(0, 118, 320, 2);
    // podłoga
ctx.fillStyle = '#D6C8E3';
    ctx.fillRect(0, 120, 320, 60);
}

const bookShelf = (ctx)=>{
ctx.fillStyle = 'yellow';
ctx.fillRect(40, 80, 120, 10);
}


const drawPot = (ctx, x, y, s) => {
  // dopasowane do kwadratu s×s (nie wyjeżdża poza bounding)
  const w = s * 0.8;
  const h = s * 0.7;
  const px = x + (s - w) / 2;
  const py = y + s - h;

  // korpus
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(px, py, w, h);
  // rant
  ctx.fillStyle = '#a86b39';
  ctx.fillRect(px - w * 0.05, py - h * 0.15, w * 1.1, h * 0.15);
  // liście (małe listki nad rantem)
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.arc(x + s * 0.4, py - 3, 3, 0, Math.PI * 2);
  ctx.arc(x + s * 0.6, py - 5, 3, 0, Math.PI * 2);
  ctx.fill();
};

const drawPlayerCat = (ctx, x, y) => {
  // ciało
  ctx.fillStyle = '#ffd6e8'; // pastelowy róż
  ctx.fillRect(x + 6, y + 14, 20, 14);

  // głowa
  ctx.fillRect(x + 4, y + 4, 24, 16);

  // uszy
  ctx.fillRect(x + 6, y, 6, 6);
  ctx.fillRect(x + 20, y, 6, 6);

  // wnętrze uszu
  ctx.fillStyle = '#ffb6d5';
  ctx.fillRect(x + 7, y + 1, 4, 4);
  ctx.fillRect(x + 21, y + 1, 4, 4);

  // oczy
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x + 10, y + 10, 3, 3);
  ctx.fillRect(x + 19, y + 10, 3, 3);

  // błysk w oczach
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 11, y + 10, 1, 1);
  ctx.fillRect(x + 20, y + 10, 1, 1);

  // nosek
  ctx.fillStyle = '#ff7aa2';
  ctx.fillRect(x + 15, y + 14, 2, 2);

  // buzia
  ctx.strokeStyle = '#ff7aa2';
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 16);
  ctx.lineTo(x + 14, y + 18);
  ctx.moveTo(x + 16, y + 16);
  ctx.lineTo(x + 18, y + 18);
  ctx.stroke();

  // ogonek
  ctx.fillStyle = '#ffd6e8';
  ctx.fillRect(x + 26, y + 18, 6, 4);
};


const drawCat = (ctx, x, y) => {
  const t = targetRef.current; // pozycja „celu”

  drawRoom(ctx);                // pokój
  bookShelf(ctx);              // półka
  drawPot(ctx, t.x, t.y, t.size); // doniczka (zamiast czerwonego kwadratu)
  drawPlayerCat(ctx, x, y);     // kot
};

const overlaps = (ax, ay, as, bx, by, bs) =>
  ax < bx + bs && ax + as > bx && ay < by + bs && ay + as > by;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawCat(ctx, xRef.current, yRef.current);

    const keyDownHandler=(e)=>{
  if(e.key === 'ArrowRight' || e.key === 'd'){
        xRef.current += 15;
      }
      if(e.key === 'ArrowLeft' || e.key === 'a'){
        xRef.current -= 15;
      }
  if(e.key === 'ArrowUp' || e.key === 'w' ){
        yRef.current -= 15;
      }
  if(e.key === 'ArrowDown' || e.key === 's'){
        yRef.current += 15;
      }
      xRef.current = Math.max(0, Math.min(320 - 32, xRef.current));
      yRef.current = Math.max(0, Math.min(180 - 32, yRef.current)); 
      const t = targetRef.current;
if (overlaps(xRef.current, yRef.current, 32, t.x, t.y, t.size)) {
  t.x = Math.floor(Math.random() * (320 - t.size));
  t.y = Math.floor(Math.random() * (180 - t.size));
}
      drawCat(ctx, xRef.current, yRef.current);
    }
window.addEventListener('keydown', keyDownHandler);
return ()=>window.removeEventListener('keydown', keyDownHandler);
  }, []);

  return <canvas ref={canvasRef} width={320} height={180} className="game-canvas" />;
}