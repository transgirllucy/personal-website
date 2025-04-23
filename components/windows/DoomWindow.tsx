"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface DoomWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

// Define the map layout
// 0 = empty space, 1 = wall
const MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

// Define enemy type
interface Enemy {
  x: number
  y: number
  health: number
  type: "imp" | "demon"
  isAlive: boolean
}

// Define player type
interface Player {
  x: number
  y: number
  angle: number
  health: number
  ammo: number
  weapon: "pistol" | "shotgun"
}

export const DoomWindow: React.FC<DoomWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 240 })
  const [player, setPlayer] = useState<Player>({
    x: 8,
    y: 8,
    angle: 0,
    health: 100,
    ammo: 50,
    weapon: "pistol",
  })
  const [enemies, setEnemies] = useState<Enemy[]>([
    { x: 3, y: 3, health: 20, type: "imp", isAlive: true },
    { x: 12, y: 12, health: 20, type: "imp", isAlive: true },
    { x: 5, y: 12, health: 40, type: "demon", isAlive: true },
    { x: 12, y: 5, health: 40, type: "demon", isAlive: true },
  ])
  const [isShooting, setIsShooting] = useState(false)
  const [showWeapon, setShowWeapon] = useState(true)
  const [showMap, setShowMap] = useState(false)

  // Key state for movement
  const [keys, setKeys] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
    strafe_left: false,
    strafe_right: false,
  })

  // Game loop reference
  const gameLoopRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Initialize or reset the game
  const resetGame = () => {
    setPlayer({
      x: 8,
      y: 8,
      angle: 0,
      health: 100,
      ammo: 50,
      weapon: "pistol",
    })
    setEnemies([
      { x: 3, y: 3, health: 20, type: "imp", isAlive: true },
      { x: 12, y: 12, health: 20, type: "imp", isAlive: true },
      { x: 5, y: 12, health: 40, type: "demon", isAlive: true },
      { x: 12, y: 5, health: 40, type: "demon", isAlive: true },
    ])
    setScore(0)
    setGameOver(false)
  }

  // Start the game
  const startGame = () => {
    resetGame()
    setGameActive(true)
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || gameOver || !isActive || !windowState.isOpen || windowState.isMinimized) return

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setKeys((prev) => ({ ...prev, up: true }))
          break
        case "s":
        case "arrowdown":
          setKeys((prev) => ({ ...prev, down: true }))
          break
        case "a":
        case "arrowleft":
          if (e.shiftKey) {
            setKeys((prev) => ({ ...prev, strafe_left: true }))
          } else {
            setKeys((prev) => ({ ...prev, left: true }))
          }
          break
        case "d":
        case "arrowright":
          if (e.shiftKey) {
            setKeys((prev) => ({ ...prev, strafe_right: true }))
          } else {
            setKeys((prev) => ({ ...prev, right: true }))
          }
          break
        case " ":
        case "control":
          if (player.ammo > 0) {
            setIsShooting(true)
            setPlayer((prev) => ({ ...prev, ammo: prev.ammo - 1 }))
            // Check for enemy hits
            checkEnemyHits()
          }
          break
        case "m":
          setShowMap((prev) => !prev)
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameActive || gameOver || !isActive || !windowState.isOpen || windowState.isMinimized) return

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          setKeys((prev) => ({ ...prev, up: false }))
          break
        case "s":
        case "arrowdown":
          setKeys((prev) => ({ ...prev, down: false }))
          break
        case "a":
        case "arrowleft":
          setKeys((prev) => ({ ...prev, left: false, strafe_left: false }))
          break
        case "d":
        case "arrowright":
          setKeys((prev) => ({ ...prev, right: false, strafe_right: false }))
          break
        case " ":
        case "control":
          setIsShooting(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gameActive, gameOver, isActive, windowState.isOpen, windowState.isMinimized, player.ammo])

  // Check for enemy hits when shooting
  const checkEnemyHits = () => {
    // Simple ray casting to check if an enemy is in front of the player
    const rayLength = 5 // How far the player can shoot
    const rayStep = 0.1 // Precision of the ray
    const rayAngle = player.angle

    for (let i = 0; i < rayLength; i += rayStep) {
      const rayX = player.x + Math.cos(rayAngle) * i
      const rayY = player.y + Math.sin(rayAngle) * i

      // Check if ray hits a wall
      if (MAP[Math.floor(rayY)][Math.floor(rayX)] === 1) {
        break // Ray hit a wall, stop checking
      }

      // Check if ray hits an enemy
      setEnemies((prevEnemies) => {
        return prevEnemies.map((enemy) => {
          if (enemy.isAlive && Math.floor(rayX) === Math.floor(enemy.x) && Math.floor(rayY) === Math.floor(enemy.y)) {
            // Hit an enemy
            const damage = player.weapon === "pistol" ? 10 : 20
            const newHealth = enemy.health - damage

            if (newHealth <= 0) {
              // Enemy killed
              setScore((prev) => prev + (enemy.type === "imp" ? 100 : 200))
              return { ...enemy, health: 0, isAlive: false }
            } else {
              // Enemy hit but not killed
              return { ...enemy, health: newHealth }
            }
          }
          return enemy
        })
      })
    }
  }

  // Game loop
  useEffect(() => {
    if (!gameActive || gameOver || !isActive || !windowState.isOpen || windowState.isMinimized) return

    const gameLoop = (timestamp: number) => {
      // Calculate delta time
      const deltaTime = timestamp - (lastTimeRef.current || timestamp)
      lastTimeRef.current = timestamp

      // Move player based on keys
      setPlayer((prev) => {
        let newX = prev.x
        let newY = prev.y
        let newAngle = prev.angle

        const moveSpeed = 0.05 * (deltaTime / 16) // Adjust for frame rate
        const rotateSpeed = 0.03 * (deltaTime / 16)

        // Rotate
        if (keys.left) newAngle -= rotateSpeed
        if (keys.right) newAngle += rotateSpeed

        // Move forward/backward
        if (keys.up) {
          newX += Math.cos(newAngle) * moveSpeed
          newY += Math.sin(newAngle) * moveSpeed
        }
        if (keys.down) {
          newX -= Math.cos(newAngle) * moveSpeed
          newY -= Math.sin(newAngle) * moveSpeed
        }

        // Strafe left/right
        if (keys.strafe_left) {
          newX += Math.cos(newAngle - Math.PI / 2) * moveSpeed
          newY += Math.sin(newAngle - Math.PI / 2) * moveSpeed
        }
        if (keys.strafe_right) {
          newX += Math.cos(newAngle + Math.PI / 2) * moveSpeed
          newY += Math.sin(newAngle + Math.PI / 2) * moveSpeed
        }

        // Collision detection with walls
        if (MAP[Math.floor(newY)][Math.floor(newX)] === 0) {
          return { ...prev, x: newX, y: newY, angle: newAngle }
        } else {
          return { ...prev, angle: newAngle }
        }
      })

      // Move enemies towards player (simple AI)
      setEnemies((prevEnemies) => {
        return prevEnemies.map((enemy) => {
          if (!enemy.isAlive) return enemy

          const dx = player.x - enemy.x
          const dy = player.y - enemy.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only move if enemy is within a certain distance
          if (distance < 8) {
            const moveSpeed = 0.02 * (deltaTime / 16) // Slower than player
            const angle = Math.atan2(dy, dx)

            const newX = enemy.x + Math.cos(angle) * moveSpeed
            const newY = enemy.y + Math.sin(angle) * moveSpeed

            // Check for wall collision
            if (MAP[Math.floor(newY)][Math.floor(newX)] === 0) {
              // Check for collision with player
              const newDistance = Math.sqrt(Math.pow(player.x - newX, 2) + Math.pow(player.y - newY, 2))

              if (newDistance < 0.5) {
                // Enemy hit player
                setPlayer((prev) => {
                  const damage = enemy.type === "imp" ? 5 : 10
                  const newHealth = prev.health - damage

                  if (newHealth <= 0) {
                    setGameOver(true)
                  }

                  return { ...prev, health: Math.max(0, newHealth) }
                })
              } else {
                return { ...enemy, x: newX, y: newY }
              }
            }
          }

          return enemy
        })
      })

      // Weapon animation
      if (isShooting) {
        setShowWeapon(false)
        setTimeout(() => setShowWeapon(true), 100)
        setIsShooting(false)
      }

      // Check if all enemies are dead
      const allEnemiesDead = enemies.every((enemy) => !enemy.isAlive)
      if (allEnemiesDead) {
        setScore((prev) => prev + 1000) // Bonus for clearing the level
        // Spawn new enemies
        setEnemies([
          { x: 3, y: 3, health: 20, type: "imp", isAlive: true },
          { x: 12, y: 12, health: 20, type: "imp", isAlive: true },
          { x: 5, y: 12, health: 40, type: "demon", isAlive: true },
          { x: 12, y: 5, health: 40, type: "demon", isAlive: true },
          // Add more enemies as the game progresses
          { x: 8, y: 3, health: 40, type: "demon", isAlive: true },
        ])
      }

      // Render the game
      renderGame()

      // Continue the game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameActive, gameOver, isActive, windowState.isOpen, windowState.isMinimized, keys, isShooting, enemies])

  // Render the game
  const renderGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Raycasting parameters
    const FOV = Math.PI / 3 // 60 degrees
    const rayCount = canvas.width
    const maxDistance = 16

    // Draw floor and ceiling
    ctx.fillStyle = "#444" // Ceiling color
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2)
    ctx.fillStyle = "#222" // Floor color
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2)

    // Cast rays
    for (let i = 0; i < rayCount; i++) {
      // Calculate ray angle
      const rayAngle = player.angle - FOV / 2 + (i / rayCount) * FOV

      // Initialize ray position
      let rayX = player.x
      let rayY = player.y
      let distance = 0
      let hitWall = false
      let wallType = 0

      // Step size for ray
      const stepSize = 0.05
      const sin = Math.sin(rayAngle)
      const cos = Math.cos(rayAngle)

      // Cast ray until we hit a wall or reach max distance
      while (!hitWall && distance < maxDistance) {
        distance += stepSize
        rayX = player.x + cos * distance
        rayY = player.y + sin * distance

        // Check if ray is out of bounds
        if (rayX < 0 || rayX >= MAP[0].length || rayY < 0 || rayY >= MAP.length) {
          hitWall = true
          distance = maxDistance
        } else {
          // Check if ray hit a wall
          const mapX = Math.floor(rayX)
          const mapY = Math.floor(rayY)

          if (MAP[mapY][mapX] === 1) {
            hitWall = true
            wallType = 1
          }
        }
      }

      // Calculate wall height based on distance
      const wallHeight = canvas.height / distance

      // Draw wall slice
      const wallTop = Math.max(0, (canvas.height - wallHeight) / 2)
      const wallBottom = Math.min(canvas.height, (canvas.height + wallHeight) / 2)

      // Determine wall color based on distance and type
      let wallColor
      if (wallType === 1) {
        // Darker color for further walls
        const shade = Math.min(1, 1 - distance / maxDistance)
        wallColor = `rgb(${Math.floor(200 * shade)}, 0, 0)` // Red walls
      }

      // Draw the wall slice
      ctx.fillStyle = wallColor || "#000"
      ctx.fillRect(i, wallTop, 1, wallBottom - wallTop)
    }

    // Draw enemies (sprites)
    enemies.forEach((enemy) => {
      if (!enemy.isAlive) return

      // Calculate enemy position relative to player
      const dx = enemy.x - player.x
      const dy = enemy.y - player.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate enemy angle relative to player
      const enemyAngle = Math.atan2(dy, dx)

      // Check if enemy is in field of view
      let angleDiff = player.angle - enemyAngle
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI

      if (Math.abs(angleDiff) < FOV / 2) {
        // Calculate enemy screen position
        const screenX = canvas.width / 2 + (angleDiff / (FOV / 2)) * (canvas.width / 2)

        // Calculate enemy size based on distance
        const size = Math.min(200, canvas.height / distance)

        // Draw enemy sprite
        ctx.fillStyle = enemy.type === "imp" ? "#0F0" : "#F00"
        ctx.fillRect(screenX - size / 2, canvas.height / 2 - size / 2, size, size)
      }
    })

    // Draw weapon
    if (showWeapon) {
      const weaponImg = new Image()
      weaponImg.src = player.weapon === "pistol" ? "pistol.png" : "shotgun.png"

      // Draw a simple weapon placeholder
      ctx.fillStyle = "#888"
      ctx.fillRect(canvas.width / 2 - 10, canvas.height - 50, 20, 50)
    }

    // Draw HUD
    ctx.fillStyle = "#000"
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30)

    // Health
    ctx.fillStyle = "#F00"
    ctx.fillRect(10, canvas.height - 25, player.health, 10)
    ctx.strokeStyle = "#FFF"
    ctx.strokeRect(10, canvas.height - 25, 100, 10)
    ctx.fillStyle = "#FFF"
    ctx.font = "10px Arial"
    ctx.fillText(`HEALTH: ${player.health}`, 10, canvas.height - 10)

    // Ammo
    ctx.fillStyle = "#FF0"
    ctx.fillRect(canvas.width - 110, canvas.height - 25, player.ammo, 10)
    ctx.strokeStyle = "#FFF"
    ctx.strokeRect(canvas.width - 110, canvas.height - 25, 100, 10)
    ctx.fillStyle = "#FFF"
    ctx.fillText(`AMMO: ${player.ammo}`, canvas.width - 110, canvas.height - 10)

    // Score
    ctx.fillStyle = "#FFF"
    ctx.fillText(`SCORE: ${score}`, canvas.width / 2 - 30, canvas.height - 10)

    // Draw minimap if enabled
    if (showMap) {
      const mapSize = 100
      const cellSize = mapSize / MAP.length

      // Draw map background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(canvas.width - mapSize - 10, 10, mapSize, mapSize)

      // Draw map walls
      for (let y = 0; y < MAP.length; y++) {
        for (let x = 0; x < MAP[y].length; x++) {
          if (MAP[y][x] === 1) {
            ctx.fillStyle = "#FFF"
            ctx.fillRect(canvas.width - mapSize - 10 + x * cellSize, 10 + y * cellSize, cellSize, cellSize)
          }
        }
      }

      // Draw player on map
      ctx.fillStyle = "#00F"
      ctx.fillRect(canvas.width - mapSize - 10 + player.x * cellSize - 2, 10 + player.y * cellSize - 2, 4, 4)

      // Draw player direction
      ctx.strokeStyle = "#00F"
      ctx.beginPath()
      ctx.moveTo(canvas.width - mapSize - 10 + player.x * cellSize, 10 + player.y * cellSize)
      ctx.lineTo(
        canvas.width - mapSize - 10 + (player.x + Math.cos(player.angle) * 2) * cellSize,
        10 + (player.y + Math.sin(player.angle) * 2) * cellSize,
      )
      ctx.stroke()

      // Draw enemies on map
      enemies.forEach((enemy) => {
        if (enemy.isAlive) {
          ctx.fillStyle = enemy.type === "imp" ? "#0F0" : "#F00"
          ctx.fillRect(canvas.width - mapSize - 10 + enemy.x * cellSize - 2, 10 + enemy.y * cellSize - 2, 4, 4)
        }
      })
    }
  }

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const width = container.clientWidth
      const height = container.clientHeight - 30 // Subtract HUD height

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

  // Clean up game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  return (
    <div className="window" data-window="doom" style={getWindowStyle("doom", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">DOOM - Score: {score}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body doom-container">
        <canvas
          ref={canvasRef}
          className="doom-canvas"
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={() => {
            if (!gameActive) {
              startGame()
            } else if (player.ammo > 0) {
              setIsShooting(true)
              setPlayer((prev) => ({ ...prev, ammo: prev.ammo - 1 }))
              checkEnemyHits()
            }
          }}
        />
        {!gameActive && (
          <div className="doom-start-screen">
            <h2>DOOM</h2>
            <p>Click to start</p>
            <p>Controls:</p>
            <p>W/Up Arrow: Move forward</p>
            <p>S/Down Arrow: Move backward</p>
            <p>A/Left Arrow: Turn left</p>
            <p>D/Right Arrow: Turn right</p>
            <p>Shift + A/D: Strafe</p>
            <p>Space/Ctrl: Shoot</p>
            <p>M: Toggle map</p>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}
        {gameOver && (
          <div className="doom-game-over">
            <h2>Game Over</h2>
            <p>Your score: {score}</p>
            <button onClick={startGame}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
