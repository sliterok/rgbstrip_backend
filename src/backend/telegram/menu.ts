import { Context } from 'grammy'
import { MenuTemplate } from 'grammy-inline-menu'
import { dynamic } from '../shared'
import { getIsWeekend } from '../night/static'
import { toggleSetting, selectMode } from './settings'
import { config } from '../config'

export function createMenuTemplate() {
	const menuTemplate = new MenuTemplate<Context>(() =>
		[
			new Date().toLocaleString('en', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: false }),
			dynamic.isAway && 'away',
			dynamic.isNight && 'night',
			getIsWeekend() > 1 && 'weekend',
		]
			.filter(el => el)
			.join('\n')
	)

	toggleSetting(menuTemplate, 'Night override', 'nightOverride')
	toggleSetting(menuTemplate, 'GEO override', 'geoOverride')
	toggleSetting(menuTemplate, 'Mix color with noise', 'mixColorWithNoise')

	selectMode(menuTemplate)

	menuTemplate.manual({
		web_app: {
			url: config.externalUrl,
		},
		text: 'select color',
	})

	return menuTemplate
}
