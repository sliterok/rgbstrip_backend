import { MenuTemplate } from 'grammy-inline-menu'
import { Context } from 'grammy'
import { settings } from '../../settings'
import { IMode, ISettings } from '../../typings'
import { updateKeyboard } from './updates'
import { dynamic } from '../shared'
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
		},
		{
			formatState,
			columns: 3,
			isSet: (ctx, key) => settings.mode === parseInt(key),
			set: async (ctx, key) => {
				settings.mode = parseInt(key)
				if (settings.mode === IMode.Breathe) dynamic.breatheOffset = Math.random() * 12_000
				const selectedMode = IMode[settings.mode]
				// eslint-disable-next-line no-console
				console.log('selected mode:', selectedMode)
				await ctx.answerCallbackQuery(settings.mode ? `${selectedMode} mode` : 'off')
				await updateKeyboard(ctx.chat!.id)
				return true
			},
		}
	)
}
