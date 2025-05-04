import { useState, useRef } from 'react';
import './App.css';
import OutputDisplay from './Output';

function App() {
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [resumeOutput, setResumeOutput] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleFileSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />

          {selectedFile && (
            <div className="file-info-column">
              <p className="file-name">📄 {selectedFile.name}</p>
              <button className="clear-btn" onClick={handleClearFile}>✕</button>
            </div>
          )}
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
