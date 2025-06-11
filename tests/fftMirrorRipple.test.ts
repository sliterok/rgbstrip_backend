import { getFftMirrorRippleColor, resetFftMirrorRipples } from '../src/backend/pattern/fftMirrorRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetFftMirrorRipples()
  audioState.bins = Array(8).fill(0)
})

describe('fft mirror ripple pattern', () => {
  test('spawns ripple on spike', () => {
    audioState.bins[0] = 2
    ;(getFftMirrorRippleColor as any)(0, 0)
    audioState.bins[0] = 10
    const color = (getFftMirrorRippleColor as any)(0, 16)
    expect(color).not.toEqual([0, 0, 0])
  })
})
