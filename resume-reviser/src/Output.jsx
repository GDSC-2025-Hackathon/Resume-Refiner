import React from 'react';
import './Output.css';

const OutputDisplay = ({ resumeContent, jobSuggestions }) => {
  return (
    <div className="output-container">
      <div className="output-section">
        <h2>📝 Reformatted Resume</h2>
        <p>{resumeContent || 'No reformatted resume available yet.'}</p>
      </div>

      <div className="output-section">
        <h2>💼 Job Suggestions</h2>
        <ul>
          {jobSuggestions && jobSuggestions.length > 0 ? (
            jobSuggestions.map((job, index) => <li key={index}>{job}</li>)
          ) : (
            <li>No job suggestions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default OutputDisplay;
