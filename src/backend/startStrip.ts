// eslint-disable-next-line no-undef
process.env.TZ = '***REMOVED***'
import datagram from 'dgram'
import { initTg } from './grammy'
import { createNoise2D } from 'simplex-noise'
import { settings } from '../settings'
import Color from 'colorjs.io'
// eslint-disable-next-line import/default
import RingBufferTs from 'ring-buffer-ts'
const RingBuffer = RingBufferTs.RingBuffer
import { broadcastMessage } from '../routes/debug-stream.api'
import { phoneLastSeen } from './routerIntegration'
import { HSLToRGB, clamp, getCurrentMode, getTime, hexToRgb, preWakeupTime, wakeupTime, wakeupTimeWeekend } from 'src/helpers'

const socket = datagram.createSocket('udp4')

let colorChange = 0
let offset = 0
let exec = 0
const activeColors = 5
const colorNoise = createNoise2D()
const randomColor = (x: number, y: number) => new Color('hsl', [((colorNoise(x, y) + 1) * 1000) % 360, 100, 50])
const colors = new RingBuffer<Color>(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(randomColor(Math.random() * 10, 0))
const pixelsCount = 288

let disabledColor = [0, 0, 1]

function getPixels(mode: number, frameIndex: number): [number, number, number][] {
	const pixels = Array(pixelsCount)
		.fill([0, 0, 0])
		.map((_, index) => {
			if (mode === 0) {
				if (index % 1000 === 0) {
					const d = new Date()
					const day = d.getDay()
					const isWeekend = [6, 7].includes(day)
					const time = getTime(d.getHours(), d.getMinutes())
					if (time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
						if (disabledColor[1] !== 1) disabledColor = [0, 1, 0]
					} else {
						if (disabledColor[2] !== 1) disabledColor = [0, 0, 1]
					}
				}
				return disabledColor
			} else if (mode === 1) {
				const color = (frameIndex + index) % 360
				return HSLToRGB(color, 50, 100)
			} else if (mode === 2) {
				const { current, total, lastUpdate } = settings.progress

				const mult = total / pixelsCount
				const progress = current / mult || 0 // 0 / 0 = NaN
				const dist = Math.abs(progress - index)

				let lightness = clamp(25, progress > index ? 50 : 50 - 20 * dist, 50)
				let saturation = lightness * 2
				let color = (frameIndex + index) % 360

				if (total === 0) {
					lightness = 50
					saturation = 50
				} else if (current >= total - 1) {
					color = 150
				}

				const framesPerScene = 30
				const scenes = total / framesPerScene
				const sceneLength = Math.floor(pixelsCount / scenes)
				if (index % sceneLength === 0) {
					lightness = 20
					saturation = 0
				}

				if (lastUpdate && Date.now() - lastUpdate.getTime() > 300000 && progress / total < 0.95) {
					color = 0
				}

				return HSLToRGB(color, saturation, lightness)
			} else if (mode === 3) {
				return [255, 255, 255]
			} else if (mode === 4) {
				return [5, 20, 5]
			} else if (mode === 5) {
				const x = index / 80 + frameIndex / 200
				const y = frameIndex / 300

				const baseOffset = ((colorNoise(x, y) + 1) / 2 + index / pixelsCount) % 1
				const segmentWidth = 1 / (activeColors - 1)
				const i = baseOffset + offset * segmentWidth
				const segmentIndex = Math.floor(i / segmentWidth)
				const segmentFraction = (i % segmentWidth) / segmentWidth
				const colorStart = colors.get(segmentIndex)!
				const colorEnd = colors.get(segmentIndex + 1)!

				const mixed = colorStart.mix(colorEnd, segmentFraction, { space: 'lab', outputSpace: 'srgb' })

				return mixed.coords.map(el => clamp(0, Math.floor(el * 255), 255))
			} else if (mode === 6) {
				// console.log('color: ', settings.color)
				return hexToRgb(settings.color)
			}
		}) as [number, number, number][]

	return pixels
}

let seenTimeout: NodeJS.Timeout | null = null
async function updatePhoneLastSeen() {
	const lastSeen = await phoneLastSeen()
	// eslint-disable-next-line no-console
	console.log('phone last seen:', lastSeen)
	if (lastSeen === undefined || lastSeen > 120) {
		if (!seenTimeout) seenTimeout = setTimeout(() => (settings.away = true), 120000)
	} else {
		if (seenTimeout) clearTimeout(seenTimeout)
		seenTimeout = null
		settings.away = false
	}
}
setInterval(updatePhoneLastSeen, 120000)
updatePhoneLastSeen()

socket.on('error', e => console.error(e))

try {
	socket.bind(8008, '0.0.0.0', () => {
		// eslint-disable-next-line no-console
		console.log('up on 8008')
		initTg()
	})
} catch (err) {
	console.error(err)
}

let lastMessage: number
let target: datagram.RemoteInfo | null = null

socket.on('message', (msg, newTarget) => {
	lastMessage = Date.now()
	target = newTarget
})

// let lastSent = 0
const buf = new Uint8Array(pixelsCount * 3)
setInterval(() => {
	exec++
	const rawOffset = offset + 0.004
	offset = rawOffset % 1
	if (rawOffset >= 1) colors.add(randomColor((colorChange += 7 / 3), Math.random() * 5))

	if (import.meta.env.DEV) {
		const mode = 5
		const pixels = getPixels(mode, exec)
		return broadcastMessage(JSON.stringify(pixels))
	}

	if (!target) return
	if (Date.now() - lastMessage > 7000) {
		target = null
		return
	}
	const { address, port } = target

	const mode = getCurrentMode()

	const pixels = getPixels(mode, exec)

	for (let index = 0; index < pixels.length; index++) {
		for (let color = 0; color < 3; color++) {
			let actualColor = color
			switch (color) {
				case 0:
					actualColor = 1
					break
				case 1:
					actualColor = 0
					break
			}
			const colorValue = pixels[index][actualColor]
			buf[index * 3 + actualColor] = actualColor === 0 ? colorValue * 0.5 : colorValue
		}
	}

	socket.send(buf, port, address)
}, 16)
