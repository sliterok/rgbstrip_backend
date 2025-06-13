import { createNoise2D } from 'simplex-noise'
import { IDynamicDto } from 'src/typings'
import { hsl } from 'd3-color'

export const activeColors = 5
export const colorNoise = createNoise2D()
export const normalNoise = (x: number, y: number) => (colorNoise(x, y) + 1) / 2
export const pixelsCount = 288
export const batchSize = 3
export const frameInterval = 12

export const dynamic: IDynamicDto = {
	hasConnections: false,
	disabledColor: [0, 0, 1],
	isNight: true,
	isAway: false,
	lastMessage: 0,
	nightChanged: Date.now(),
	awayChanged: Date.now(),
	overrideRatio: 0,
	breatheHue: undefined,
	transition: undefined,
}

export const hueToColor = (hue: number) => hsl(hue, 1, 0.5)
