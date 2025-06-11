import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { getPlasmaColor } from './plasma'
import { getBreatheColor } from './breathe'
import { getWaveColor } from './wave'
import { getHeartbeatColor, getStrobeColor, getPulseColor, getGradientPulseColor, getMultiPulseColor } from './extra'
import { rippleMapper } from './ripple'
import { fftRippleMapper } from './fftRipple'
import { fftRandomMapper } from './fftRandomRipple'
import { fftMirrorMapper } from './fftMirrorRipple'
import { createIndexedMapper, createFlatMapper } from './mappers'

const transitionDuration = 250

function mix(a: IArrColor, b: IArrColor, t: number): IArrColor {
	return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}

function blend(from: IArrColor[][], to: IArrColor[][], t: number): IArrColor[][] {
	return from.map((batch, i) => batch.map((c, j) => mix(c, to[i][j], t)))
}

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
	[IMode.Heartbeat]: createIndexedMapper(getHeartbeatColor),
	[IMode.Strobe]: createIndexedMapper(getStrobeColor),
	[IMode.Pulse]: createIndexedMapper(getPulseColor),
	[IMode.GradientPulse]: createIndexedMapper(getGradientPulseColor),
	[IMode.MultiPulse]: createIndexedMapper(getMultiPulseColor),
	[IMode.Ripple]: rippleMapper,
	[IMode.FftRipple]: fftRippleMapper,
	[IMode.FftRandomRipple]: fftRandomMapper,
	[IMode.FftMirrorRipple]: fftMirrorMapper,
}

export function getPixels(mode: IMode): IArrColor[][] {
	const now = Date.now()
	const mapper = mappers[mode]
	if (dynamic.transition) {
		const t = (now - dynamic.transition.start) / transitionDuration
		if (t >= 1) {
			dynamic.transition = undefined
			return mapper()
		}
		const fromPixels = mappers[dynamic.transition.from]()
		const toPixels = mapper()
		return blend(fromPixels, toPixels, t)
	}
	return mapper()
}
