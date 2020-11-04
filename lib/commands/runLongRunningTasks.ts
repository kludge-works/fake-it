import { CommandHandler, runSteps } from "@atomist/skill";
import * as _ from "lodash";
import { slackUpdate, sleep2 } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log("Checking long running tasks");
	await ctx.audit.log(JSON.stringify(ctx));

	const steps = [sleep2];
	const slackListener = await slackUpdate(
		ctx as any,
		steps,
		"Long task Execution",
		[_.get(ctx.trigger.source, "slack.channel.name")],
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
