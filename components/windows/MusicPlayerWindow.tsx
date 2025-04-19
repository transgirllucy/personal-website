"use client"

import type React from "react"
import { useState } from "react"
import type { WindowState, PlaylistItem } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"
import { formatTime } from "../../utils/window-utils"

interface MusicPlayerWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  playlist: PlaylistItem[]
  setPlaylist: (playlist: PlaylistItem[]) => void
  currentTrack: number | null
  setCurrentTrack: (track: number | null) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  currentTime: number
  setCurrentTime: (time: number) => void
  duration: number
  volume: number
  setVolume: (volume: number) => void
  audioStatus: string
  visualizerData: number[]
  audioRef: React.RefObject<HTMLAudioElement>
}

export const MusicPlayerWindow: React.FC<MusicPlayerWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  playlist,
  setPlaylist,
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  duration,
  volume,
  setVolume,
  audioStatus,
  visualizerData,
  audioRef,
}) => {
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [newTrackTitle, setNewTrackTitle] = useState("")

  const playTrack = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentTrack(index)

      // Small delay to ensure audio is loaded
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch((e) => {
            console.error("Error playing audio:", e)
          })
        }
      }, 100)
    }
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      // If no track is selected, play the first one
      if (currentTrack === null && playlist.length > 0) {
        playTrack(0)
      } else {
        audio.play().catch((e) => {
          console.error("Error playing audio:", e)
        })
      }
    }
  }

  const stopAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setIsPlaying(false)
    }
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const seekAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const addToPlaylist = () => {
    if (newTrackUrl) {
      const title = newTrackTitle || `Track ${playlist.length + 1}`
      setPlaylist([...playlist, { title, url: newTrackUrl }])
      setNewTrackUrl("")
      setNewTrackTitle("")
    }
  }

  const removeFromPlaylist = (index: number) => {
    const newPlaylist = [...playlist]
    newPlaylist.splice(index, 1)
    setPlaylist(newPlaylist)

    // Adjust currentTrack if needed
    if (currentTrack !== null) {
      if (index === currentTrack) {
        // Stop playback if current track is removed
        stopAudio()
        setCurrentTrack(null)
      } else if (index < currentTrack) {
        // Adjust the index of current track
        setCurrentTrack(currentTrack - 1)
      }
    }
  }

  return (
    <div className="window" data-window="musicPlayer" style={getWindowStyle("musicPlayer", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Music Player</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body music-player-container">
        <div className="music-player-main">
          <div className="music-player-info">
            <div className="music-player-title">
              {currentTrack !== null && playlist[currentTrack] ? playlist[currentTrack].title : "No track selected"}
            </div>
            {currentTrack !== null && playlist[currentTrack] && (
              <div className="music-player-url">{playlist[currentTrack].url}</div>
            )}
          </div>

          <div className="music-player-visualization">
            {visualizerData.map((height, index) => (
              <div key={index} className="visualizer-bar" style={{ height: `${height}px` }} />
            ))}
          </div>

          <div className="music-player-progress-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={seekAudio}
              className="music-player-progress"
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                zIndex: 2,
              }}
            />
            <div className="music-player-progress">
              <div
                className="music-player-progress-bar"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              ></div>
              <div className="music-player-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="music-player-controls">
            <button
              className="music-player-control-button"
              onClick={() => (currentTrack !== null && currentTrack > 0 ? playTrack(currentTrack - 1) : null)}
            >
              ◀◀
            </button>
            <button className="music-player-control-button" onClick={togglePlay}>
              {isPlaying ? "▮▮" : "▶"}
            </button>
            <button className="music-player-control-button" onClick={stopAudio}>
              ■
            </button>
            <button
              className="music-player-control-button"
              onClick={() =>
                currentTrack !== null && currentTrack < playlist.length - 1 ? playTrack(currentTrack + 1) : null
              }
            >
              ▶▶
            </button>
          </div>

          <div className="music-player-volume-container">
            <span className="music-player-volume-label">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={changeVolume}
              className="music-player-volume"
            />
            <span>{Math.round(volume * 100)}%</span>
          </div>

          <div className="music-player-add-container">
            <label>Add new track:</label>
            <input
              type="text"
              className="music-player-add-url"
              placeholder="Track title"
              value={newTrackTitle}
              onChange={(e) => setNewTrackTitle(e.target.value)}
            />
            <input
              type="text"
              className="music-player-add-url"
              placeholder="Audio URL"
              value={newTrackUrl}
              onChange={(e) => setNewTrackUrl(e.target.value)}
            />
            <div className="music-player-add-buttons">
              <button onClick={addToPlaylist}>Add to Playlist</button>
            </div>
          </div>

          <div className="music-player-playlist">
            {playlist.length > 0 ? (
              playlist.map((track, index) => (
                <div
                  key={index}
                  className={`music-player-playlist-item ${currentTrack === index ? "active" : ""}`}
                  onClick={() => playTrack(index)}
                >
                  <div className="music-player-playlist-item-title">{track.title}</div>
                  <button
                    className="music-player-playlist-item-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromPlaylist(index)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="music-player-playlist-empty">Playlist is empty</div>
            )}
          </div>
        </div>
        <div className="music-player-status">
          <div className="music-player-status-left">{audioStatus}</div>
          <div className="music-player-status-right">{isPlaying ? "Playing" : "Stopped"}</div>
        </div>
      </div>
    </div>
  )
}
