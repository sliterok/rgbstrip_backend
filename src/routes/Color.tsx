import { Head, useServerSideMutation } from 'rakkasjs'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useEffect } from 'react'
import { TelegramWebApps } from 'telegram-webapps-types'
import { HexColorPicker } from 'react-colorful'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import useConstant from 'use-constant'

import _ from 'lodash'

function useThrottle(cb: any, delay: number) {
	const options = { leading: true, trailing: false } // add custom lodash options
	const cbRef = useRef(cb)
	// use mutable ref to make useCallback/throttle not depend on `cb` dep
	useEffect(() => {
		cbRef.current = cb
	})
	return useCallback(
		_.throttle((...args) => cbRef.current(...args), delay, options),
		[delay]
	)
}

export default function Color() {
	const [user, setUser] = useState({})
	const [color, setColor] = useState('#aabbcc')
	// const [serverColor, setServerColor] = useState('#aabbcc')

	// Debounce the original search async function
	// const debouncedColor = (color: string) => AwesomeDebouncePromise(() => setServerColor(color), 50)
	// const debouncedColor = useConstant(() => AwesomeDebouncePromise((color: string) => setServerColor(color), 300))

	useEffect(() => {
		if (globalThis.location.hash) {
			globalThis.location.hash = ''
			location.reload()
		}
	}, [globalThis.location])

	useEffect(() => {
		const app = globalThis?.Telegram?.WebApp as TelegramWebApps.WebApp
		console.log(app)
	}, [globalThis?.Telegram])

	const mutation = useServerSideMutation(async (ctx, color: string) => {
		ctx.locals.settings.color = color
	})
	const throttledCb = useThrottle(() => mutation.mutate(color), 50)

	useEffect(throttledCb, [color])

	return (
		<div>
			<HexColorPicker color={color} onChange={setColor} style={{ width: '100%', height: '90vh' }} />
			<button onClick={() => mutation.mutate(color)} style={{ width: '100%' }}>
				set
			</button>
		</div>
	)
}
