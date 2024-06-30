import { settings } from 'src/settings'
import { IMode } from 'src/typings'
import { updateKeyboard, updateMessage } from '../telegram/bot'
import { CronJob } from 'cron'
import { config } from '../config'
import { dynamic } from '../shared'
import { getCurrentTime, getTargetTime, nightUpdateTimes, TargetTimes, updateDisabledColor } from './static'

export function updateNightStatus(time = getCurrentTime()) {
	const targetSleepTime = getTargetTime(TargetTimes.sleep)
	const targetWakeupTime = getTargetTime(TargetTimes.wakeUp)
	if (time >= targetSleepTime) dynamic.isNight = true
	else if (time < targetWakeupTime) dynamic.isNight = true
	else {
		dynamic.isNight = false
		if (settings.nightOverride !== false) {
			settings.nightOverride = false
			updateKeyboard()
		}
	}

	updateMessage()

	if (dynamic.isNight || settings.mode === IMode.Disabled) updateDisabledColor(time, targetSleepTime)
}

export function startNightChecks() {
	updateNightStatus()
	for (const { minutes, hours, time } of nightUpdateTimes) {
		CronJob.from({
			cronTime: `${minutes} ${hours} * * *`,
			onTick: () => updateNightStatus(time),
			start: true,
			timeZone: config.TZ,
		})
	}
}
