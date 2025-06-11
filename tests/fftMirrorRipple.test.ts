import { getFftMirrorColor, resetFftMirror } from '../src/backend/pattern/fftMirrorRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetFftMirror()
  audioState.bins = Array(8).fill(0)
})

describe('fft mirror ripple', () => {
  test('spawns ripple on spike', () => {
    audioState.bins[0] = 2
    ;(getFftMirrorColor as any)(0, 0)
    audioState.bins[0] = 10
    const color = (getFftMirrorColor as any)(0, 16)
    expect(color).not.toEqual([0, 0, 0])
  })
})
