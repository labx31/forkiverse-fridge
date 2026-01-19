import { useState } from 'react'
import { Fridge } from './components/Fridge'
import { AboutModal } from './components/AboutModal'
import './App.css'

function App() {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="app">
      <div className="app-layout">
        {/* Left side - Title */}
        <div className="side-panel left-panel">
          <h1>
            <span className="title-hashtag">#vibecoding</span>
            <span className="title-subtitle">through the Forkiverse</span>
          </h1>
        </div>

        {/* Center - Fridge */}
        <main className="fridge-panel">
          <Fridge />
        </main>

        {/* Right side - Info */}
        <div className="side-panel right-panel">
          <p className="info-text">
            The 80 most recent #vibecoding posts on The Forkiverse
          </p>
          <button className="faq-button" onClick={() => setShowAbout(true)}>
            FAQ
          </button>
        </div>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  )
}

export default App
