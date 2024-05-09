import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { pixelsCount, dynamic, colors, hueToColor, normalNoise } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IArrColor, IMode } from 'src/typings'

export function startLoop() {
	setInterval(loop, 16)
}

function getCurrentMode() {
	if (dynamic.isNight && !settings.nightOverride) return IMode.Disabled
	else if (settings.away && !settings.geoOverride) return IMode.Away
	else return settings.mode
}

let colorChange = 0
const buf = new Uint8Array(pixelsCount * 3)
function loop() {
	const rawOffset = dynamic.offset + 0.006
	dynamic.offset = rawOffset % 1
	if (rawOffset >= 1) {
		colorChange += normalNoise(Date.now(), 0) * 10
		const hue = normalNoise(colorChange, 0) * 360 + normalNoise(0, Date.now()) * 360
		const newColor = hueToColor(hue)
		colors.add(newColor)
	}

	let pixels: IArrColor[] | undefined
	if (dynamic.hasConnections) {
		pixels = getPixels(IMode.Noise)
		broadcastMessage(JSON.stringify(pixels))
	}

	if (!dynamic.target) return
	if (Date.now() - (dynamic.lastMessage || 0) > 7000) {
		delete dynamic.target
		return
	}

	const mode = getCurrentMode()
	if (!pixels || mode !== IMode.Noise) pixels = getPixels(mode)

	for (let index = 0; index < pixels.length; index++) {
		for (let color = 0; color < 3; color++) {
			let actualColor = color
			// rgb strip uses g, r, b
			switch (color) {
				case 0:
					actualColor = 1
					break
				case 1:
					actualColor = 0
					break
			}

			buf[index * 3 + color] = pixels[index][actualColor]
		}
	}

	const { address, port } = dynamic.target
	socket.send(buf, port, address)
}
