import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA',
  'JPM', 'V', 'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD',
  'DIS', 'NFLX', 'BA', 'KO', 'PEP'
]

const PERIODS = [
  { value: '1y', label: '1 Year' },
  { value: '3mo', label: 'Last Quarter' },
]

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'

function fetchStockData(ticker, range) {
  const url = `${YAHOO_BASE}/${ticker}?range=${range}&interval=1d`
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })
}

function calcSMA(data, period) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j]
    result.push(sum / period)
  }
  return result
}

function calcRSI(closes, period = 14) {
  const rsi = []
  let gains = 0, losses = 0
  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
    if (i === period) { gains /= period; losses /= period }
    if (i >= period) {
      const rs = losses === 0 ? 100 : gains / losses
      rsi.push(100 - 100 / (1 + rs))
      const diff2 = closes[i] - closes[i - 1]
      gains = (gains * (period - 1) + (diff2 > 0 ? diff2 : 0)) / period
      losses = (losses * (period - 1) + (diff2 < 0 ? -diff2 : 0)) / period
    } else rsi.push(null)
  }
  return rsi
}

function calcMACD(closes) {
  const ema12 = [], ema26 = [], macd = [], signal = [], hist = []
  const k = 2 / 13, k26 = 2 / 27
  let ema12v = closes.slice(0, 12).reduce((a, b) => a + b, 0) / 12
  let ema26v = closes.slice(0, 26).reduce((a, b) => a + b, 0) / 26
  for (let i = 0; i < closes.length; i++) {
    if (i < 26) { ema12.push(null); ema26.push(null); macd.push(null); signal.push(null); hist.push(null); continue }
    if (i === 26) { ema12v = closes.slice(0, 12).reduce((a, b) => a + b, 0) / 12; ema26v = closes.slice(0, 26).reduce((a, b) => a + b, 0) / 26 }
    ema12v = closes[i] * k + ema12v * (1 - k); ema26v = closes[i] * k26 + ema26v * (1 - k26)
    ema12.push(ema12v); ema26.push(ema26v)
    const m = ema12v - ema26v; macd.push(m)
    if (i === 26) signal.push(m)
    else { const sv = signal[i - 1] || m; signal.push(m * 0.2 + sv * 0.8) }
    hist.push(m - (signal[i] || 0))
  }
  return { macd, signal, hist }
}

function calcADX(highs, lows, closes, period = 14) {
  const tr = [], plusDM = [], minusDM = [], atr = [], pdi = [], mdi = [], dx = [], adx = []
  for (let i = 1; i < highs.length; i++) {
    tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])))
    const up = highs[i] - highs[i - 1], down = lows[i - 1] - lows[i]
    if (up > down && up > 0) plusDM.push(up); else plusDM.push(0)
    if (down > up && down > 0) minusDM.push(down); else minusDM.push(0)
  }
  for (let i = 0; i < highs.length; i++) {
    if (i < period) { atr.push(null); pdi.push(null); mdi.push(null); dx.push(null); adx.push(null); continue }
    let atrV = 0, pdiV = 0, mdiV = 0
    for (let j = i - period; j < i; j++) { atrV += tr[j]; pdiV += plusDM[j]; mdiV += minusDM[j] }
    atrV /= period; pdiV /= period; mdiV /= period
    atr.push(atrV); pdi.push(pdiV); mdi.push(mdiV)
    const diSum = pdiV + mdiV
    if (diSum > 0) { const d = Math.abs(pdiV - mdiV) / diSum * 100; dx.push(d) } else dx.push(0)
  }
  for (let i = 0; i < highs.length; i++) {
    if (i < period * 2 - 1) { adx.push(null); continue }
    let s = 0; for (let j = i - period + 1; j <= i; j++) s += dx[j] || 0
    adx.push(s / period)
  }
  return { adx, pdi, mdi }
}

