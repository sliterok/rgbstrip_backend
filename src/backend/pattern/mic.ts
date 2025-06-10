import { IColorGetter } from 'src/typings'
import { settings } from 'src/settings'
import { dynamic } from '../shared'

export const getMicColor: IColorGetter = () => {
	const level = Math.min(dynamic.audioLevel, 1)
	const [r, g, b] = settings.color
	return [Math.round(r * level), Math.round(g * level), Math.round(b * level)]
}
