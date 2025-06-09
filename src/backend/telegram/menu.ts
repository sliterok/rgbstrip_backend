import { Context } from 'grammy'
import { MenuTemplate } from 'grammy-inline-menu'
import { dynamic } from '../shared'
import { settings } from '../../settings'
import { getIsWeekend } from '../night/static'
import { toggleSetting, selectMode } from './settings'
import { config } from '../config'

export function createMenuTemplate() {
        const menuTemplate = new MenuTemplate<Context>(() =>
                [
                        new Date().toLocaleString('en', {
                                weekday: 'long',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: false,
                        }),
                        settings.nightOverride && '🚫🌙',
                        settings.geoOverride && '🚫📍',
                        dynamic.isAway && '📵',
                        dynamic.isNight && '🌙',
                        getIsWeekend() > 1 && '📅',
                ]
                        .filter(el => el)
                        .join(' ')
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
