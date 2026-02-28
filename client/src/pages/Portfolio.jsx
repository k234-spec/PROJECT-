import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import ProjectCard from '../components/ProjectCard'

const CATEGORIES = ['All', 'Web', 'Mobile', 'AI', 'Design', 'Backend', 'Other']

export default function Portfolio() {
  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = { limit: 30 }
      if (category !== 'All') params.category = category
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await api.get('/projects', { params })
      setProjects(data.projects)
      setTotal(data.total)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }, [category, debouncedSearch])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  return (
    <div className="page">
      <div className="hero">
        <div className="container">
          <div className="hero-badge fade-up">
            <span className="hero-badge-dot" />
            Open to collaboration
          </div>
          <h1 className="hero-title fade-up fade-up-delay-1">
            Discover <span className="gradient">Creative</span><br />works and projects
          </h1>
          <p className="hero-desc fade-up fade-up-delay-2">
            A curated showcase from developers, designers, and creators.
            Explore, get inspired, and connect with talented individuals.
          </p>
          <div className="hero-cta fade-up fade-up-delay-3">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
          </div>
          {total > 0 && (
            <div className="stats-row" style={{ marginTop: '48px' }}>
              <div className="stat fade-up"><div className="stat-value">{total}+</div><div className="stat-label">Projects</div></div>
              <div className="stat fade-up"><div className="stat-value">6</div><div className="stat-label">Categories</div></div>
              <div className="stat fade-up"><div className="stat-value">&#8734;</div><div className="stat-label">Inspiration</div></div>
            </div>
          )}
        </div>
      </div>
      <div className="section">
        <div className="container">
          <div className="filter-bar">
            <div className="filter-search">
              <span className="filter-search-icon">&#128269;</span>
              <input
                id="portfolio-search"
                className="input"
                placeholder="Search projects, tags, descriptions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-cats">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  id={'filter-' + cat.toLowerCase()}
                  className={'filter-cat' + (category === cat ? ' active' : '')}
                  onClick={() => setCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="grid grid-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: 200 }} />
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                    <div className="skeleton" style={{ height: 20, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, width: '90%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">&#128269;</div>
              <div className="dash-empty-title">No projects found</div>
              <p>Try a different search or category, or be the first to publish!</p>
              <div style={{ marginTop: 24 }}>
                <Link to="/register" className="btn btn-primary">Add Your Project</Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-3">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}