import { CommandHandler, runSteps } from "@atomist/skill";
import { sleep } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log("Checking long running tasks");

	return await runSteps({
		context: ctx,
		steps: [sleep],
	});
};
