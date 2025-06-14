import mic from 'mic'
import WebSocket from 'ws'

const url = process.argv[2] || 'ws://localhost:8081'
const ws = new WebSocket(url)

ws.on('open', () => {
  const micInst = mic({ rate: '44100', channels: '1' })
  const micStream = micInst.getAudioStream()
  micInst.start()
  micStream.on('data', chunk => ws.send(chunk))
  micStream.on('error', console.error)
})

