import { useRef, useEffect } from "react";

export default function Game() {

  const canvasRef = useRef(null);

  const xRef= useRef(50);
  const yRef = useRef(50); 

const drawCat=(ctx,x,y)=>{
  ctx.fillStyle='#1e1e1e'; 
ctx.fillRect(0,0,320,180);
ctx.fillStyle='#ffcc00'; 
ctx.fillRect(x,y,32,32);
}

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawCat(ctx, xRef.current, yRef.current);

    const keyDownHandler=(e)=>{
      if(e.key === 'ArrowRight'){
        xRef.current += 15;
      }
      if(e.key === 'ArrowLeft'){
        xRef.current -= 15;
      }
      if(e.key === 'ArrowUp'){
        yRef.current -= 15;
      }
      if(e.key === 'ArrowDown'){
        yRef.current += 15;
      }
      drawCat(ctx, xRef.current, yRef.current);
    }
window.addEventListener('keydown', keyDownHandler);
return ()=>window.removeEventListener('keydown', keyDownHandler);
  }, []);

  return <canvas ref={canvasRef} width={320} height={180} className="game-canvas" />;
}