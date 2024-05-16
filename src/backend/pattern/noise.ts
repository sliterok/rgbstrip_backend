// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { ColorCommonInstance, rgb } from 'd3-color'
import { interpolateLab } from 'd3-interpolate'
import { IArrColor, IColorGetter, IColorMapper } from 'src/typings'
import { pixelsCount, activeColors, normalNoise, hueToColor, batchSize } from '../shared'
import { callIndexedGetter, defaultMapperMiddleware } from './mappers'
import { settings } from 'src/settings'
import { getCachedColor } from 'src/helpers'

const colors = new RingBuffer<ColorCommonInstance>(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(hueToColor(Math.random() * 5000))

interface INoiseBatchData {
	baseOffset: number
}

let baseOffset = 0
let lastTrueColor = Date.now()
export const noiseFrameMapper: IColorMapper = () => {
	const middlewareRes = defaultMapperMiddleware()
	let coeff = 0
	if (middlewareRes) {
		const diff = Date.now() - lastTrueColor
		coeff = coeff < 1 ? Math.cbrt(diff / (5 * 60 * 1000)) : diff / (5 * 60 * 1000)
		const hasFullyTransitioned = coeff > 1.3
		if (hasFullyTransitioned) return [[middlewareRes]]
	}

	return callIndexedGetter<INoiseBatchData>(getNoiseColor, () => {
		const rawOffset = baseOffset + 0.006
		baseOffset = rawOffset % 1
		if (rawOffset >= 1) {
			const color = middlewareRes && getCachedColor(middlewareRes)
			colors.add(getNextColor(coeff, color))
		}
		return { baseOffset }
	})
}

function getNextColor(coeff: number, alternativeColor?: ColorCommonInstance): ColorCommonInstance {
	const hasTransitioned = coeff > 1.1
	if (hasTransitioned) return alternativeColor!

	let color: ColorCommonInstance = getNextRandomColor()
	if (coeff) {
		const interpolator = getInterpolator(color, alternativeColor!)
		color = rgb(...interpolator(coeff))
	} else {
		lastTrueColor = Date.now()
	}
	if (settings.mixColorWithNoise) {
		const interpolator = getInterpolator(color, getCachedColor(settings.color))
		color = rgb(...interpolator(settings.mixRatio))
	}
	return color
}

let colorNoiseOffset = 0
function getNextRandomColor() {
	const colorChange = normalNoise(Date.now(), 0) ** 2 * 23 + 1 / 3
	colorNoiseOffset += colorChange

	const hue = normalNoise(colorNoiseOffset, 0) * 360 + normalNoise(0, Date.now()) * 360
	return hueToColor(hue)
}

const getNoiseColor: IColorGetter<INoiseBatchData> = (index, time, batchData) => {
	const normalPosition = index / pixelsCount
	const positionScaleNoise = 10 * normalNoise(time, index) + 3

	const x = normalPosition * positionScaleNoise
	const y = time / 5000

	const colorsOffset = normalNoise(x, y) * (activeColors - 1)
	const offset = batchData.baseOffset + colorsOffset

	const segmentIndex = Math.floor(offset)
	const segmentFraction = offset - segmentIndex

	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	const interpolator = getInterpolator(colorStart, colorEnd)
	const color = interpolator(segmentFraction ** 2)

	return color
}

const interpolators = new WeakMap<ColorCommonInstance, WeakMap<ColorCommonInstance, (t: number) => string>>()

function getInterpolator(colorStart: ColorCommonInstance, colorEnd: ColorCommonInstance): (t: number) => IArrColor {
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

	return t =>
		interpolator(t)
			.replace(/[^\d,]/g, '')
			.split(',')
			.map(el => parseInt(el)) as IArrColor
}
