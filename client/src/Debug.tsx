import React from 'react'
import { useEffect, useRef, useState } from 'react'
import classes from './pixel.module.css'
import { IArrColor } from '../../src/typings'

let eventSource: EventSource

export default function Debug() {
	eventSource = eventSource ?? new EventSource('/debug/stream')

	const [readyState, setReadyState] = useState(eventSource.readyState)
	const pixelsRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		eventSource.onopen = () => setReadyState(eventSource.readyState)
		eventSource.onerror = () => setReadyState(eventSource.readyState)
		eventSource.onmessage = event => {
			const pixels = JSON.parse(event.data) as IArrColor[]
			for (const i in pixels) {
				const [r, g, b] = pixels[i]
				const el = pixelsRef.current?.children[Number(i)]
				el?.setAttribute('style', `background: rgb(${r}, ${g}, ${b})`)
			}
		}
	}, [])

	return (
		<div>
			<p>Status: {readyState ? 'Connected' : 'Connecting...'}</p>
			<div ref={pixelsRef} style={{ display: 'flex' }}>
				{Array(288)
					.fill(0)
					.map((_, i) => (
						<div key={i} className={classes.pixel}></div>
					))}
			</div>
		</div>
	)
}
