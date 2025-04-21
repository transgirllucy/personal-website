"use client"

import type React from "react"
import { AboutIcon, LinuxIcon, ContactIcon, SnakeIcon, NotepadIcon, MusicPlayerIcon, CmdIcon } from "./win98-icons"

interface DesktopIconsProps {
  openWindow: (windowName: string) => void
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ openWindow }) => {
  return (
    <div className="desktop-icons">
      <div className="desktop-icon" onClick={() => openWindow("about")}>
        <div className="icon-container">
          <AboutIcon />
        </div>
        <span className="desktop-icon-text">About Me</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("projects")}>
        <div className="icon-container">
          <LinuxIcon />
        </div>
        <span className="desktop-icon-text">Linux Projects</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("contact")}>
        <div className="icon-container">
          <ContactIcon />
        </div>
        <span className="desktop-icon-text">Contact</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("snake")}>
        <div className="icon-container">
          <SnakeIcon />
        </div>
        <span className="desktop-icon-text">Snake</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("notepad")}>
        <div className="icon-container">
          <NotepadIcon />
        </div>
        <span className="desktop-icon-text">Notepad</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("musicPlayer")}>
        <div className="icon-container">
          <MusicPlayerIcon />
        </div>
        <span className="desktop-icon-text">Music Player</span>
      </div>
      <div className="desktop-icon" onClick={() => openWindow("cmd")}>
        <div className="icon-container">
          <CmdIcon />
        </div>
        <span className="desktop-icon-text">Command Prompt</span>
      </div>
    </div>
  )
}
