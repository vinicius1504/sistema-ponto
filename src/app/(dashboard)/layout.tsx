'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useCurrentTime } from '@/hooks'
import {
  ClockIcon,
  DashboardIcon,
  ReportIcon,
  UsersIcon,
  MenuIcon,
  LogoutIcon,
  UserIcon
} from '@/components/icons'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const currentTime = useCurrentTime()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { href: '/ponto', label: 'Bater Ponto', icon: ClockIcon },
    { href: '/relatorios', label: 'Relatorios', icon: ReportIcon },
    { href: '/perfil', label: 'Meu Perfil', icon: UserIcon },
    ...(user?.isAdmin ? [{ href: '/funcionarios', label: 'Funcionarios', icon: UsersIcon }] : [])
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 bg-slate-800 z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg text-white">
              <ClockIcon />
            </div>
            {sidebarOpen && (
              <span className="text-white font-bold text-lg">Ponto</span>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <Link
            href="/perfil"
            className={`block p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${!sidebarOpen && 'flex justify-center'}`}
            title="Ver meu perfil"
          >
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user.nome}</p>
                  <p className="text-slate-400 text-sm truncate">{user.cargo}</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            )}
          </Link>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                } ${!sidebarOpen && 'justify-center px-3'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 ${
              !sidebarOpen && 'justify-center px-3'
            }`}
            title={!sidebarOpen ? 'Sair' : undefined}
          >
            <LogoutIcon />
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Header */}
      <header
        className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-40 transition-all duration-300 shadow-sm ${
          sidebarOpen ? 'left-64' : 'left-20'
        }`}
      >
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-500">{user?.empresa.nome}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Relogio */}
            <div className="text-right hidden md:block">
              <p className="text-2xl font-bold text-slate-800 font-mono">
                {currentTime ? currentTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                }) : '--:--:--'}
              </p>
              <p className="text-xs text-slate-500">
                {currentTime ? currentTime.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'short'
                }) : '---'}
              </p>
            </div>

            {/* Status */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-700">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        <div className="p-6 animate-fadeIn">{children}</div>
      </main>
    </div>
  )
}
