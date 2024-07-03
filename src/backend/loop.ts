import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { dynamic, batchSize, frameInterval } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IArrColor } from 'src/typings'

export function startLoop() {
	setInterval(loop, frameInterval * batchSize)
}

async function loop() {
	if (!dynamic.hasConnections && !dynamic.target) return

	const packets = getPixels(settings.mode)
	for (const packet of packets) {
		if (dynamic.hasConnections) broadcastMessage(JSON.stringify(packet))
		if (dynamic.target) await sendPacket(packet)
	}
}

async function sendPacket(pixels: IArrColor[]) {
	const buffer = new Uint8Array(pixels.length * 3)
	pixels.forEach(([r, g, b], index) => buffer.set([g, r, b], index * 3))

	try {
		await socket.send(buffer, dynamic.target!.port, dynamic.target!.address)
	} catch (err) {
		console.error('Error sending packet:', err)
	}
}
