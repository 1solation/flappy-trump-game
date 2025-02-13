"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const GRAVITY = 0.5;
const JUMP_STRENGTH = 7;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const BRICK_HEIGHT = 20;
const BRICK_WIDTH = 40;

export default function Flappytrump() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let gameLoopId: number;

    const trump = {
      x: 50,
      y: canvas.height / 2,
      width: 40,
      height: 30,
      velocity: 0,
    };

    const pipes: { x: number; y: number }[] = [];

    const trumpImg = new Image();
    trumpImg.src =
      "https://pngimg.com/uploads/donald_trump/donald_trump_PNG47.png";
    trumpImg.onerror = () => {
      console.error("Failed to load trump image");
    };

    function drawtrump() {
      if (ctx) {
        if (trumpImg.complete) {
          ctx.drawImage(trumpImg, trump.x, trump.y, trump.width, trump.height);
        } else {
          ctx.fillStyle = "brown";
          ctx.fillRect(trump.x, trump.y, trump.width, trump.height);
        }
      }
    }

    function drawBrickPattern(
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      if (ctx) {
        ctx.fillStyle = "#8B4513"; // Dark brown for bricks
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = "#D2691E"; // Lighter brown for mortar
        ctx.lineWidth = 2;

        // Draw horizontal lines
        for (let i = 0; i <= height; i += BRICK_HEIGHT) {
          ctx.beginPath();
          ctx.moveTo(x, y + i);
          ctx.lineTo(x + width, y + i);
          ctx.stroke();
        }

        // Draw vertical lines
        for (let i = 0; i <= width; i += BRICK_WIDTH) {
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i, y + height);
          ctx.stroke();
        }

        // Offset every other row
        for (let i = BRICK_HEIGHT; i < height; i += BRICK_HEIGHT * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y + i);
          ctx.lineTo(x, y + i + BRICK_HEIGHT);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x + width, y + i);
          ctx.lineTo(x + width, y + i + BRICK_HEIGHT);
          ctx.stroke();
        }
      }
    }

    function drawPipes() {
      if (ctx && canvas) {
        pipes.forEach((pipe) => {
          drawBrickPattern(pipe.x, 0, PIPE_WIDTH, pipe.y);
          drawBrickPattern(
            pipe.x,
            pipe.y + PIPE_GAP,
            PIPE_WIDTH,
            canvas.height - pipe.y - PIPE_GAP
          );
        });
      }
    }

    function updateGame() {
      if (ctx && canvas) {
        trump.velocity += GRAVITY;
        trump.y += trump.velocity;

        if (trump.y + trump.height > canvas.height) {
          trump.y = canvas.height - trump.height;
          trump.velocity = 0;
          endGame();
        }

        if (trump.y < 0) {
          trump.y = 0;
          trump.velocity = 0;
        }

        pipes.forEach((pipe, index) => {
          pipe.x -= PIPE_SPEED;

          // Check for collision
          if (
            trump.x < pipe.x + PIPE_WIDTH &&
            trump.x + trump.width > pipe.x &&
            (trump.y < pipe.y || trump.y + trump.height > pipe.y + PIPE_GAP)
          ) {
            endGame();
          }

          if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
            setScore((prevScore) => prevScore + 1);
          }
        });

        if (
          pipes.length === 0 ||
          pipes[pipes.length - 1].x < canvas.width - 200
        ) {
          pipes.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - PIPE_GAP - 100) + 50,
          });
        }
      }
    }

    function drawGame() {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPipes();
        drawtrump();
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${score}`, 10, 30);
      }
    }

    function gameLoop() {
      updateGame();
      drawGame();
      gameLoopId = requestAnimationFrame(gameLoop);
    }

    function jump() {
      trump.velocity = -JUMP_STRENGTH;
    }

    function endGame() {
      setGameStarted(false);
      if (score > highScore) {
        setHighScore(score);
      }
      cancelAnimationFrame(gameLoopId);
    }

    canvas.addEventListener("click", jump);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") jump();
    };
    document.addEventListener("keydown", handleKeyDown);

    gameLoop();

    return () => {
      canvas.removeEventListener("click", jump);
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(gameLoopId);
    };
  }, [gameStarted, score, highScore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-100">
      <h1 className="text-4xl font-bold mb-4">Flappy trump</h1>
      {!gameStarted && (
        <div className="text-center mb-4">
          <p className="text-xl mb-2">High Score: {highScore}</p>
          <Button
            onClick={() => {
              setGameStarted(true);
              setScore(0);
            }}
          >
            {score > 0 ? "Play Again" : "Start Game"}
          </Button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={600}
        className="border-4 border-sky-500 rounded-lg"
      />
      <p className="mt-4 text-lg">Click or press Space to jump!</p>
    </div>
  );
}
