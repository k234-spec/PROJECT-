import { useNavigate } from 'react-router-dom'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const tags = project.tags ? project.tags.split(',').filter(Boolean) : []

  return (
    <div className="card project-card fade-up" onClick={() => navigate(`/project/${project.id}`)}>
      {project.cover_image
        ? <img src={project.cover_image} alt={project.title} className="card-img" />
        : <div className="card-img-placeholder">{project.category === 'Mobile' ? '' : project.category === 'AI' ? '' : project.category === 'Design' ? '' : ''}</div>
      }
      <div className="card-body">
        <div className="project-card-meta">
          <span className="tag tag-accent">{project.category || 'Web'}</span>
          <span className="views-count"> {project.views || 0}</span>
        </div>
        <h3 className="project-card-title">{project.title}</h3>
        <p className="project-card-desc">{project.description}</p>
        {tags.length > 0 && (
          <div className="tags">
            {tags.slice(0, 3).map(t => <span key={t} className="tag">{t.trim()}</span>)}
            {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
          </div>
        )}
        <div className="project-card-footer">
          <div className="project-card-author">
            <div className="avatar avatar-sm">{project.author_name?.[0]?.toUpperCase() || 'U'}</div>
            <span style={{fontSize:'13px',color:'var(--text-muted)'}}>{project.author_name}</span>
          </div>
          <span style={{fontSize:'12px',color:'var(--text-dim)'}}>{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
