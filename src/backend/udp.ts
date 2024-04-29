import datagram from 'dgram'
import { dynamic } from './shared'

export const socket = datagram.createSocket('udp4')
socket.on('error', e => console.error(e))

export function startUdpServer() {
	try {
		socket.bind(8008, '0.0.0.0', () => {
			// eslint-disable-next-line no-console
			console.log('up on 8008')
		})
	} catch (err) {
		console.error(err)
	}
}

socket.on('message', (msg, newTarget) => {
	dynamic.lastMessage = Date.now()
	dynamic.target = newTarget
})
