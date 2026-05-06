// Component for displaying a summary of a project
import { Link } from 'react-router-dom'
import { FiDollarSign, FiCalendar, FiArrowRight } from 'react-icons/fi'

const statusColors = {
  'Open': 'status-open',
  'Assigned': 'status-assigned',
  'In Progress': 'status-progress',
  'Completed': 'status-completed'
}

export default function ProjectCard({ project }) {
  const deadline = new Date(project.deadline).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-card-title">{project.title}</h3>
        <span className={`status-badge ${statusColors[project.status]}`}>
          {project.status}
        </span>
      </div>

      <p className="project-card-desc">
        {project.description?.length > 120
          ? project.description.substring(0, 120) + '...'
          : project.description}
      </p>

      <div className="project-card-skills">
        {project.skills?.map((skill, i) => (
          <span key={i} className="skill-tag">{skill}</span>
        ))}
      </div>

      <div className="project-card-meta">
        <span className="meta-item">
          <FiDollarSign size={14} />
          ₹{project.budget?.toLocaleString()}
        </span>
        <span className="meta-item">
          <FiCalendar size={14} />
          {deadline}
        </span>
      </div>

      <div className="project-card-footer">
        <span className="posted-by">
          by {project.client?.name || 'Unknown'}
        </span>
        <Link to={`/projects/${project._id}`} className="btn-view-project">
          View Details <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
