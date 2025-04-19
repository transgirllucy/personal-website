export interface WindowState {
  isOpen: boolean
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: string; height: string }
  zIndex: number
  title?: string
}

export interface WindowStates {
  [key: string]: WindowState
}

export interface DraggingState {
  isDragging: boolean
  window: string | null
  offset: { x: number; y: number }
}

export interface MinimizeAnimationState {
  windowName: string | null
  startPos: { x: number; y: number; width: number; height: number } | null
  endPos: { x: number; y: number; width: number; height: number } | null
  isAnimating: boolean
}

export interface SystemResourcesState {
  cpu: number
  memory: number
  history: { cpu: number; memory: number }[]
}

export interface PlaylistItem {
  title: string
  url: string
}
