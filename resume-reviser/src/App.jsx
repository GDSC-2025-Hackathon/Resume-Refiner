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
  
  const [revisedText, setRevisedText] = useState('');
  const fileInputRef = useRef(null);

  let hasUploaded = false;
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !hasUploaded) {
      hasUploaded = true; // prevent double call
      setSelectedFile(file);
      handleFileUpload(file);
      setTimeout(() => hasUploaded = false, 500); // allow next upload after delay
    }
  };


  const handleFileSubmit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/file-upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('[Frontend] Upload success:', data.message);
    } catch (err) {
      console.error('[Frontend] Upload error:', err);
      //alert('Resume upload failed.');
    }
  };
  
  

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRevise = async () => {
    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('description', description);

    try {
      const response = await fetch('http://127.0.0.1:5000/revise', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Revise request failed");

      const data = await response.json();
      setRevisedText(data.revisedText);
    } catch (err) {
      console.error("Error revising resume:", err);
    }
  };

  const handleJobSearch = async () => {
    const formData = new FormData();
    formData.append('job', position);
    formData.append('city', location);
    formData.append('country', 'ca');
    formData.append('description', description);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/result', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
      setJobSuggestions(data.jobSuggestions);
    } catch (error) {
      console.error('Error during job search:', error);
      alert('An error occurred while searching for jobs.');
    }
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
            onChange={(e) => {
              handleFileChange(e);
              handleFileUpload(); // Automatically upload when selected
            }}            
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

      <h2>Enter Job Description</h2>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Paste the job description here..."
      />
      <button onClick={handleRevise}>Revise Resume</button>
      
      {/* Reformatted resume shown immediately after job description */}
      {/*<OutputDisplay resumeContent={resumeOutput} jobSuggestions={[]} whichOne={1}/>*/}
      <OutputDisplay resumeContent={revisedText} jobSuggestions={[]} whichOne={1} />

      <hr className="section-divider" />

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
        placeholder="e.g. Toronto"
      />

      <button onClick={handleJobSearch}>Find Jobs</button>

      {/* Always-visible Job Suggestions */}
      <OutputDisplay resumeContent={''} jobSuggestions={jobSuggestions} whichOne={2}/>

    </div>


      </div>
    </div>
  );
}

export default App;
