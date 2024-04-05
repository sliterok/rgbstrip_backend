import { ClientSuspense, Head } from 'rakkasjs'
import { lazy } from 'react'

const Color = lazy(() => import('./Color'))

export default function HomePage() {
	// console.log(window, globalThis)
	return (
		<div>
			<Head title="lights">
				<script src="https://telegram.org/js/telegram-web-app.js"></script>
			</Head>
			<Color />
		</div>
	)
}
