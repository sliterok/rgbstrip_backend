import { WebSocketServer } from 'ws'
import fftjs from 'fft-js'
const { fft, util } = fftjs

export interface AudioState {
	hue: number
	level: number
	freq: number
	bins: number[]
}

export const audioState: AudioState = { hue: 0, level: 0, freq: 0, bins: [] }

export function startAudioServer(port = 8081) {
	const wss = new WebSocketServer({ port })
	wss.on('connection', ws => {
		ws.on('message', data => {
			if (Buffer.isBuffer(data)) processAudio(data)
		})
	})
}

export function processAudio(buffer: Buffer, sampleRate = 44100) {
	const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2)
	const input = Array.from(samples, s => s / 32768)
	const spectrum = fft(input)
	const mags = util.fftMag(spectrum)
	audioState.bins = mags.slice(0, mags.length / 2)
	let max = 0
	let idx = 0
	for (let i = 1; i < mags.length / 2; i++) {
		if (mags[i] > max) {
			max = mags[i]
			idx = i
		}
	}
	const freq = (idx * sampleRate) / input.length
	audioState.freq = freq
	audioState.hue = (idx / (mags.length / 2)) * 360
	audioState.level = max / (mags.length / 2)
}
