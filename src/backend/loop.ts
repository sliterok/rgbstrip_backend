import { broadcastMessage } from 'src/routes/debug/stream.api'
import { getPixels } from './pattern'
import { dynamic, batchSize, frameInterval } from './shared'
import { socket } from './udp'
import { settings } from 'src/settings'
import { IArrColor, IMode } from 'src/typings'

export function startLoop() {
	setInterval(loop, frameInterval * batchSize)
}

async function loop() {
	const maybePixels = debugBroadcastPixels()
	sendPixels(maybePixels)
}

function debugBroadcastPixels() {
	if (!dynamic.hasConnections) return

	const pixels = getPixels(IMode.Noise)
	for (const packet of pixels) {
		broadcastMessage(JSON.stringify(packet))
	}
	return pixels
}

async function sendPixels(pixels?: IArrColor[][]) {
	if (!dynamic.target) return

	if (Date.now() - dynamic.lastMessage > 7000) {
		delete dynamic.target
		return
	}

	if (!pixels || settings.mode !== IMode.Noise) pixels = getPixels(settings.mode)

	for (const packet of pixels) {
		const colorBuffer = new Uint8Array(packet.length * 3)
		packet.forEach((color, index) => colorBuffer.set(convertColor(color), index * 3))
		await sendPacket(colorBuffer)
	}
}

function sendPacket(buffer: Uint8Array) {
	return new Promise<number>((res, rej) =>
		socket.send(buffer, dynamic.target!.port, dynamic.target!.address, (err, bytes) => (err ? rej(err) : res(bytes)))
	)
}

function convertColor(color: IArrColor): Uint8Array {
	const [r, g, b] = color
	return new Uint8Array([g, r, b])
}
