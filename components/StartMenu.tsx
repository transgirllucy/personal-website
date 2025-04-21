"use client"

import type React from "react"
import { Computer, Terminal, Globe, Monitor, Music, Command, GamepadIcon as GameController } from "lucide-react"
import { SnakeIcon, NotepadIcon, TaskManagerIcon } from "./win98-icons"

interface StartMenuProps {
  startMenuRef: React.RefObject<HTMLDivElement>
  openWindow: (windowName: string) => void
  highestZIndex: number
}

export const StartMenu: React.FC<StartMenuProps> = ({ startMenuRef, openWindow, highestZIndex }) => {
  return (
    <div ref={startMenuRef} className="start-menu" style={{ zIndex: highestZIndex + 100 }}>
      <div className="start-menu-banner">
        <span className="start-menu-banner-text">Windows 98</span>
      </div>

      <div className="start-menu-items">
        <div className="start-menu-item" onClick={() => openWindow("displayProperties")}>
          <Monitor className="start-menu-icon" size={16} />
          <span>Display Properties</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("musicPlayer")}>
          <Music className="start-menu-icon" size={16} />
          <span>Music Player</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("about")}>
          <Computer className="start-menu-icon" size={16} />
          <span>About Me</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("projects")}>
          <Terminal className="start-menu-icon" size={16} />
          <span>Linux Projects</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("contact")}>
          <Globe className="start-menu-icon" size={16} />
          <span>Contact</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("snake")}>
          <div className="start-menu-icon">
            <SnakeIcon />
          </div>
          <span>Snake</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("flappyBird")}>
          <GameController className="start-menu-icon" size={16} />
          <span>Flappy Bird</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("notepad")}>
          <div className="start-menu-icon">
            <NotepadIcon />
          </div>
          <span>Notepad</span>
        </div>
        <div className="start-menu-item" onClick={() => openWindow("cmd")}>
          <Command className="start-menu-icon" size={16} />
          <span>Command Prompt</span>
        </div>
        <div className="start-menu-divider"></div>
        <div className="start-menu-item" onClick={() => openWindow("taskManager")}>
          <div className="start-menu-icon">
            <TaskManagerIcon />
          </div>
          <span>Task Manager</span>
        </div>
      </div>
    </div>
  )
}
