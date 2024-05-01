import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { pixelsCount, dynamic, colors, randomColor } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IMode } from 'src/typings'

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
	const rawOffset = dynamic.offset + 0.004
	dynamic.offset = rawOffset % 1
	if (rawOffset >= 1) colors.add(randomColor((colorChange += 7 / 3), Math.random() * 5))

	if (dynamic.hasConnections) broadcastMessage(JSON.stringify(getPixels(5)))

	if (!dynamic.target) return
	if (Date.now() - (dynamic.lastMessage || 0) > 7000) {
		delete dynamic.target
		return
	}

	const mode = getCurrentMode()
	const pixels = getPixels(mode)

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

			const colorValue = pixels[index][actualColor]

			let overrideColor
			switch (color) {
				case 0:
					overrideColor = Math.ceil(colorValue * 0.65)
					break
				case 2:
					overrideColor = Math.ceil(colorValue * 0.75)
					break
			}
			buf[index * 3 + color] = overrideColor || colorValue
		}
	}

	const { address, port } = dynamic.target
	socket.send(buf, port, address)
}
