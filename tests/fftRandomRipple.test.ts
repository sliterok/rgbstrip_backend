import { getFftRandomRippleColor, resetFftRandomRipples } from '../src/backend/pattern/fftRandomRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetFftRandomRipples()
  audioState.bins = Array(8).fill(0)
})

describe('fft random ripple pattern', () => {
  test('spawns ripple on spike', () => {
    const orig = Math.random
    ;(Math as any).random = () => 0
    audioState.bins[0] = 2
    ;(getFftRandomRippleColor as any)(0, 0)
    audioState.bins[0] = 10
    const color = (getFftRandomRippleColor as any)(0, 16)
    expect(color).not.toEqual([0, 0, 0])
    Math.random = orig
  })
})
