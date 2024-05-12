import { HSLColor } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { IArrColor, IColorGetter } from 'src/typings'
import { pixelsCount, activeColors, dynamic, colors, normalNoise } from '../shared'

export const getNoiseColor: IColorGetter = index => {
	const now = Date.now()
	const normalPosition = index / pixelsCount
	const positionScaleNoise = 10 * normalNoise(now, index) + 3

	const x = normalPosition * positionScaleNoise
	const y = now / 5000

	const offsetNoise = normalNoise(x, y)
	const baseOffset = offsetNoise * (activeColors - 1)
	const offset = baseOffset + dynamic.offset

	const segmentIndex = Math.floor(offset)
	const segmentFraction = offset - segmentIndex

	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	const interpolator = getInterpolator(colorStart, colorEnd)
	const mixed = interpolator(segmentFraction ** 2)

	return mixed
		.replace(/[^\d,]/g, '')
		.split(',')
		.map(el => parseInt(el)) as IArrColor
}

const interpolators = new WeakMap<HSLColor, WeakMap<HSLColor, (t: number) => string>>()

function getInterpolator(colorStart: HSLColor, colorEnd: HSLColor) {
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

	return interpolator
}
