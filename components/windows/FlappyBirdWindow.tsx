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
  const [showOptions, setShowOptions] = useState(false)
  const [difficulty, setDifficulty] = useState("medium") // easy, medium, hard
  const [theme, setTheme] = useState("day") // day, night, retro
  const [volume, setVolume] = useState(0.5) // Add this line for volume control (0.0 to 1.0)
  const [pipeGap, setPipeGap] = useState(PIPE_GAP)
  const [pipeSpeed, setPipeSpeed] = useState(PIPE_SPEED)
  const prevGameActive = useRef(gameActive)

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
    // Base64 encoded audio data for small sound effects
    const jumpSoundBase64 = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
    const scoreSoundBase64 = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
    const gameOverSoundBase64 = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="

    // Create simple beep sounds with the Web Audio API instead of loading files
    const createBeepSound = (frequency: number, duration: number): HTMLAudioElement => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "square"
      oscillator.frequency.value = frequency
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)

      // Create an audio element with the generated sound
      const audioElement = document.createElement("audio")
      return audioElement
    }

    // Create our sound effects
    jumpSoundRef.current = createBeepSound(800, 0.1)
    scoreSoundRef.current = createBeepSound(1200, 0.15)
    gameOverSoundRef.current = createBeepSound(300, 0.3)

    return () => {
      // Clean up audio elements
      jumpSoundRef.current = null
      scoreSoundRef.current = null
      gameOverSoundRef.current = null
    }
  }, [])

  // Play sound function
  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "square"
      oscillator.frequency.value = frequency
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()
      // Use the volume state to set the gain value
      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.error("Error playing sound:", error)
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
    playSound(800, 0.1)
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
          x: pipe.x - pipeSpeed,
        }))

        // Remove pipes that are off-screen
        const filteredPipes = movedPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

        // Add new pipes if needed
        const lastPipe = movedPipes[movedPipes.length - 1]
        if (!lastPipe || lastPipe.x < canvasSize.width - PIPE_SPACING) {
          const topHeight = Math.floor(Math.random() * (canvasSize.height - pipeGap - GROUND_HEIGHT - 40)) + 20
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
        playSound(300, 0.3) // Game over sound
        return
      }

      // Ceiling collision
      if (bird.y < 0) {
        setGameOver(true)
        playSound(300, 0.3) // Game over sound
        return
      }

      // Pipe collision
      for (const pipe of pipes) {
        const pipeRight = pipe.x + PIPE_WIDTH
        const bottomPipeTop = pipe.topHeight + pipeGap

        // Check if bird is horizontally aligned with pipe
        if (birdRight > pipe.x && bird.x < pipeRight) {
          // Check if bird is vertically within the pipe gap
          if (bird.y < pipe.topHeight || birdBottom > bottomPipeTop) {
            setGameOver(true)
            playSound(300, 0.3) // Game over sound
            return
          }
        }

        // Increment score when bird passes a pipe
        if (pipe.x + PIPE_WIDTH / 2 <= bird.x && pipe.x + PIPE_WIDTH / 2 > bird.x - pipeSpeed) {
          setScore((prev) => {
            const newScore = prev + 1
            if (newScore > highScore) {
              setHighScore(newScore)
            }
            // Play score sound
            playSound(1200, 0.15)
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
  }, [gameActive, gameOver, bird, pipes, canvasSize.height, canvasSize.width, highScore, pipeGap, pipeSpeed])

  // Draw the game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background based on theme
    if (theme === "day") {
      ctx.fillStyle = "#87CEEB"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw some clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      ctx.beginPath()
      ctx.arc(canvas.width * 0.2, canvas.height * 0.2, 20, 0, Math.PI * 2)
      ctx.arc(canvas.width * 0.2 + 15, canvas.height * 0.2 - 10, 15, 0, Math.PI * 2)
      ctx.arc(canvas.width * 0.2 + 30, canvas.height * 0.2, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 20, 0, Math.PI * 2)
      ctx.arc(canvas.width * 0.7 + 25, canvas.height * 0.3, 25, 0, Math.PI * 2)
      ctx.arc(canvas.width * 0.7 + 40, canvas.height * 0.3 - 5, 15, 0, Math.PI * 2)
      ctx.fill()
    } else if (theme === "night") {
      // Night sky with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#0a1a3f")
      gradient.addColorStop(1, "#263c6f")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      ctx.fillStyle = "white"
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * (canvas.height - GROUND_HEIGHT) * 0.8
        const size = Math.random() * 2 + 1
        ctx.fillRect(x, y, size, size)
      }

      // Draw moon
      ctx.fillStyle = "#f0f0f0"
      ctx.beginPath()
      ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 30, 0, Math.PI * 2)
      ctx.fill()

      // Moon crater
      ctx.fillStyle = "#d0d0d0"
      ctx.beginPath()
      ctx.arc(canvas.width * 0.8 - 10, canvas.height * 0.2 - 10, 8, 0, Math.PI * 2)
      ctx.fill()
    } else if (theme === "retro") {
      // Retro pixelated background
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid pattern
      ctx.strokeStyle = "#333333"
      ctx.lineWidth = 1

      // Horizontal grid lines
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
    }

    // Draw pipes with theme-appropriate colors
    if (theme === "day") {
      ctx.fillStyle = "#75B743" // Green pipes for day theme
    } else if (theme === "night") {
      ctx.fillStyle = "#4a752a" // Darker green pipes for night theme
    } else if (theme === "retro") {
      ctx.fillStyle = "#00FF00" // Bright green for retro theme
    }
    for (const pipe of pipes) {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)

      // Bottom pipe
      const bottomPipeTop = pipe.topHeight + pipeGap
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, canvas.height - bottomPipeTop)

      // Pipe caps
      if (theme === "day") {
        ctx.fillStyle = "#5D9136" // Dark green caps for day theme
      } else if (theme === "night") {
        ctx.fillStyle = "#3d5e24" // Darker caps for night theme
      } else if (theme === "retro") {
        ctx.fillStyle = "#00AA00" // Bright dark green for retro theme
      }
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 10, PIPE_WIDTH + 6, 10)
      ctx.fillRect(pipe.x - 3, bottomPipeTop, PIPE_WIDTH + 6, 10)
      if (theme === "day") {
        ctx.fillStyle = "#75B743"
      } else if (theme === "night") {
        ctx.fillStyle = "#4a752a"
      } else if (theme === "retro") {
        ctx.fillStyle = "#00FF00"
      }
    }

    // Draw ground
    if (theme === "day") {
      ctx.fillStyle = "#DEB887" // Normal ground for day
    } else if (theme === "night") {
      ctx.fillStyle = "#8B7355" // Darker ground for night
    } else if (theme === "retro") {
      ctx.fillStyle = "#AA5500" // Brown for retro
    }
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT)

    // Draw ground pattern
    if (theme === "day") {
      ctx.fillStyle = "#C19A6B"
    } else if (theme === "night") {
      ctx.fillStyle = "#6B4226"
    } else if (theme === "retro") {
      ctx.fillStyle = "#FF8800"
    }
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
      if (theme === "day") {
        ctx.fillStyle = "#FFC107" // Yellow bird for day
      } else if (theme === "night") {
        ctx.fillStyle = "#E6AC00" // Slightly darker yellow for night
      } else if (theme === "retro") {
        ctx.fillStyle = "#FFFF00" // Bright yellow for retro
      }
      ctx.fillRect(-BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT)

      // Draw bird wing
      if (theme === "day") {
        ctx.fillStyle = "#FFA000"
      } else if (theme === "night") {
        ctx.fillStyle = "#CC8000"
      } else if (theme === "retro") {
        ctx.fillStyle = "#FFAA00"
      }
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
      if (theme === "day") {
        ctx.fillStyle = "#FF5722"
      } else if (theme === "night") {
        ctx.fillStyle = "#CC4518"
      } else if (theme === "retro") {
        ctx.fillStyle = "#FF0000"
      }
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

    // Draw options button
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.fillRect(canvas.width - 40, 50, 30, 30)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.strokeRect(canvas.width - 40, 50, 30, 30)

    // Draw gear icon for options
    ctx.fillStyle = "#000"
    ctx.beginPath()
    ctx.arc(canvas.width - 25, 65, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.beginPath()
    ctx.arc(canvas.width - 25, 65, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = canvas.width - 25 + Math.cos(angle) * 8
      const y1 = 65 + Math.sin(angle) * 8
      const x2 = canvas.width - 25 + Math.cos(angle) * 12
      const y2 = 65 + Math.sin(angle) * 12
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }, [
    gameActive,
    gameOver,
    bird,
    pipes,
    score,
    highScore,
    canvasSize.width,
    canvasSize.height,
    soundEnabled,
    pipeGap,
    theme,
  ])

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

  // Adjust game parameters based on difficulty
  useEffect(() => {
    // Adjust game parameters based on difficulty
    switch (difficulty) {
      case "easy":
        setPipeGap(180)
        setPipeSpeed(1.5)
        break
      case "medium":
        setPipeGap(150)
        setPipeSpeed(2)
        break
      case "hard":
        setPipeGap(120)
        setPipeSpeed(2.5)
        break
    }
  }, [difficulty])

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
    }
    // Check if options button was clicked
    else if (x >= canvas.width - 40 && x <= canvas.width - 10 && y >= 50 && y <= 80) {
      prevGameActive.current = gameActive
      setGameActive(false)
      setShowOptions(true)
      e.stopPropagation() // Prevent jump when clicking options button
    } else {
      jump()
    }
  }

  // Add this function to handle closing the options menu
  const closeOptions = () => {
    setShowOptions(false)
    // Resume game if it was active before
    if (prevGameActive.current && !gameOver) {
      setGameActive(true)
    }
  }

  // Add this effect to update the volume slider bubble position
  useEffect(() => {
    // Update the volume slider bubble position
    const root = document.documentElement
    root.style.setProperty("--volume-percent", (volume * 100).toString())
  }, [volume])

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
        {showOptions && (
          <div className="flappy-bird-options-overlay">
            <div className="flappy-bird-options-menu">
              <div className="title-bar">
                <div className="title-bar-text">Game Options</div>
                <div className="title-bar-controls">
                  <button aria-label="Close" onClick={closeOptions}></button>
                </div>
              </div>
              <div className="window-body">
                <div className="field-row">
                  <label>Sound:</label>
                  <div className="field-row-stacked">
                    <label className={`option-label ${soundEnabled ? "option-selected" : ""}`}>
                      <input type="radio" name="sound" checked={soundEnabled} onChange={() => setSoundEnabled(true)} />
                      <span className="option-text">On</span>
                      {soundEnabled && <span className="option-indicator">✓</span>}
                    </label>
                    <label className={`option-label ${!soundEnabled ? "option-selected" : ""}`}>
                      <input
                        type="radio"
                        name="sound"
                        checked={!soundEnabled}
                        onChange={() => setSoundEnabled(false)}
                      />
                      <span className="option-text">Off</span>
                      {!soundEnabled && <span className="option-indicator">✓</span>}
                    </label>
                  </div>
                </div>

                <div className="field-row">
                  <label>Difficulty:</label>
                  <div className="field-row-stacked">
                    <label className={`option-label ${difficulty === "easy" ? "option-selected" : ""}`}>
                      <input
                        type="radio"
                        name="difficulty"
                        checked={difficulty === "easy"}
                        onChange={() => setDifficulty("easy")}
                      />
                      <span className="option-text">Easy</span>
                      {difficulty === "easy" && <span className="option-indicator">✓</span>}
                    </label>
                    <label className={`option-label ${difficulty === "medium" ? "option-selected" : ""}`}>
                      <input
                        type="radio"
                        name="difficulty"
                        checked={difficulty === "medium"}
                        onChange={() => setDifficulty("medium")}
                      />
                      <span className="option-text">Medium</span>
                      {difficulty === "medium" && <span className="option-indicator">✓</span>}
                    </label>
                    <label className={`option-label ${difficulty === "hard" ? "option-selected" : ""}`}>
                      <input
                        type="radio"
                        name="difficulty"
                        checked={difficulty === "hard"}
                        onChange={() => setDifficulty("hard")}
                      />
                      <span className="option-text">Hard</span>
                      {difficulty === "hard" && <span className="option-indicator">✓</span>}
                    </label>
                  </div>
                </div>

                <div className="field-row">
                  <label>Theme:</label>
                  <div className="field-row-stacked">
                    <label className={`option-label ${theme === "day" ? "option-selected" : ""}`}>
                      <input type="radio" name="theme" checked={theme === "day"} onChange={() => setTheme("day")} />
                      <span className="option-text">Day</span>
                      {theme === "day" && <span className="option-indicator">✓</span>}
                    </label>
                    <label className={`option-label ${theme === "night" ? "option-selected" : ""}`}>
                      <input type="radio" name="theme" checked={theme === "night"} onChange={() => setTheme("night")} />
                      <span className="option-text">Night</span>
                      {theme === "night" && <span className="option-indicator">✓</span>}
                    </label>
                    <label className={`option-label ${theme === "retro" ? "option-selected" : ""}`}>
                      <input type="radio" name="theme" checked={theme === "retro"} onChange={() => setTheme("retro")} />
                      <span className="option-text">Retro</span>
                      {theme === "retro" && <span className="option-indicator">✓</span>}
                    </label>
                  </div>
                </div>

                {/* Enhanced volume slider with better visual feedback */}
                <div className="field-row">
                  <label>Volume:</label>
                  <div className="field-row-stacked" style={{ width: "100%" }}>
                    <div className="volume-control">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={(e) => setVolume(Number(e.target.value) / 100)}
                        className="volume-slider"
                      />
                      <div className="volume-value-indicator">
                        <div className="volume-value-bubble">{Math.round(volume * 100)}%</div>
                      </div>
                    </div>
                    <div className="volume-labels">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="field-row" style={{ marginTop: "20px" }}>
                  <button onClick={closeOptions} className="option-button">
                    Apply & Close
                  </button>
                  <button
                    onClick={() => {
                      setDifficulty("medium")
                      setTheme("day")
                      setSoundEnabled(true)
                      setVolume(0.5) // Reset volume to 50%
                    }}
                    className="option-button"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="field-row" style={{ marginTop: "10px" }}>
                  <fieldset>
                    <legend>Controls</legend>
                    <p>Space or Up Arrow: Jump</p>
                    <p>Click: Jump</p>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
