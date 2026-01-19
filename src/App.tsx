import { useState } from 'react'
import { Fridge } from './components/Fridge'
import { AboutModal } from './components/AboutModal'
import './App.css'

function App() {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="title-hashtag">#vibecoding</span>
          <span className="title-subtitle">through the Forkiverse</span>
        </h1>
      </header>

      <main>
        <Fridge />
      </main>

      <footer className="app-footer">
        <button className="footer-button" onClick={() => setShowAbout(true)}>
          The 80 most recent #vibecoding posts on The Forkiverse
        </button>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  )
}

export default App
