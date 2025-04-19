"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface SnakeWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  score: number
  gameActive: boolean
  gameOver: boolean
  setGameActive: (active: boolean) => void
  resetGame: () => void
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT"
  snake: { x: number; y: number }[]
  food: { x: number; y: number }
  gridSize: { width: number; height: number }
  cellSize: number
}

export const SnakeWindow: React.FC<SnakeWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  score,
  gameActive,
  gameOver,
  setGameActive,
  resetGame,
  direction,
  snake,
  food,
  gridSize,
  cellSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the game
  useEffect(() => {
    if (gameActive && !gameOver) {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Draw snake
          ctx.fillStyle = "#00FF00"
          snake.forEach((segment, index) => {
            if (index === 0) {
              // Draw head in a different color
              ctx.fillStyle = "#00AA00"
            } else {
              ctx.fillStyle = "#00FF00"
            }
            ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize)
          })

          // Draw food
          ctx.fillStyle = "#FF0000"
          ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize)

          // Draw grid (optional)
          ctx.strokeStyle = "#333333"
          ctx.lineWidth = 0.5
          for (let x = 0; x <= gridSize.width; x++) {
            ctx.beginPath()
            ctx.moveTo(x * cellSize, 0)
            ctx.lineTo(x * cellSize, gridSize.height * cellSize)
            ctx.stroke()
          }
          for (let y = 0; y <= gridSize.height; y++) {
            ctx.beginPath()
            ctx.moveTo(0, y * cellSize)
            ctx.lineTo(gridSize.width * cellSize, y * cellSize)
            ctx.stroke()
          }
        }
      }
    }
  }, [gameActive, gameOver, snake, food, gridSize, cellSize])

  return (
    <div className="window" data-window="snake" style={getWindowStyle("snake", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Snake - Score: {score}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body snake-game-container">
        {!gameActive && !gameOver ? (
          <div className="snake-start-screen">
            <h3>Snake Game</h3>
            <p>Use arrow keys to control the snake.</p>
            <p>Eat the red food to grow and earn points.</p>
            <button onClick={() => setGameActive(true)}>Start Game</button>
          </div>
        ) : gameOver ? (
          <div className="snake-game-over">
            <h3>Game Over!</h3>
            <p>Your score: {score}</p>
            <button
              onClick={() => {
                resetGame()
                setGameActive(true)
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={gridSize.width * cellSize}
            height={gridSize.height * cellSize}
            className="snake-canvas"
          />
        )}
      </div>
    </div>
  )
}
