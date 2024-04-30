/* eslint-disable ssr-friendly/no-dom-globals-in-react-fc */
import { Head } from 'rakkasjs'
import { useEffect, useRef, useState } from 'react'
import classes from './pixel.module.css'

let eventSource: EventSource
// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
if (typeof window !== 'undefined') window.addEventListener('unload', () => eventSource.close())

export default function Debug() {
	eventSource = eventSource ?? new EventSource('/debug/stream')

	const [readyState, setReadyState] = useState(eventSource.readyState)
	const pixelsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		eventSource.onopen = () => {
			setReadyState(eventSource.readyState)
		}

		eventSource.onerror = () => {
			setReadyState(eventSource.readyState)
		}

		eventSource.onmessage = event => {
			const pixels = JSON.parse(event.data) as [number, number, number][]
			for (const i in pixels) {
				const [r, g, b] = pixels[i]
				const el = pixelsRef.current?.children[i]
				el?.setAttribute('style', `background: rgb(${r}, ${g}, ${b})`)
			}
		}
	}, [])

	// console.log(window, globalThis)
	return (
		<div>
			<p>Status: {readyState ? 'Connected' : 'Connecting...'}</p>
			<div ref={pixelsRef} style={{ display: 'flex' }}>
				{Array(288)
					.fill(0)
					.map((el, i) => (
						<div key={i} data-index={i} className={classes.pixel}></div>
					))}
			</div>
			<Head title="debug"></Head>
		</div>
	)
}
