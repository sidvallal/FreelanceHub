// Component for displaying the real-time chat interface
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import { FiSend } from 'react-icons/fi'

const SOCKET_URL = 'http://localhost:5000'

export default function ChatWindow({ projectId, receiverId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Load chat history
    const loadMessages = async () => {
      try {
        const { data } = await API.get(`/messages/${projectId}`)
        setMessages(data)
      } catch (err) {
        console.error('Failed to load messages:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMessages()

    // Setup Socket.IO
    socketRef.current = io(SOCKET_URL)
    socketRef.current.emit('joinProject', projectId)

    socketRef.current.on('receiveMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socketRef.current.emit('leaveProject', projectId)
      socketRef.current.disconnect()
    }
  }, [projectId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    socketRef.current.emit('sendMessage', {
      projectId,
      senderId: user._id,
      receiverId,
      content: newMessage.trim()
    })

    setNewMessage('')
  }

  if (loading) {
    return <div className="chat-loading"><div className="spinner"></div></div>
  }

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg._id || i}
              className={`chat-bubble ${msg.sender?._id === user._id || msg.sender === user._id ? 'sent' : 'received'}`}
            >
              <div className="bubble-header">
                <span className="bubble-sender">
                  {msg.sender?.name || 'You'}
                </span>
                <span className="bubble-time">
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="bubble-content">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
          <FiSend size={18} />
        </button>
      </form>
    </div>
  )
}
