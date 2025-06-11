import { processAudio, audioState, resetAudioState } from '../src/backend/wsAudio'

function genSine(freq: number, samples: number, sampleRate: number) {
	const buf = Buffer.alloc(samples * 2)
	for (let i = 0; i < samples; i++) {
		const v = Math.sin((2 * Math.PI * freq * i) / sampleRate)
		buf.writeInt16LE(Math.round(v * 32767), i * 2)
	}
	return buf
}

describe('processAudio', () => {
        beforeEach(() => {
                resetAudioState()
        })
        test('detects frequency', () => {
                const buf = genSine(440, 1024, 44100)
                processAudio(buf)
                expect(audioState.freq).toBeGreaterThan(430)
                expect(audioState.freq).toBeLessThan(450)
        })

})
