import record from 'node-record-lpcm16'
import WebSocket from 'ws'

const url = process.argv[2] || 'ws://localhost:8081'
const ws = new WebSocket(url)

ws.on('open', () => {
  const mic = record.start({ sampleRate: 44100, channels: 1 })
  mic.on('data', chunk => ws.send(chunk))
})
