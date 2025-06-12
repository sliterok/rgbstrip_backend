import { WebSocketServer } from 'ws'
import fftjs from 'fft-js'
// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
const { fft, util } = fftjs

export interface AudioState {
	hue: number
	level: number
	freq: number
	bpm: number
	bins: number[]
}

export const audioState: AudioState = { hue: 0, level: 0, freq: 0, bpm: 0, bins: [] }

export function startAudioServer(port = 8081) {
	const wss = new WebSocketServer({ port })
	wss.on('connection', ws => {
		ws.on('message', data => {
			if (Buffer.isBuffer(data)) processAudio(data)
		})
	})
}

const sampleRateDefault = 44100
const bpmWindow = sampleRateDefault * 8
const sampleBuffer = new RingBuffer<number>(bpmWindow)
let lastBpmUpdate = 0

function detectBpm(samples: number[], sampleRate: number): number {
	const windowSize = 1024
	const energies: number[] = []
	for (let i = 0; i < samples.length; i += windowSize) {
		let sum = 0
		for (let j = 0; j < windowSize && i + j < samples.length; j++) {
			const v = samples[i + j]
			sum += v * v
		}
		energies.push(sum / windowSize)
	}
	if (energies.length < 3) return 0
	const mean = energies.reduce((a, b) => a + b, 0) / energies.length
	const threshold = mean * 1.5
	const peaks: number[] = []
	for (let i = 1; i < energies.length - 1; i++) {
		if (energies[i] > threshold && energies[i] > energies[i - 1] && energies[i] > energies[i + 1]) {
			peaks.push(i)
		}
	}
	if (peaks.length < 2) return 0
	const intervals = []
	for (let i = 1; i < peaks.length; i++) intervals.push(((peaks[i] - peaks[i - 1]) * windowSize) / sampleRate)
	intervals.sort((a, b) => a - b)
	const median = intervals[Math.floor(intervals.length / 2)]
	if (!median) return 0
	const bpm = 60 / median
	if (bpm < 60 || bpm > 180) return 0
	return bpm
}

export function processAudio(buffer: Buffer, sampleRate = sampleRateDefault) {
	const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2)
	const input = Array.from(samples, s => s / 32768)
	for (const s of input) sampleBuffer.add(s)

	const size = 1 << Math.floor(Math.log2(input.length || 1))
	const spectrum = fft(input.slice(0, size))
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
	const freq = (idx * sampleRate) / size
	audioState.freq = freq
	audioState.hue = (idx / (mags.length / 2)) * 360
	audioState.level = max / (mags.length / 2)

	const now = Date.now()
	if (now - lastBpmUpdate > 500 && sampleBuffer.getBufferLength() >= sampleRate * 2) {
		lastBpmUpdate = now
		try {
			const bpm = detectBpm(sampleBuffer.toArray(), sampleRate)
			if (bpm) audioState.bpm = bpm
		} catch {
			// ignore errors
		}
	}
}

export function resetAudioState() {
	audioState.hue = 0
	audioState.level = 0
	audioState.freq = 0
	audioState.bpm = 0
	audioState.bins = []
	sampleBuffer.clear()
	lastBpmUpdate = 0
}
