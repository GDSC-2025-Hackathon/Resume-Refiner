import { useState } from 'react';
import './App.css';
import OutputDisplay from './Output';

function App() {
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [resumeOutput, setResumeOutput] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState([]);

  const handleUpload = () => {
    console.log('Choose file clicked');
  };

  const handleFileSubmit = () => {
    console.log('Upload file clicked');
  };

  const handleRevise = () => {
    const reformattedResume = `Job Title: ${position}\nLocation: ${location}\n\nJob Description:\n${description}`;
    const mockJobs = [
      'Frontend Developer at Shopify',
      'Junior React Engineer at RBC',
      'Web Developer Intern at TELUS Digital',
    ];
    setResumeOutput(reformattedResume);
    setJobSuggestions(mockJobs);
  };

  return (
    <div className="main-wrapper">
      <div className="main-container">
        <h1 className="app-title">Resume Reviser</h1>
        <hr className="title-line" />

        <div className="card">
          <button onClick={handleFileSubmit}>Upload Resume</button>
        </div>

        <div className="form-section">
          <h2>Enter Job Position</h2>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Software Engineer"
          />

          <h2>Enter Job Location</h2>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Toronto, ON"
          />

          <h2>Enter Job Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Paste the job description here..."
          />

          <button onClick={handleRevise}>Revise Resume</button>
        </div>

        <OutputDisplay
          resumeContent={resumeOutput}
          jobSuggestions={jobSuggestions}
        />
      </div>
    </div>
  );
}

export default App;
