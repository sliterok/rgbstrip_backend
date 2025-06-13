import { getBreatheColor } from '../src/backend/pattern/breathe'
import { dynamic } from '../src/backend/shared'

describe('getBreatheColor', () => {
	beforeEach(() => {
		dynamic.overrideRatio = 0
		dynamic.breatheHue = undefined
	})

	test('changes over time when no override', () => {
		const c1 = (getBreatheColor as any)(0, 0)
		const c2 = (getBreatheColor as any)(0, 1000)
		expect(c1).not.toEqual(c2)
	})

	test('still changes with partial override', () => {
		dynamic.overrideRatio = 0.5
		const c1 = (getBreatheColor as any)(0, 0)
		const c2 = (getBreatheColor as any)(0, 1000)
		expect(c1).not.toEqual(c2)
	})
})
