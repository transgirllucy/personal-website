"use client"

import type React from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface AboutWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

export const AboutWindow: React.FC<AboutWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  return (
    <div className="window" data-window="about" style={getWindowStyle("about", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">About Me</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">
        <h3>
          Hello World! <span className="pride-colors">🏳️‍⚧️</span>
        </h3>
        <p>
          I'm a 19-year-old <span className="pride-colors">transgender girl</span> currently living in Dresden, Germany,
          and hanging out at c3d2 (Chaos Computer Club Dresden).
        </p>
        <div className="field-row">
          <span className="pronoun-badge">she/her</span>
          <span className="pronoun-badge">t4t</span>
          <span className="pronoun-badge">lesbian</span>
        </div>
        <p>When I'm not being gay and doing crimes (in Minecraft), I'm usually tinkering with:</p>
        <ul className="tree-view">
          <li>NixOS configuration</li>
          <li>Linux From Scratch builds</li>
          <li>Gentoo optimization</li>
          <li>Queer tech spaces</li>
        </ul>
        <p>I believe in free and open-source software, trans rights, and the power of community-driven tech spaces.</p>
      </div>
    </div>
  )
}
