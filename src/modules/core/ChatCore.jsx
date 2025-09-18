import React, { useState } from 'react'
import './StableCSS.css'

const ChatCore = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to DaisyDog! 🐕 What would you like to do?', sender: 'daisy' }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const addMessage = (text, sender = 'daisy') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    addMessage(inputMessage, 'user')
    setInputMessage('')

    // Simple AI response
    setTimeout(() => {
      const responses = [
        "That's interesting! 🐕",
        "Tell me more! 🐶",
        "I love chatting with you! 💕",
        "What's your favorite thing to do? 🎾",
        "You're awesome! 🌟"
      ]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      addMessage(randomResponse)
    }, 1000)
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            🐕 Daisy Dog
          </div>
          <div style={{ color: '#666' }}>
            Your friendly AI companion
          </div>
        </header>

        {/* Messages */}
        <div className="messages-container">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="timestamp">
                  {message.timestamp?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to Daisy..."
            className="message-input"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

export default ChatCore
