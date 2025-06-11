import { WebSocketServer, WebSocket, RawData } from 'ws'
import { logger } from '../logger'
import { dynamic } from './shared'
import fftLib from 'fft-js'

const { fft, util: fftUtil } = fftLib as any

export function analyzeSamples(samples: number[], sampleRate = 16000) {
	const ph = fft(samples)
	const mags = fftUtil.fftMag(ph)
	const freqs = fftUtil.fftFreq(ph, sampleRate)
	const sum = mags.reduce((a: number, b: number) => a + b, 0)
	const peak = mags.reduce((m: number, v: number, i: number) => (v > mags[m] ? i : m), 0)
	const level = Math.min(sum / mags.length / 5, 1)
	const hue = (freqs[peak] / (sampleRate / 2)) * 360
	return { level, hue }
}

export function startAudioServer() {
	const wss = new WebSocketServer({ port: 8010 })
	wss.on('connection', (ws: WebSocket) => {
		logger.info('mic connected')
		const buf: number[] = []
		ws.on('message', (data: RawData) => {
			const bufData = data as Buffer
			const arr = new Int16Array(bufData.buffer, bufData.byteOffset, bufData.byteLength / Int16Array.BYTES_PER_ELEMENT)
			for (const sample of arr) buf.push(sample)
			while (buf.length >= 1024) {
				const chunk = buf.splice(0, 1024).map(s => s / 32768)
				const { level, hue } = analyzeSamples(chunk)
				dynamic.audioLevel = level
				dynamic.audioHue = hue
			}
		})
	})
	logger.info('audio ws listening', { port: 8010 })
}
