import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { getPlasmaColor } from './plasma'
import { getBreatheColor } from './breathe'
import { getWaveColor } from './wave'
import {
	getChaseColor,
	getRippleColor,
	getMeteorColor,
	getLightningColor,
	getScannerColor,
	getHeartbeatColor,
	getSparklerColor,
	getSpectrumColor,
	getSunriseColor,
	getStrobeColor,
	getTwinkleColor,
	getPulseColor,
	getFireColor,
	getGradientColor,
	getSparkleColor,
	getOceanColor,
} from './extra'
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
	[IMode.Chase]: createIndexedMapper(getChaseColor),
	[IMode.Ripple]: createIndexedMapper(getRippleColor),
	[IMode.Meteor]: createIndexedMapper(getMeteorColor),
	[IMode.Lightning]: createIndexedMapper(getLightningColor),
	[IMode.Scanner]: createIndexedMapper(getScannerColor),
	[IMode.Heartbeat]: createIndexedMapper(getHeartbeatColor),
	[IMode.Sparkler]: createIndexedMapper(getSparklerColor),
	[IMode.Spectrum]: createIndexedMapper(getSpectrumColor),
	[IMode.Sunrise]: createIndexedMapper(getSunriseColor),
	[IMode.Strobe]: createIndexedMapper(getStrobeColor),
	[IMode.Twinkle]: createIndexedMapper(getTwinkleColor),
	[IMode.Pulse]: createIndexedMapper(getPulseColor),
	[IMode.Fire]: createIndexedMapper(getFireColor),
	[IMode.Gradient]: createIndexedMapper(getGradientColor),
	[IMode.Sparkle]: createIndexedMapper(getSparkleColor),
	[IMode.Ocean]: createIndexedMapper(getOceanColor),
}

export function getPixels(mode: IMode): IArrColor[][] {
	const mapper = mappers[mode]
	return mapper()
}
