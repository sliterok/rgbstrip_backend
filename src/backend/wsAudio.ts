import { WebSocketServer } from 'ws'
import fftjs from 'fft-js'
const { fft, util } = fftjs

export interface AudioState {
	hue: number
	level: number
}

export const audioState: AudioState = { hue: 0, level: 0 }

export function startAudioServer(port = 8081) {
	const wss = new WebSocketServer({ port })
	wss.on('connection', ws => {
		ws.on('message', data => {
			if (Buffer.isBuffer(data)) processAudio(data)
		})
	})
}

export function processAudio(buffer: Buffer, sampleRate = 44100) {
	const view = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2)
	const input = Array.from(view).map(v => v / 32768)
	const phasors = fft(input)
	const mags = util.fftMag(phasors)
	let max = 0
	let idx = 0
	for (let i = 1; i < mags.length / 2; i++) {
		if (mags[i] > max) {
			max = mags[i]
			idx = i
		}
	}
	audioState.hue = (idx / (mags.length / 2)) * 360
	audioState.level = max / (mags.length / 2)
}
