import { WebSocketServer } from 'ws'
import fftjs from 'fft-js'
import { Essentia, EssentiaWASM } from 'essentia.js'
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
const essentiaPromise = Promise.resolve(new Essentia(EssentiaWASM))
let bpmSmoothed = 0

export async function processAudio(buffer: Buffer, sampleRate = sampleRateDefault) {
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
	if (now - lastBpmUpdate > 2000 && sampleBuffer.getBufferLength() >= sampleRate * 4) {
		lastBpmUpdate = now
		try {
			const essentia = await essentiaPromise
			const signal = essentia.arrayToVector(Float32Array.from(sampleBuffer.toArray()))
			const res = essentia.RhythmExtractor2013(signal, 208, 'multifeature', 40)
			const tempo = res.bpm
			if (!Number.isNaN(tempo)) {
				bpmSmoothed = bpmSmoothed ? bpmSmoothed * 0.8 + tempo * 0.2 : tempo
				audioState.bpm = bpmSmoothed
			}
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
	bpmSmoothed = 0
}
