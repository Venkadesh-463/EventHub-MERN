import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your EventHub AI Assistant. You can ask me about upcoming events, how to use the platform, or general inquiries.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // In axiosInstance we have interceptors, but this is a public endpoint.
      // So it will work fine even if not logged in if the backend allows it.
      const response = await axiosInstance.post('/ai/chat', { message: userMessage });
      const reply = response.data.data.reply;
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the AI brain right now. Please check the GEMINI_API_KEY or try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown to HTML formatter for the chat bubbles
  const formatText = (text) => {
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              width: '350px',
              height: '500px',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px',
              backgroundColor: '#6366f1',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={24} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>EventHub AI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f8fafc'
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  maxWidth: '85%'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: msg.role === 'user' ? '#cbd5e1' : '#e0e7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {msg.role === 'user' ? <User size={16} color="#475569" /> : <Sparkles size={16} color="#4f46e5" />}
                  </div>
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#6366f1' : 'white',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    borderTopRightRadius: msg.role === 'user' ? '0' : '12px',
                    borderTopLeftRadius: msg.role === 'user' ? '12px' : '0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
                  />
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Bot size={16} color="#4f46e5" />
                  </div>
                  <div style={{ backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', borderTopLeftRadius: '0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: 6, height: 6, backgroundColor: '#94a3b8', borderRadius: '50%' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
              padding: '12px',
              backgroundColor: 'white',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: input.trim() && !isLoading ? '#6366f1' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s'
                }}
              >
                <Send size={18} style={{ marginLeft: '2px' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </motion.button>
    </>
  );
};

export default AIAssistant;
