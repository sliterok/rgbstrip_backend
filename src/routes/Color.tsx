import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker, RgbaColorPicker } from 'react-colorful'
import { settings } from '../settings'
import { IArrColor } from 'src/typings'
import classes from './container.module.css'
import { isVerifiedUser } from 'src/backend/telegram/verify'
import { useEffect, useRef } from 'react'
import { urlParseHashParams } from 'src/backend/telegram/decode'

let lastTimestamp: number

export default function Color() {
	const tgWebAppDataRef = useRef<string | null>(null)

	useEffect(() => {
		const initData = urlParseHashParams(location.hash)
		tgWebAppDataRef.current = initData.tgWebAppData
	}, [])

	const mutation = useServerSideMutation(async (ctx, [color, alpha, tgWebAppData]: [IArrColor, number, string]) => {
		if (!tgWebAppData) return
		const verified = isVerifiedUser(tgWebAppData)
		if (!verified) return
		settings.color = color
		settings.mixRatio = alpha
	})

	return (
		<div className={classes.container}>
			<RgbaColorPicker
				onChange={({ r, g, b, a }) =>
					requestAnimationFrame(timestamp => {
						if (lastTimestamp === timestamp) return
						lastTimestamp = timestamp
						const tgWebAppData = tgWebAppDataRef.current
						if (tgWebAppData) mutation.mutate([[r, g, b], a, tgWebAppData])
					})
				}
				style={{ width: '95vw', height: '95vh' }}
			/>
		</div>
	)
}
