"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type {
  WindowStates,
  DraggingState,
  MinimizeAnimationState,
  SystemResourcesState,
  PlaylistItem,
} from "../types/windows"
import { AboutWindow } from "../components/windows/AboutWindow"
import { ProjectsWindow } from "../components/windows/ProjectsWindow"
import { ContactWindow } from "../components/windows/ContactWindow"
import { TaskManagerWindow } from "../components/windows/TaskManagerWindow"
import { SnakeWindow } from "../components/windows/SnakeWindow"
import { NotepadWindow } from "../components/windows/NotepadWindow"
import { DisplayPropertiesWindow } from "../components/windows/DisplayPropertiesWindow"
import { MusicPlayerWindow } from "../components/windows/MusicPlayerWindow"
import { Calendar } from "../components/Calendar"
import { Taskbar } from "../components/Taskbar"
import { StartMenu } from "../components/StartMenu"
import { DesktopIcons } from "../components/DesktopIcons"
import { CmdWindow } from "../components/windows/CmdWindow"

// Windows 98 Icons as components
const Win98Logo = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="6" height="6" fill="#FF0000" />
    <rect x="9" y="1" width="6" height="6" fill="#00FF00" />
    <rect x="1" y="9" width="6" height="6" fill="#0000FF" />
    <rect x="9" y="9" width="6" height="6" fill="#FFFF00" />
  </svg>
)

const AboutIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#FFCC99" stroke="#000000" strokeWidth="1" />
    <circle cx="11" cy="12" r="2" fill="#000000" />
    <circle cx="21" cy="12" r="2" fill="#000000" />
    <path d="M10 20C10 20 12 24 16 24C20 24 22 20 22 20" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 4C16 4 8 8 8 16C8 24 16 28 16 28" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 4C16 4 24 8 24 16C24 24 16 28 16 28" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const LinuxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="22" rx="10" ry="7" fill="#FFCC00" />
    <circle cx="16" cy="12" r="8" fill="#FFCC00" />
    <circle cx="13" cy="10" r="1.5" fill="#000000" />
    <circle cx="19" cy="10" r="1.5" fill="#000000" />
    <path d="M12 14C12 14 14 16 16 16C18 16 20 14 20 14" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
    <path d="M10 8L7 6" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
    <path d="M22 8L25 6" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
    <path d="M11 22L8 26" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
    <path d="M21 22L24 26" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

const ContactIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="24" height="16" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    <path d="M4 8L16 18L28 8" stroke="#000000" strokeWidth="1" />
    <path d="M4 24L12 16" stroke="#000000" strokeWidth="1" />
    <path d="M28 24L20 16" stroke="#000000" strokeWidth="1" />
    <rect x="10" y="12" width="12" height="8" fill="#CCCCFF" />
    <path d="M10 12L22 12" stroke="#0000FF" strokeWidth="1" />
    <path d="M10 14L22 14" stroke="#0000FF" strokeWidth="1" />
    <path d="M10 16L22 16" stroke="#0000FF" strokeWidth="1" />
    <path d="M10 18L22 18" stroke="#0000FF" strokeWidth="1" />
    <path d="M10 20L22 20" stroke="#0000FF" strokeWidth="1" />
  </svg>
)

const TaskManagerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="14" height="14" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
    <rect x="2" y="2" width="12" height="2" fill="#000080" />
    <rect x="2" y="5" width="12" height="1" fill="#000000" />
    <rect x="2" y="7" width="12" height="1" fill="#000000" />
    <rect x="2" y="9" width="12" height="1" fill="#000000" />
    <rect x="2" y="11" width="12" height="1" fill="#000000" />
    <rect x="2" y="13" width="12" height="1" fill="#000000" />
  </svg>
)

const SnakeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" fill="#000000" stroke="#00FF00" strokeWidth="1" />
    <rect x="6" y="6" width="4" height="4" fill="#00FF00" />
    <rect x="10" y="6" width="4" height="4" fill="#00FF00" />
    <rect x="14" y="6" width="4" height="4" fill="#00FF00" />
    <rect x="18" y="6" width="4" height="4" fill="#00FF00" />
    <rect x="18" y="10" width="4" height="4" fill="#00FF00" />
    <rect x="18" y="14" width="4" height="4" fill="#00FF00" />
    <rect x="22" y="14" width="4" height="4" fill="#FF0000" />
  </svg>
)

const NotepadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2" width="20" height="28" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    <rect x="8" y="6" width="16" height="1" fill="#000000" />
    <rect x="8" y="9" width="16" height="1" fill="#000000" />
    <rect x="8" y="12" width="16" height="1" fill="#000000" />
    <rect x="8" y="15" width="16" height="1" fill="#000000" />
    <rect x="8" y="18" width="16" height="1" fill="#000000" />
    <rect x="8" y="21" width="16" height="1" fill="#000000" />
    <rect x="8" y="24" width="10" height="1" fill="#000000" />
    <path d="M6 2L10 6H6V2Z" fill="#C0C0C0" />
  </svg>
)

const MusicPlayerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="28" height="28" fill="#000080" stroke="#000000" strokeWidth="1" />
    <circle cx="16" cy="16" r="10" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <circle cx="16" cy="16" r="3" fill="#000000" />
    <rect x="15" y="2" width="2" height="8" fill="#00FFFF" />
    <rect x="22" y="15" width="8" height="2" fill="#00FFFF" />
    <rect x="15" y="22" width="2" height="8" fill="#00FFFF" />
    <rect x="2" y="15" width="8" height="2" fill="#00FFFF" />
    <path d="M21 8L24 5" stroke="#00FFFF" strokeWidth="2" />
    <path d="M24 27L21 24" stroke="#00FFFF" strokeWidth="2" />
    <path d="M8 24L5 27" stroke="#00FFFF" strokeWidth="2" />
    <path d="M5 5L8 8" stroke="#00FFFF" strokeWidth="2" />
  </svg>
)

