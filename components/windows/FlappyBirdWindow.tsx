"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface FlappyBirdWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  windowStates: any
}

// Game constants
const GRAVITY = 0.5
const JUMP_FORCE = -8
const PIPE_SPEED = 2
const PIPE_WIDTH = 50
const PIPE_GAP = 150
const PIPE_SPACING = 200
const BIRD_WIDTH = 30
const BIRD_HEIGHT = 24
const GROUND_HEIGHT = 20

export const FlappyBirdWindow: React.FC<FlappyBirdWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  windowStates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Audio refs
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null)
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null)

  // Game state
  const [bird, setBird] = useState({
    x: 50,
    y: 150,
    velocity: 0,
  })

  const [pipes, setPipes] = useState<{ x: number; topHeight: number }[]>([])
  const gameLoopRef = useRef<number | null>(null)
  const scoreRef = useRef(0) // Ref to track score for sound effects

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 480 })

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    jumpSoundRef.current = new Audio("/sounds/jump.mp3")
    scoreSoundRef.current = new Audio("/sounds/score.mp3")
    gameOverSoundRef.current = new Audio("/sounds/gameover.mp3")

    // Set volume
    if (jumpSoundRef.current) jumpSoundRef.current.volume = 0.3
    if (scoreSoundRef.current) scoreSoundRef.current.volume = 0.3
    if (gameOverSoundRef.current) gameOverSoundRef.current.volume = 0.3

    // Preload audio
    jumpSoundRef.current?.load()
    scoreSoundRef.current?.load()
    gameOverSoundRef.current?.load()

    return () => {
      // Clean up audio elements
      jumpSoundRef.current = null
      scoreSoundRef.current = null
      gameOverSoundRef.current = null
    }
  }, [])

  // Play sound function
  const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
    if (soundEnabled && soundRef.current) {
      // Reset the audio to the beginning if it's already playing
      soundRef.current.currentTime = 0
      soundRef.current.play().catch((error) => {
        console.error("Error playing sound:", error)
      })
    }
  }

  // Initialize or reset the game
  const resetGame = () => {
    setBird({
      x: 50,
      y: 150,
      velocity: 0,
    })
    setPipes([])
    setScore(0)
    scoreRef.current = 0
    setGameOver(false)
  }

  // Start the game
  const startGame = () => {
    resetGame()
    setGameActive(true)
  }

  // Jump action
  const jump = () => {
    if (gameOver) {
      startGame()
      return
    }

    if (!gameActive) {
      setGameActive(true)
      return
    }

    setBird((prev) => ({
      ...prev,
      velocity: JUMP_FORCE,
    }))

    // Play jump sound
    playSound(jumpSoundRef)
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "Space" || e.key === " " || e.key === "ArrowUp") &&
        windowStates.flappyBird.isOpen &&
        !windowStates.flappyBird.isMinimized &&
        isActive
      ) {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameActive, gameOver, isActive, windowStates.flappyBird.isOpen, windowStates.flappyBird.isMinimized])

  // Game loop
  useEffect(() => {
    if (!gameActive || gameOver) return

    const gameLoop = () => {
      // Update bird position
      setBird((prev) => ({
        ...prev,
        y: prev.y + prev.velocity,
        velocity: prev.velocity + GRAVITY,
      }))

      // Update pipes
      setPipes((prevPipes) => {
        // Move pipes to the left
        const movedPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED,
        }))

        // Remove pipes that are off-screen
        const filteredPipes = movedPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

        // Add new pipes if needed
        const lastPipe = movedPipes[movedPipes.length - 1]
        if (!lastPipe || lastPipe.x < canvasSize.width - PIPE_SPACING) {
          const topHeight = Math.floor(Math.random() * (canvasSize.height - PIPE_GAP - GROUND_HEIGHT - 40)) + 20
          filteredPipes.push({
            x: canvasSize.width,
            topHeight,
          })
        }

        return filteredPipes
      })

      // Check for collisions
      const birdRight = bird.x + BIRD_WIDTH
      const birdBottom = bird.y + BIRD_HEIGHT

      // Ground collision
      if (birdBottom > canvasSize.height - GROUND_HEIGHT) {
        setGameOver(true)
        playSound(gameOverSoundRef)
        return
      }

      // Ceiling collision
      if (bird.y < 0) {
        setGameOver(true)
        playSound(gameOverSoundRef)
        return
      }

      // Pipe collision
      for (const pipe of pipes) {
        const pipeRight = pipe.x + PIPE_WIDTH
        const bottomPipeTop = pipe.topHeight + PIPE_GAP

        // Check if bird is horizontally aligned with pipe
        if (birdRight > pipe.x && bird.x < pipeRight) {
          // Check if bird is vertically within the pipe gap
          if (bird.y < pipe.topHeight || birdBottom > bottomPipeTop) {
            setGameOver(true)
            playSound(gameOverSoundRef)
            return
          }
        }

        // Increment score when bird passes a pipe
        if (pipe.x + PIPE_WIDTH / 2 <= bird.x && pipe.x + PIPE_WIDTH / 2 > bird.x - PIPE_SPEED) {
          setScore((prev) => {
            const newScore = prev + 1
            if (newScore > highScore) {
              setHighScore(newScore)
            }
            // Play score sound
            playSound(scoreSoundRef)
            scoreRef.current = newScore
            return newScore
          })
        }
      }
    }

    gameLoopRef.current = window.setInterval(gameLoop, 1000 / 60)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameActive, gameOver, bird, pipes, canvasSize.height, canvasSize.width, highScore])

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw sky background
    ctx.fillStyle = "#87CEEB"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw pipes
    ctx.fillStyle = "#75B743"
    for (const pipe of pipes) {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)

      // Bottom pipe
      const bottomPipeTop = pipe.topHeight + PIPE_GAP
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, canvas.height - bottomPipeTop)

      // Pipe caps
      ctx.fillStyle = "#5D9136"
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 10, PIPE_WIDTH + 6, 10)
      ctx.fillRect(pipe.x - 3, bottomPipeTop, PIPE_WIDTH + 6, 10)
      ctx.fillStyle = "#75B743"
    }

    // Draw ground
    ctx.fillStyle = "#DEB887"
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT)

    // Draw ground pattern
    ctx.fillStyle = "#C19A6B"
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.fillRect(i, canvas.height - GROUND_HEIGHT, 10, 5)
    }

    // Draw bird
    if (gameActive) {
      ctx.save()
      ctx.translate(bird.x + BIRD_WIDTH / 2, bird.y + BIRD_HEIGHT / 2)

      // Rotate bird based on velocity
      const rotation = Math.max(-0.5, Math.min(Math.PI / 4, bird.velocity * 0.05))
      ctx.rotate(rotation)

      // Draw bird body
      ctx.fillStyle = "#FFC107"
      ctx.fillRect(-BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT)

      // Draw bird wing
      ctx.fillStyle = "#FFA000"
      ctx.fillRect(-BIRD_WIDTH / 2, 0, BIRD_WIDTH / 2, BIRD_HEIGHT / 3)

      // Draw bird eye
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(BIRD_WIDTH / 4, -BIRD_HEIGHT / 6, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "black"
      ctx.beginPath()
      ctx.arc(BIRD_WIDTH / 4 + 2, -BIRD_HEIGHT / 6, 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw bird beak
      ctx.fillStyle = "#FF5722"
      ctx.beginPath()
      ctx.moveTo(BIRD_WIDTH / 2, -BIRD_HEIGHT / 8)
      ctx.lineTo(BIRD_WIDTH / 2 + 10, 0)
      ctx.lineTo(BIRD_WIDTH / 2, BIRD_HEIGHT / 8)
      ctx.fill()

      ctx.restore()
    }

    // Draw score
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.strokeText(`Score: ${score}`, canvas.width / 2, 30)
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 30)

    // Draw start screen or game over screen
    if (!gameActive || gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "white"
      ctx.font = "bold 36px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      if (gameOver) {
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 50)
        ctx.font = "bold 24px Arial"
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2)
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 30)
        ctx.font = "18px Arial"
        ctx.fillText("Press SPACE to play again", canvas.width / 2, canvas.height / 2 + 70)
      } else {
        ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 50)
        ctx.font = "18px Arial"
        ctx.fillText("Press SPACE to start", canvas.width / 2, canvas.height / 2 + 20)
        ctx.fillText("Use SPACE or UP ARROW to jump", canvas.width / 2, canvas.height / 2 + 50)
      }
    }

    // Draw sound toggle button
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.fillRect(canvas.width - 40, 10, 30, 30)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.strokeRect(canvas.width - 40, 10, 30, 30)

    // Draw sound icon
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.moveTo(canvas.width - 33, 25)
    ctx.lineTo(canvas.width - 28, 25)
    ctx.lineTo(canvas.width - 23, 20)
    ctx.lineTo(canvas.width - 23, 30)
    ctx.lineTo(canvas.width - 28, 25)
    ctx.fill()

    // Draw sound waves or X
    if (soundEnabled) {
      ctx.beginPath()
      ctx.arc(canvas.width - 20, 25, 3, -Math.PI / 4, Math.PI / 4, false)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(canvas.width - 18, 25, 6, -Math.PI / 4, Math.PI / 4, false)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.moveTo(canvas.width - 25, 20)
      ctx.lineTo(canvas.width - 15, 30)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(canvas.width - 15, 20)
      ctx.lineTo(canvas.width - 25, 30)
      ctx.stroke()
    }
  }, [gameActive, gameOver, bird, pipes, score, highScore, canvasSize.width, canvasSize.height, soundEnabled])

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const width = container.clientWidth
      const height = container.clientHeight

      if (width !== canvasSize.width || height !== canvasSize.height) {
        setCanvasSize({ width, height })
        canvas.width = width
        canvas.height = height
      }
    }

    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [canvasSize.width, canvasSize.height, windowState.isMaximized])

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("flappyBirdHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore, 10))
    }
  }, [])

  // Save high score to localStorage
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem("flappyBirdHighScore", highScore.toString())
    }
  }, [highScore])

  // Clean up game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [])

  // Initialize game when window is opened and active
  useEffect(() => {
    if (isActive && !gameActive && !gameOver) {
      const canvas = canvasRef.current
      if (canvas) {
        // Make sure canvas is properly sized
        const container = canvas.parentElement
        if (container) {
          canvas.width = container.clientWidth
          canvas.height = container.clientHeight
          setCanvasSize({
            width: container.clientWidth,
            height: container.clientHeight,
          })
        }

        // Draw initial screen
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Draw sky background
          ctx.fillStyle = "#87CEEB"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw instructions
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          ctx.fillStyle = "white"
          ctx.font = "bold 36px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("Flappy Bird", canvas.width / 2, canvas.height / 2 - 50)
          ctx.font = "18px Arial"
          ctx.fillText("Click or Press SPACE to start", canvas.width / 2, canvas.height / 2 + 20)
          ctx.fillText("Use SPACE or UP ARROW to jump", canvas.width / 2, canvas.height / 2 + 50)
        }
      }
    }
  }, [isActive, gameActive, gameOver])

  // Handle sound toggle
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if sound button was clicked
    if (x >= canvas.width - 40 && x <= canvas.width - 10 && y >= 10 && y <= 40) {
      setSoundEnabled(!soundEnabled)
      e.stopPropagation() // Prevent jump when clicking sound button
    } else {
      jump()
    }
  }

  return (
    <div className="window" data-window="flappyBird" style={getWindowStyle("flappyBird", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Flappy Bird - Score: {score}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div
        className="window-body flappy-bird-container"
        onClick={jump}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "ArrowUp") {
            e.preventDefault()
            jump()
          }
        }}
      >
        <canvas
          ref={canvasRef}
          className="flappy-bird-canvas"
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
        />
        {!gameActive && !gameOver && (
          <button
            className="flappy-bird-start-button"
            onClick={(e) => {
              e.stopPropagation()
              startGame()
            }}
          >
            Start Game
          </button>
        )}

        {/* Hidden audio elements */}
        <audio src="/sounds/jump.mp3" preload="auto" />
        <audio src="/sounds/score.mp3" preload="auto" />
        <audio src="/sounds/gameover.mp3" preload="auto" />
      </div>
    </div>
  )
}
