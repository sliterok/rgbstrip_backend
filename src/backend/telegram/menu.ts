import { Context } from 'grammy'
import { MenuTemplate } from 'grammy-inline-menu'
import { dynamic } from '../shared'
import { settings } from '../../settings'
import { getIsWeekend } from '../night/static'
import { toggleSetting, selectMode } from './settings'
import { updateKeyboard } from './updates'
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
			settings.nightOverride && '🌚',
			settings.geoOverride && '🗺️',
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
	toggleSetting(menuTemplate, 'Music reactive', 'music')

	selectMode(menuTemplate)

	menuTemplate.interact('-', 'spd_dec', {
		do: async ctx => {
			const step = Math.max(0.1, settings.effectSpeed * 0.2)
			settings.effectSpeed = Math.max(0.1, Math.round((settings.effectSpeed - step) * 10) / 10)
			await ctx.answerCallbackQuery(`${Math.round(settings.effectSpeed * 100)}%`)
			await updateKeyboard(ctx.chat!.id)
			return true
		},
	})
	menuTemplate.interact(() => `${Math.round(settings.effectSpeed * 100)}%`, 'spd_res', {
		joinLastRow: true,
		do: async ctx => {
			settings.effectSpeed = 1
			await ctx.answerCallbackQuery('reset to 100%')
			await updateKeyboard(ctx.chat!.id)
			return true
		},
	})
	menuTemplate.interact('+', 'spd_inc', {
		joinLastRow: true,
		do: async ctx => {
			const step = Math.max(0.1, settings.effectSpeed * 0.2)
			settings.effectSpeed = Math.min(5, Math.round((settings.effectSpeed + step) * 10) / 10)
			await ctx.answerCallbackQuery(`${Math.round(settings.effectSpeed * 100)}%`)
			await updateKeyboard(ctx.chat!.id)
			return true
		},
	})

	menuTemplate.manual({
		web_app: {
			url: config.externalUrl,
		},
		text: 'select color',
	})

	return menuTemplate
}
