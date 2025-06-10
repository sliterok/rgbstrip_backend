// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { ColorCommonInstance, rgb } from 'd3-color'
import { IArrColor, IColorGetter, IColorMapper, IRgbLabColor } from 'src/typings'
import { interpolateLabArr, toRgbLab } from './interpolate'
import { pixelsCount, activeColors, normalNoise, hueToColor } from '../shared'
import { callIndexedGetter } from './mappers'
import { settings } from 'src/settings'
import { getCachedColor } from 'src/helpers'

const colors = new RingBuffer<IRgbLabColor>(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(toRgbLab(hueToColor(Math.random() * 5000)))

interface INoiseBatchData {
	baseOffset: number
}

let baseOffset = 0
let lastTrueColor = Date.now()
export const noiseFrameMapper: IColorMapper = () =>
	callIndexedGetter<INoiseBatchData>(getNoiseColor, () => {
		const rawOffset = baseOffset + 0.007 * settings.effectSpeed
		baseOffset = rawOffset % 1
		if (rawOffset >= 1) {
			colors.add(toRgbLab(getNextColor()))
		}
		return { baseOffset }
	})

function getNextColor(): ColorCommonInstance {
	let color: ColorCommonInstance = getNextRandomColor()
	lastTrueColor = Date.now()
	if (settings.mixColorWithNoise) {
		const interpolator = getInterpolator(toRgbLab(color), toRgbLab(getCachedColor(settings.color)))
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
	const t = time * settings.effectSpeed
	const positionScaleNoise = 10 * normalNoise(t / 300, index) + 3

	const x = normalPosition * positionScaleNoise
	const y = t / 5000

	const offset = batchData.baseOffset + normalNoise(x, y) * (activeColors - 1)

	const segmentIndex = Math.floor(offset)
	const segmentFraction = offset - segmentIndex

	const colorStart = colors.get(segmentIndex)!
	const colorEnd = colors.get(segmentIndex + 1)!

	const interpolator = getInterpolator(colorStart, colorEnd)
	const color = interpolator(segmentFraction ** 2)

	return color
}

const interpolators = new WeakMap<IRgbLabColor, WeakMap<IRgbLabColor, (t: number) => IArrColor>>()

function getInterpolator(colorStart: IRgbLabColor, colorEnd: IRgbLabColor): (t: number) => IArrColor {
	let interpolator: undefined | ((t: number) => IArrColor)
	let subInterpolator: WeakMap<IRgbLabColor, (t: number) => IArrColor>
	const hadFirstColor = interpolators.has(colorStart)
	if (hadFirstColor) {
		subInterpolator = interpolators.get(colorStart)!
		interpolator = subInterpolator.get(colorEnd)
	}
	const hadSecondColor = !!interpolator
	if (!interpolator) interpolator = interpolateLabArr(colorStart.lab, colorEnd.lab)
	if (!hadFirstColor) {
		subInterpolator = new WeakMap()
		interpolators.set(colorStart, subInterpolator)
	}
	if (!hadSecondColor) subInterpolator!.set(colorEnd, interpolator)

	return interpolator!
}
