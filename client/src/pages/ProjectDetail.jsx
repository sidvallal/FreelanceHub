// Page showing detailed view of a specific project
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import ChatWindow from '../components/ChatWindow'
import { FiDollarSign, FiCalendar, FiUser, FiSend, FiCheck, FiX, FiMessageSquare, FiArrowRight } from 'react-icons/fi'

const statusColors = {
  'Open': 'status-open',
  'Assigned': 'status-assigned',
  'In Progress': 'status-progress',
  'Completed': 'status-completed'
}

const nextStatus = {
  'Assigned': 'In Progress',
  'In Progress': 'Completed'
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [bidForm, setBidForm] = useState({ coverLetter: '', bidAmount: '' })
  const [bidError, setBidError] = useState('')
  const [bidSuccess, setBidSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`)
      setProject(data)

      // Fetch proposals if client owns the project
      if (user && data.client?._id === user._id) {
        const propRes = await API.get(`/proposals/project/${id}`)
        setProposals(propRes.data)
      }
    } catch (err) {
      console.error('Failed to fetch project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    setBidError('')
    setBidSuccess('')
    setSubmitting(true)
    try {
      await API.post('/proposals', {
        project: id,
        coverLetter: bidForm.coverLetter,
        bidAmount: Number(bidForm.bidAmount)
      })
      setBidSuccess('Proposal submitted successfully!')
      setBidForm({ coverLetter: '', bidAmount: '' })
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to submit proposal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptProposal = async (proposalId) => {
    try {
      await API.put(`/proposals/${proposalId}/accept`)
      fetchProject()
    } catch (err) {
      console.error('Failed to accept proposal:', err)
    }
  }

  const handleRejectProposal = async (proposalId) => {
    try {
      await API.put(`/proposals/${proposalId}/reject`)
      fetchProject()
    } catch (err) {
      console.error('Failed to reject proposal:', err)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await API.put(`/projects/${id}/status`, { status: newStatus })
      fetchProject()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await API.delete(`/projects/${id}`)
      navigate('/dashboard')
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>
  }

  if (!project) {
    return <div className="empty-state"><h2>Project not found</h2></div>
  }

  const isOwner = user && project.client?._id === user._id
  const isAssignedFreelancer = user && project.assignedFreelancer?._id === user._id
  const canChat = project.status !== 'Open' && (isOwner || isAssignedFreelancer)
  const receiverId = isOwner ? project.assignedFreelancer?._id : project.client?._id

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <div>
          <h1>{project.title}</h1>
          <span className={`status-badge ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>

        <div className="project-detail-actions">
          {isOwner && project.status === 'Open' && (
            <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>
              Delete Project
            </button>
          )}
          {isOwner && nextStatus[project.status] && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleStatusChange(nextStatus[project.status])}
            >
              Mark as {nextStatus[project.status]} <FiArrowRight size={14} />
            </button>
          )}
          {canChat && (
            <button className="btn btn-accent btn-sm" onClick={() => setShowChat(!showChat)}>
              <FiMessageSquare size={16} /> {showChat ? 'Hide' : 'Open'} Chat
            </button>
          )}
        </div>
      </div>

      <div className="project-detail-body">
        <div className="project-detail-main">
          <section className="detail-section">
            <h2>Description</h2>
            <p className="project-description">{project.description}</p>
          </section>

          <section className="detail-section">
            <h2>Required Skills</h2>
            <div className="project-card-skills">
              {project.skills?.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </section>

          <div className="project-meta-grid">
            <div className="meta-card">
              <FiDollarSign size={24} />
              <div>
                <span className="meta-label">Budget</span>
                <span className="meta-value">₹{project.budget?.toLocaleString()}</span>
              </div>
            </div>
            <div className="meta-card">
              <FiCalendar size={24} />
              <div>
                <span className="meta-label">Deadline</span>
                <span className="meta-value">
                  {new Date(project.deadline).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="meta-card">
              <FiUser size={24} />
              <div>
                <span className="meta-label">Client</span>
                <span className="meta-value">{project.client?.name}</span>
                {project.status !== 'Open' && isAssignedFreelancer && project.client?.phone && (
                  <span className="meta-value" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Phone: {project.client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {project.assignedFreelancer && (
            <section className="detail-section">
              <h2>Assigned Freelancer</h2>
              <div className="assigned-freelancer-card">
                <h3>{project.assignedFreelancer.name}</h3>
                <p>{project.assignedFreelancer.email}</p>
                {isOwner && project.assignedFreelancer.phone && (
                   <p className="freelancer-phone">Phone: {project.assignedFreelancer.phone}</p>
                )}
                {project.assignedFreelancer.skills?.length > 0 && (
                  <div className="project-card-skills">
                    {project.assignedFreelancer.skills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Freelancer can submit a bid */}
          {user?.role === 'freelancer' && project.status === 'Open' && !isAssignedFreelancer && (
            <section className="detail-section">
              <h2><FiSend size={20} /> Submit a Proposal</h2>
              {bidError && <div className="alert alert-error">{bidError}</div>}
              {bidSuccess && <div className="alert alert-success">{bidSuccess}</div>}
              <form className="bid-form" onSubmit={handleSubmitBid}>
                <div className="form-group">
                  <label htmlFor="bidAmount">Your Bid Amount (₹)</label>
                  <input
                    id="bidAmount"
                    type="number"
                    placeholder="e.g. 15000"
                    value={bidForm.bidAmount}
                    onChange={(e) => setBidForm({ ...bidForm, bidAmount: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter</label>
                  <textarea
                    id="coverLetter"
                    rows="4"
                    placeholder="Explain why you're the best fit for this project..."
                    value={bidForm.coverLetter}
                    onChange={(e) => setBidForm({ ...bidForm, coverLetter: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner-sm"></span> : <><FiSend size={16} /> Submit Proposal</>}
                </button>
              </form>
            </section>
          )}

          {/* Client sees proposals */}
          {isOwner && proposals.length > 0 && (
            <section className="detail-section">
              <h2>Proposals ({proposals.length})</h2>
              <div className="proposals-list">
                {proposals.map(prop => (
                  <div key={prop._id} className={`proposal-item ${prop.status}`}>
                    <div className="proposal-info">
                      <h3>{prop.freelancer?.name}</h3>
                      <p className="proposal-email">{prop.freelancer?.email}</p>
                      <p className="proposal-bid">Bid: ₹{prop.bidAmount?.toLocaleString()}</p>
                      <p className="proposal-letter">{prop.coverLetter}</p>
                      {prop.freelancer?.skills?.length > 0 && (
                        <div className="project-card-skills">
                          {prop.freelancer.skills.map((s, i) => (
                            <span key={i} className="skill-tag skill-tag-sm">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {prop.status === 'pending' && project.status === 'Open' && (
                      <div className="proposal-actions">
                        <button className="btn btn-success btn-sm" onClick={() => handleAcceptProposal(prop._id)}>
                          <FiCheck size={14} /> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectProposal(prop._id)}>
                          <FiX size={14} /> Reject
                        </button>
                      </div>
                    )}
                    {prop.status !== 'pending' && (
                      <span className={`proposal-status-badge ${prop.status}`}>
                        {prop.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && canChat && (
          <div className="project-detail-chat">
            <h2><FiMessageSquare size={20} /> Project Chat</h2>
            <ChatWindow projectId={id} receiverId={receiverId} />
          </div>
        )}
      </div>
    </div>
  )
}
