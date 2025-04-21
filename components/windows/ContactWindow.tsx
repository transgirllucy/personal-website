"use client"

import type React from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface ContactWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

export const ContactWindow: React.FC<ContactWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  return (
    <div className="window" data-window="contact" style={getWindowStyle("contact", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Contact</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">
        <p>You can find me at:</p>
        <div className="field-row">
          <label>Location:</label>
          <div>📍 Berlin: xHain, CCCB, c-base & Dresden: C3D2</div>
        </div>
        <div className="field-row">
          <label>Email:</label>
          <div>📧 your-email@example.com</div>
        </div>
        <div className="field-row">
          <label>Matrix:</label>
          <div>💬 @username:matrix.org</div>
        </div>
        <div className="field-row">
          <label>GitHub:</label>
          <div>🐙 github.com/yourusername</div>
        </div>
        <p>
          I'm always open to collaborating on queer-friendly tech projects 🌈, especially those involving NixOS 🐧,
          Linux 💻, or creating safe spaces for trans folks in tech 🏳️‍⚧️👩‍💻.
        </p>
      </div>
    </div>
  )
}
