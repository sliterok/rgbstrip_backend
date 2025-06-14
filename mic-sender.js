import { Essentia, arrayToVector } from 'essentia.js'
import mic from 'mic'
import WebSocket from 'ws'

async function main() {
  const url = process.argv[2] || 'ws://localhost:8081'
  const ws = new WebSocket(url)
  await new Promise(resolve => ws.once('open', resolve))

  const essentia = await Essentia()
  const sampleRate = 44100
  const bufferSizeSec = 5
  const bufferSize = sampleRate * bufferSizeSec
  let buffer = new Float32Array(0)

  const rhythmAlgo = (signal) =>
    essentia.RhythmExtractor2013({ signal, sampleRate })

  const micInst = mic({ rate: sampleRate.toString(), channels: '1' })
  const micStream = micInst.getAudioStream()

  micInst.start()

  micStream.on('data', (chunk) => {
    ws.send(chunk)
    const pcm = new Float32Array(chunk.buffer, chunk.byteOffset, chunk.length / 4)
    const tmp = new Float32Array(buffer.length + pcm.length)
    tmp.set(buffer)
    tmp.set(pcm, buffer.length)
    buffer = tmp
    if (buffer.length >= bufferSize) {
      const sigVec = arrayToVector(buffer)
      const res = rhythmAlgo(sigVec)
      const bpm = res.bpm
      ws.send(JSON.stringify({ bpm }))
      console.log(`BPM: ${bpm.toFixed(2)}, ticks: ${res.ticks.length}`)
      buffer = buffer.subarray(bufferSize)
    }
  })

  micStream.on('error', console.error)
}

main().catch(console.error)

