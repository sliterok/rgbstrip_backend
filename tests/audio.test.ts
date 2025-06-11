import { analyzeSamples } from '../src/backend/audio'

describe('analyzeSamples', () => {
	test('detects frequency', () => {
		const sr = 16000
		const freq = 440
		const size = 1024
		const samples = Array.from({ length: size }, (_, i) => Math.sin((2 * Math.PI * freq * i) / sr))
		const { level, hue } = analyzeSamples(samples, sr)
		expect(level).toBeGreaterThan(0)
		const detected = (hue / 360) * (sr / 2)
		expect(Math.abs(detected - freq)).toBeLessThan(30)
	})

	test('silence gives zero level', () => {
		const { level } = analyzeSamples(new Array(1024).fill(0))
		expect(level).toBe(0)
	})
})
