process.env.TZ = '***REMOVED***'
import datagram from 'dgram'
const socket = datagram.createSocket('udp4')
import { initTg } from './grammy'
import { createNoise2D } from 'simplex-noise'
import chroma from 'chroma-js'
import NanoTimer from 'nanotimer'
const timer = new NanoTimer()
import { settings } from '../settings'
import Color from 'colorjs.io'
import RingBufferPkg from 'ring-buffer-ts'
const { RingBuffer } = RingBufferPkg
import CubicBezier from '@thednp/bezier-easing'
import { broadcastMessage } from '../routes/debug-stream.api'

const bezier = new CubicBezier(0.25, 0.1, 0.25, 1.0)

function getTime(hours, minutes) {
	return hours + ( minutes / 60)
}

const preWakeupTime = getTime(7, 30);
const wakeupTime = getTime(8, 50);
const sleepTime = getTime(23, 30)
const wakeupTimeWeekend = getTime(10, 0);
const sleepTimeWeekend = getTime(23, 58)

function getTargetTime() {
	const d = new Date()
	const time = getTime(d.getHours(), d.getMinutes())
	const day = d.getDay()

	const isWeekend = [6, 7].includes(day)

	if(time >= (isWeekend ? sleepTimeWeekend : sleepTime)) return true
	else if (time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) return true

	// const date = new Date()
	// const dayOfWeek = date.getDay()
	// const isWorkday = ![6, 7].includes(dayOfWeek)

	// if (isWorkday) {
	// 	const time = getTime(date)
	// 	if (time < 5.5) return true
	// 	else if (time > 8 + 50 / 60) return false
	// }

	// const timeDiff = date.getTime() - settings.alive
	// if (timeDiff > 9 * 60 * 60 * 1000) return false
	// else if (timeDiff > 10 * 60 * 1000) return true

	// return false

	// const d = new Date()
	// const day = d.getDay()

	// if (time < 5 + 30 / 60) return true

	// if (![6, 7].includes(day)) {
	// 	if (time > 23 + 30 / 60) return true
	// 	// if (time < 8 + 50 / 60) return true
	// }

	// const aliveTime = getTime(settings.alive)
	// if (time > aliveTime + 10 / 60) return false
	// if (time < (aliveTime + 9) % 24) return false

	// return true
}

function getCurrentMode() {
	if (getTargetTime() && !settings.nightOverride) return 0
	// if ((time > 23.5 || time < 8 + 50 / 60) && !settings.nightOverride) return 0 // mode 0 at night
	else if (settings.away && !settings.geoOverride) return 4 // when away
	else return settings.mode
}

const HSLToRGB = (h, s, l) => {
	s /= 100
	l /= 100
	const k = n => (n + h / 30) % 12
	const a = s * Math.min(l, 1 - l)
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
	return [255 * f(0), 255 * f(8), 255 * f(4)]
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
}

function sphericalToCartesian(theta, phi, r = 1) {
	let x = Math.sin(phi) * Math.cos(theta)
	let y = Math.sin(phi) * Math.sin(theta)
	let z = Math.cos(phi)
	const mult = 255 * r //255 / Math.max(x, y, z)
	return [x * mult, y * mult, z * mult].map(el => Math.min(255, el))
}

const clamp = (min, num, max) => Math.min(Math.max(num, min), max)

let colorChange = 0
let offset = 0
let exec = 0
const activeColors = 5
const colorNoise = createNoise2D()
const randomColor = (...seed) => new Color('hsl', [((colorNoise(...seed) + 1) * 1000) % 360, 100, 50])
const colors = new RingBuffer(activeColors + 1)
for (let i = 0; i <= activeColors; i++) colors.add(randomColor(Math.random() * 10, 0))
const pixelsCount = 288
const phiNoise = createNoise2D()

function gradientNoise(x, y, mult = 1) {
	// A small positive number for finite difference approximation
	const h = 0.01
	const n = (x, y) => (colorNoise(x, y) + 1) / 2
	// Calculate the finite differences along x and y axes
	const dx = (n(x + h, y) - n(x - h, y)) / (2 * h)
	const dy = (n(x, y + h) - n(x, y - h)) / (2 * h)
	const magnitude = Math.sqrt(dx * dx + dy * dy)
	return [(dx * mult) / magnitude, (dy * mult) / magnitude]
}

let disabledColor = [0,0,1]

