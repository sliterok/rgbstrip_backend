// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { ColorCommonInstance, rgb } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { IArrColor, IColorGetter, IColorMapper } from 'src/typings'
import { pixelsCount, activeColors, normalNoise, hueToColor, dynamic } from '../shared'
import { settings } from 'src/settings'

const colors = new RingBuffer<ColorCommonInstance>(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(hueToColor(Math.random() * 5000))

let baseOffset = 0
export const noiseFrameMapper: IColorMapper = () => {
	const rawOffset = baseOffset + 0.006
	baseOffset = rawOffset % 1
	if (rawOffset >= 1) {
		colors.add(getNextColor())
	}

	return Array(pixelsCount)
		.fill(null)
		.map((_, index): IArrColor => getNoiseColor(index))
}

let colorNoiseOffset = 0
function getNextColor(): ColorCommonInstance {
	if (settings.nightOverride) {
		// for testing
		return rgb(...dynamic.disabledColor)
	} else if (settings.away && !settings.geoOverride) {
		return rgb(5, 20, 5)
	} else {
		const colorChange = normalNoise(Date.now(), 0) ** 2 * 23 + 1 / 3
		colorNoiseOffset += colorChange

		const hue = normalNoise(colorNoiseOffset, 0) * 360 + normalNoise(0, Date.now()) * 360
		return hueToColor(hue)
	}
}

const getNoiseColor: IColorGetter = index => {
	const now = Date.now()
	const normalPosition = index / pixelsCount
	const positionScaleNoise = 10 * normalNoise(now, index) + 3

	const x = normalPosition * positionScaleNoise
	const y = now / 5000

	const colorsOffset = normalNoise(x, y) * (activeColors - 1)
	const offset = baseOffset + colorsOffset

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

const interpolators = new WeakMap<ColorCommonInstance, WeakMap<ColorCommonInstance, (t: number) => string>>()

function getInterpolator(colorStart: ColorCommonInstance, colorEnd: ColorCommonInstance) {
	let interpolator: undefined | ((t: number) => string)
	let subInterpolator: WeakMap<ColorCommonInstance, (t: number) => string>
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
