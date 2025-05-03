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
    // This simulates backend reformatted resume and job suggestions
    const reformattedResume = `Job Title: ${position}\nLocation: ${location}\n\nJob Description:\n${description}`;

    const mockJobs = [
      'Frontend Developer at Shopify',
      'Junior React Engineer at RBC',
      'Web Developer Intern at TELUS Digital'
    ];

    setResumeOutput(reformattedResume);
    setJobSuggestions(mockJobs);
  };

  return (
    <>
      <h1>Resume Reviser</h1>

      <div className="card">
        <button onClick={handleUpload}>Choose file</button>
        <button onClick={handleFileSubmit}>Upload file</button>
      </div>

      <h2>Enter Job Position</h2>
      <input
        type="text"
        style={{ width: '300px', height: '40px', fontSize: '16px' }}
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        placeholder="e.g. Software Engineer"
      />

      <h2>Enter Job Location</h2>
      <input
        type="text"
        style={{ width: '300px', height: '40px', fontSize: '16px' }}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="e.g. Toronto, ON"
      />

      <h2>Enter Job Description</h2>
      <textarea
        rows={6}
        cols={40}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Paste the job description here..."
      />

      <div>
        <button onClick={handleRevise}>Revise Resume</button>
      </div>

      <div>
        <OutputDisplay
          resumeContent={resumeOutput}
          jobSuggestions={jobSuggestions}
        />
      </div>
    </>
  );
}

export default App;
