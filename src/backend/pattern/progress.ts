import { clamp, HSLToRGB } from 'src/helpers'
import { settings } from 'src/settings'
import { IColorGetter } from 'src/typings'
import { pixelsCount } from '../shared'

export const getProgressColor: IColorGetter = index => {
	const { current, total, lastUpdate } = settings.progress

	const mult = total / pixelsCount
	const progress = current / mult || 0 // 0 / 0 = NaN
	const dist = Math.abs(progress - index)

	let lightness = clamp(25, progress > index ? 50 : 50 - 20 * dist, 50)
	let saturation = lightness * 2
	let color = (Date.now() / 16 + index) % 360

	if (total === 0) {
		lightness = 50
		saturation = 50
	} else if (current >= total - 1) {
		color = 150
	}

	const framesPerScene = 30
	const scenes = total / framesPerScene
	const sceneLength = Math.floor(pixelsCount / scenes)
	if (index % sceneLength === 0) {
		lightness = 20
		saturation = 0
	}

	if (lastUpdate && Date.now() - lastUpdate.getTime() > 300000 && progress / total < 0.95) {
		color = 0
	}

	return HSLToRGB(color, saturation, lightness)
}
