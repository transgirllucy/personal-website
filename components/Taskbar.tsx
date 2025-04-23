"use client"

import type React from "react"
import { Win98Logo } from "./win98-icons"
import type { WindowStates } from "../types/windows"
import { formatTimeDisplay, formatDateDisplay } from "../utils/window-utils"

interface TaskbarProps {
  startMenuRef: React.RefObject<HTMLDivElement>
  startButtonRef: React.RefObject<HTMLButtonElement>
  timeRef: React.RefObject<HTMLDivElement>
  isStartMenuOpen: boolean
  toggleStartMenu: () => void
  windowStates: WindowStates
  activeWindow: string | null
  restoreWindow: (windowName: string) => void
  minimizeWindow: (windowName: string) => void
  currentDateTime: Date
  toggleCalendar: () => void
  handleTaskbarRightClick: (e: React.MouseEvent) => void
  highestZIndex: number
  handleTaskbarButtonContextMenu: (e: React.MouseEvent, windowName: string) => void // Add this prop
}

export const Taskbar: React.FC<TaskbarProps> = ({
  startMenuRef,
  startButtonRef,
  timeRef,
  isStartMenuOpen,
  toggleStartMenu,
  windowStates,
  activeWindow,
  restoreWindow,
  minimizeWindow,
  currentDateTime,
  toggleCalendar,
  handleTaskbarRightClick,
  highestZIndex,
  handleTaskbarButtonContextMenu,
}) => {
  return (
    <div className="taskbar" onContextMenu={handleTaskbarRightClick}>
      <button
        ref={startButtonRef}
        className={`start-button ${isStartMenuOpen ? "active" : ""}`}
        onClick={toggleStartMenu}
      >
        <div className="start-logo">
          <Win98Logo />
        </div>
        <span>Start</span>
      </button>

      {Object.entries(windowStates).map(
        ([name, state]) =>
          state.isOpen && (
            <button
              key={name}
              data-taskbar-button={name}
              className={`taskbar-button ${activeWindow === name && !state.isMinimized ? "active" : ""}`}
              onClick={() => (state.isMinimized ? restoreWindow(name) : minimizeWindow(name))}
              onContextMenu={(e) => handleTaskbarButtonContextMenu(e, name)} // Add this handler
            >
              {state.title || name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ),
      )}

      <div ref={timeRef} className="taskbar-time" onClick={toggleCalendar}>
        <div>{formatTimeDisplay(currentDateTime)}</div>
        <div className="taskbar-date">{formatDateDisplay(currentDateTime)}</div>
      </div>
    </div>
  )
}
