import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import ProjectCard from '../components/ProjectCard'
import { FiPlusCircle, FiBriefcase, FiClock, FiCheckCircle, FiSend, FiTrendingUp } from 'react-icons/fi'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'client') {
          const { data } = await API.get('/projects')
          setProjects(data.filter(p => p.client?._id === user._id))
        } else {
          const [projRes, propRes] = await Promise.all([
            API.get('/projects'),
            API.get('/proposals/my')
          ])
          setProjects(projRes.data)
          setProposals(propRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>
  }

  // Client Dashboard
  if (user.role === 'client') {
    const openProjects = projects.filter(p => p.status === 'Open')
    const activeProjects = projects.filter(p => ['Assigned', 'In Progress'].includes(p.status))
    const completedProjects = projects.filter(p => p.status === 'Completed')

    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user.name}!</h1>
            <p className="dashboard-subtitle">Manage your projects and find top talent</p>
          </div>
          <Link to="/create-project" className="btn btn-primary">
            <FiPlusCircle size={18} /> Post New Project
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <FiBriefcase size={28} className="stat-icon" />
            <div>
              <h3>{projects.length}</h3>
              <p>Total Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <FiClock size={28} className="stat-icon stat-amber" />
            <div>
              <h3>{activeProjects.length}</h3>
              <p>Active Projects</p>
            </div>
          </div>
          <div className="stat-card">
            <FiCheckCircle size={28} className="stat-icon stat-green" />
            <div>
              <h3>{completedProjects.length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {openProjects.length > 0 && (
          <section className="dashboard-section">
            <h2><FiBriefcase size={20} /> Open Projects</h2>
            <div className="projects-grid">
              {openProjects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {activeProjects.length > 0 && (
          <section className="dashboard-section">
            <h2><FiClock size={20} /> Active Projects</h2>
            <div className="projects-grid">
              {activeProjects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {completedProjects.length > 0 && (
          <section className="dashboard-section">
            <h2><FiCheckCircle size={20} /> Completed Projects</h2>
            <div className="projects-grid">
              {completedProjects.map(p => <ProjectCard key={p._id} project={p} />)}
            </div>
          </section>
        )}

        {projects.length === 0 && (
          <div className="empty-state">
            <FiBriefcase size={48} />
            <h2>No projects yet</h2>
            <p>Post your first project and start finding talented freelancers!</p>
            <Link to="/create-project" className="btn btn-primary">
              <FiPlusCircle size={18} /> Post a Project
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Freelancer Dashboard
  const appliedProposals = proposals.filter(p => p.status === 'pending')
  const acceptedProposals = proposals.filter(p => p.status === 'accepted')
  const rejectedProposals = proposals.filter(p => p.status === 'rejected')
  const openProjects = projects.filter(p => p.status === 'Open')

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user.name}! </h1>
          <p className="dashboard-subtitle">Find projects and grow your freelancing career</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <FiBriefcase size={18} /> Browse Projects
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiSend size={28} className="stat-icon" />
          <div>
            <h3>{proposals.length}</h3>
            <p>Total Proposals</p>
          </div>
        </div>
        <div className="stat-card">
          <FiClock size={28} className="stat-icon stat-amber" />
          <div>
            <h3>{appliedProposals.length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiCheckCircle size={28} className="stat-icon stat-green" />
          <div>
            <h3>{acceptedProposals.length}</h3>
            <p>Accepted</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp size={28} className="stat-icon stat-purple" />
          <div>
            <h3>{openProjects.length}</h3>
            <p>Open Projects</p>
          </div>
        </div>
      </div>

      {acceptedProposals.length > 0 && (
        <section className="dashboard-section">
          <h2><FiCheckCircle size={20} /> Accepted Proposals</h2>
          <div className="proposals-list">
            {acceptedProposals.map(prop => (
              <div key={prop._id} className="proposal-item accepted">
                <div className="proposal-info">
                  <h3>{prop.project?.title || 'Project'}</h3>
                  <p>Bid: ₹{prop.bidAmount?.toLocaleString()}</p>
                </div>
                <Link to={`/projects/${prop.project?._id}`} className="btn btn-sm btn-outline">
                  View Project
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {appliedProposals.length > 0 && (
        <section className="dashboard-section">
          <h2><FiClock size={20} /> Pending Proposals</h2>
          <div className="proposals-list">
            {appliedProposals.map(prop => (
              <div key={prop._id} className="proposal-item pending">
                <div className="proposal-info">
                  <h3>{prop.project?.title || 'Project'}</h3>
                  <p>Bid: ₹{prop.bidAmount?.toLocaleString()}</p>
                </div>
                <Link to={`/projects/${prop.project?._id}`} className="btn btn-sm btn-outline">
                  View Project
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {proposals.length === 0 && (
        <div className="empty-state">
          <FiBriefcase size={48} />
          <h2>No proposals yet</h2>
          <p>Browse available projects and submit your first proposal!</p>
          <Link to="/projects" className="btn btn-primary">
            <FiBriefcase size={18} /> Browse Projects
          </Link>
        </div>
      )}
    </div>
  )
}
