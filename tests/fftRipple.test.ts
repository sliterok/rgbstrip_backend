import { getFftRippleColor, resetFftRipples } from '../src/backend/pattern/fftRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetFftRipples()
  audioState.bins = Array(8).fill(0)
})

describe('fft ripple pattern', () => {
  test('spawns ripple on spike', () => {
  audioState.bins[0] = 2
  ;(getFftRippleColor as any)(0, 0)
  audioState.bins[0] = 10
  const color = (getFftRippleColor as any)(0, 16)
  expect(color).not.toEqual([0, 0, 0])
  })
})
