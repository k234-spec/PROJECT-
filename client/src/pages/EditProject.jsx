import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = ['Web', 'Mobile', 'AI', 'Design', 'Backend', 'Other']

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [cover, setCover] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragover, setDragover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/projects/' + id)
        setForm({ title: data.title || '', description: data.description || '', category: data.category || 'Web', tags: data.tags || '', live_url: data.live_url || '', github_url: data.github_url || '', tech_stack: data.tech_stack || '', status: data.status || 'published' })
        setPreview(data.cover_image || null)
      } catch { navigate('/dashboard') }
      finally { setFetching(false) }
    }
    load()
  }, [id, navigate])

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
      await api.put('/projects/' + id, { ...form, ...(cover_image ? { cover_image } : {}) })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project')
    } finally { setLoading(false) }
  }

  if (fetching || !form) return (
    <div className="page"><div className="section"><div className="container" style={{ maxWidth: 720 }}>
      <div className="skeleton" style={{ height: 48, width: '50%', marginBottom: 32 }} />
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 16 }} />)}
    </div></div></div>
  )

  return (
    <div className="page">
      <div className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <h1 className="page-title">Edit Project</h1>
            <p className="page-desc">Update your project details</p>
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
                    <div className="upload-zone-text">Drop or <strong>click to browse</strong></div>
                  </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="label">Title *</label>
              <input id="edit-title" className="input" value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Description</label>
              <textarea id="edit-desc" className="textarea" value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 120 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Category</label>
                <select id="edit-category" className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Status</label>
                <select id="edit-status" className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="label">Tags</label>
              <input id="edit-tags" className="input" placeholder="React, Node.js (comma-separated)" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Tech Stack</label>
              <input id="edit-tech" className="input" value={form.tech_stack} onChange={e => set('tech_stack', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Live URL</label>
                <input id="edit-live-url" className="input" type="url" value={form.live_url} onChange={e => set('live_url', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">GitHub URL</label>
                <input id="edit-github-url" className="input" type="url" value={form.github_url} onChange={e => set('github_url', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button type="submit" id="save-project-btn" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}