import { Request, Response } from 'express'
import { dynamic } from '../../../backend/shared'

const connections = new Set<Response>()

export function streamHandler(req: Request, res: Response) {
	if (process.env.NODE_ENV === 'production') {
		console.warn('debug stream connection attempt rejected on prod')
		res.end()
		return
	}
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders()

	connections.add(res)
	dynamic.hasConnections = true

	req.on('close', () => {
		connections.delete(res)
		dynamic.hasConnections = connections.size !== 0
	})
}

export function broadcastMessage(data: any) {
	for (const res of connections) {
		res.write(`data: ${data}\n\n`)
	}
}
