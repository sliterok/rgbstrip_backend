import { ClientSuspense, Head } from 'rakkasjs'
import { lazy } from 'react'

const Color = lazy(() => import('./Color'))

export default function HomePage() {
	// console.log(window, globalThis)
	return (
		<div>
			<Head title="lights" />
			<ClientSuspense fallback="loading...">
				<Color />
			</ClientSuspense>
		</div>
	)
}
