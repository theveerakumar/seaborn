import { useState } from 'react'

export default function RentalYield() {
  const [price, setPrice] = useState(5000000)
  const [rent, setRent] = useState(25000)
  const [expenses, setExpenses] = useState(10)

  const annualRent = rent * 12
  const annualExpenses = price * (expenses / 100)
  const netAnnualIncome = annualRent - annualExpenses
  const grossYield = ((annualRent / price) * 100).toFixed(2)
  const netYield = ((netAnnualIncome / price) * 100).toFixed(2)
  const monthlyCashflow = (netAnnualIncome / 12).toFixed(0)

  const format = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n))

  return (
    <div className="calculator">
      <h2>Rental Yield Calculator</h2>
      <div className="inputs">
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
      </div>
    </div>
  )
}
