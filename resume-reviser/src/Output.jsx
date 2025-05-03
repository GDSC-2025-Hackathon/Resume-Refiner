import React from 'react';
import './Output.css';

const OutputDisplay = ({ content }) => {
  return (
    <div className="output-box">
      <h2>Extracted Text</h2>
      <p>{content || 'No content yet. Upload a file to see extracted text.'}</p>
    </div>
  );
};

export default OutputDisplay;
