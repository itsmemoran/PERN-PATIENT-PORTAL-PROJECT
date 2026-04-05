import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Calendar, FileText, Pill, FlaskConical,
  FolderHeart, MessageCircle, Phone, User, LogOut, X, Bot
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/appointments', icon: Calendar, label: 'Rendez-vous' },
  { to: '/test-results', icon: FlaskConical, label: 'Résultats' },
  { to: '/prescriptions', icon: Pill, label: 'Ordonnances' },
  { to: '/medical-records', icon: FolderHeart, label: 'Dossier médical' },
  { to: '/chatbot', icon: Bot, label: 'Assistant IA' },
  { to: '/contacts', icon: Phone, label: 'Contact' },
  { to: '/profile', icon: User, label: 'Mon profil' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstName = user?.firstName || user?.first_name || ''
  const lastName = user?.lastName || user?.last_name || ''
  const initials = (firstName[0] || '') + (lastName[0] || '')

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px]
        bg-white border-r border-gray-100
        flex flex-col
        transform transition-transform duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <img className='className="w-10 h-10  flex items-center justify-center' src="/assets/logo-danan-500x500.png" alt="logo" />
            <div>
              <p className="text-sm font-bold font-display text-gray-900 leading-tight">Centre Medical</p>
              <p className="text-[11px] text-primary-600 font-medium">Danan</p>
            </div>
          </div>
          <button className="lg:hidden p-1 hover:bg-gray-100 rounded-lg" onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{firstName} {lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm
                       text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
