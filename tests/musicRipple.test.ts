import { getMusicRippleColor, resetMusicRipples } from '../src/backend/pattern/musicRipple'
import { audioState } from '../src/backend/wsAudio'

beforeEach(() => {
  resetMusicRipples()
  audioState.hue = 0
  audioState.level = 0
  audioState.events = []
})

describe('music ripple pattern', () => {
  test('spawns ripple for event', () => {
    const orig = Math.random
    ;(Math as any).random = () => 0
    audioState.events.push({ hue: 0, level: 1 })
    expect((getMusicRippleColor as any)(0, 0)).toEqual([255, 0, 0])
    Math.random = orig
  })
})
