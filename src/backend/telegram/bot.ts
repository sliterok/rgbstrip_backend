import { Bot, CommandContext, Context, GrammyError, NextFunction } from 'grammy'
import { settings } from '../../settings'
import { MenuTemplate, MenuMiddleware } from 'grammy-inline-menu'
import { config } from '../config'
import { IMode, ISettings } from 'src/typings'
import { InlineKeyboardButton, Message } from 'grammy/types'
import { TextBody } from 'grammy-inline-menu/dist/source/body'
import { dynamic } from '../shared'
import { getIsWeekend } from '../night/static'
import Cryptr from 'cryptr'
import { addDeeplinkUser, deeplinkUsers } from './deeplink'

const allowedTelegramUsers = new Set([...config.tgAllowedUsers.split(',').map(el => parseInt(el)), deeplinkUsers])
const cryptr = new Cryptr(config.tgAllowedUsers, { encoding: 'base64', saltLength: 1, pbkdf2Iterations: 10 })

const bot = new Bot(config.tgApiKey)

const formatBool = (val: boolean, text: string) => val && text

const menuTemplate = new MenuTemplate<Context>(() =>
	[
		new Date().toLocaleString('en', { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: false }),
		formatBool(dynamic.isAway, 'away'),
		formatBool(dynamic.isNight, 'night'),
		formatBool(getIsWeekend() > 0, 'weekend'),
	]
		.filter(el => el)
		.join('\n')
)

type IBooleanSettingsKeys = { [k in keyof ISettings]: ISettings[k] extends boolean ? k : never }[keyof ISettings]

const toggleTemplate = (title: string, key: IBooleanSettingsKeys) =>
	menuTemplate.toggle(title, key, {
		formatState: (ctx, text, state) => `${state ? '✅ ' : ''}${text}`,
		isSet: () => settings[key] as boolean,
		set: async (ctx, val) => {
			settings[key] = val
			await ctx.answerCallbackQuery(`${title} ${val ? 'on' : 'off'}`)
			await updateKeyboard(ctx.chat!.id)

			return true
		},
	})

toggleTemplate('Night override', 'nightOverride')
toggleTemplate('GEO override', 'geoOverride')
toggleTemplate('Mix color with noise', 'mixColorWithNoise')

menuTemplate.select(
	'select_mode',
	{
		[IMode.Disabled]: 'off',
		[IMode.Rainbow]: 'rainbow',
		[IMode.Progress]: 'progress',
		[IMode.White]: 'white',
		[IMode.Noise]: 'noise',
		[IMode.Color]: 'color',
	},
	{
		columns: 2,
		isSet: (ctx, key) => settings.mode === parseInt(key),
		set: async (ctx, key) => {
			settings.mode = parseInt(key)
			const selectedMode = IMode[settings.mode]
			// eslint-disable-next-line no-console
			console.log('selected mode:', selectedMode)
			await ctx.answerCallbackQuery(settings.mode ? `${selectedMode} mode` : 'off')
			await updateKeyboard(ctx.chat!.id)

			return true
		},
	}
)

menuTemplate.manual({
	web_app: {
		url: config.externalUrl,
	},
	text: 'select color',
})

const menuMiddleware = new MenuMiddleware('/', menuTemplate)

interface IUserData {
	ctx: CommandContext<Context>
	menu: Message.TextMessage
}

const userData: Map<number, IUserData> = new Map()

bot.command('start', async ctx => {
	let deeplinked = false
	if (ctx.match) {
		try {
			const username = cryptr.decrypt(ctx.match)
			if (ctx.from?.username?.slice(0, 15) === username) {
				allowedTelegramUsers.add(ctx.from.id)
				await addDeeplinkUser(ctx.from.id)
				deeplinked = true
			}
		} catch (error) {
			return console.error(error)
		}
	}

	if (deeplinked || allowedTelegramUsers.has(ctx.chat.id)) {
		const user = userData.get(ctx.chat.id)
		await ctx.deleteMessages([ctx.message?.message_id, user?.menu?.message_id].filter(el => el) as number[])
		userData.set(ctx.chat.id, { ctx, menu: (await menuMiddleware.replyToContext(ctx!)) as Message.TextMessage })
	} else {
		await ctx.react('👎')
	}
})

bot.use(async (ctx: Context, next: NextFunction) => {
	if (!ctx.chat || !allowedTelegramUsers.has(ctx.chat.id)) {
		if (ctx.callbackQuery) await ctx.answerCallbackQuery('Unauthorized')
	} else {
		userData.set(ctx.chat.id, {
			ctx: ctx as CommandContext<Context>,
			menu: ctx.callbackQuery?.message as Message.TextMessage,
		})
		await next()
	}
})

bot.use(menuMiddleware)

bot.hears(/https:\/\/t.me\/(.+)/, async ctx => {
	const [, username] = ctx.match
	await ctx.reply(`[control lights](https://t.me/${ctx.me.username}?start=${cryptr.encrypt(username.slice(0, 15))})`, { parse_mode: 'MarkdownV2' })
})

export async function updateKeyboard(except?: number) {
	for (const [userId, { ctx: lastContext, menu: lastMenu }] of userData.entries()) {
		if (userId === except) continue

		const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
		try {
			await bot.api.editMessageReplyMarkup(lastMenu.chat.id, lastMenu.message_id, {
				reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
			})
		} catch (error) {
			if (
				'description' in (error as any) &&
				!(error as GrammyError).description.endsWith('are exactly the same as a current content and reply markup of the message')
			)
				console.error(error)
		}
	}
}

export async function updateMessage(except?: number) {
	for (const [userId, { ctx: lastContext, menu: lastMenu }] of userData.entries()) {
		if (userId === except) continue

		const body = await menuTemplate.renderBody(lastContext, '/')
		const text = typeof body === 'string' ? body : (body as TextBody).text
		const keyboard = await menuTemplate.renderKeyboard(lastContext, '/')
		try {
			await bot.api.editMessageText(lastMenu.chat.id, lastMenu.message_id, text, {
				reply_markup: { inline_keyboard: keyboard as InlineKeyboardButton[][] },
			})
		} catch (error) {
			if (
				'description' in (error as any) &&
				!(error as GrammyError).description.endsWith('are exactly the same as a current content and reply markup of the message')
			)
				console.error(error)
		}
	}
}

export function startTelegram() {
	if (import.meta.env.PROD) {
		bot.start().catch(err => console.error(err))
	}
}
