import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tForm, setTForm] = useState({ author: '', role: '', content: '', rating: 5 })
  const [submitting, setSubmitting] = useState(false)
  const [tSuccess, setTSuccess] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/projects/' + id)
        setProject(data)
      } catch { navigate('/') }
      finally { setLoading(false) }
    }
    load()
  }, [id, navigate])

  const submitTestimonial = async (e) => {
    e.preventDefault()
    if (!tForm.author || !tForm.content) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/projects/' + id + '/testimonials', tForm)
      setProject(p => ({ ...p, testimonials: [...(p.testimonials || []), data] }))
      setTForm({ author: '', role: '', content: '', rating: 5 })
      setTSuccess(true)
      setTimeout(() => setTSuccess(false), 3000)
    } catch {}
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="page"><div className="section"><div className="container">
      <div className="skeleton" style={{ height: 440, borderRadius: 20 }} />
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: '60%' }} />
        <div className="skeleton" style={{ height: 20, width: '40%' }} />
        <div className="skeleton" style={{ height: 100 }} />
      </div>
    </div></div></div>
  )

  if (!project) return null

  const tags = project.tags ? project.tags.split(',').filter(Boolean) : []
  const techStack = project.tech_stack ? project.tech_stack.split(',').filter(Boolean) : []
  const isOwner = user && user.id === project.user_id

  return (
    <div className="page">
      <div className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          {project.cover_image && (
            <img src={project.cover_image} alt={project.title} className="project-detail-hero" />
          )}
          <div className="project-detail-title fade-up">{project.title}</div>
          <div className="project-detail-meta fade-up">
            <span className="tag tag-accent">{project.category}</span>
            <span className="tag">{project.views || 0} views</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {isOwner && (
              <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={() => navigate('/edit/' + id)}>Edit Project</button>
            )}
          </div>
          {project.description && <p className="project-detail-desc fade-up">{project.description}</p>}
          {tags.length > 0 && (
            <div className="project-detail-section fade-up">
              <div className="project-detail-section-title">Tags</div>
              <div className="tags">{tags.map(t => <span key={t} className="tag">{t.trim()}</span>)}</div>
            </div>
          )}
          {techStack.length > 0 && (
            <div className="project-detail-section fade-up">
              <div className="project-detail-section-title">Tech Stack</div>
              <div className="tags">{techStack.map(t => <span key={t} className="tag tag-accent">{t.trim()}</span>)}</div>
            </div>
          )}
          <div className="project-detail-section fade-up">
            <div className="project-detail-section-title">Links</div>
            <div className="project-links">
              {project.live_url && <a href={project.live_url} target="_blank" rel="noreferrer" className="btn btn-primary">Live Demo &#8599;</a>}
              {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-outline">GitHub &#8599;</a>}
              {!project.live_url && !project.github_url && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No links provided.</span>}
            </div>
          </div>
          <div className="project-detail-section fade-up">
            <div className="project-detail-section-title">About the Creator</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar avatar-lg">{project.author_name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{project.author_name}</div>
                {project.author_bio && <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{project.author_bio}</div>}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  {project.author_github && <a href={project.author_github} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>GitHub</a>}
                  {project.author_website && <a href={project.author_website} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>Website</a>}
                </div>
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="project-detail-section">
            <div className="project-detail-section-title">Testimonials ({(project.testimonials || []).length})</div>
            {(project.testimonials || []).length > 0 && (
              <div className="grid grid-2" style={{ marginBottom: 24 }}>
                {project.testimonials.map(t => (
                  <div key={t.id} className="testimonial-card fade-up">
                    <div className="testimonial-stars">{'★'.repeat(t.rating || 5)}</div>
                    <div className="testimonial-text">{t.content}</div>
                    <div className="testimonial-author">{t.author}</div>
                    {t.role && <div className="testimonial-role">{t.role}</div>}
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Leave a Testimonial</div>
              {tSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>Testimonial submitted!</div>}
              <form onSubmit={submitTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Your Name *</label>
                    <input className="input" placeholder="Jane Doe" value={tForm.author} onChange={e => setTForm(f => ({ ...f, author: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="label">Role / Company</label>
                    <input className="input" placeholder="CEO at Acme" value={tForm.role} onChange={e => setTForm(f => ({ ...f, role: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Your Review *</label>
                  <textarea className="textarea" placeholder="This project was incredible..." value={tForm.content} onChange={e => setTForm(f => ({ ...f, content: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="label">Rating</label>
                  <select className="select" value={tForm.rating} onChange={e => setTForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Testimonial'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}