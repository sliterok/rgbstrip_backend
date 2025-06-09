import { IColorGetter, IArrColor, IStaticColorGetter, IColorMapper } from 'src/typings'
import { batchSize, dynamic, frameInterval, pixelsCount } from '../shared'
import { settings } from 'src/settings'

const nightDuration = 10 * 60 * 1000
const awayDuration = 60 * 1000

function mix(a: IArrColor, b: IArrColor, t: number): IArrColor {
	return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}

function getOverride(now: number): { color: IArrColor; ratio: number } | undefined {
	const nightActive = !settings.nightOverride && dynamic.isNight
	if (nightActive !== dynamic.nightOverrideActive) {
		dynamic.nightOverrideActive = nightActive
		dynamic.nightChanged = now
	}
	if (nightActive || now - dynamic.nightChanged < nightDuration) {
		const diff = now - dynamic.nightChanged
		const base = Math.min(1, diff / nightDuration)
		const ratio = nightActive ? base : 1 - base
		if (ratio > 0) return { color: dynamic.disabledColor, ratio }
	}

	const awayActive = !settings.geoOverride && dynamic.isAway
	if (awayActive !== dynamic.awayOverrideActive) {
		dynamic.awayOverrideActive = awayActive
		dynamic.awayChanged = now
	}
	if (awayActive || now - dynamic.awayChanged < awayDuration) {
		const diff = now - dynamic.awayChanged
		const base = Math.min(1, diff / awayDuration)
		const ratio = awayActive ? base : 1 - base
		if (ratio > 0) return { color: awayColor, ratio }
	}
}

export const awayColor: IArrColor = [5, 20, 5]

export const defaultMapperMiddleware = (): { color: IArrColor; ratio: number } | undefined => {
	const now = Date.now()
	return getOverride(now)
}

export const callIndexedGetter = <T = never>(getter: IColorGetter<T>, onBatch?: (batchIndex: number) => T) => {
	const now = Date.now()
	const override = getOverride(now)
	return Array(batchSize)
		.fill(null)
		.map((_, batchIndex): IArrColor[] => {
			const batchData = onBatch && onBatch(batchIndex)
			const base = Array(pixelsCount)
				.fill(null)
				.map((_, indexInBatch): IArrColor => getter(indexInBatch, now + batchIndex * frameInterval, batchData!))
			if (!override) return base
			if (override.ratio >= 1) return base.map(() => override.color)
			return base.map(color => mix(color, override.color, override.ratio))
		})
}

export const createIndexedMapper =
	(getter: IColorGetter): IColorMapper =>
	() =>
		callIndexedGetter(getter)

export const createFlatMapper =
	(getter: IStaticColorGetter | IArrColor): IColorMapper =>
	() => {
		const now = Date.now()
		const override = getOverride(now)
		const base = getter instanceof Function ? getter() : getter
		if (!override) return [[base]]
		if (override.ratio >= 1) return [[override.color]]
		return [[mix(base, override.color, override.ratio)]]
	}
