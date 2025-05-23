import React from 'react';
import Layout from '../components/Layout';

export default function HomePage() {
  // Basic inline styles for demonstration
  const chatDisplayAreaStyle = {
    border: '1px solid #ccc',
    minHeight: '200px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  };

  const chatInputAreaStyle = {
    display: 'flex',
    gap: '10px',
  };

  const inputStyle = {
    flexGrow: 1,
    padding: '8px',
  };

  const buttonStyle = {
    padding: '8px 15px',
  };

  return (
    <Layout>
      <h1>Chat with CropCycle Planner</h1>
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={chatDisplayAreaStyle}>
          <p>Chat messages will appear here...</p>
          {/* Example messages: */}
          {/* <p><strong>You:</strong> Hello!</p> */}
          {/* <p><strong>Bot:</strong> Hi there! How can I help you plan your crops today?</p> */}
        </div>
        
        <div style={chatInputAreaStyle}>
          <input type="text" placeholder="Type your message..." style={inputStyle} />
          <button style={buttonStyle}>Send</button>
        </div>
      </div>
    </Layout>
  );
}
