import { useServerSideMutation } from 'rakkasjs'
import { RgbColorPicker } from 'react-colorful'
import { settings } from '../settings'
import { IArrColor } from 'src/typings'
import classes from './container.module.css'
import { urlParseHashParams, getVerifiedUser } from 'src/backend/telegram/helpers'
import { allowedTelegramUsers } from 'src/backend/telegram'
import { useEffect } from 'react'

let lastTimestamp: number
let tgWebAppData: string

export default function Color() {
	useEffect(() => {
		const initData = urlParseHashParams(location.hash)
		tgWebAppData = initData.tgWebAppData!
	}, [])

	const mutation = useServerSideMutation(async (ctx, color: IArrColor) => {
		if (!tgWebAppData) return
		const user = getVerifiedUser(tgWebAppData)
		if (allowedTelegramUsers.has(user?.id || 0)) settings.color = color
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
