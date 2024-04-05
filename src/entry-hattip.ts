import { createRequestHandler } from 'rakkasjs'
import { IMode, ISettings } from './typings'
// import {} from 'rakkasjs'
import './entry-hattip.d'
import './backend/startStrip.js'

export const settings: ISettings = {
	mode: IMode.Disabled,
	color: '#ff00ff',
	progress: { current: 0, total: 0, lastUpdate: null },
	nightOverride: false,
	geoOverride: false,
	away: false,
	alive: new Date(),
}

export default createRequestHandler({
	middleware: {
		beforePages: [
			async ctx => {
				ctx.locals.settings = settings
			},
		],
		beforeApiRoutes: [
			ctx => {
				// console.log('bbb',ctx.hooks)
			},
		],
	},

	createPageHooks(reqCtx) {
		return {
			async extendPageContext(pageCtx) {},
		}
	},
})
