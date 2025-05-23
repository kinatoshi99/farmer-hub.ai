import React from 'react';
import Layout from '../components/Layout';

export default function PlanningPage() {
  const sectionStyle = {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #eee',
    borderRadius: '5px',
  };

  const formGroupStyle = {
    marginBottom: '15px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
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
      <h1>Crop Planning</h1>

      <div style={sectionStyle}>
        <h2>Create New Plan</h2>
        <form>
          <div style={formGroupStyle}>
            <label htmlFor="planName" style={labelStyle}>Plan Name</label>
            <input type="text" id="planName" name="planName" style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="selectCrop" style={labelStyle}>Select Crop</label>
            <input type="text" id="selectCrop" name="selectCrop" placeholder="Search and select a crop..." style={inputStyle} />
            {/* This would ideally be a select dropdown or a searchable combobox */}
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="plantingDate" style={labelStyle}>Planting Date</label>
            <input type="date" id="plantingDate" name="plantingDate" style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="fieldName" style={labelStyle}>Field Name/Identifier</label>
            <input type="text" id="fieldName" name="fieldName" style={inputStyle} />
          </div>

          <button type="submit" style={buttonStyle}>Generate Plan & Tasks</button>
        </form>
      </div>

      <div style={sectionStyle}>
        <h2>Existing Plans</h2>
        <div style={{ border: '1px dashed #ccc', padding: '20px', minHeight: '100px', backgroundColor: '#f9f9f9' }}>
          <p>Existing crop plans will be listed here (e.g., in a table or as interactive cards).</p>
          <p>Each plan might show: Plan Name, Crop, Planting Date, Status, and actions like 'View Details', 'Edit', 'Delete'.</p>
        </div>
      </div>
    </Layout>
  );
}
