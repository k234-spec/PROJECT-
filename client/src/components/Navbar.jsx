import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    setOpen(false)
  }
  const close = () => setOpen(false)

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo" onClick={close}>Portfolio<span>.</span></Link>
        <button className="navbar-menu-toggle" aria-label="Toggle menu" onClick={() => setOpen(o => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>
        <div className={`navbar-links${open ? ' open' : ''}`}>
          <NavLink to="/" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} end onClick={close}>Showcase</NavLink>
          <NavLink to="/collaborate" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>Collaborate</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>Dashboard</NavLink>
              <NavLink to="/create" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>+ New</NavLink>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              <div className="avatar avatar-sm" title={user.name}>{user.name?.[0]?.toUpperCase()}</div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} onClick={close}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}