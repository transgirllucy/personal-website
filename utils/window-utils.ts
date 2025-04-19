import type { WindowState } from "../types/windows"

export const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = Math.floor(timeInSeconds % 60)
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

export const formatTimeDisplay = (date: Date) => {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'

  const minutesStr = minutes < 10 ? "0" + minutes : minutes

  return `${hours}:${minutesStr} ${ampm}`
}

export const formatDateDisplay = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }
  return date.toLocaleDateString("en-US", options)
}

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

export const getWindowStyle = (windowName: string, windowState: WindowState, isActive: boolean) => {
  return {
    position: "absolute" as const,
    left: windowState.isMaximized ? "0" : `${windowState.position.x}px`,
    top: windowState.isMaximized ? "0" : `${windowState.position.y}px`,
    width: windowState.isMaximized ? "100%" : windowState.size.width,
    height: windowState.isMaximized ? "calc(100% - 28px)" : windowState.size.height,
    zIndex: windowState.zIndex,
    display: windowState.isMinimized ? "none" : "block",
  }
}
