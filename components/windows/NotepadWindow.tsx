"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface NotepadWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  content: string
  setContent: (content: string) => void
  filename: string
  setFilename: (filename: string) => void
  modified: boolean
  setModified: (modified: boolean) => void
}

export const NotepadWindow: React.FC<NotepadWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  content,
  setContent,
  filename,
  setFilename,
  modified,
  setModified,
}) => {
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  return (
    <div className="window" data-window="notepad" style={getWindowStyle("notepad", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">
          Notepad - {filename}
          {modified ? " *" : ""}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body notepad-container">
        <div className="notepad-menu-bar">
          <div className="notepad-menu-item" onClick={() => setShowMenu(showMenu === "file" ? null : "file")}>
            File
          </div>
          <div className="notepad-menu-item" onClick={() => setShowMenu(showMenu === "edit" ? null : "edit")}>
            Edit
          </div>
          <div className="notepad-menu-item" onClick={() => setShowMenu(showMenu === "help" ? null : "help")}>
            Help
          </div>

          {showMenu === "file" && (
            <div ref={menuRef} className="notepad-dropdown-menu file-menu">
              <div
                className="notepad-menu-option"
                onClick={() => {
                  setContent("")
                  setFilename("Untitled.txt")
                  setModified(false)
                  setShowMenu(null)
                }}
              >
                New
              </div>
              <div className="notepad-menu-option disabled">Open...</div>
              <div className="notepad-menu-option disabled">Save</div>
              <div className="notepad-menu-option disabled">Save As...</div>
              <div className="notepad-menu-divider"></div>
              <div
                className="notepad-menu-option"
                onClick={() => {
                  onClose()
                  setShowMenu(null)
                }}
              >
                Exit
              </div>
            </div>
          )}

          {showMenu === "edit" && (
            <div ref={menuRef} className="notepad-dropdown-menu edit-menu">
              <div className="notepad-menu-option disabled">Undo</div>
              <div className="notepad-menu-divider"></div>
              <div
                className="notepad-menu-option"
                onClick={() => {
                  document.execCommand("cut")
                  setShowMenu(null)
                }}
              >
                Cut
              </div>
              <div
                className="notepad-menu-option"
                onClick={() => {
                  document.execCommand("copy")
                  setShowMenu(null)
                }}
              >
                Copy
              </div>
              <div
                className="notepad-menu-option"
                onClick={() => {
                  document.execCommand("paste")
                  setShowMenu(null)
                }}
              >
                Paste
              </div>
              <div
                className="notepad-menu-option"
                onClick={() => {
                  if (textareaRef.current) {
                    textareaRef.current.select()
                  }
                  setShowMenu(null)
                }}
              >
                Select All
              </div>
            </div>
          )}

          {showMenu === "help" && (
            <div ref={menuRef} className="notepad-dropdown-menu help-menu">
              <div
                className="notepad-menu-option"
                onClick={() => {
                  alert("Windows 98 Notepad Clone\nCreated for your personal website")
                  setShowMenu(null)
                }}
              >
                About Notepad
              </div>
            </div>
          )}
        </div>
        <textarea
          ref={textareaRef}
          className="notepad-textarea"
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (!modified) {
              setModified(true)
            }
          }}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
