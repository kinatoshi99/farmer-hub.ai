import React from 'react';
import Layout from '../components/Layout';

export default function TasksPage() {
  const tasksDisplayAreaStyle = {
    border: '1px dashed #ccc',
    padding: '20px',
    minHeight: '150px',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px',
  };

  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <Layout>
      <h1>Task Management</h1>

      <div style={tasksDisplayAreaStyle}>
        <p>Tasks will be displayed here, likely in a table with columns like: Task Name, Due Date, Status, Associated Crop Plan.</p>
        <p>Filters for status (e.g., Pending, In Progress, Completed), priority, or due date might also be available here.</p>
        {/* Example of how a single task item might look (simplified):
        <div>
          <strong>Task:</strong> Water Tomato Seedlings - <strong>Due:</strong> 2024-05-10 - <strong>Status:</strong> Pending - <strong>Plan:</strong> My Spring Tomatoes
        </div> 
        */}
      </div>

      <button style={buttonStyle}>Add New Task</button>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        (Note: Most tasks will be automatically generated from Crop Plans. This button might be for ad-hoc tasks.)
      </p>
    </Layout>
  );
}
