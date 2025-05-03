import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import OutputDisplay from './Output';

function App() {
  const [count, setCount] = useState(0)

  const [text, setText] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };
  const handleChange2 = (event) => {
    setText2(event.target.value);
  };
  const handleChange3 = (event) => {
    setText3(event.target.value);
  };
  
  const [outputText, setOutputText] = useState('');
  const [jobdesc, setJobdesc] = useState('');

  return (
    <>
      <div>
        {/* 
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a> */}
      </div>
      <h1>Resume Reviser</h1>
      <div className="card">
        <button onClick>
          Choose file
        </button>

        <button onClick>
          Upload file
        </button>
        
      </div>

      <h2>Enter Job Posisition</h2>
      <input id="position"
        type="text"
        style={{ width: '300px', height: '40px', fontSize: '16px' }}
        value={text}
        onChange={handleChange}
        placeholder="Type something..."
      />

    <h2>Enter Job Location</h2>
    <input
      type="text2"
      style={{ width: '300px', height: '40px', fontSize: '16px' }}
      value={text2}
      onChange={handleChange2}
      placeholder="Type something..."
    />

      <h2>Enter Job Description</h2>
      <div>
      
      <textarea
        type="text3"
        rows={6}
        cols={40}
        value={text3}
        onChange={handleChange3}
        placeholder="Type multiple lines..."
      />

    </div>
    <div>
    <button onClick>
          Revise Resume
        </button>
    </div>
    </>
  )
}



export default App
