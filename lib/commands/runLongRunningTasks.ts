// import { CommandHandler, runSteps } from "@atomist/skill";
// import { slackUpdate, sleep, sleep2 } from "../longRunningTasks";
import * as _ from "lodash";
import { CommandHandler } from "@atomist/skill";

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log("Checking long running tasks");

	// const steps = [sleep("long task 1", 180), sleep2];
	// const slackListener = await slackUpdate(
	// 	ctx as any,
	// 	steps,
	// 	"Long task Execution",
	// 	[_.get(ctx.trigger.source, "slack.channel.name")],
	// );
	//
	// const result = await runSteps({
	// 	context: ctx,
	// 	steps,
	// 	listeners: [slackListener],
	// });

	// return {
	// 	code: result.code,
	// 	reason: result.code === 0 ? "Success" : result.reason,
	// };

	return {
		code: 0,
		reason: "success",
	};
};
