import { useState } from 'react'

export default function EmiCalculator() {
  const [amount, setAmount] = useState(3000000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)

  const monthlyRate = rate / 12 / 100
  const months = tenure * 12
  const emi = monthlyRate
    ? Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1))
    : Math.round(amount / months)
  const totalPayment = emi * months
  const totalInterest = totalPayment - amount

  const format = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n))

  return (
    <div className="calculator">
      <h2>EMI Calculator</h2>
      <div className="inputs">
        <label>Loan Amount (₹)
          <input type="range" min="100000" max="50000000" step="100000" value={amount} onChange={e => setAmount(+e.target.value)} />
          <span className="value">₹{format(amount)}</span>
        </label>
        <label>Interest Rate (%)
          <input type="range" min="1" max="20" step="0.1" value={rate} onChange={e => setRate(+e.target.value)} />
          <span className="value">{rate}%</span>
        </label>
        <label>Tenure (years)
          <input type="range" min="1" max="30" value={tenure} onChange={e => setTenure(+e.target.value)} />
          <span className="value">{tenure} yrs</span>
        </label>
      </div>
      <div className="results">
        <div className="result-card highlight"><span className="label">Monthly EMI</span><span className="value">₹{format(emi)}</span></div>
        <div className="result-card"><span className="label">Total Interest</span><span className="value">₹{format(totalInterest)}</span></div>
        <div className="result-card"><span className="label">Total Payment</span><span className="value">₹{format(totalPayment)}</span></div>
      </div>
    </div>
  )
}
