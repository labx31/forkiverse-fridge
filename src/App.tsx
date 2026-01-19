import { Fridge } from './components/Fridge'
import './App.css'

function App() {
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
        <span className="footer-label">Recent</span>
        <p>
          Projects tagged{' '}
          <a
            href="https://theforkiverse.com/tags/vibecoding"
            target="_blank"
            rel="noopener noreferrer"
          >
            #vibecoding
          </a>
          {' '}on{' '}
          <a
            href="https://theforkiverse.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            The Forkiverse
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