function getPixels(mode, frameIndex) {
	const pixels = Array(pixelsCount)
		.fill([0, 0, 0])
		.map((_, index) => {
			if (mode === 0) {
				if(index % 1000 === 0) {
					const d = new Date()
					const day = d.getDay()
					const isWeekend = [6, 7].includes(day)
					const time = getTime(d.getHours(), d.getMinutes())
					if(time >= preWakeupTime && time <= (isWeekend ? wakeupTimeWeekend : wakeupTime)) {
						if(disabledColor[1] !== 1) disabledColor = [0, 1, 0]
					} else {
						if(disabledColor[2] !== 1) disabledColor = [0, 0, 1]
					}
				}
				// const currentTime = getTime(new Date())//, true)
				// const targetTime = getTargetTime()
				// const mult = targetTime / pixelsCount
				// const progress = currentTime / mult

				// let brightness = 1
				// const hourLength = Math.floor(pixelsCount / 9)
				// if (index % hourLength === 0) brightness = 0

				// const color = progress > index ? 2 : 1
				// const ret = new Array(3).fill(0)
				// ret[color] = brightness

				// const progress = settings.alive + 1000 * 60 * 60 * 8.5
				return disabledColor
			} else if (mode === 1) {
				const color = (frameIndex + index) % 360
				// return chroma(color, 150, 100, 'hsl').rgb()
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

				if (Date.now() - lastUpdate > 300000 && progress / total < 0.95) {
					color = 0
				}

				return HSLToRGB(color, saturation, lightness)
				// return chroma(color, saturation, lightness, 'hsv').rgb()
			} else if (mode === 3) {
				return [255, 255, 255]
			} else if (mode === 4) {
				return [5, 20, 5]
			} else if (mode === 5) {
				// const param = frameIndex / 300 + index / pixelsCount
				// const [x, y] = gradientNoise(param, param)

				// const x = index / 80 + frameIndex / 200
				// const y = frameIndex / 300
				const x = index / 80 + frameIndex / 200
				const y = frameIndex / 300
				// const x = index / pixelsCount
				// const y = frameIndex / 400

				// (colorNoise(x, y) + 1) / 2
				const baseOffset = ((colorNoise(x, y) + 1) / 2 + index / pixelsCount) % 1
				const segmentWidth = 1 / (activeColors - 2)
				const i = baseOffset + (offset + 1) * segmentWidth
				const segmentIndex = Math.floor(i / segmentWidth)
				const segmentFraction = bezier((i % segmentWidth) / segmentWidth)
				const colorStart = colors.get(segmentIndex)
				const colorEnd = colors.get(segmentIndex + 1)

				const mixed = colorStart.mix(colorEnd, segmentFraction, { space: 'lab', outputSpace: 'lab' }).to('srgb')
				
				return mixed.coords.map(el => Math.min(255, Math.max(0, Math.floor(el * 255))))

				// return HSLToRGB(h, 100, 50)
				// const g = colorNoise(index + frameIndex, 1) * 255
				// const b = colorNoise(index + frameIndex, 2) * 255
				// return [r, g, b]
				return c.to('srgb').coords.map(el => el * 255)
			} else if (mode === 6) {
				// console.log('color: ', settings.color)
				return hexToRgb(settings.color)
			}
		})

	return pixels
}

import { phoneLastSeen } from './routerIntegration'
let seenTimeout
async function updatePhoneLastSeen() {
	const lastSeen = await phoneLastSeen()
	console.log({ lastSeen })
	if (lastSeen === undefined || lastSeen > 120) {
		if(!seenTimeout) seenTimeout = setTimeout(() => (settings.away = true), 120000)
	}
	else {
		clearTimeout(seenTimeout)
		seenTimeout = null;
		settings.away = false
	}
}
setInterval(updatePhoneLastSeen, 120000)
updatePhoneLastSeen()

socket.on('error', e => console.error(e))

try {
	socket.bind(8008, '0.0.0.0', e => {
		console.log('bind to 8008: ', e)
		initTg()
	})
} catch (err) {
	console.error(err)
}
let lastMessage
let target

socket.on('message', (msg, newTarget) => {
	const { address, port } = newTarget
	lastMessage = Date.now()
	// console.log(`last ping: ${new Date(lastMessage).toLocaleString('ru-Ru')} from ${address}:${port}\r`)
	target = newTarget
})

// let lastSent = 0
const buf = new Uint8Array(pixelsCount * 3)
setInterval(
	() => {
		exec++
		const rawOffset = offset + 0.004
		offset = rawOffset % 1
		if (rawOffset >= 1) colors.add(randomColor((colorChange += 7 / 3), Math.random() * 5))
		// colors.toArray().forEach(el => (el.hwb.h += 0.1))
		if (!target) {
			const mode = 5
			const pixels = getPixels(mode, exec)
			return broadcastMessage(JSON.stringify(pixels))
		}
		if (Date.now() - lastMessage > 7000) {
			target = null
			console.log({ target })
			return
		}
		const { address, port } = target

		const mode = getCurrentMode()
		// const now = new Date()
		// const time = getTime(now)
		// const day = now.getDay()

		let pixels = getPixels(mode, exec)
		// if (![6, 7].includes(day) && mode !== 0) {
		// 	const diff = 8 + 50 / 60 - time
		// 	if (diff > 0) {
		// 		const mult = clamp(0.1, 1 - diff * 5, 1)
		// 		pixels = pixels.map(([r, g, b]) => [Math.floor(r * mult), Math.floor(g * mult), Math.floor(b * mult)])
		// 	}
		// }
		for (let index = 0; index < pixels.length; index++) {
			for (let color = 0; color < 3; color++) {
				let actualColor = color
				switch (color) {
					case 0:
						actualColor = 1
						break;
					case 1:
						actualColor = 0
						break;
				}
				const colorValue = pixels[index][actualColor]
				buf[index * 3 + actualColor] = actualColor === 0 ? colorValue * 0.5 : colorValue
			}
		}

		socket.send(buf, port, address)
		// lastSent = now
	},
	16
)
