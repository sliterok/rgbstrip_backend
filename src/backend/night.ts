import { dynamic } from './shared'
import { CronJob } from 'cron'
import { config } from './config'

interface ICronTime {
	minutes: number
	hours: number
	time: number
}

const nightUpdateTimes: ICronTime[] = []

function getTime(hours: number, minutes: number, store = false) {
	const time = hours + minutes / 60
	if (store) nightUpdateTimes.push({ minutes, hours, time })
	return time
}

const preWakeupTime = getTime(7, 30, true)
const wakeupTime = getTime(8, 50, true)
const sleepTime = getTime(23, 30, true)
const wakeupTimeWeekend = getTime(10, 0, true)
const sleepTimeWeekend = getTime(23, 58, true)

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

function updateNightStatus(time = getCurrentTime()) {
	const targetSleepTime = getTargetTime(TargetTimes.sleep)
	const targetWakeupTime = getTargetTime(TargetTimes.wakeUp)
	if (time >= targetSleepTime) dynamic.isNight = true
	else if (time <= targetWakeupTime) dynamic.isNight = true
	else {
		dynamic.isNight = false
		return
	}

	updateDisabledColor(time, targetWakeupTime)
}

function updateDisabledColor(time: number, targetWakeupTime: number) {
	if (time >= preWakeupTime && time <= targetWakeupTime) {
		if (dynamic.disabledColor[1] !== 1) dynamic.disabledColor = [0, 1, 0]
	} else {
		if (dynamic.disabledColor[2] !== 1) dynamic.disabledColor = [0, 0, 1]
	}
}

enum TargetTimes {
	sleep,
	wakeUp,
}

enum WekeendDay {
	workday,
	friday,
	saturday,
	sunday,
}

function getTargetTime(target: TargetTimes): number {
	const isWeekend = getIsWeekend()
	if (target === TargetTimes.wakeUp) {
		return isWeekend !== WekeendDay.friday ? wakeupTimeWeekend : wakeupTime
	} else if (target === TargetTimes.sleep) {
		return isWeekend !== WekeendDay.sunday ? sleepTimeWeekend : sleepTime
	}
	throw Error(`unexpected target: ${target} in getTargetTime`)
}

const weekends = new Map([
	[5, WekeendDay.friday],
	[6, WekeendDay.saturday],
	[0, WekeendDay.sunday],
])

function getIsWeekend() {
	const d = new Date()
	const day = d.getDay()
	const isWeekend = weekends.get(day)
	return isWeekend || WekeendDay.workday
}

function getCurrentTime() {
	const d = new Date()
	const time = getTime(d.getHours(), d.getMinutes())

	return time
}
