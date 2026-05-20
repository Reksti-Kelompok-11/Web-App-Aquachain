"use client"

import { useState, useEffect } from "react"

interface PageHeaderProps {
  title: string
  description: string
  showGreeting?: boolean
  userName?: string
}

export function PageHeader({ 
  title, 
  description, 
  showGreeting = false,
  userName = "Darryl"
}: PageHeaderProps) {
  const [currentTime, setCurrentTime] = useState("")
  const [greeting, setGreeting] = useState("")

  const getGreeting = (hour: number) => {
    if (hour >= 5 && hour < 11) return "Selamat Pagi"
    if (hour >= 11 && hour < 15) return "Selamat Siang"
    if (hour >= 15 && hour < 18) return "Selamat Sore"
    return "Selamat Malam"
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(getCurrentTime())
      setGreeting(getGreeting(now.getHours()))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const displayTitle = showGreeting ? `${greeting}, ${userName}!` : title

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          {displayTitle}
        </h1>
        <p className="text-slate-600">{description}</p>
      </div>
      <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
        Waktu Real-Time : {currentTime}
      </div>
    </div>
  )
}
