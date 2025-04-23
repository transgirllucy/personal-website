"use client"

import type React from "react"
import {
  AboutIcon,
  LinuxIcon,
  ContactIcon,
  SnakeIcon,
  NotepadIcon,
  MusicPlayerIcon,
  CmdIcon,
  FlappyBirdIcon,
  DoomIcon,
} from "./win98-icons"

// Update the interface to include the new props
interface DesktopIconsProps {
  openWindow: (windowName: string) => void
  iconPositions: Record<string, { x: number; y: number }>
  startIconDragging: (e: React.MouseEvent, iconName: string) => void
}

// Update the component to use the new props
export const DesktopIcons: React.FC<DesktopIconsProps> = ({ openWindow, iconPositions, startIconDragging }) => {
  // Define the icons with their names for positioning
  const icons = [
    { name: "about", title: "About Me", icon: AboutIcon },
    { name: "projects", title: "Linux Projects", icon: LinuxIcon },
    { name: "contact", title: "Contact", icon: ContactIcon },
    { name: "snake", title: "Snake", icon: SnakeIcon },
    { name: "notepad", title: "Notepad", icon: NotepadIcon },
    { name: "musicPlayer", title: "Music Player", icon: MusicPlayerIcon },
    { name: "cmd", title: "Command Prompt", icon: CmdIcon },
    { name: "flappyBird", title: "Flappy Bird", icon: FlappyBirdIcon },
    { name: "doom", title: "DOOM", icon: DoomIcon },
  ]

  return (
    <div className="desktop-icons">
      {icons.map((icon) => (
        <div
          key={icon.name}
          className="desktop-icon"
          style={{
            position: "absolute",
            left: iconPositions[icon.name]?.x || undefined,
            top: iconPositions[icon.name]?.y || undefined,
            cursor: "move",
          }}
          onClick={(e) => {
            // Prevent opening the window when starting to drag
            if (e.detail === 1) {
              // Single click
              const timer = setTimeout(() => {
                openWindow(icon.name)
              }, 200)

              // Store the timer ID on the element
              ;(e.currentTarget as any)._clickTimer = timer
            }
          }}
          onDoubleClick={() => {
            // Clear the single-click timer on double-click
            const timer = (window.event?.currentTarget as any)?._clickTimer
            if (timer) clearTimeout(timer)

            // Open the window
            openWindow(icon.name)
          }}
          onMouseDown={(e) => {
            // Only start dragging on left mouse button
            if (e.button === 0) {
              e.stopPropagation()

              // Clear the click timer to prevent opening the window
              const timer = (e.currentTarget as any)._clickTimer
              if (timer) clearTimeout(timer)

              startIconDragging(e, icon.name)
            }
          }}
        >
          <div className="icon-container">
            <icon.icon />
          </div>
          <span className="desktop-icon-text">{icon.title}</span>
        </div>
      ))}
    </div>
  )
}
