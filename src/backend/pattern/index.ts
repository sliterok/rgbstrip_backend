import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { getPlasmaColor } from './plasma'
import { getBreatheColor } from './breathe'
import { getWaveColor } from './wave'
import { createIndexedMapper, createFlatMapper } from './mappers'

const mappers: Record<IMode, IColorMapper> = {
	[IMode.Disabled]: createFlatMapper(() => dynamic.disabledColor),
	[IMode.Rainbow]: createIndexedMapper(getRainbowColor),
	[IMode.Progress]: createIndexedMapper(getProgressColor),
	[IMode.White]: createFlatMapper([255, 255, 255]),
	[IMode.Noise]: noiseFrameMapper,
	[IMode.Plasma]: createIndexedMapper(getPlasmaColor),
	[IMode.Color]: createFlatMapper(() => settings.color),
	[IMode.Breathe]: createIndexedMapper(getBreatheColor),
	[IMode.Wave]: createIndexedMapper(getWaveColor),
}

const modeDuration = 2000

function mix(a: IArrColor, b: IArrColor, t: number): IArrColor {
	return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}

function getModePixels(mode: IMode): IArrColor[][] {
	const mapper = mappers[mode]
	return mapper()
}

export function getPixels(mode: IMode): IArrColor[][] {
	const now = Date.now()
	const newPixels = getModePixels(mode)

	if (mode !== dynamic.lastMode) {
		const diff = now - dynamic.modeChanged
		const ratio = diff / modeDuration
		if (ratio < 1) {
			const oldPixels = getModePixels(dynamic.lastMode)
			return newPixels.map((batch, bi) => batch.map((color, pi) => mix(oldPixels[bi][pi], color, ratio)))
		}
		dynamic.lastMode = mode
	}

	return newPixels
}
