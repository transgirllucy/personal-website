"use client"

import type React from "react"
import { getDaysInMonth, getFirstDayOfMonth } from "../utils/window-utils"

interface CalendarProps {
  calendarRef: React.RefObject<HTMLDivElement>
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
  onClose: () => void
  zIndex: number
}

export const Calendar: React.FC<CalendarProps> = ({ calendarRef, currentMonth, setCurrentMonth, onClose, zIndex }) => {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const changeMonth = (amount: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + amount)
      return newDate
    })
  }

  // Create calendar grid
  const days = []
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year

    days.push(
      <div key={`day-${i}`} className={`calendar-day ${isToday ? "today" : ""}`}>
        {i}
      </div>,
    )
  }

  return (
    <div ref={calendarRef} className="calendar-popup" style={{ zIndex }}>
      <div className="title-bar">
        <div className="title-bar-text">Calendar</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body calendar-body">
        <div className="calendar-header">
          <button className="calendar-nav-button" onClick={() => changeMonth(-1)}>
            ◀
          </button>
          <div className="calendar-title">
            {monthNames[month]} {year}
          </div>
          <button className="calendar-nav-button" onClick={() => changeMonth(1)}>
            ▶
          </button>
        </div>
        <div className="calendar-days-header">
          {dayNames.map((day) => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{days}</div>
      </div>
    </div>
  )
}
