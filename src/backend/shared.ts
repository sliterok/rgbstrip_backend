// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { createNoise2D } from 'simplex-noise'
import { IDynamicDto } from 'src/typings'
import { HCLColor, hcl } from 'd3-color'

export const activeColors = 5
export const colorNoise = createNoise2D()
export const normalNoise = (x: number, y: number) => (colorNoise(x, y) + 1) / 2
export const pixelsCount = 288

export const dynamic: IDynamicDto = {
	offset: 0,
	hasConnections: false,
	disabledColor: [0, 0, 1],
	isNight: true,
}

export const colors = new RingBuffer<HCLColor>(activeColors + 1)

export const randomColor = (hue: number) => hcl(hue, 230, 100)
for (let i = 0; i <= activeColors; i++) colors.add(randomColor(Math.random() * 5000))
