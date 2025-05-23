import React from 'react';
import Layout from '../components/Layout';

export default function KnowledgeBasePage() {
  const searchInputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  const resultsAreaStyle = {
    border: '1px dashed #ccc',
    padding: '20px',
    minHeight: '200px',
    backgroundColor: '#f9f9f9',
  };

  return (
    <Layout>
      <h1>Crop Knowledge Base</h1>
      
      <input 
        type="search" 
        placeholder="Search crops by name, type, or characteristic..." 
        style={searchInputStyle} 
      />

      <div style={resultsAreaStyle}>
        <p>Crop information will be displayed here (e.g., as a list or cards of crops).</p>
        <p>Each crop could be clickable to see details such as:</p>
        <ul>
          <li>Crop Name, Species/Variety</li>
          <li>Description</li>
          <li>Optimal Planting Season</li>
          <li>Default Harvest Duration</li>
          <li>Growth Stages (clickable for stage-specific details like duration, environmental needs, recommended activities)</li>
        </ul>
        {/* Example of how a single crop item might look (simplified):
        <div>
          <h3>Tomato (Solanum lycopersicum)</h3>
          <p>A widely cultivated fruit, typically red when ripe. Optimal planting: Spring/Early Summer. Harvest in ~90 days.</p>
          <button>View Details & Growth Stages</button>
        </div>
        */}
      </div>
    </Layout>
  );
}
