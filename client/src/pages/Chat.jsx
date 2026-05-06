// Page for displaying the chat messages between users
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import ChatWindow from '../components/ChatWindow'
import { FiMessageSquare } from 'react-icons/fi'

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await API.get('/messages/conversations/list')
        setConversations(data)
        if (data.length > 0) setActiveConv(data[0])
      } catch (err) {
        console.error('Failed to load conversations:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  if (loading) {
    return <div className="loading-screen"><div className="spinner"></div></div>
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2><FiMessageSquare size={20} /> Messages</h2>
        {conversations.length === 0 ? (
          <p className="chat-no-convos">No conversations yet. Get assigned to a project to start chatting!</p>
        ) : (
          <div className="conversation-list">
            {conversations.map((conv) => (
              <button
                key={conv.project._id}
                className={`conversation-item ${activeConv?.project._id === conv.project._id ? 'active' : ''}`}
                onClick={() => setActiveConv(conv)}
              >
                <div className="conv-info">
                  <h4>{conv.project.title}</h4>
                  <p className="conv-user">{conv.otherUser?.name || 'Unknown'}</p>
                  {conv.lastMessage && (
                    <p className="conv-preview">
                      {conv.lastMessage.sender}: {conv.lastMessage.content.substring(0, 40)}
                      {conv.lastMessage.content.length > 40 ? '...' : ''}
                    </p>
                  )}
                </div>
                <span className={`status-badge status-badge-sm ${conv.project.status === 'In Progress' ? 'status-progress' : conv.project.status === 'Completed' ? 'status-completed' : 'status-assigned'}`}>
                  {conv.project.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-main">
        {activeConv ? (
          <>
            <div className="chat-main-header">
              <h3>{activeConv.project.title}</h3>
              <p>Chatting with {activeConv.otherUser?.name}</p>
            </div>
            <ChatWindow
              projectId={activeConv.project._id}
              receiverId={activeConv.otherUser?._id}
            />
          </>
        ) : (
          <div className="chat-empty-main">
            <FiMessageSquare size={48} />
            <h2>Select a conversation</h2>
            <p>Choose a project conversation from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
