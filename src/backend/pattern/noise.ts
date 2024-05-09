import { HSLColor } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { IArrColor, IColorGetter } from 'src/typings'
import { pixelsCount, activeColors, dynamic, colors, normalNoise } from '../shared'

const interpolators = new WeakMap<HSLColor, WeakMap<HSLColor, (t: number) => string>>()

export const getNoiseColor: IColorGetter = index => {
	const now = Date.now()
	const x = (10 * normalNoise(now, now) + 3) * (index / pixelsCount)

	const normalizedNoise = normalNoise(x, -now / 5000)
	const baseOffset = normalizedNoise * (activeColors - 1)
	const i = baseOffset + dynamic.offset
	const segmentIndex = Math.floor(i)
	const segmentFraction = i - segmentIndex

	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	let interpolator: undefined | ((t: number) => string)
	let subInterpolator: WeakMap<HSLColor, (t: number) => string>
	const hadFirstColor = interpolators.has(colorStart)
	if (hadFirstColor) {
		subInterpolator = interpolators.get(colorStart)!
		interpolator = subInterpolator.get(colorEnd)
	}
	const hadSecondColor = !!interpolator
	if (!interpolator) interpolator = interpolateLab(colorStart, colorEnd)
	if (!hadFirstColor) {
		subInterpolator = new WeakMap()
		interpolators.set(colorStart, subInterpolator)
	}
	if (!hadSecondColor) subInterpolator!.set(colorEnd, interpolator)

	const mixed = interpolator(segmentFraction)
	return mixed
		.replace(/[^\d,]/g, '')
		.split(',')
		.map(el => parseInt(el)) as IArrColor
}
