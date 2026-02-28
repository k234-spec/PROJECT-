import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['Web', 'Mobile', 'AI', 'Design', 'Backend', 'Other']

export default function CreateProject() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Web', tags: '', live_url: '', github_url: '', tech_stack: '', status: 'published' })
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setCover(file)
    setPreview(URL.createObjectURL(file))
  }

  const uploadCover = async () => {
    if (!cover) return null
    const fd = new FormData()
    fd.append('file', cover)
    const { data } = await api.post('/upload', fd)
    return data.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true); setError('')
    try {
      const cover_image = await uploadCover()
      await api.post('/projects', { ...form, cover_image })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project')
    } finally { setLoading(false) }
  }

  return (
    <div className="page">
      <div className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title">Create Project</h1>
            <p className="page-desc">Add a new project to your portfolio</p>
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>&#9888; {error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="label">Cover Image</label>
              <div
                className={'upload-zone' + (dragover ? ' dragover' : '')}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragover(true) }}
                onDragLeave={() => setDragover(false)}
                onDrop={e => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]) }}
              >
                {preview
                  ? <img src={preview} alt="preview" className="upload-preview" />
                  : <>
                    <div className="upload-zone-icon">&#128444;</div>
                    <div className="upload-zone-text">Drop image here or <strong>click to browse</strong></div>
                    <div className="upload-zone-text" style={{ marginTop: 4, fontSize: 12 }}>PNG, JPG, WebP up to 10MB</div>
                  </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} id="cover-upload" onChange={e => handleFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="label">Title *</label>
              <input id="project-title" className="input" placeholder="My Awesome Project" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea id="project-desc" className="textarea" placeholder="What is this project about?" value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 120 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Category</label>
                <select id="project-category" className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select id="project-status" className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Tags</label>
              <input id="project-tags" className="input" placeholder="React, Node.js (comma-separated)" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Tech Stack</label>
              <input id="project-tech" className="input" placeholder="React, Express, SQLite" value={form.tech_stack} onChange={e => set('tech_stack', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Live URL</label>
                <input id="project-live-url" className="input" type="url" placeholder="https://myproject.com" value={form.live_url} onChange={e => set('live_url', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">GitHub URL</label>
                <input id="project-github-url" className="input" type="url" placeholder="https://github.com/user/repo" value={form.github_url} onChange={e => set('github_url', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" id="submit-project-btn" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}