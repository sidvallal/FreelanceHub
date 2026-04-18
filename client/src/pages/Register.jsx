import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'freelancer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role, form.phone)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Join FreelanceHub</h1>
          <p>Create your account and get started</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name"><FiUser size={16} /> Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email"><FiMail size={16} /> Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              placeholder="+1234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              pattern="^[0-9]{10}$"
              title="Phone number must be exactly 10 digits"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password"><FiLock size={16} /> Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>I want to</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${form.role === 'freelancer' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'freelancer' })}
              >
                Work as Freelancer
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === 'client' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'client' })}
              >
                Hire Freelancers
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm"></span> : <><FiUserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
