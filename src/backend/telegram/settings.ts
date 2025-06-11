import { MenuTemplate } from 'grammy-inline-menu'
import { Context } from 'grammy'
import { settings } from '../../settings'
import { IMode, ISettings } from '../../typings'
import { dynamic } from '../shared'
import { updateKeyboard } from './updates'
import { logger } from '../../logger'
import { FormatStateFunction } from 'grammy-inline-menu/dist/source/buttons/select'

type IBooleanSettingsKeys = { [k in keyof ISettings]: ISettings[k] extends boolean ? k : never }[keyof ISettings]

const formatState: FormatStateFunction<Context> = (ctx, text, state) => `${state ? '✅' : '✔️'} ${text}`

export function toggleSetting(menuTemplate: MenuTemplate<Context>, title: string, key: IBooleanSettingsKeys) {
	menuTemplate.toggle(title, key, {
		formatState,
		isSet: () => settings[key] as boolean,
		set: async (ctx, val) => {
			settings[key] = val
			await ctx.answerCallbackQuery(`${title} ${val ? 'on' : 'off'}`)
			await updateKeyboard(ctx.chat!.id)
			return true
		},
	})
}

export function selectMode(menuTemplate: MenuTemplate<Context>) {
	menuTemplate.select(
		'select_mode',
		{
			[IMode.Disabled]: '❌',
			[IMode.Rainbow]: '🌈',
			[IMode.Progress]: '⏳',
			[IMode.White]: '⬜',
			[IMode.Color]: '🎨',
			[IMode.Noise]: '🌀',
			[IMode.Plasma]: '✨',
			[IMode.Breathe]: '🌪',
			[IMode.Wave]: '🌊',
			[IMode.Heartbeat]: '❤️',
			[IMode.Strobe]: '💥',
			[IMode.Pulse]: '🔆',
			[IMode.GradientPulse]: '🎇',
			[IMode.MultiPulse]: '🎆',
			[IMode.Ripple]: '💧',
			[IMode.FftRipple]: '🎶',
			[IMode.FftRandomRipple]: '🔀',
			[IMode.FftMirrorRipple]: '🔁',
		},
		{
			formatState,
			columns: 4,
			isSet: (ctx, key) => settings.mode === parseInt(key),
			set: async (ctx, key) => {
				const newMode = parseInt(key)
				if (settings.mode !== newMode) {
					dynamic.transition = { from: settings.mode, start: Date.now() }
					settings.mode = newMode
				}
				const selectedMode = IMode[settings.mode]
				logger.info('selected mode', { selectedMode, userId: ctx.chat!.id })
				await ctx.answerCallbackQuery(settings.mode ? `${selectedMode} mode` : 'off')
				await updateKeyboard(ctx.chat!.id)
				return true
			},
		}
	)
}
