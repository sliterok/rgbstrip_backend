// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { createNoise2D } from 'simplex-noise'
import { IDynamicDto } from 'src/typings'

export const activeColors = 5
export const colorNoise = createNoise2D()
export const pixelsCount = 288

export const dynamic: IDynamicDto = {
	offset: 0,
}

export const colors = new RingBuffer<number>(activeColors + 1)

export const randomColor = (x: number, y: number) => ((colorNoise(x, y) + 1) * 1000) % 360
for (let i = 0; i <= activeColors; i++) colors.add(randomColor(Math.random() * 10, 0))
