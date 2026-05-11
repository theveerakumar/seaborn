import { useState } from 'react'
import RentalYield from './components/RentalYield'
import EmiCalculator from './components/EmiCalculator'
import Affordability from './components/Affordability'
import './App.css'

const tabs = [
  { id: 'rental', label: 'Rental Yield', component: RentalYield },
  { id: 'emi', label: 'EMI Calculator', component: EmiCalculator },
  { id: 'afford', label: 'Affordability', component: Affordability },
]

function App() {
  const [activeTab, setActiveTab] = useState('rental')

  const ActiveComponent = tabs.find(t => t.id === activeTab).component

  return (
    <div className="app">
      <header className="header">
        <h1>Seaborn</h1>
        <p className="tagline">Smart Financial Calculators</p>
      </header>
      <nav className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="main">
        <ActiveComponent />
      </main>
      <footer className="footer">
        <p>Seaborn &copy; {new Date().getFullYear()}<span className="footer-rev"> rev {import.meta.env.VITE_GIT_COMMIT || 'dev'}</span></p>
      </footer>
    </div>
  )
}

export default App
