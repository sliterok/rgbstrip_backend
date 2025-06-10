const Mic = require('mic')
const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:8010')
const mic = Mic({ rate: 16000, channels: 1, debug: false })
const stream = mic.getAudioStream()

stream.on('data', data => {
  if (ws.readyState === WebSocket.OPEN) ws.send(data)
})

mic.start()
console.log('sending mic data')
