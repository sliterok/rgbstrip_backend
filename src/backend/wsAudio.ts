import { WebSocketServer } from 'ws'
import fftjs from 'fft-js'
const { fft, util } = fftjs

export interface AudioEvent {
	hue: number
	level: number
}

export interface AudioState {
	hue: number
	level: number
	freq: number
	events: AudioEvent[]
}

export const audioState: AudioState = { hue: 0, level: 0, freq: 0, events: [] }

let averages: number[] = []
let prevAbove: boolean[] = []

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
	const half = Math.floor(mags.length / 2)
	if (averages.length !== half) {
		averages = new Array(half).fill(0)
		prevAbove = new Array(half).fill(false)
	}
	let max = 0
	let idx = 0
	for (let i = 1; i < half; i++) {
		const mag = mags[i]
		averages[i] = averages[i] * 0.95 + mag * 0.05
		const above = mag >= averages[i]
		if (!above && prevAbove[i]) {
			audioState.events.push({
				hue: (i / half) * 360,
				level: mag / half,
			})
		}
		prevAbove[i] = above
		if (mag > max) {
			max = mag
			idx = i
		}
	}
	const freq = (idx * sampleRate) / input.length
	audioState.freq = freq
	audioState.hue = (idx / half) * 360
	audioState.level = max / half
}
