// Page for viewing and editing user profile information
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiSave, FiCode, FiFileText, FiBriefcase, FiLink } from 'react-icons/fi'

// Component for viewing and updating user profile information
export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    experience: user?.experience || '',
    portfolio: user?.portfolio || '',
    skills: user?.skills || []
  })
  const [skillInput, setSkillInput] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Adds a new skill to the user's skill list
  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] })
      setSkillInput('')
    }
  }

  // Removes a specified skill from the user's skill list
  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) })
  }

  // Triggers adding a skill when the Enter key is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  // Handles the form submission to save profile updates
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await updateProfile(form)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="form-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FiUser size={40} />
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            {user?.phone && <p className="profile-phone">{user?.phone}</p>}
            <span className="user-role-badge">{user?.role}</span>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name"><FiUser size={16} /> Display Name</label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Phone Number</label>
            <input
              id="profile-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              pattern="^[0-9]{10}$"
              title="Phone number must be exactly 10 digits"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio"><FiFileText size={16} /> Bio</label>
            <textarea
              id="bio"
              rows="3"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          {user?.role === 'freelancer' && (
            <>
              <div className="form-group">
                <label htmlFor="experience"><FiBriefcase size={16} /> Experience</label>
                <textarea
                  id="experience"
                  rows="3"
                  placeholder="Describe your professional experience..."
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio"><FiLink size={16} /> Portfolio URL</label>
                <input
                  id="portfolio"
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={form.portfolio}
                  onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label><FiCode size={16} /> Skills</label>
                <div className="skill-input-row">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button type="button" className="btn btn-sm btn-outline" onClick={addSkill}>
                    Add
                  </button>
                </div>
                <div className="project-card-skills">
                  {form.skills.map((skill, i) => (
                    <span key={i} className="skill-tag" onClick={() => removeSkill(skill)} style={{ cursor: 'pointer' }}>
                      {skill} ×
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm"></span> : <><FiSave size={16} /> Save Profile</>}
          </button>
        </form>
      </div>
    </div>
  )
}
