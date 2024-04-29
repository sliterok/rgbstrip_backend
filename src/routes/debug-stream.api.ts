import { serverSentEvents, ServerSentEventSink } from '@hattip/response'

const connections = new Set<ServerSentEventSink>()

export function get() {
	let thisSink: ServerSentEventSink

	return serverSentEvents({
		onOpen(sink) {
			thisSink = sink
			connections.add(sink)
			sink.ping()
		},
		onClose() {
			connections.delete(thisSink)
		},
	})
}

export function broadcastMessage(data: any) {
	for (const sink of connections) {
		sink.send({ data })
	}
}
