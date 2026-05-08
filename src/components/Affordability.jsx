import { useState } from 'react'

export default function Affordability() {
  const [income, setIncome] = useState(80000)
  const [existingEmi, setExistingEmi] = useState(0)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)
  const [downPayment, setDownPayment] = useState(500000)

  const monthlyRate = rate / 12 / 100
  const months = tenure * 12
  const maxEmi = income * 0.5 - existingEmi
  const maxLoan = maxEmi > 0 && monthlyRate > 0
    ? Math.round(maxEmi * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)))
    : 0
  const affordablePrice = maxLoan + downPayment
  const actualEmi = maxLoan > 0 && monthlyRate > 0
    ? Math.round(maxLoan * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1))
    : 0

  const format = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n))

  return (
    <div className="calculator">
      <h2>Affordability Calculator</h2>
      <p className="subtitle">How much house or car can you afford?</p>
      <div className="inputs">
        <label>Monthly Income (₹)
          <input type="range" min="20000" max="500000" step="5000" value={income} onChange={e => setIncome(+e.target.value)} />
          <span className="value">₹{format(income)}</span>
        </label>
        <label>Existing EMIs (₹)
          <input type="range" min="0" max="200000" step="1000" value={existingEmi} onChange={e => setExistingEmi(+e.target.value)} />
          <span className="value">₹{format(existingEmi)}</span>
        </label>
        <label>Interest Rate (%)
          <input type="range" min="1" max="20" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} />
          <span className="value">{rate}%</span>
        </label>
        <label>Loan Tenure (years)
          <input type="range" min="1" max="30" value={tenure} onChange={e => setTenure(+e.target.value)} />
          <span className="value">{tenure} yrs</span>
        </label>
        <label>Down Payment Available (₹)
          <input type="range" min="0" max="10000000" step="50000" value={downPayment} onChange={e => setDownPayment(+e.target.value)} />
          <span className="value">₹{format(downPayment)}</span>
        </label>
      </div>
      <div className="results">
        <div className="result-card highlight"><span className="label">Maximum Affordable Price</span><span className="value">₹{format(affordablePrice)}</span></div>
        <div className="result-card"><span className="label">Max Loan Amount</span><span className="value">₹{format(maxLoan)}</span></div>
        <div className="result-card"><span className="label">Down Payment</span><span className="value">₹{format(downPayment)}</span></div>
        <div className="result-card"><span className="label">Monthly EMI</span><span className="value">₹{format(actualEmi)}</span></div>
      </div>
    </div>
  )
}