export default function Home() {
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [windowStates, setWindowStates] = useState<WindowStates>({
    about: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 50, y: 50 },
      size: { width: "500px", height: "auto" },
      zIndex: 1,
      title: "About Me",
    },
    projects: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: "500px", height: "auto" },
      zIndex: 1,
      title: "Linux Projects",
    },
    contact: {
      isOpen: false,
      isMinimized: false,
      position: { x: 150, y: 150 },
      size: { width: "500px", height: "auto" },
      isMaximized: false,
      isMinimized: false,
      zIndex: 1,
      title: "Contact",
    },
    taskManager: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: "400px", height: "auto" },
      zIndex: 1,
      title: "Task Manager",
    },
    snake: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 250, y: 150 },
      size: { width: "400px", height: "400px" },
      zIndex: 1,
      title: "Snake",
    },
    notepad: {
      isOpen: false,
      isMinimized: false,
      position: { x: 300, y: 200 },
      size: { width: "500px", height: "400px" },
      isMaximized: false,
      isMinimized: false,
      zIndex: 1,
      title: "Notepad",
    },
    displayProperties: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 350, y: 100 },
      size: { width: "400px", height: "450px" },
      zIndex: 1,
      title: "Display Properties",
    },
    musicPlayer: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 150 },
      size: { width: "400px", height: "500px" },
      zIndex: 1,
      title: "Music Player",
    },
    cmd: {
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      position: { x: 400, y: 200 },
      size: { width: "500px", height: "400px" },
      zIndex: 1,
      title: "Command Prompt",
    },
  })

  const [dragging, setDragging] = useState<DraggingState>({
    isDragging: false,
    window: null,
    offset: { x: 0, y: 0 },
  })

  const [highestZIndex, setHighestZIndex] = useState(1)
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [systemResources, setSystemResources] = useState<SystemResourcesState>({
    cpu: 0,
    memory: 0,
    history: Array(60)
      .fill(0)
      .map(() => ({ cpu: 0, memory: 0 })),
  })
  const [showTaskbarMenu, setShowTaskbarMenu] = useState(false)
  const [taskbarMenuPosition, setTaskbarMenuPosition] = useState({ x: 0, y: 0 })
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [minimizeAnimation, setMinimizeAnimation] = useState<MinimizeAnimationState>({
    windowName: null,
    startPos: null,
    endPos: null,
    isAnimating: false,
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showNotepadMenu, setShowNotepadMenu] = useState<string | null>(null)

  // Snake game state
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ])
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(150)
  const [gridSize, setGridSize] = useState({ width: 20, height: 20 })
  const [cellSize, setCellSize] = useState(15)

  // Notepad state
  const [notepadContent, setNotepadContent] = useState("")
  const [notepadFilename, setNotepadFilename] = useState("Untitled.txt")
  const [notepadModified, setNotepadModified] = useState(false)

  // Music Player state
  const [audioUrl, setAudioUrl] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([
    { title: "Sample Lofi Hip Hop", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1b0a1eadad.mp3" },
    { title: "Sample Jazz", url: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_eae8e41b9e.mp3" },
    { title: "Sample Piano", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e2d65f95.mp3" },
  ])
  const [currentTrack, setCurrentTrack] = useState<number | null>(null)
  const [audioStatus, setAudioStatus] = useState("Ready")
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(30).fill(0))

  // Wallpaper state
  const [wallpaper, setWallpaper] = useState<string | null>(null)
  const [wallpaperStyle, setWallpaperStyle] = useState<"center" | "tile" | "stretch">("stretch")
  const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(null)
  const [wallpaperUrl, setWallpaperUrl] = useState("")
  const [uploadedWallpapers, setUploadedWallpapers] = useState<{ name: string; url: string }[]>([])

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const startMenuRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const taskbarMenuRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const snakeCanvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number | null>(null)
  const notepadTextareaRef = useRef<HTMLTextAreaElement>(null)
  const notepadMenuRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const visualizerIntervalRef = useRef<number | null>(null)

  // Reference to track if component is mounted
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging.isDragging && dragging.window) {
        setWindowStates((prev) => ({
          ...prev,
          [dragging.window!]: {
            ...prev[dragging.window!],
            position: {
              x: e.clientX - dragging.offset.x,
              y: e.clientY - dragging.offset.y,
            },
          },
        }))
      }
    }

    const handleMouseUp = () => {
      setDragging({
        isDragging: false,
        window: null,
        offset: { x: 0, y: 0 },
      })
    }

    if (dragging.isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 60000) // Update every minute

    // Initial update
    setCurrentDateTime(new Date())

    return () => clearInterval(timer)
  }, [])

  // Simulate system resources
  useEffect(() => {
    const updateResources = () => {
      setSystemResources((prev) => {
        // Generate random CPU and memory usage that fluctuates realistically
        const newCpu = Math.max(5, Math.min(95, prev.cpu + (Math.random() * 10 - 5)))
        const newMemory = Math.max(20, Math.min(80, prev.memory + (Math.random() * 6 - 3)))

        // Add to history, removing oldest entry
        const newHistory = [...prev.history.slice(1), { cpu: newCpu, memory: newMemory }]

        return {
          cpu: newCpu,
          memory: newMemory,
          history: newHistory,
        }
      })
    }

    const resourceTimer = setInterval(updateResources, 1000)
    updateResources() // Initial update

    return () => clearInterval(resourceTimer)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+Delete to open Task Manager
      if (e.ctrlKey && e.altKey && e.key === "Delete") {
        openWindow("taskManager")
      }

      // Snake game controls
      if (windowStates.snake.isOpen && !windowStates.snake.isMinimized && gameActive && !gameOver) {
        switch (e.key) {
          case "ArrowUp":
            if (direction !== "DOWN") setDirection("UP")
            break
          case "ArrowDown":
            if (direction !== "UP") setDirection("DOWN")
            break
          case "ArrowLeft":
            if (direction !== "RIGHT") setDirection("LEFT")
            break
          case "ArrowRight":
            if (direction !== "LEFT") setDirection("RIGHT")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [windowStates.snake.isOpen, windowStates.snake.isMinimized, gameActive, gameOver, direction])

  // Handle clicks outside the start menu and taskbar menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle Start Menu clicks
      if (
        isStartMenuOpen &&
        startMenuRef.current &&
        !startMenuRef.current.contains(event.target as Node) &&
        startButtonRef.current &&
        !startButtonRef.current.contains(event.target as Node)
      ) {
        setIsStartMenuOpen(false)
      }

      // Handle Taskbar Menu clicks
      if (showTaskbarMenu && taskbarMenuRef.current && !taskbarMenuRef.current.contains(event.target as Node)) {
        setShowTaskbarMenu(false)
      }

      // Handle Calendar clicks
      if (
        calendarVisible &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        timeRef.current &&
        !timeRef.current.contains(event.target as Node)
      ) {
        setCalendarVisible(false)
      }

      // Handle Notepad menu clicks
      if (showNotepadMenu && notepadMenuRef.current && !notepadMenuRef.current.contains(event.target as Node)) {
        setShowNotepadMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isStartMenuOpen, showTaskbarMenu, calendarVisible, showNotepadMenu])

  // Snake game loop
  useEffect(() => {
    if (windowStates.snake.isOpen && !windowStates.snake.isMinimized && gameActive && !gameOver) {
      const moveSnake = () => {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake]
          const head = { ...newSnake[0] }

          // Move head based on direction
          switch (direction) {
            case "UP":
              head.y -= 1
              break
            case "DOWN":
              head.y += 1
              break
            case "LEFT":
              head.x -= 1
              break
            case "RIGHT":
              head.x += 1
              break
          }

          // Check for wall collision
          if (head.x < 0 || head.x >= gridSize.width || head.y < 0 || head.y >= gridSize.height) {
            setGameOver(true)
            return prevSnake
          }

          // Check for self collision
          for (let i = 0; i < newSnake.length; i++) {
            if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
              setGameOver(true)
              return prevSnake
            }
          }

          // Add new head
          newSnake.unshift(head)

          // Check if snake ate food
          if (head.x === food.x && head.y === food.y) {
            // Generate new food
            const newFood = generateFood(newSnake)
            setFood(newFood)
            setScore((prev) => prev + 10)

            // Increase speed every 50 points
            if (score > 0 && score % 50 === 0) {
              setSpeed((prev) => Math.max(50, prev - 10))
            }
          } else {
            // Remove tail if no food was eaten
            newSnake.pop()
          }

          return newSnake
        })
      }

      // Set up game loop
      gameLoopRef.current = window.setInterval(moveSnake, speed)

      // Draw the game
      const drawGame = () => {
        const canvas = snakeCanvasRef.current
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

        // Request next frame
        requestAnimationFrame(drawGame)
      }

      // Start drawing
      //drawGame()

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current)
        }
      }
    }
  }, [
    windowStates.snake.isOpen,
    windowStates.snake.isMinimized,
    snake,
    food,
    direction,
    gameActive,
    gameOver,
    speed,
    gridSize,
    cellSize,
    score,
  ])

  // Audio player setup and time update
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime)
        setDuration(audio.duration || 0)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setAudioStatus("Playback ended")

        // Play next track if available
        if (currentTrack !== null && currentTrack < playlist.length - 1) {
          playTrack(currentTrack + 1)
        }
      }

      const handlePlay = () => {
        setIsPlaying(true)
        setAudioStatus("Playing")
      }

      const handlePause = () => {
        setIsPlaying(false)
        setAudioStatus("Paused")
      }

      const handleError = () => {
        setIsPlaying(false)
        setAudioStatus("Error loading audio")
      }

      const handleCanPlay = () => {
        setAudioStatus("Ready to play")
      }

      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("play", handlePlay)
      audio.addEventListener("pause", handlePause)
      audio.addEventListener("error", handleError)
      audio.addEventListener("canplay", handleCanPlay)

      // Set initial volume
      audio.volume = volume

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("play", handlePlay)
        audio.removeEventListener("pause", handlePause)
        audio.removeEventListener("error", handleError)
        audio.removeEventListener("canplay", handleCanPlay)
      }
    }
  }, [currentTrack, playlist, volume])

  // Update audio element src when audioUrl changes
  useEffect(() => {
    const audio = audioRef.current
    if (audio && audioUrl) {
      audio.src = audioUrl
      audio.load()
      setAudioStatus("Loading...")
    }
  }, [audioUrl])

  // Audio visualizer
  useEffect(() => {
    if (isPlaying && windowStates.musicPlayer.isOpen && !windowStates.musicPlayer.isMinimized) {
      // Simulate visualizer with random values
      visualizerIntervalRef.current = window.setInterval(() => {
        const newData = Array(30)
          .fill(0)
          .map(() => Math.floor(Math.random() * 35) + 5)
        setVisualizerData(newData)
      }, 100)
    } else {
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current)
      }
    }

    return () => {
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current)
      }
    }
  }, [isPlaying, windowStates.musicPlayer.isOpen, windowStates.musicPlayer.isMinimized])

  // Generate random food position
  const generateFood = (snakeBody: { x: number; y: number }[]) => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize.width),
        y: Math.floor(Math.random() * gridSize.height),
      }
      // Make sure food doesn't spawn on snake
    } while (snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }

  // Reset snake game
  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    setFood(
      generateFood([
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ]),
    )
    setDirection("RIGHT")
    setGameOver(false)
    setScore(0)
    setSpeed(150)
  }

  // Music player functions
  const playTrack = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrack(index)
      setAudioUrl(playlist[index].url)

      // Small delay to ensure audio is loaded
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((e) => {
            console.error("Error playing audio:", e)
            setAudioStatus("Error: " + e.message)
          })
        }
      }, 100)
    }
  }

  const applyWallpaper = useCallback(() => {
    if (selectedWallpaper) {
      setWallpaper(selectedWallpaper)
    } else if (wallpaperUrl) {
      setWallpaper(wallpaperUrl)
      // Add to uploaded wallpapers if it's not already there
      if (!uploadedWallpapers.some((w) => w.url === wallpaperUrl)) {
        setUploadedWallpapers((prev) => [
          ...prev,
          {
            name: `URL Image ${prev.length + 1}`,
            url: wallpaperUrl,
          },
        ])
      }
    }
  }, [selectedWallpaper, wallpaperUrl, uploadedWallpapers])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setSelectedWallpaper(imageUrl)
        setUploadedWallpapers((prev) => [
          ...prev,
          {
            name: file.name,
            url: imageUrl,
          },
        ])
      }
      reader.readAsDataURL(file)
    }
  }

  const openWindow = (windowName: string) => {
    setActiveWindow(windowName)
    setHighestZIndex((prev) => prev + 1)
    setWindowStates((prev) => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        isOpen: true,
        isMinimized: false,
        zIndex: highestZIndex + 1,
      },
    }))

    // Close start menu when opening a window
    setIsStartMenuOpen(false)
    setShowTaskbarMenu(false)

    // Special handling for snake game
    if (windowName === "snake") {
      resetGame()
    }
  }

  const closeWindow = (windowName: string) => {
    // Special handling for snake game
    if (windowName === "snake") {
      setGameActive(false)
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    // Special handling for notepad
    if (windowName === "notepad" && notepadModified) {
      // In a real app, we'd show a save dialog here
      // For simplicity, we'll just reset the state
      setNotepadContent("")
      setNotepadFilename("Untitled.txt")
      setNotepadModified(false)
    }

    // Special handling for music player
    if (windowName === "musicPlayer") {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        setIsPlaying(false)
      }
    }

    setWindowStates((prev) => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      },
    }))

    if (activeWindow === windowName) {
      setActiveWindow(null)
    }
  }

  const minimizeWindow = (windowName: string) => {
    // Get the DOM element for the window and taskbar button
    const windowElement = document.querySelector(`[data-window="${windowName}"]`) as HTMLElement
    const taskbarButton = document.querySelector(`[data-taskbar-button="${windowName}"]`) as HTMLElement

    if (windowElement && taskbarButton) {
      // Get the positions for animation
      const windowRect = windowElement.getBoundingClientRect()
      const buttonRect = taskbarButton.getBoundingClientRect()

      // Set the animation state
      setMinimizeAnimation({
        windowName,
        startPos: {
          x: windowRect.left,
          y: windowRect.top,
          width: windowRect.width,
          height: windowRect.height,
        },
        endPos: {
          x: buttonRect.left,
          y: buttonRect.top,
          width: buttonRect.width,
          height: buttonRect.height,
        },
        isAnimating: true,
      })

      // After animation completes, update the window state
      setTimeout(() => {
        setMinimizeAnimation((prev) => ({ ...prev, isAnimating: false }))
        setWindowStates((prev) => ({
          ...prev,
          [windowName]: {
            ...prev[windowName],
            isMinimized: true,
          },
        }))
      }, 300) // Animation duration
    } else {
      // Fallback if elements aren't found
      setWindowStates((prev) => ({
        ...prev,
        [windowName]: {
          ...prev[windowName],
          isMinimized: true,
        },
      }))
    }

    // Special handling for snake game
    if (windowName === "snake") {
      setGameActive(false)
    }
  }

  const maximizeWindow = (windowName: string) => {
    setWindowStates((prev) => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        isMaximized: !prev[windowName].isMaximized,
      },
    }))
  }

  const startDragging = (e: React.MouseEvent, windowName: string) => {
    // Don't drag if maximized
    if (windowStates[windowName].isMaximized) return

    // Bring window to front
    setHighestZIndex((prev) => prev + 1)
    setWindowStates((prev) => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        zIndex: highestZIndex + 1,
      },
    }))

    setActiveWindow(windowName)

    // Start dragging
    setDragging({
      isDragging: true,
      window: windowName,
      offset: {
        x: e.clientX - windowStates[windowName].position.x,
        y: e.clientY - windowStates[windowName].position.y,
      },
    })
  }

  const restoreWindow = (windowName: string) => {
    setWindowStates((prev) => ({
      ...prev,
      [windowName]: {
        ...prev[windowName],
        isMinimized: false,
        zIndex: highestZIndex + 1,
      },
    }))
    setHighestZIndex((prev) => prev + 1)
    setActiveWindow(windowName)

    // Special handling for snake game
    if (windowName === "snake" && gameOver) {
      resetGame()
    }
  }

  const toggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev)
    setShowTaskbarMenu(false)
  }

  const handleTaskbarRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowTaskbarMenu(true)
    setIsStartMenuOpen(false)
    setTaskbarMenuPosition({ x: e.clientX, y: e.clientY })
  }

  const toggleCalendar = () => {
    setCalendarVisible((prev) => !prev)
    setShowTaskbarMenu(false)
  }

  // Get running applications for Task Manager
  const getRunningApplications = () => {
    return Object.entries(windowStates)
      .filter(([name, state]) => state.isOpen && name !== "taskManager")
      .map(([name, state]) => ({
        name,
        title: state.title || name.charAt(0).toUpperCase() + name.slice(1),
        status: state.isMinimized ? "Not Responding" : "Running",
      }))
  }

  // Handle desktop right-click
  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowTaskbarMenu(false)
    setIsStartMenuOpen(false)

    // Show a context menu for the desktop
    setTaskbarMenuPosition({ x: e.clientX, y: e.clientY })
    setShowTaskbarMenu(true)
  }

  const renderMinimizeAnimation = () => {
    if (!minimizeAnimation.isAnimating || !minimizeAnimation.startPos || !minimizeAnimation.endPos) {
      return null
    }

    return (
      <div
        className="minimize-animation"
        style={{
          position: "fixed",
          left: minimizeAnimation.startPos.x,
          top: minimizeAnimation.startPos.y,
          width: minimizeAnimation.startPos.width,
          height: minimizeAnimation.startPos.height,
          transform: `
            translate(
              ${minimizeAnimation.endPos.x - minimizeAnimation.startPos.x}px, 
              ${minimizeAnimation.endPos.y - minimizeAnimation.startPos.y}px
            ) 
            scale(
              ${minimizeAnimation.endPos.width / minimizeAnimation.startPos.width}, 
              ${minimizeAnimation.endPos.height / minimizeAnimation.startPos.height}
            )
          `,
          opacity: 0,
          transition: "all 300ms ease-in-out",
          backgroundColor: "#c0c0c0",
          border: "1px solid #000",
          zIndex: highestZIndex + 200,
        }}
      />
    )
  }

  return (
    <main onContextMenu={handleDesktopRightClick}>
      <div
        className="desktop-background"
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
          backgroundSize: wallpaperStyle === "stretch" ? "cover" : "auto",
          backgroundRepeat: wallpaperStyle === "tile" ? "repeat" : "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>

      <DesktopIcons openWindow={openWindow} />

      {windowStates.about.isOpen && (
        <AboutWindow
          windowState={windowStates.about}
          isActive={activeWindow === "about"}
          onClose={() => closeWindow("about")}
          onMinimize={() => minimizeWindow("about")}
          onMaximize={() => maximizeWindow("about")}
          onStartDragging={(e) => startDragging(e, "about")}
        />
      )}

      {windowStates.projects.isOpen && (
        <ProjectsWindow
          windowState={windowStates.projects}
          isActive={activeWindow === "projects"}
          onClose={() => closeWindow("projects")}
          onMinimize={() => minimizeWindow("projects")}
          onMaximize={() => maximizeWindow("projects")}
          onStartDragging={(e) => startDragging(e, "projects")}
        />
      )}

      {windowStates.contact.isOpen && (
        <ContactWindow
          windowState={windowStates.contact}
          isActive={activeWindow === "contact"}
          onClose={() => closeWindow("contact")}
          onMinimize={() => minimizeWindow("contact")}
          onMaximize={() => maximizeWindow("contact")}
          onStartDragging={(e) => startDragging(e, "contact")}
        />
      )}

      {windowStates.taskManager.isOpen && (
        <TaskManagerWindow
          windowState={windowStates.taskManager}
          isActive={activeWindow === "taskManager"}
          onClose={() => closeWindow("taskManager")}
          onMinimize={() => minimizeWindow("taskManager")}
          onMaximize={() => maximizeWindow("taskManager")}
          onStartDragging={(e) => startDragging(e, "taskManager")}
          systemResources={systemResources}
          runningApps={getRunningApplications()}
          closeWindow={closeWindow}
        />
      )}

      {windowStates.snake.isOpen && (
        <SnakeWindow
          windowState={windowStates.snake}
          isActive={activeWindow === "snake"}
          onClose={() => closeWindow("snake")}
          onMinimize={() => minimizeWindow("snake")}
          onMaximize={() => maximizeWindow("snake")}
          onStartDragging={(e) => startDragging(e, "snake")}
          score={score}
          gameActive={gameActive}
          gameOver={gameOver}
          setGameActive={setGameActive}
          resetGame={resetGame}
          direction={direction}
          snake={snake}
          food={food}
          gridSize={gridSize}
          cellSize={cellSize}
        />
      )}

      {windowStates.notepad.isOpen && (
        <NotepadWindow
          windowState={windowStates.notepad}
          isActive={activeWindow === "notepad"}
          onClose={() => closeWindow("notepad")}
          onMinimize={() => minimizeWindow("notepad")}
          onMaximize={() => maximizeWindow("notepad")}
          onStartDragging={(e) => startDragging(e, "notepad")}
          content={notepadContent}
          setContent={setNotepadContent}
          filename={notepadFilename}
          setFilename={setNotepadFilename}
          modified={notepadModified}
          setModified={setNotepadModified}
        />
      )}

      {windowStates.displayProperties.isOpen && (
        <DisplayPropertiesWindow
          windowState={windowStates.displayProperties}
          isActive={activeWindow === "displayProperties"}
          onClose={() => closeWindow("displayProperties")}
          onMinimize={() => minimizeWindow("displayProperties")}
          onMaximize={() => maximizeWindow("displayProperties")}
          onStartDragging={(e) => startDragging(e, "displayProperties")}
          selectedWallpaper={selectedWallpaper}
          setSelectedWallpaper={setSelectedWallpaper}
          wallpaperUrl={wallpaperUrl}
          setWallpaperUrl={setWallpaperUrl}
          wallpaperStyle={wallpaperStyle}
          setWallpaperStyle={setWallpaperStyle}
          uploadedWallpapers={uploadedWallpapers}
          applyWallpaper={applyWallpaper}
          handleFileUpload={handleFileUpload}
        />
      )}

      {windowStates.musicPlayer.isOpen && (
        <MusicPlayerWindow
          windowState={windowStates.musicPlayer}
          isActive={activeWindow === "musicPlayer"}
          onClose={() => closeWindow("musicPlayer")}
          onMinimize={() => minimizeWindow("musicPlayer")}
          onMaximize={() => maximizeWindow("musicPlayer")}
          onStartDragging={(e) => startDragging(e, "musicPlayer")}
          playlist={playlist}
          setPlaylist={setPlaylist}
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          duration={duration}
          volume={volume}
          setVolume={setVolume}
          audioStatus={audioStatus}
          visualizerData={visualizerData}
          audioRef={audioRef}
        />
      )}

      {windowStates.cmd.isOpen && (
        <CmdWindow
          windowState={windowStates.cmd}
          isActive={activeWindow === "cmd"}
          onClose={() => closeWindow("cmd")}
          onMinimize={() => minimizeWindow("cmd")}
          onMaximize={() => maximizeWindow("cmd")}
          onStartDragging={(e) => startDragging(e, "cmd")}
        />
      )}

      {showTaskbarMenu && (
        <div
          ref={taskbarMenuRef}
          className="taskbar-context-menu"
          style={{
            position: "absolute",
            left: `${taskbarMenuPosition.x}px`,
            top: `${taskbarMenuPosition.y - 120}px`,
            zIndex: highestZIndex + 100,
          }}
        >
          <div className="context-menu-item" onClick={() => openWindow("displayProperties")}>
            Display Properties
          </div>
          <div className="context-menu-item" onClick={() => openWindow("taskManager")}>
            Task Manager
          </div>
        </div>
      )}

      <Taskbar
        startMenuRef={startMenuRef}
        startButtonRef={startButtonRef}
        timeRef={timeRef}
        isStartMenuOpen={isStartMenuOpen}
        toggleStartMenu={toggleStartMenu}
        windowStates={windowStates}
        activeWindow={activeWindow}
        restoreWindow={restoreWindow}
        minimizeWindow={minimizeWindow}
        currentDateTime={currentDateTime}
        toggleCalendar={toggleCalendar}
        handleTaskbarRightClick={handleTaskbarRightClick}
        highestZIndex={highestZIndex}
      />

      {isStartMenuOpen && (
        <StartMenu startMenuRef={startMenuRef} openWindow={openWindow} highestZIndex={highestZIndex} />
      )}

      {calendarVisible && (
        <Calendar
          calendarRef={calendarRef}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          onClose={() => setCalendarVisible(false)}
          zIndex={highestZIndex + 100}
        />
      )}

      {renderMinimizeAnimation()}
      <audio ref={audioRef} />
    </main>
  )
}
