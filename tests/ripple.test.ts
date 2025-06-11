import { getRippleColor, resetRipples } from '../src/backend/pattern/ripple'

beforeEach(() => {
  resetRipples()
})

describe('ripple pattern', () => {
  test('spawns ripple after interval', () => {
    const orig = Math.random
    ;(Math as any).random = () => 0
    expect((getRippleColor as any)(0, 0)).toEqual([0, 0, 0])
    const color = (getRippleColor as any)(0, 1000)
    expect(color).toEqual([255, 0, 0])
    Math.random = orig
  })
})
