"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface TetrisWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

// Define tetromino shapes and colors
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00FFFF", // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000FF", // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#FFA500", // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFFF00", // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00FF00", // Green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#800080", // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#FF0000", // Red
  },
}

// Game constants
const ROWS = 20
const COLS = 10
const CELL_SIZE = 20
const INITIAL_SPEED = 800 // ms per drop
const SPEED_INCREASE = 50 // ms decrease per level
const MIN_SPEED = 100 // minimum drop speed
const POINTS_PER_LINE = 100
const LINES_PER_LEVEL = 10

export const TetrisWindow: React.FC<TetrisWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  // Game state
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState<{
    shape: number[][]
    position: { x: number; y: number }
    type: keyof typeof TETROMINOES
  } | null>(null)
  const [nextPiece, setNextPiece] = useState<keyof typeof TETROMINOES>(getRandomTetromino())
  const [highScores, setHighScores] = useState<{ name: string; score: number }[]>([])

  // Refs
  const boardRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const keyHandlersRef = useRef<{ [key: string]: () => void }>({})

  // Create an empty game board
  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  }

  // Get a random tetromino type
  function getRandomTetromino(): keyof typeof TETROMINOES {
    const types = Object.keys(TETROMINOES) as Array<keyof typeof TETROMINOES>
    return types[Math.floor(Math.random() * types.length)]
  }

  // Generate a new piece
  const generateNewPiece = useCallback(() => {
    const type = nextPiece
    const newPiece = {
      shape: TETROMINOES[type].shape,
      position: { x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type].shape[0].length / 2), y: 0 },
      type,
    }
    setCurrentPiece(newPiece)
    setNextPiece(getRandomTetromino())

    // Check if the new piece can be placed (game over check)
    if (!isValidPosition(newPiece.shape, newPiece.position)) {
      setGameOver(true)
      setGameActive(false)

      // Check if score is a high score
      if (score > 0) {
        const newHighScores = [...highScores]
        newHighScores.push({ name: "Player", score })
        newHighScores.sort((a, b) => b.score - a.score)
        if (newHighScores.length > 5) {
          newHighScores.pop()
        }
        setHighScores(newHighScores)
        localStorage.setItem("tetrisHighScores", JSON.stringify(newHighScores))
      }
    }
  }, [nextPiece, score, highScores])

  // Check if a position is valid for the current piece
  const isValidPosition = useCallback(
    (shape: number[][], position: { x: number; y: number }) => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] !== 0) {
            const boardX = position.x + x
            const boardY = position.y + y

            // Check boundaries
            if (boardX < 0 || boardX >= COLS || boardY < 0 || boardY >= ROWS) {
              return false
            }

            // Check collision with existing pieces
            if (boardY >= 0 && board[boardY][boardX] !== 0) {
              return false
            }
          }
        }
      }
      return true
    },
    [board],
  )

  // Rotate a piece
  const rotatePiece = useCallback(() => {
    if (!currentPiece) return

    // Create a new rotated shape
    const rotatedShape = currentPiece.shape[0].map((_, index) => currentPiece.shape.map((row) => row[index]).reverse())

    // Check if the rotated position is valid
    if (isValidPosition(rotatedShape, currentPiece.position)) {
      setCurrentPiece({
        ...currentPiece,
        shape: rotatedShape,
      })
    } else {
      // Try wall kicks (move the piece left or right if rotation near wall)
      const kicks = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 2, y: 0 },
        { x: -2, y: 0 },
      ]

      for (const kick of kicks) {
        const newPosition = {
          x: currentPiece.position.x + kick.x,
          y: currentPiece.position.y + kick.y,
        }
        if (isValidPosition(rotatedShape, newPosition)) {
          setCurrentPiece({
            ...currentPiece,
            shape: rotatedShape,
            position: newPosition,
          })
          break
        }
      }
    }
  }, [currentPiece, isValidPosition])

  // Move piece left
  const moveLeft = useCallback(() => {
    if (!currentPiece || paused || gameOver) return

    const newPosition = {
      ...currentPiece.position,
      x: currentPiece.position.x - 1,
    }

    if (isValidPosition(currentPiece.shape, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: newPosition,
      })
    }
  }, [currentPiece, isValidPosition, paused, gameOver])

  // Move piece right
  const moveRight = useCallback(() => {
    if (!currentPiece || paused || gameOver) return

    const newPosition = {
      ...currentPiece.position,
      x: currentPiece.position.x + 1,
    }

    if (isValidPosition(currentPiece.shape, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: newPosition,
      })
    }
  }, [currentPiece, isValidPosition, paused, gameOver])

  // Move piece down (soft drop)
  const moveDown = useCallback(() => {
    if (!currentPiece || paused || gameOver) return

    const newPosition = {
      ...currentPiece.position,
      y: currentPiece.position.y + 1,
    }

    if (isValidPosition(currentPiece.shape, newPosition)) {
      setCurrentPiece({
        ...currentPiece,
        position: newPosition,
      })
      return true
    } else {
      // Piece can't move down, lock it in place
      lockPiece()
      return false
    }
  }, [currentPiece, isValidPosition, paused, gameOver])

  // Hard drop - move piece all the way down
  const hardDrop = useCallback(() => {
    if (!currentPiece || paused || gameOver) return

    let newY = currentPiece.position.y
    while (
      isValidPosition(currentPiece.shape, {
        ...currentPiece.position,
        y: newY + 1,
      })
    ) {
      newY++
    }

    setCurrentPiece({
      ...currentPiece,
      position: {
        ...currentPiece.position,
        y: newY,
      },
    })

    // Lock the piece immediately
    lockPiece()
  }, [currentPiece, isValidPosition, paused, gameOver])

  // Lock the current piece in place and check for completed lines
  const lockPiece = useCallback(() => {
    if (!currentPiece) return

    // Create a new board with the current piece locked in place
    const newBoard = [...board]
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = currentPiece.position.y + y
          const boardX = currentPiece.position.x + x
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = currentPiece.type
          }
        }
      }
    }

    // Check for completed lines
    let completedLines = 0
    const updatedBoard = newBoard.filter((row) => {
      const isComplete = row.every((cell) => cell !== 0)
      if (isComplete) completedLines++
      return !isComplete
    })

    // Add empty rows at the top for each completed line
    while (updatedBoard.length < ROWS) {
      updatedBoard.unshift(Array(COLS).fill(0))
    }

    // Update score and level
    if (completedLines > 0) {
      const newLines = lines + completedLines
      const newScore = score + POINTS_PER_LINE * completedLines * level
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1

      setLines(newLines)
      setScore(newScore)

      if (newLevel > level) {
        setLevel(newLevel)
        setSpeed(Math.max(MIN_SPEED, INITIAL_SPEED - (newLevel - 1) * SPEED_INCREASE))
      }
    }

    setBoard(updatedBoard)
    generateNewPiece()
  }, [board, currentPiece, generateNewPiece, level, lines, score])

  // Start the game
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setScore(0)
    setLevel(1)
    setLines(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setGameActive(true)
    setPaused(false)
    generateNewPiece()
  }, [generateNewPiece])

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameActive && !gameOver) {
      setPaused((prev) => !prev)
    }
  }, [gameActive, gameOver])

  // Game loop
  useEffect(() => {
    if (gameActive && !paused && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        moveDown()
      }, speed)
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameActive, paused, gameOver, speed, moveDown])

  // Keyboard controls
  useEffect(() => {
    // Set up key handlers
    keyHandlersRef.current = {
      ArrowLeft: moveLeft,
      ArrowRight: moveRight,
      ArrowDown: moveDown,
      ArrowUp: rotatePiece,
      " ": hardDrop,
      p: togglePause,
      P: togglePause,
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || !windowState.isOpen || windowState.isMinimized) return

      const handler = keyHandlersRef.current[e.key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    isActive,
    windowState.isOpen,
    windowState.isMinimized,
    moveLeft,
    moveRight,
    moveDown,
    rotatePiece,
    hardDrop,
    togglePause,
  ])

  // Load high scores from localStorage
  useEffect(() => {
    const savedHighScores = localStorage.getItem("tetrisHighScores")
    if (savedHighScores) {
      try {
        setHighScores(JSON.parse(savedHighScores))
      } catch (e) {
        console.error("Failed to parse saved high scores", e)
      }
    }
  }, [])

  // Render the game board with the current piece
  const renderBoard = () => {
    // Create a copy of the board
    const displayBoard = board.map((row) => [...row])

    // Add the current piece to the display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = currentPiece.position.y + y
            const boardX = currentPiece.position.x + x
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              displayBoard[boardY][boardX] = currentPiece.type
            }
          }
        }
      }
    }

    return (
      <div className="tetris-board" ref={boardRef}>
        {displayBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="tetris-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="tetris-cell"
                style={{
                  backgroundColor: cell ? TETROMINOES[cell].color : "#000",
                  borderColor: cell ? "#FFF" : "#333",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Render the next piece preview
  const renderNextPiece = () => {
    const shape = TETROMINOES[nextPiece].shape
    const color = TETROMINOES[nextPiece].color

    return (
      <div className="tetris-next-piece">
        {shape.map((row, rowIndex) => (
          <div key={rowIndex} className="tetris-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="tetris-preview-cell"
                style={{
                  backgroundColor: cell ? color : "transparent",
                  borderColor: cell ? "#FFF" : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="window" data-window="tetris" style={getWindowStyle("tetris", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Tetris - Score: {score}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body tetris-container">
        {!gameActive && !gameOver ? (
          <div className="tetris-start-screen">
            <h2>TETRIS</h2>
            <p>Controls:</p>
            <p>Arrow Left/Right: Move piece</p>
            <p>Arrow Down: Soft drop</p>
            <p>Arrow Up: Rotate piece</p>
            <p>Space: Hard drop</p>
            <p>P: Pause game</p>
            <button onClick={startGame}>Start Game</button>

            {highScores.length > 0 && (
              <div className="tetris-high-scores">
                <h3>High Scores</h3>
                <table>
                  <tbody>
                    {highScores.map((entry, index) => (
                      <tr key={index}>
                        <td>{index + 1}.</td>
                        <td>{entry.name}</td>
                        <td>{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : gameOver ? (
          <div className="tetris-game-over">
            <h2>Game Over</h2>
            <p>Your score: {score}</p>
            <p>Level: {level}</p>
            <p>Lines cleared: {lines}</p>
            <button onClick={startGame}>Play Again</button>
          </div>
        ) : (
          <div className="tetris-game-area">
            {paused ? (
              <div className="tetris-paused">
                <h2>PAUSED</h2>
                <button onClick={togglePause}>Resume</button>
              </div>
            ) : null}
            <div className="tetris-game-board">{renderBoard()}</div>
            <div className="tetris-sidebar">
              <div className="tetris-info">
                <div className="tetris-next">
                  <h3>Next Piece</h3>
                  {renderNextPiece()}
                </div>
                <div className="tetris-stats">
                  <p>Score: {score}</p>
                  <p>Level: {level}</p>
                  <p>Lines: {lines}</p>
                </div>
                <div className="tetris-controls">
                  <button onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
                  <button onClick={startGame}>New Game</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