export default function StockAnalysis() {
  const [ticker, setTicker] = useState('AAPL')
  const [customTicker, setCustomTicker] = useState('')
  const [period, setPeriod] = useState('1y')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback((t, p) => {
    setLoading(true); setError(null)
    fetchStockData(t, p).then(json => {
      const result = json.chart.result[0]
      if (!result) { setError('No data returned'); setLoading(false); return }
      const quotes = result.indicators.quote[0]
      const timestamps = result.timestamp || []
      const opens = quotes.open || []; const highs = quotes.high || []
      const lows = quotes.low || []; const closes = quotes.close || []
      const volumes = quotes.volume || []

      const prices = closes.map((c, i) => ({
        date: new Date(timestamps[i] * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        ts: timestamps[i],
        open: opens[i], high: highs[i], low: lows[i], close: c, volume: volumes[i],
      })).filter(p => p.close !== null)

      const closesArr = prices.map(p => p.close)
      const highsArr = prices.map(p => p.high)
      const lowsArr = prices.map(p => p.low)

      const sma50 = calcSMA(closesArr, 50)
      const sma100 = calcSMA(closesArr, 100)
      const sma200 = calcSMA(closesArr, 200)
      const rsiArr = calcRSI(closesArr)
      const macdObj = calcMACD(closesArr)
      const adxObj = calcADX(highsArr, lowsArr, closesArr)

      const merged = prices.map((p, i) => ({
        ...p,
        sma50: sma50[i], sma100: sma100[i], sma200: sma200[i],
        rsi: rsiArr[i], macd: macdObj.macd[i], macdSignal: macdObj.signal[i], macdHist: macdObj.hist[i],
        adx: adxObj.adx[i], pdi: adxObj.pdi[i], mdi: adxObj.mdi[i],
      }))

      const last = merged[merged.length - 1]
      const lastRsi = last?.rsi || 50
      const lastMacd = last?.macd || 0
      const lastSignal = last?.macdSignal || 0
      const lastAdx = last?.adx || 0
      const lastPdi = last?.pdi || 0
      const lastMdi = last?.mdi || 0
      const lastClose = last?.close || 0
      const sma200v = last?.sma200

      let rsiSignal = lastRsi > 70 ? 'Overbought' : lastRsi < 30 ? 'Oversold' : 'Neutral'
      let macdSignal = lastMacd > lastSignal ? 'Bullish' : 'Bearish'
      let adxSignal = lastAdx >= 25 ? 'Trending' : 'Ranging'
      if (lastPdi > lastMdi && lastAdx >= 25) adxSignal = 'Up Trend'
      if (lastMdi > lastPdi && lastAdx >= 25) adxSignal = 'Down Trend'

      let score = 50
      if (lastRsi < 30) score += 25; else if (lastRsi < 45) score += 10
      else if (lastRsi > 70) score -= 25; else if (lastRsi > 60) score -= 10
      if (lastMacd > lastSignal) score += 15; else score -= 15
      if (lastAdx >= 25 && lastPdi > lastMdi) score += 10
      if (lastAdx >= 25 && lastMdi > lastPdi) score -= 10
      if (lastClose > sma200v) score += 10; else score -= 10

      const overall = score >= 70 ? 'Strong Buy' : score >= 55 ? 'Buy' : score >= 40 ? 'Hold' : score >= 25 ? 'Sell' : 'Strong Sell'
      const conf = score

      const qHigh = Math.max(...merged.slice(-63).map(p => p.high).filter(Boolean))
      const qLow = Math.min(...merged.slice(-63).map(p => p.low).filter(Boolean))
      const qReturn = merged.length > 63 ? ((lastClose / merged[merged.length - 64]?.close - 1) * 100).toFixed(1) : '—'

      setData({
        merged, lastRsi, lastMacd, lastSignal, lastAdx, lastPdi, lastMdi, lastClose,
        sma200v, rsiSignal, macdSignal, adxSignal, overall, conf,
        ticker: result.meta.symbol, name: result.meta.symbol,
        qHigh, qLow, qReturn,
      })
      setLoading(false)
    }).catch(err => { setError(err.message); setLoading(false) })
  }, [])

  useEffect(() => { analyze(ticker, period) }, [ticker, period, analyze])

  const selectTicker = (t) => { setTicker(t); setCustomTicker('') }
  const handleCustom = () => { if (customTicker.trim()) { setTicker(customTicker.trim().toUpperCase()) } }

  const fmt = (n) => {
    if (n === null || n === undefined) return '—'
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <div className="tooltip-date">{label}</div>
        {payload.map((p, i) => p.value !== null && (
          <div key={i} className="tooltip-row">
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="calculator stock-analyzer">
      <div className="header-row">
        <h2>$ stock_analysis.sh</h2>
      </div>

      <div className="stock-controls">
        <div className="ticker-select">
          <select value={POPULAR_TICKERS.includes(ticker) ? ticker : ''} onChange={e => selectTicker(e.target.value)}>
            <option value="">Popular Stocks</option>
            {POPULAR_TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="custom-ticker">
            <input type="text" placeholder="Any ticker..." value={customTicker} onChange={e => setCustomTicker(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleCustom()} />
            <button onClick={handleCustom}>Go</button>
          </div>
        </div>
        <div className="period-select">
          {PERIODS.map(p => (
            <button key={p.value} className={`pill-btn ${period === p.value ? 'active' : ''}`} onClick={() => setPeriod(p.value)}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading && <div className="stock-loading"><div className="spinner"></div><span>Loading {ticker} data...</span></div>}
      {error && <div className="stock-error">Error: {error}. Try another ticker or check your connection.</div>}

      {data && !loading && (
        <>
          <div className="stock-header-info">
            <span className="stock-ticker">{data.ticker}</span>
            <span className="stock-price">${fmt(data.lastClose)}</span>
            {data.sma200v && <span className="stock-sma">SMA 200: ${fmt(data.sma200v)}</span>}
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.merged}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Line type="monotone" dataKey="close" stroke="#38bdf8" name="Price" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="sma50" stroke="#22c55e" name="SMA 50" dot={false} strokeWidth={1} />
                <Line type="monotone" dataKey="sma100" stroke="#f59e0b" name="SMA 100" dot={false} strokeWidth={1} />
                <Line type="monotone" dataKey="sma200" stroke="#ef4444" name="SMA 200" dot={false} strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="signal-banner" data-signal={data.overall.toLowerCase().replace(' ', '-')}>
            <span className="signal-label">SIGNAL</span>
            <span className="signal-value">{data.overall}</span>
            <span className="signal-conf">{data.conf}% confidence</span>
          </div>

          <div className="indicator-grid">
            <div className="indicator-card">
              <span className="indicator-name">RSI ({fmt(data.lastRsi)})</span>
              <span className="indicator-status" data-status={data.rsiSignal.toLowerCase()}>{data.rsiSignal}</span>
              <span className="indicator-desc">{data.lastRsi > 70 ? 'Overbought — possible pullback' : data.lastRsi < 30 ? 'Oversold — possible bounce' : 'Neutral zone'}</span>
            </div>
            <div className="indicator-card">
              <span className="indicator-name">MACD ({fmt(data.lastMacd)})</span>
              <span className="indicator-status" data-status={data.macdSignal.toLowerCase()}>{data.macdSignal}</span>
              <span className="indicator-desc">{data.lastMacd > data.lastSignal ? 'Momentum up' : 'Momentum down'}</span>
            </div>
            <div className="indicator-card">
              <span className="indicator-name">ADX ({fmt(data.lastAdx)})</span>
              <span className="indicator-status" data-status={data.adxSignal.toLowerCase().replace(' ', '-')}>{data.adxSignal}</span>
              <span className="indicator-desc">{data.lastAdx >= 25 ? 'Strong trend direction' : 'Weak / ranging market'}</span>
            </div>
            <div className="indicator-card">
              <span className="indicator-name">SMA 50/100/200</span>
              <span className="indicator-desc">
                {data.lastClose > data.sma200v ? 'Price above SMA 200' : 'Price below SMA 200'}
                {data.merged[data.merged.length - 1]?.sma50 > data.merged[data.merged.length - 1]?.sma100 ? ' — Golden cross setup' : ''}
              </span>
            </div>
          </div>

          {period === '3mo' && (
            <div className="quarter-box">
              <span className="quarter-title">Last Quarter</span>
              <div className="quarter-stats">
                <span>High: <strong>${fmt(data.qHigh)}</strong></span>
                <span>Low: <strong>${fmt(data.qLow)}</strong></span>
                <span>Return: <strong className={+data.qReturn >= 0 ? 'green' : 'red'}>{data.qReturn}%</strong></span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
