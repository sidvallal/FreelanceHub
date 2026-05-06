// Page for clients to create and post new projects
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { FiPlusCircle, FiX } from 'react-icons/fi'

const SKILLS_LIST = ['React', 'Node.js', 'Python', 'JavaScript', 'MongoDB', 'Express', 'Angular', 'Vue.js', 'Django', 'Flutter', 'Java', 'TypeScript', 'PHP', 'Laravel', 'AWS']

export default function CreateProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const addSkill = (skill) => {
    if (!form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] })
    }
  }

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.skills.length === 0) {
      setError('Please select at least one required skill')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/projects', {
        ...form,
        budget: Number(form.budget)
      })
      navigate(`/projects/${data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-project-page">
      <div className="form-card">
        <h1><FiPlusCircle size={24} /> Post a New Project</h1>
        <p className="form-subtitle">Describe your project to attract the best freelancers</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Project Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Build a React Dashboard"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="5"
              placeholder="Describe the project requirements, deliverables, and any extra details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget (₹)</label>
              <input
                id="budget"
                type="number"
                placeholder="e.g. 25000"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Required Skills</label>
            <div className="skills-selector">
              {SKILLS_LIST.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-btn ${form.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => form.skills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                >
                  {skill} {form.skills.includes(skill) && <FiX size={12} />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm"></span> : <><FiPlusCircle size={16} /> Publish Project</>}
          </button>
        </form>
      </div>
    </div>
  )
}
