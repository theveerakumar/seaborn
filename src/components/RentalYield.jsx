import { useState } from 'react'

const regions = {
  mumbai: { label: 'Mumbai', rent: 50000, price: 15000000 },
  delhi: { label: 'Delhi NCR', rent: 35000, price: 10000000 },
  bangalore: { label: 'Bangalore', rent: 35000, price: 9500000 },
  hyderabad: { label: 'Hyderabad', rent: 30000, price: 8500000 },
  pune: { label: 'Pune', rent: 28000, price: 8000000 },
  chennai: { label: 'Chennai', rent: 25000, price: 7500000 },
  kolkata: { label: 'Kolkata', rent: 20000, price: 6000000 },
  ahmedabad: { label: 'Ahmedabad', rent: 20000, price: 6000000 },
  jaipur: { label: 'Jaipur', rent: 15000, price: 5000000 },
}

export default function RentalYield() {
  const [region, setRegion] = useState('')
  const [price, setPrice] = useState(5000000)
  const [rent, setRent] = useState(25000)
  const [expenses, setExpenses] = useState(10)

  const selectRegion = (e) => {
    const key = e.target.value
    if (!key) return
    const r = regions[key]
    setRegion(key)
    setPrice(r.price)
    setRent(r.rent)
  }

  const annualRent = rent * 12
  const annualExpenses = price * (expenses / 100)
  const netAnnualIncome = annualRent - annualExpenses
  const grossYield = ((annualRent / price) * 100).toFixed(2)
  const netYield = ((netAnnualIncome / price) * 100).toFixed(2)
  const monthlyCashflow = (netAnnualIncome / 12).toFixed(0)

  const format = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n))

  const getVerdict = () => {
    const y = parseFloat(grossYield)
    if (y < 3) return { label: 'Expensive', color: '#ef4444', msg: 'Property is overvalued relative to rental income. Low rental yield suggests poor investment return.' }
    if (y < 6) return { label: 'Fair', color: '#f59e0b', msg: 'Property is reasonably priced. Average rental yield typical for stable markets.' }
    return { label: 'Cheap', color: '#22c55e', msg: 'Property is undervalued relative to rental income. High rental yield indicates good investment potential.' }
  }

  const verdict = getVerdict()

  return (
    <div className="calculator">
      <div className="header-row">
        <h2>Rental Yield Calculator</h2>
        <span className={`verdict-badge verdict-${verdict.label.toLowerCase()}`} style={{ background: verdict.color }}>
          {verdict.label}
        </span>
      </div>
      <div className="inputs">
        <label>Select Region
          <select className="region-select" value={region} onChange={selectRegion}>
            <option value="">— Select a city for typical rent —</option>
            {Object.entries(regions).map(([key, r]) => (
              <option key={key} value={key}>{r.label}</option>
            ))}
          </select>
        </label>
        <label>Property Price (₹)
          <input type="range" min="500000" max="50000000" step="100000" value={price} onChange={e => setPrice(+e.target.value)} />
          <span className="value">₹{format(price)}</span>
        </label>
        <label>Monthly Rent (₹)
          <input type="range" min="5000" max="500000" step="1000" value={rent} onChange={e => setRent(+e.target.value)} />
          <span className="value">₹{format(rent)}</span>
        </label>
        <label>Annual Expenses (% of property value)
          <input type="range" min="1" max="30" step="0.5" value={expenses} onChange={e => setExpenses(+e.target.value)} />
          <span className="value">{expenses}%</span>
        </label>
      </div>
      <div className="results">
        <div className="result-card"><span className="label">Gross Rental Yield</span><span className="value">{grossYield}%</span></div>
        <div className="result-card"><span className="label">Net Rental Yield</span><span className="value">{netYield}%</span></div>
        <div className="result-card"><span className="label">Annual Rent</span><span className="value">₹{format(annualRent)}</span></div>
        <div className="result-card"><span className="label">Annual Expenses</span><span className="value">₹{format(annualExpenses)}</span></div>
        <div className="result-card"><span className="label">Monthly Cash Flow</span><span className="value">₹{format(monthlyCashflow)}</span></div>
        <div className="result-card verdict" style={{ borderColor: verdict.color }}>
          <span className="label">Verdict</span>
          <span className="value" style={{ color: verdict.color }}>{verdict.msg}</span>
        </div>
      </div>
    </div>
  )
}
