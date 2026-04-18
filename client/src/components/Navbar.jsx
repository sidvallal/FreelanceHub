import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiBriefcase, FiLogOut, FiUser, FiMessageSquare, FiPlusCircle, FiGrid } from 'react-icons/fi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FiBriefcase className="brand-icon" />
          <span>FreelanceHub</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                <FiGrid size={16} /> Dashboard
              </Link>
              <Link to="/projects" onClick={() => setMenuOpen(false)}>
                <FiBriefcase size={16} /> Projects
              </Link>
              {user.role === 'client' && (
                <Link to="/create-project" onClick={() => setMenuOpen(false)}>
                  <FiPlusCircle size={16} /> Post Project
                </Link>
              )}
              <Link to="/chat" onClick={() => setMenuOpen(false)}>
                <FiMessageSquare size={16} /> Messages
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                <FiUser size={16} /> Profile
              </Link>
              <div className="navbar-user-info">
                <span className="user-role-badge">{user.role}</span>
                <span className="user-name">{user.name}</span>
                <button className="btn-logout" onClick={handleLogout}>
                  <FiLogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-nav-register" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
