import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [text, setText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

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

      <h2>Enter Job Description</h2>
      <div>
      
      <textarea
      rows={6}
      cols={40}
      value={text}
      onChange={handleChange}
      placeholder="Type multiple lines..."
    />
      <p>You typed: {text}</p>
    </div>
    </>
  )
}



export default App
