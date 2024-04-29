import { ClientSuspense, Head } from 'rakkasjs'
import Debug from './Debug'

export default function HomePage() {
	return (
		<div>
			<Head title="debug"></Head>
			<ClientSuspense fallback="loading...">
				<Debug />
			</ClientSuspense>
		</div>
	)
}
