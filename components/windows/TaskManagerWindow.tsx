"use client"

import type React from "react"
import { useState } from "react"
import type { WindowState, SystemResourcesState } from "../../types/windows"
import { getWindowStyle } from "../../utils/window-utils"

interface TaskManagerWindowProps {
  windowState: WindowState
  isActive: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onStartDragging: (e: React.MouseEvent) => void
  systemResources: SystemResourcesState
  runningApps: { name: string; title: string; status: string }[]
  closeWindow: (name: string) => void
}

export const TaskManagerWindow: React.FC<TaskManagerWindowProps> = ({
  windowState,
  isActive,
  onClose,
  onMinimize,
  onMaximize,
  onStartDragging,
  systemResources,
  runningApps,
  closeWindow,
}) => {
  const [activeTab, setActiveTab] = useState("applications")

  return (
    <div className="window" data-window="taskManager" style={getWindowStyle("taskManager", windowState, isActive)}>
      <div
        className="title-bar"
        onMouseDown={onStartDragging}
        style={{ cursor: windowState.isMaximized ? "default" : "move" }}
      >
        <div className="title-bar-text">Windows Task Manager</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button aria-label="Maximize" onClick={onMaximize}></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body">
        <div className="task-manager-tabs">
          <button
            className={`task-manager-tab ${activeTab === "applications" ? "active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
          <button
            className={`task-manager-tab ${activeTab === "processes" ? "active" : ""}`}
            onClick={() => setActiveTab("processes")}
          >
            Processes
          </button>
          <button
            className={`task-manager-tab ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
        </div>

        {activeTab === "applications" && (
          <div className="task-manager-content">
            <div className="task-list">
              <div className="task-list-header">
                <div className="task-column task-name">Task</div>
                <div className="task-column task-status">Status</div>
              </div>
              {runningApps.length > 0 ? (
                runningApps.map((app) => (
                  <div key={app.name} className="task-item">
                    <div className="task-column task-name">{app.title}</div>
                    <div className="task-column task-status">{app.status}</div>
                    <button className="task-end-button" onClick={() => closeWindow(app.name)}>
                      End Task
                    </button>
                  </div>
                ))
              ) : (
                <div className="task-empty">No tasks are running</div>
              )}
            </div>
            <div className="task-buttons">
              <button className="task-button" onClick={onClose}>
                End Task
              </button>
              <button className="task-button" disabled>
                Switch To
              </button>
              <button className="task-button" disabled>
                New Task...
              </button>
            </div>
          </div>
        )}

        {activeTab === "processes" && (
          <div className="task-manager-content">
            <div className="task-list">
              <div className="task-list-header">
                <div className="task-column process-name">Image Name</div>
                <div className="task-column process-pid">PID</div>
                <div className="task-column process-cpu">CPU</div>
                <div className="task-column process-mem">Mem Usage</div>
              </div>
              <div className="task-item">
                <div className="task-column process-name">explorer.exe</div>
                <div className="task-column process-pid">1234</div>
                <div className="task-column process-cpu">1%</div>
                <div className="task-column process-mem">12,345 K</div>
              </div>
              <div className="task-item">
                <div className="task-column process-name">system</div>
                <div className="task-column process-pid">8</div>
                <div className="task-column process-cpu">0%</div>
                <div className="task-column process-mem">236 K</div>
              </div>
              <div className="task-item">
                <div className="task-column process-name">winlogon.exe</div>
                <div className="task-column process-pid">432</div>
                <div className="task-column process-cpu">0%</div>
                <div className="task-column process-mem">3,456 K</div>
              </div>
              <div className="task-item">
                <div className="task-column process-name">taskmgr.exe</div>
                <div className="task-column process-pid">5678</div>
                <div className="task-column process-cpu">2%</div>
                <div className="task-column process-mem">4,532 K</div>
              </div>
            </div>
            <div className="task-buttons">
              <button className="task-button">End Process</button>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="task-manager-content">
            <div className="performance-graphs">
              <div className="performance-section">
                <div className="performance-header">CPU Usage: {Math.round(systemResources.cpu)}%</div>
                <div className="performance-graph">
                  <div className="graph-container">
                    {systemResources.history.map((point, i) => (
                      <div
                        key={i}
                        className="graph-bar"
                        style={{
                          height: `${point.cpu}%`,
                          left: `${(i / systemResources.history.length) * 100}%`,
                          width: `${100 / systemResources.history.length}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="performance-section">
                <div className="performance-header">Memory Usage: {Math.round(systemResources.memory)}%</div>
                <div className="performance-graph">
                  <div className="graph-container">
                    {systemResources.history.map((point, i) => (
                      <div
                        key={i}
                        className="graph-bar memory-bar"
                        style={{
                          height: `${point.memory}%`,
                          left: `${(i / systemResources.history.length) * 100}%`,
                          width: `${100 / systemResources.history.length}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-stats">
              <div className="stats-row">
                <div className="stats-label">Total Physical Memory:</div>
                <div className="stats-value">64 MB</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Available Physical Memory:</div>
                <div className="stats-value">{Math.round(64 * (1 - systemResources.memory / 100))} MB</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">File Cache:</div>
                <div className="stats-value">12 MB</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Kernel Memory:</div>
                <div className="stats-value">8 MB</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
