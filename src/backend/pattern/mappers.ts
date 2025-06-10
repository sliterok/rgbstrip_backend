import { IColorGetter, IArrColor, IStaticColorGetter, IColorMapper } from 'src/typings'
import { batchSize, dynamic, frameInterval, pixelsCount } from '../shared'
import { settings } from 'src/settings'

const nightDuration = 10 * 60 * 1000
const awayDuration = 60 * 1000

export const awayColor: IArrColor = [5, 20, 5]

function mix(a: IArrColor, b: IArrColor, t: number): IArrColor {
	return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}

export const defaultMapperMiddleware = (): { color: IArrColor; ratio: number } | undefined => {
	const now = Date.now()
	if (!settings.nightOverride) {
		const diff = now - dynamic.nightChanged
		if (dynamic.isNight || diff < nightDuration) {
			const base = Math.min(1, diff / nightDuration)
			const ratio = dynamic.isNight ? base : 1 - base
			if (ratio > 0) {
				dynamic.overrideRatio = ratio
				return { color: dynamic.disabledColor, ratio }
			}
		}
	}

	if (!settings.geoOverride) {
		const diff = now - dynamic.awayChanged
		if (dynamic.isAway || diff < awayDuration) {
			const base = Math.min(1, diff / awayDuration)
			const ratio = dynamic.isAway ? base : 1 - base
			if (ratio > 0) {
				dynamic.overrideRatio = ratio
				return { color: awayColor, ratio }
			}
		}
	}

	dynamic.overrideRatio = 0
	return undefined
}

export const callIndexedGetter = <T = never>(getter: IColorGetter<T>, onBatch?: (batchIndex: number) => T) => {
	const override = defaultMapperMiddleware()
	const now = Date.now()
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
		const override = defaultMapperMiddleware()
		const base = getter instanceof Function ? getter() : getter
		if (!override) return [[base]]
		if (override.ratio >= 1) return [[override.color]]
		return [[mix(base, override.color, override.ratio)]]
	}
