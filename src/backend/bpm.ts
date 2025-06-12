// BPM detection from microphone audio
// Uses envelope follower and onset detection with simple autocorrelation
import { audioState } from './wsAudio'

let lastSample = 0
let envelope = 0
let prevEnv = 0
const envelopeWindow = 0.05 // 50 ms
const thresholdWindow = 1 // 1 second
let sampleCount = 0
let sampleRate = 44100
const energyHistory: number[] = []
const onsetTimes: number[] = []
const bpmHistory: number[] = []

export function resetBeat() {
	lastSample = 0
	envelope = 0
	prevEnv = 0
	sampleCount = 0
	energyHistory.length = 0
	onsetTimes.length = 0
	bpmHistory.length = 0
	audioState.bpm = 0
	audioState.beat = 0
}

export function processBeat(samples: number[], rate: number) {
	sampleRate = rate
	const envAlpha = 1 / (rate * envelopeWindow)
	for (const s of samples) {
		const diff = s - lastSample
		lastSample = s
		const energy = diff > 0 ? diff * diff : 0
		envelope += (energy - envelope) * envAlpha
		energyHistory.push(envelope)
		if (energyHistory.length > rate * thresholdWindow) energyHistory.shift()
		if (energyHistory.length === rate * thresholdWindow) {
			const mean = energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length
			const std = Math.sqrt(energyHistory.reduce((a, b) => a + (b - mean) ** 2, 0) / energyHistory.length)
			const threshold = mean + std * 1.5
			if (envelope > threshold && prevEnv <= threshold) registerOnset(sampleCount / rate)
			prevEnv = envelope
		}
		sampleCount++
	}
	decayBeat()
}

function registerOnset(time: number) {
	onsetTimes.push(time)
	while (onsetTimes.length && time - onsetTimes[0] > 8) onsetTimes.shift()
	computeBpm()
	audioState.beat = 1
	lastBeat = Date.now()
}

let lastBeat = 0
function decayBeat() {
	const dt = Date.now() - lastBeat
	audioState.beat = Math.max(0, 1 - dt / 200)
}

function computeBpm() {
	if (onsetTimes.length < 2) return
	const counts: Record<number, number> = {}
	for (let i = 1; i < onsetTimes.length; i++) {
		for (let j = 0; j < i; j++) {
			const lag = onsetTimes[i] - onsetTimes[j]
			if (lag < 0.33 || lag > 1) continue
			const key = Math.round(lag * 100)
			counts[key] = (counts[key] || 0) + 1
		}
	}
	let bestKey = 0
	let bestVal = 0
	for (const k in counts) {
		const v = counts[k]
		if (v > bestVal) {
			bestVal = v
			bestKey = parseInt(k)
		}
	}
	if (bestVal === 0) return
	const interval = bestKey / 100
	const bpm = Math.round(60 / interval)
	bpmHistory.push(bpm)
	if (bpmHistory.length > 3) bpmHistory.shift()
	const sorted = bpmHistory.slice().sort((a, b) => a - b)
	audioState.bpm = sorted[Math.floor(sorted.length / 2)]
}
