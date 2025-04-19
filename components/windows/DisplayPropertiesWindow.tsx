"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { WindowState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface DisplayPropertiesWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  selectedWallpaper: string | null
  setSelectedWallpaper: (wallpaper: string | null) => void
  wallpaperUrl: string
  setWallpaperUrl: (url: string) => void
  wallpaperStyle: "center" | "tile" | "stretch"
  setWallpaperStyle: (style: "center" | "tile" | "stretch") => void
  uploadedWallpapers: { name: string; url: string }[]
  applyWallpaper: () => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const DisplayPropertiesWindow: React.FC<DisplayPropertiesWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  selectedWallpaper,
  setSelectedWallpaper,
  wallpaperUrl,
  setWallpaperUrl,
  wallpaperStyle,
  setWallpaperStyle,
  uploadedWallpapers,
  applyWallpaper,
  handleFileUpload,
}) => {
  const [activeTab, setActiveTab] = useState("background")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultWallpapers = [
    { name: "None", url: null },
    { name: "Windows 98 Clouds", url: "https://i.imgur.com/JRFIiMl.jpg" },
    { name: "Windows 98 Logo", url: "https://i.imgur.com/O5pu2QB.jpg" },
    { name: "Windows 98 Maze", url: "https://i.imgur.com/0ynrYvL.jpg" },
    { name: "Teal Background", url: "https://i.imgur.com/Zk6TR5k.png" },
  ]

  return (
    <div
      className="window"
      data-window="displayProperties"
      style={getWindowStyle("displayProperties", windowState, isActive)}
    >
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Display Properties</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body display-properties-container">
        <div className="display-properties-tabs">
          <button
            className={`display-properties-tab ${activeTab === "background" ? "active" : ""}`}
            onClick={() => setActiveTab("background")}
          >
            Background
          </button>
          <button
            className={`display-properties-tab ${activeTab === "appearance" ? "active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            Appearance
          </button>
          <button
            className={`display-properties-tab ${activeTab === "effects" ? "active" : ""}`}
            onClick={() => setActiveTab("effects")}
          >
            Effects
          </button>
        </div>

        {activeTab === "background" && (
          <div className="display-properties-content">
            <div className="wallpaper-preview-container">
              <div
                className="wallpaper-preview"
                style={{
                  backgroundImage: selectedWallpaper ? `url(${selectedWallpaper})` : "none",
                  backgroundSize: wallpaperStyle === "stretch" ? "cover" : "auto",
                  backgroundRepeat: wallpaperStyle === "tile" ? "repeat" : "no-repeat",
                  backgroundPosition: "center",
                }}
              >
                <div className="wallpaper-preview-icons">■ ■ ■</div>
                <div className="wallpaper-preview-taskbar"></div>
              </div>
            </div>

            <div className="wallpaper-options">
              <label>Wallpaper:</label>
              <div className="wallpaper-list">
                {defaultWallpapers.map((wp) => (
                  <div
                    key={wp.name}
                    className={`wallpaper-item ${selectedWallpaper === wp.url ? "selected" : ""}`}
                    onClick={() => setSelectedWallpaper(wp.url)}
                  >
                    {wp.name}
                  </div>
                ))}
                {uploadedWallpapers.map((wp) => (
                  <div
                    key={wp.name}
                    className={`wallpaper-item ${selectedWallpaper === wp.url ? "selected" : ""}`}
                    onClick={() => setSelectedWallpaper(wp.url)}
                  >
                    {wp.name}
                  </div>
                ))}
              </div>

              <div className="wallpaper-controls">
                <div className="file-upload-container">
                  <button onClick={() => fileInputRef.current?.click()}>Browse...</button>
                  <span>Select image from your computer</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>

                <div>
                  <label>Or enter an image URL:</label>
                  <input
                    type="text"
                    className="wallpaper-url-input"
                    value={wallpaperUrl}
                    onChange={(e) => setWallpaperUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <fieldset>
                  <legend>Display</legend>
                  <div className="wallpaper-display-options">
                    <div className="field-row">
                      <input
                        id="wallpaper-center"
                        type="radio"
                        name="wallpaper-style"
                        checked={wallpaperStyle === "center"}
                        onChange={() => setWallpaperStyle("center")}
                      />
                      <label htmlFor="wallpaper-center">Center</label>
                    </div>
                    <div className="field-row">
                      <input
                        id="wallpaper-tile"
                        type="radio"
                        name="wallpaper-style"
                        checked={wallpaperStyle === "tile"}
                        onChange={() => setWallpaperStyle("tile")}
                      />
                      <label htmlFor="wallpaper-tile">Tile</label>
                    </div>
                    <div className="field-row">
                      <input
                        id="wallpaper-stretch"
                        type="radio"
                        name="wallpaper-style"
                        checked={wallpaperStyle === "stretch"}
                        onChange={() => setWallpaperStyle("stretch")}
                      />
                      <label htmlFor="wallpaper-stretch">Stretch</label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="wallpaper-buttons">
              <button
                onClick={() => {
                  applyWallpaper()
                  onClose()
                }}
              >
                OK
              </button>
              <button onClick={onClose}>Cancel</button>
              <button onClick={applyWallpaper}>Apply</button>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="display-properties-content">
            <p>Appearance settings would go here in a real Windows 98 system.</p>
            <p>This tab is included for authenticity but is not functional.</p>
          </div>
        )}

        {activeTab === "effects" && (
          <div className="display-properties-content">
            <p>Visual effects settings would go here in a real Windows 98 system.</p>
            <p>This tab is included for authenticity but is not functional.</p>
          </div>
        )}
      </div>
    </div>
  )
}
