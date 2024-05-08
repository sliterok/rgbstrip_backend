import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker } from 'react-colorful'
import { settings } from '../settings'
import { IArrColor } from 'src/typings'
import classes from './container.module.css'
import { isVerifiedUser } from 'src/backend/telegram/verify'
import { useEffect, useRef } from 'react'
import { urlParseHashParams } from 'src/backend/telegram/decode'

let lastTimestamp: number

export default function Color() {
	const tgWebAppData = useRef<string | null>(null)
	useEffect(() => {
		const initData = urlParseHashParams(location.hash)
		tgWebAppData.current = initData.tgWebAppData
	}, [])

	const mutation = useServerSideMutation(async (ctx, color: IArrColor) => {
		if (!tgWebAppData.current) return
		const verified = isVerifiedUser(tgWebAppData.current)
		if (verified) settings.color = color
	})

	return (
		<div className={classes.container}>
			<RgbColorPicker
				onChange={({ r, g, b }) =>
					requestAnimationFrame(timestamp => {
						if (lastTimestamp === timestamp) return
						lastTimestamp = timestamp
						mutation.mutate([r, g, b])
					})
				}
				style={{ width: '95vw', height: '95vh' }}
			/>
		</div>
	)
}
