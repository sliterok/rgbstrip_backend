import { getFftRandomColor, resetFftRandom } from '../src/backend/pattern/fftRandomRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetFftRandom()
  audioState.bins = Array(8).fill(0)
})

describe('fft random ripple', () => {
  test('spawns ripple on spike', () => {
    const orig = Math.random
    ;(Math as any).random = () => 0
    audioState.bins[0] = 2
    ;(getFftRandomColor as any)(0, 0)
    audioState.bins[0] = 10
    const color = (getFftRandomColor as any)(0, 16)
    expect(color).not.toEqual([0, 0, 0])
    Math.random = orig
  })
})
