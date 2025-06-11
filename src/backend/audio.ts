import { WebSocketServer, WebSocket, RawData } from 'ws'
import { logger } from '../logger'
import { dynamic } from './shared'
import { fft } from 'fft-js'

export function startAudioServer() {
	const wss = new WebSocketServer({ port: 8010 })
	wss.on('connection', (ws: WebSocket) => {
		logger.info('mic connected')
		const buf: number[] = []
		ws.on('message', (data: RawData) => {
			const arr = new Int16Array(data as ArrayBuffer)
			for (const sample of arr) buf.push(sample)
			while (buf.length >= 1024) {
				const chunk = buf.splice(0, 1024).map(s => s / 32768)
				const ph = fft(chunk)
				const mags = ph.map(([re, im]: [number, number]) => Math.hypot(re, im))
				const half = mags.slice(0, mags.length / 2)
				const sum = half.reduce((a: number, b: number) => a + b, 0)
				const peak = half.reduce((m: number, v: number, i: number) => (v > half[m] ? i : m), 0)
				dynamic.audioLevel = Math.min(sum / half.length / 5, 1)
				const freq = (peak * 16000) / chunk.length
				dynamic.audioHue = (freq / 8000) * 360
			}
		})
	})
	logger.info('audio ws listening', { port: 8010 })
}
