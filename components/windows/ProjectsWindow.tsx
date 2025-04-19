"use client"

import type React from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface ProjectsWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
}

export const ProjectsWindow: React.FC<ProjectsWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
}) => {
  return (
    <div className="window" data-window="projects" style={getWindowStyle("projects", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Linux Projects</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">
        <div className="project-card">
          <h4>NixOS Configuration</h4>
          <p>My personal NixOS setup with declarative system configuration:</p>
          <ul>
            <li>Custom desktop environment</li>
            <li>Reproducible development environments</li>
            <li>Dotfiles managed through Home Manager</li>
          </ul>
        </div>

        <div className="project-card">
          <h4>Linux From Scratch</h4>
          <p>Building a complete Linux system from source code:</p>
          <ul>
            <li>Custom kernel configuration</li>
            <li>Minimal system with only necessary components</li>
            <li>Documentation of the entire build process</li>
          </ul>
        </div>

        <div className="project-card">
          <h4>Gentoo Optimization</h4>
          <p>Finely-tuned Gentoo installation:</p>
          <ul>
            <li>Custom USE flags for optimal performance</li>
            <li>Kernel compiled with specific CPU optimizations</li>
            <li>Minimal bloat, maximum speed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
