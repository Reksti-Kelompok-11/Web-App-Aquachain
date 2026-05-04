"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart3,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Analitik", icon: BarChart3, href: "/analitik" },
  { name: "Log Pakan", icon: FileText, href: "/log-pakan" },
  { name: "Audit Blockchain", icon: Shield, href: "/blockchain" },
]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const userName = "Darryl Rizqi"
  const userRole = "Admin Lele"
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative flex-shrink-0">
      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`absolute top-8 bg-cyan-600 text-white rounded-full p-1.5 shadow-lg hover:bg-cyan-700 transition-all duration-300 z-30 border-2 border-white ${
          sidebarOpen ? "left-60" : "left-16"
        }`}
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-center">
          {sidebarOpen ? (
            <h1 className="text-xl text-white whitespace-nowrap">
              <span className="font-bold">Aqua</span>
              <span className="font-light">Chain</span>
            </h1>
          ) : (
            <span className="text-xl font-bold text-cyan-400">A</span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800"
                } ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-cyan-700 text-cyan-100 flex items-center justify-center flex-shrink-0 font-semibold">
              {userInitials}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white font-medium truncate">{userName}</p>
                <p className="text-slate-400 text-sm truncate">{userRole}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
