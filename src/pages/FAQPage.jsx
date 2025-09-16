import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaComments, FaBone, FaPaw } from 'react-icons/fa'
import './FAQPage.css'

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I talk to Daisy?",
      answer: "Just type your message in the chat box and press the paw button to send! You can also click the quick action buttons for instant fun."
    },
    {
      question: "Why does Daisy get hungry?",
      answer: "Daisy's hunger level decreases over time, just like a real dog! Feed her by clicking the bone button to keep her happy and energetic."
    },
    {
      question: "What games can I play with Daisy?",
      answer: "Daisy loves to play fetch, hide and seek, tug of war, and guessing games! Just ask her to play and she'll suggest something fun."
    },
    {
      question: "How do I make Daisy do tricks?",
      answer: "Ask Daisy to 'do a trick' or use the quick action button. She knows how to sit, roll over, play dead, and spin!"
    },
    {
      question: "Can Daisy tell jokes?",
      answer: "Absolutely! Daisy loves telling dog-themed jokes. Click the 'Tell a joke' button or just ask her for one."
    },
    {
      question: "What happens when Daisy is fully fed?",
      answer: "When Daisy reaches 5 bones of hunger, she gets super excited and might do funny things like backflips, zoomies, or happy howling!"
    },
    {
      question: "How do I play fetch with Daisy?",
      answer: "Ask Daisy to play a game and she might drop an imaginary ball at your feet. Then you can choose to throw it, bounce it, or even run away!"
    },
    {
      question: "Is Daisy safe for kids?",
      answer: "Yes! Daisy is designed to be completely child-friendly. She only shares positive, encouraging content appropriate for ages 5-18."
    },
    {
      question: "Why isn't Daisy responding?",
      answer: "Make sure you have an internet connection. If the AI isn't working, Daisy will still respond with her built-in personality!"
    },
    {
      question: "Can I customize Daisy?",
      answer: "Daisy's personality is designed to be consistently friendly and playful, but she learns about you as you chat and remembers your conversations!"
    }
  ]

  return (
    <div className="faq-page">
      <header className="faq-header">
        <div className="header-content">
          <Link to="/" className="home-btn">
            <FaHome /> Home
          </Link>
          <Link to="/chat" className="chat-btn">
            <FaComments /> Chat with Daisy
          </Link>
        </div>
      </header>

      <div className="faq-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="faq-hero"
        >
          <div className="faq-logo">
            <img src="/assets/images/daisy-logo.png" alt="Daisy" />
          </div>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about playing with Daisy! 🐕</p>
        </motion.div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="faq-item"
            >
              <div className="faq-question">
                <FaPaw className="faq-icon" />
                <h3>{faq.question}</h3>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="faq-footer"
        >
          <h3>Still have questions?</h3>
          <p>Just ask Daisy directly! She loves to help and answer questions about herself.</p>
          <Link to="/chat" className="chat-link">
            <FaBone /> Start Chatting with Daisy
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default FAQPage
