import { settings } from 'src/settings'
import { dynamic } from '../shared'
import { IArrColor, IColorMapper, IMode } from 'src/typings'
import { noiseFrameMapper } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'
import { getPlasmaColor } from './plasma'
import { getBreatheColor } from './breathe'
import { getWaveColor } from './wave'
import { getHeartbeatColor, getStrobeColor, getPulseColor } from './extra'
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
	[IMode.Heartbeat]: createIndexedMapper(getHeartbeatColor),
	[IMode.Strobe]: createIndexedMapper(getStrobeColor),
	[IMode.Pulse]: createIndexedMapper(getPulseColor),
}

export function getPixels(mode: IMode): IArrColor[][] {
	const mapper = mappers[mode]
	return mapper()
}
