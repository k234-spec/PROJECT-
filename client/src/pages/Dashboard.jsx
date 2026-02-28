import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [contributions, setContributions] = useState({}) // projectId → []
  const [showContrib, setShowContrib] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/projects/mine')
      setProjects(data)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    setDeleting(id)
    try {
      await api.delete('/projects/' + id)
      setProjects(p => p.filter(x => x.id !== id))
    } catch { setError('Failed to delete.') }
    finally { setDeleting(null) }
  }

  const toggleCollab = async (p) => {
    try {
      const newVal = !p.open_for_collaboration
      await api.put('/projects/' + p.id, { open_for_collaboration: newVal })
      setProjects(ps => ps.map(x => x.id === p.id ? { ...x, open_for_collaboration: newVal } : x))
    } catch { setError('Failed to update') }
  }

  const loadContributions = async (id) => {
    if (showContrib === id) { setShowContrib(null); return }
    try {
      const { data } = await api.get('/projects/' + id + '/contributions')
      setContributions(c => ({ ...c, [id]: data }))
      setShowContrib(id)
    } catch { setError('Failed to load contributions') }
  }

  const handleContribStatus = async (projectId, cid, status) => {
    try {
      await api.patch('/projects/' + projectId + '/contributions/' + cid, { status })
      setContributions(c => ({
        ...c,
        [projectId]: c[projectId].map(r => r.id === cid ? { ...r, status } : r)
      }))
    } catch { setError('Failed to update') }
  }

  const totalViews = projects.reduce((s, p) => s + (p.views || 0), 0)
  const published = projects.filter(p => p.status === 'published').length
  const openCollab = projects.filter(p => p.open_for_collaboration).length

  return (
    <div className="page">
      <div className="section">
        <div className="container">
          <div className="dash-header">
            <div>
              <div className="dash-title">Welcome back, {user.name || 'Creator'} &#128075;</div>
              <div className="dash-subtitle">Manage your projects and collaborations</div>
            </div>
            <Link to="/create" id="create-project-btn" className="btn btn-primary">+ New Project</Link>
          </div>

          <div className="dash-stats">
            <div className="dash-stat-card"><div className="dash-stat-value">{projects.length}</div><div className="dash-stat-label">Total Projects</div></div>
            <div className="dash-stat-card"><div className="dash-stat-value">{published}</div><div className="dash-stat-label">Published</div></div>
            <div className="dash-stat-card"><div className="dash-stat-value">{totalViews}</div><div className="dash-stat-label">Total Views</div></div>
            <div className="dash-stat-card"><div className="dash-stat-value" style={{color:'var(--success)'}}>{openCollab}</div><div className="dash-stat-label">Open Collabs</div></div>
          </div>

          {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}

          {loading ? (
            <div style={{textAlign:'center',padding:'60px',color:'var(--text-muted)'}}>Loading...</div>
          ) : projects.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">&#128640;</div>
              <div className="dash-empty-title">No projects yet</div>
              <p>Create your first project to start building your portfolio.</p>
              <div style={{marginTop:24}}><Link to="/create" className="btn btn-primary">Create Project</Link></div>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Collab</th><th>Views</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {projects.map(p => (
                    <>
                      <tr key={p.id}>
                        <td>
                          <div style={{fontWeight:600}}>{p.title}</div>
                          <div style={{fontSize:13,color:'var(--text-muted)',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description}</div>
                        </td>
                        <td><span className="tag tag-accent">{p.category}</span></td>
                        <td><span className={'badge badge-' + p.status}>{p.status}</span></td>
                        <td>
                          <button
                            className={'btn btn-sm ' + (p.open_for_collaboration ? 'btn-primary' : 'btn-outline')}
                            style={{fontSize:11,padding:'4px 10px'}}
                            onClick={() => toggleCollab(p)}
                            title="Toggle open for collaboration"
                          >{p.open_for_collaboration ? '&#10003; Open' : 'Closed'}</button>
                        </td>
                        <td style={{color:'var(--text-muted)'}}>{p.views || 0}</td>
                        <td style={{color:'var(--text-muted)',fontSize:13}}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-sm btn-outline" onClick={() => navigate('/project/' + p.id)}>View</button>
                            <button className="btn btn-sm btn-ghost" onClick={() => navigate('/edit/' + p.id)}>Edit</button>
                            <button className="btn btn-sm" style={{background:'rgba(124,110,241,0.12)',color:'var(--accent)',border:'1px solid rgba(124,110,241,0.2)',fontSize:11}} onClick={() => loadContributions(p.id)}>
                              Requests
                            </button>
                            <button className="btn btn-sm btn-danger" disabled={deleting === p.id} onClick={() => handleDelete(p.id)}>{deleting === p.id ? '...' : 'Del'}</button>
                          </div>
                        </td>
                      </tr>
                      {showContrib === p.id && (
                        <tr key={p.id + '-contrib'}>
                          <td colSpan={7} style={{padding:'0 8px 16px',background:'var(--surface2)'}}>
                            <div style={{padding:'16px',borderRadius:'var(--radius)',border:'1px solid var(--border)'}}>
                              <div style={{fontWeight:700,marginBottom:12}}>Collaboration Requests ({(contributions[p.id]||[]).length})</div>
                              {(contributions[p.id]||[]).length === 0 ? (
                                <p style={{color:'var(--text-muted)',fontSize:13}}>No requests yet. Share your project on the Collaborate page!</p>
                              ) : (
                                <div className="collab-requests-list">
                                  {(contributions[p.id]||[]).map(c => (
                                    <div key={c.id} className="collab-request-item">
                                      <div className="avatar avatar-sm">{c.name[0].toUpperCase()}</div>
                                      <div style={{flex:1}}>
                                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                                          <span className="collab-request-name">{c.name}</span>
                                          {c.skill && <span className="collab-request-skill">{c.skill}</span>}
                                          <span className={'badge-' + c.status}>{c.status}</span>
                                        </div>
                                        <div className="collab-request-msg">{c.message}</div>
                                      </div>
                                      {c.status === 'pending' && (
                                        <div style={{display:'flex',gap:6,flexShrink:0}}>
                                          <button className="btn btn-sm" style={{background:'rgba(34,197,94,0.15)',color:'var(--success)',border:'1px solid rgba(34,197,94,0.3)',fontSize:11}} onClick={() => handleContribStatus(p.id, c.id, 'approved')}>Approve</button>
                                          <button className="btn btn-sm btn-danger" style={{fontSize:11}} onClick={() => handleContribStatus(p.id, c.id, 'rejected')}>Reject</button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}