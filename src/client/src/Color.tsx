import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { RgbaColor, RgbaColorPicker } from 'react-colorful'
import classes from './container.module.css'
import { urlParseHashParams } from '../../server/telegram/decode'

let lastTimestamp: number

export default function Color() {
	const tgWebAppDataRef = useRef<string | null>(null)
	const [color, setColor] = useState<RgbaColor>({ r: 255, g: 0, b: 255, a: 0 })

	useEffect(() => {
		const initData = urlParseHashParams(location.hash)
		tgWebAppDataRef.current = initData.tgWebAppData
		fetch('/api/default-color')
			.then(res => res.json())
			.then(data => setColor(data))
	}, [])

	const sendColor = (c: RgbaColor) => {
		const tgWebAppData = tgWebAppDataRef.current
		if (!tgWebAppData) return
		fetch('/api/color', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ color: [c.r, c.g, c.b], alpha: c.a, tgWebAppData }),
		})
	}

	return (
		<div className={classes.container}>
			<RgbaColorPicker
				color={color}
				onChange={({ r, g, b, a }) => {
					setColor({ r, g, b, a })
					requestAnimationFrame(timestamp => {
						if (lastTimestamp === timestamp) return
						lastTimestamp = timestamp
						sendColor({ r, g, b, a })
					})
				}}
				style={{ width: '95vw', height: '95vh' }}
			/>
		</div>
	)
}
