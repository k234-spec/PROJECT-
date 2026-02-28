import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['All', 'Web', 'Mobile', 'AI', 'Design', 'Backend', 'Other']

export default function Collaborate() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [reqMap, setReqMap] = useState({})       // projectId → { name, message, skill, sent }
  const [sending, setSending] = useState(null)   // projectId currently sending
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const params = { open_for_collaboration: true, limit: 50 }; // backend search actually uses categories, not open_for_collaboration flag per se in the projects route, but our backend filter has it now.
        if (category !== 'All') params.category = category
        if (search) params.search = search
        const { data } = await api.get('/projects', { params })
        setProjects(data.projects.filter(p => p.open_for_collaboration))
      } catch { setProjects([]) }
      finally { setLoading(false) }
    }
    const t = setTimeout(fetch, 300)
    return () => clearTimeout(t)
  }, [category, search])

  const setReq = (id, field, val) => setReqMap(m => ({ ...m, [id]: { ...(m[id] || {}), [field]: val } }))

  const sendRequest = async (projectId) => {
    if (!user) { navigate('/login'); return }
    const r = reqMap[projectId] || {}
    if (!r.name || !r.message) return
    setSending(projectId)
    try {
      await api.post('/projects/' + projectId + '/contributions', { name: r.name, skill: r.skill || '', message: r.message })
      setReqMap(m => ({ ...m, [projectId]: { ...m[projectId], sent: true } }))
    } catch (e) { alert(e.response?.data?.error || 'Failed to send') }
    finally { setSending(null) }
  }

  return (
    <div className="page">
      <div className="hero" style={{ minHeight: 'auto', paddingTop: 80, paddingBottom: 48 }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="hero-badge fade-up"><span className="hero-badge-dot" />Open Collaboration</div>
          <h1 className="hero-title fade-up fade-up-delay-1">
            Find Projects to <span className="gradient">Contribute</span>
          </h1>
          <p className="hero-desc fade-up fade-up-delay-2">
            Discover projects open for collaboration. Join as a contributor, suggest edits, or build together.
          </p>
          {!user && (
            <div className="hero-cta fade-up fade-up-delay-3">
              <Link to="/register" className="btn btn-primary btn-lg">Join to Collaborate</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="container">
          {/* Filter bar */}
          <div className="filter-bar" style={{ marginBottom: 32 }}>
            <div className="filter-search">
              <span className="filter-search-icon">&#128269;</span>
              <input id="collab-search" className="input" placeholder="Search open projects..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-cats">
              {CATEGORIES.map(cat => (
                <button key={cat} className={'filter-cat' + (category === cat ? ' active' : '')} onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-2">
              {[...Array(4)].map((_, i) => <div key={i} className="card"><div className="skeleton" style={{ height: 220 }} /></div>)}
            </div>
          ) : projects.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">&#129309;</div>
              <div className="dash-empty-title">No open projects yet</div>
              <p>Be the first! Mark your project as open for collaboration from the dashboard.</p>
              {user && <div style={{ marginTop: 24 }}><Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link></div>}
            </div>
          ) : (
            <div className="grid grid-2">
              {projects.map(p => {
                const r = reqMap[p.id] || {}
                return (
                  <div key={p.id} className="collab-card fade-up">
                    {/* Header */}
                    <div className="collab-card-header">
                      {p.cover_image && <img src={p.cover_image} alt={p.title} className="collab-card-img" />}
                      <div className="collab-card-info">
                        <div className="collab-open-badge">&#10003; Open for collaboration</div>
                        <div className="collab-title" onClick={() => navigate('/project/' + p.id)}>{p.title}</div>
                        <div className="collab-meta">
                          <span className="tag tag-accent">{p.category}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>by {p.author_name}</span>
                        </div>
                        {p.description && <p className="collab-desc">{p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}</p>}
                        {p.tech_stack && (
                          <div className="tags" style={{ marginTop: 8 }}>
                            {p.tech_stack.split(',').slice(0,4).map(t => <span key={t} className="tag">{t.trim()}</span>)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contribution Request Form */}
                    <div className="collab-form">
                      {r.sent ? (
                        <div className="alert alert-success">&#10003; Collaboration request sent! The owner will review it.</div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>&#128073; Send a Collaboration Request</div>
                          <div className="form-row" style={{ gap: 10 }}>
                            <div className="form-group" style={{ flex: 1 }}>
                              <input className="input" placeholder="Your name *" value={r.name || ''} onChange={e => setReq(p.id, 'name', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <input className="input" placeholder="Your skill (e.g. React, Design)" value={r.skill || ''} onChange={e => setReq(p.id, 'skill', e.target.value)} />
                            </div>
                          </div>
                          <div className="form-group">
                            <textarea className="textarea" style={{ minHeight: 70 }} placeholder="How would you like to contribute? *" value={r.message || ''} onChange={e => setReq(p.id, 'message', e.target.value)} />
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <button className="btn btn-primary btn-sm" disabled={sending === p.id || !r.name || !r.message} onClick={() => sendRequest(p.id)}>
                              {sending === p.id ? 'Sending...' : 'Send Request'}
                            </button>
                            <Link to={'/project/' + p.id} className="btn btn-outline btn-sm">View Project</Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}