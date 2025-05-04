import React from 'react';
import './Output.css';

const OutputDisplay = ({ resumeContent, jobSuggestions, whichOne }) => {
  // ⬇️ Place your helper functions here
  const toggleDetails = (jobId, country) => {
    const detailsDiv = document.getElementById(`details-${jobId}`);
    const button = document.getElementById(`btn-${jobId}`);

    if (detailsDiv.style.display === 'block') {
      detailsDiv.style.display = 'none';
      button.innerText = 'More Details';
      return;
    }

    if (!detailsDiv.innerHTML.trim()) {
      detailsDiv.innerHTML = 'Loading details...';
      fetch('http://127.0.0.1:5000/job-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, country })
      })
        .then(res => res.json())
        .then(data => {
          detailsDiv.innerHTML = data.detail;
          detailsDiv.style.display = 'block';
          button.innerText = 'Hide Details';
        })
        .catch(() => {
          detailsDiv.innerHTML = 'Failed to fetch details.';
        });
    } else {
      detailsDiv.style.display = 'block';
      button.innerText = 'Hide Details';
    }
  };

  const compareWithResume = (jobId) => {
    const compareDiv = document.getElementById(`compare-${jobId}`);
    compareDiv.innerHTML = 'Comparing your resume to this job...';

    setTimeout(() => {
      compareDiv.innerHTML = `<p><em>[Mocked AI Result]</em> Your resume matches this job by approximately 83%.</p>`;
    }, 1000);
  };

  // ⬇️ Component return starts here
  return (
    <div className="output-container">
    {whichOne === 1 && (
      <div className="output-section">
        <h2>📝 Reformatted Resume</h2>
        {resumeContent && resumeContent.length > 0 ? (
          <div className="refined-resume-card">
            {resumeContent}
            <button onClick={() => {
              const blob = new Blob([resumeContent], { type: 'text/plain' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'revised_resume.txt';
              link.click();
            }}>
              Download as .txt
            </button>
          </div>
          
        ) : (
          <p>No reformatted resume yet.</p>
        )}
      </div>
    )}

    {whichOne == 2 && (
    <div className="output-section">
      <h2>💼 Job Suggestions</h2>
      <ul className="job-list">
        {jobSuggestions && jobSuggestions.length > 0 ? (
          jobSuggestions.map((job, index) => (
            <li key={index} className="job-card">
              <strong>{job.title}</strong> at {job.company}{' '}
              <a href={job.applyLink} target="_blank" rel="noopener noreferrer">Apply</a>
              <div>
                <button id={`btn-${job.jobId}`} onClick={() => toggleDetails(job.jobId, job.country)}>More Details</button>
                <button onClick={() => compareWithResume(job.jobId)}>Compare & Refine</button>
              </div>
              <div id={`details-${job.jobId}`} style={{ display: 'none' }}></div>
              <div id={`compare-${job.jobId}`} className="job-compare" style={{ marginTop: '10px' }}></div>
            </li>
          ))
        ) : (
          <li>No job suggestions yet.</li>
        )}
      </ul>
    </div>
    )}
  </div>
);
};

export default OutputDisplay;
