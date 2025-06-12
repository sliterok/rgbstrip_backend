import { processAudio, audioState, resetAudioState } from '../src/backend/wsAudio'

function genSine(freq: number, samples: number, sampleRate: number) {
	const buf = Buffer.alloc(samples * 2)
	for (let i = 0; i < samples; i++) {
		const v = Math.sin((2 * Math.PI * freq * i) / sampleRate)
		buf.writeInt16LE(Math.round(v * 32767), i * 2)
	}
	return buf
}

function genBeat(bpm: number, seconds: number, sampleRate: number) {
       const total = Math.round(seconds * sampleRate)
       const buf = Buffer.alloc(total * 2)
       const period = Math.round((60 / bpm) * sampleRate)
       for (let i = 0; i < total; i++) {
               const v = i % period === 0 ? 1 : 0
               buf.writeInt16LE(Math.round(v * 32767), i * 2)
       }
       return buf
}

describe('processAudio', () => {
        beforeEach(() => {
                resetAudioState()
        })
       test('detects frequency', () => {
               const buf = genSine(440, 1234, 44100)
               processAudio(buf)
               expect(audioState.freq).toBeGreaterThan(430)
               expect(audioState.freq).toBeLessThan(450)
       })

       test('detects bpm', () => {
               const buf = genBeat(120, 4, 44100)
               processAudio(buf)
               expect(audioState.bpm).toBeGreaterThan(110)
               expect(audioState.bpm).toBeLessThan(130)
       })

})
