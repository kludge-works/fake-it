import { CommandHandler, runSteps } from "@atomist/skill";
import * as _ from "lodash";
import { slackUpdate, sleepyTask } from "../longRunningTasks";
import { info } from "@atomist/skill/lib/log";

export const handler: CommandHandler = async ctx => {
	await info("Checking long running tasks");

	const steps = [sleepyTask("task 1", 9), sleepyTask("task 2", 7)];
	const slackListener = await slackUpdate(
		ctx as any,
		steps,
		"Long task Execution",
		[_.get(ctx.trigger.source, "slack.channel.name")],
		_.get(ctx.trigger.source, "slack.message.id"),
	);

	const result = await runSteps({
		context: ctx,
		steps,
		listeners: [slackListener],
	});

	return {
		code: result.code,
		reason: result.code === 0 ? "Success" : result.reason,
	};
};
