import { getMusicRippleColor, resetMusicRipples } from '../src/backend/pattern/musicRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetMusicRipples()
  audioState.hue = 0
  audioState.level = 0
})

describe('music ripple pattern', () => {
  test('spawns ripple when level high', () => {
    const orig = Math.random
    ;(Math as any).random = () => 0
    audioState.level = 1
    audioState.hue = 0
    expect((getMusicRippleColor as any)(0, 0)).toEqual([255, 0, 0])
    Math.random = orig
  })
})
