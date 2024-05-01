import { getTime, preWakeupTime, wakeupTimeWeekend, wakeupTime } from 'src/helpers'
import { settings } from 'src/settings'
import { pixelsCount, dynamic } from '../shared'
import { IColorGetter, IMode } from 'src/typings'
import { getNoiseColor } from './noise'
import { getProgressColor } from './progress'
import { getRainbowColor } from './rainbow'

const modeToGetter: Record<IMode, [number, number, number] | IColorGetter> = {
	[IMode.Disabled]: dynamic.disabledColor,
	[IMode.Rainbow]: getRainbowColor,
	[IMode.Progress]: getProgressColor,
	[IMode.White]: [255, 255, 255],
	[IMode.Away]: [5, 20, 5],
	[IMode.Noise]: getNoiseColor,
	[IMode.Color]: settings.color,
}

let frameIndex = 0

export function getPixels(mode: IMode): [number, number, number][] {
	frameIndex++

	if (mode === IMode.Disabled) updateDisabledColor()

	const getter = modeToGetter[mode]
	if (getter instanceof Function) {
		return Array(pixelsCount)
			.fill(null)
			.map((_, index): [number, number, number] => getter(frameIndex, index))
	} else {
		return Array(pixelsCount).fill(getter)
	}
}

function updateDisabledColor() {
	if (frameIndex % 15000 === 0) {
		// every 4 minutes or something like this
		const d = new Date()
		const day = d.getDay()
		const isWeekend = [6, 7].includes(day)
		const time = getTime(d.getHours(), d.getMinutes())
		if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
			if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
		} else {
			if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
		}
	}
}
