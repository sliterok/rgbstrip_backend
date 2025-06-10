import { IColorGetter } from 'src/typings'
import { pixelsCount } from '../shared'
import { hslToRgb } from 'src/helpers'
import { settings } from 'src/settings'

export const getChaseColor: IColorGetter = (i, t) => {
	const pos = Math.floor((t / 50) % pixelsCount)
	const dist = (i - pos + pixelsCount) % pixelsCount
	const intensity = Math.max(0, 1 - dist / 10)
	const c = Math.round(255 * intensity)
	return [c, c, c]
}

export const getRippleColor: IColorGetter = (i, t) => {
	const center = pixelsCount / 2
	const radius = (t / 100) % (pixelsCount / 2)
	const dist = Math.abs(i - center)
	const intensity = Math.max(0, 1 - Math.abs(dist - radius) / 10)
	const c = Math.round(255 * intensity)
	return [c, c, c]
}

export const getMeteorColor: IColorGetter = (i, t) => {
	const tail = 20
	const pos = (t / 50) % (pixelsCount + tail)
	const dist = pos - i
	const intensity = dist >= 0 && dist < tail ? 1 - dist / tail : 0
	const c = Math.round(255 * intensity)
	return [c, c, c]
}

export const getLightningColor: IColorGetter = (_, t) => {
	const on = Math.floor(t / 100) % 20 === 0
	const c = on ? 255 : 0
	return [c, c, c]
}

export const getScannerColor: IColorGetter = (i, t) => {
	const pos = Math.abs(((t / 50) % (2 * pixelsCount)) - pixelsCount)
	const intensity = Math.max(0, 1 - Math.abs(i - pos) / 10)
	const c = Math.round(255 * intensity)
	return [c, 0, 0]
}

export const getHeartbeatColor: IColorGetter = (_, t) => {
	const beat = Math.sin(t / 300) ** 2
	const beat2 = Math.sin(t / 600) ** 2
	const intensity = Math.max(beat, beat2)
	const c = Math.round(255 * intensity)
	return [c, 0, 0]
}

export const getSparklerColor: IColorGetter = () => {
	const c = Math.random() < 0.1 ? 255 : 0
	return [c, c, c]
}

export const getSpectrumColor: IColorGetter = (i, t) => {
	const hue = (t / 40 + (i / pixelsCount) * 360) % 360
	return hslToRgb(hue, 1, 0.5)
}

export const getSunriseColor: IColorGetter = (_, t) => {
	const k = Math.min(1, t / 10000)
	const hue = 20 + 40 * k
	const light = 0.1 + 0.4 * k
	return hslToRgb(hue, 1, light)
}

export const getStrobeColor: IColorGetter = (_, t) => {
	const on = Math.floor(t / 100) % 2 === 0
	return on ? settings.color : [0, 0, 0]
}

export const getTwinkleColor: IColorGetter = () => {
	const c = Math.random() < 0.05 ? 255 : 0
	return [c, c, c]
}

export const getPulseColor: IColorGetter = (_, t) => {
	const amp = (Math.sin(t / 500) + 1) / 2
	return settings.color.map(v => Math.round(v * amp)) as any
}

export const getFireColor: IColorGetter = () => {
	const hue = 20 + Math.random() * 20
	const light = 0.3 + Math.random() * 0.7
	return hslToRgb(hue, 1, light)
}

export const getGradientColor: IColorGetter = i => {
	const start = [255, 0, 0]
	const end = [0, 0, 255]
	const k = i / pixelsCount
	return [Math.round(start[0] * (1 - k) + end[0] * k), Math.round(start[1] * (1 - k) + end[1] * k), Math.round(start[2] * (1 - k) + end[2] * k)]
}

export const getSparkleColor: IColorGetter = () => {
	return Math.random() < 0.1 ? [255, 255, 255] : settings.color
}

export const getOceanColor: IColorGetter = (i, t) => {
	const x = i / pixelsCount
	const hue = 180 + Math.sin(x * 4 + t / 1000) * 30
	return hslToRgb(hue, 1, 0.5)
}
