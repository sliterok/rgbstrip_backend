import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker } from 'react-colorful'
import { settings } from '../settings'
import { IArrColor } from 'src/typings'
import classes from './container.module.css'
import { isVerifiedUser } from 'src/backend/telegram/verify'
import { useEffect } from 'react'
import { urlParseHashParams } from 'src/backend/telegram/decode'

let lastTimestamp: number
let tgWebAppData: string

export default function Color() {
	useEffect(() => {
		const initData = urlParseHashParams(location.hash)
		tgWebAppData = initData.tgWebAppData!
	}, [])

	const mutation = useServerSideMutation(async (ctx, color: IArrColor) => {
		if (!tgWebAppData) return
		const verified = isVerifiedUser(tgWebAppData)
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
