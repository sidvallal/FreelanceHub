import { useState, useEffect } from 'react'
import API from '../api/axios'
import ProjectCard from '../components/ProjectCard'
import { FiSearch, FiFilter } from 'react-icons/fi'

const SKILLS_LIST = ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Express', 'Angular', 'Vue.js', 'Django', 'Flutter', 'Java', 'TypeScript', 'PHP', 'Laravel', 'AWS']
const STATUS_LIST = ['Open', 'Assigned', 'In Progress', 'Completed']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [selectedSkill, selectedStatus])

  const fetchProjects = async () => {
    try {
      const params = {}
      if (selectedSkill) params.skills = selectedSkill
      if (selectedStatus) params.status = selectedStatus
      if (search) params.search = search
      const { data } = await API.get('/projects', { params })
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    fetchProjects()
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Browse Projects</h1>
        <p>Find your next freelancing opportunity</p>
      </div>

      <div className="search-filter-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <FiSearch size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <button
          className="btn btn-outline btn-sm filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter size={16} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Skill</label>
            <select value={selectedSkill} onChange={(e) => { setSelectedSkill(e.target.value); setLoading(true) }}>
              <option value="">All Skills</option>
              {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setLoading(true) }}>
              <option value="">All Statuses</option>
              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => { setSelectedSkill(''); setSelectedStatus(''); setSearch(''); setLoading(true) }}>
            Clear Filters
          </button>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <FiSearch size={48} />
          <h2>No projects found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
