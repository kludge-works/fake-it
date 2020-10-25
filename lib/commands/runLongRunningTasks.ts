import { CommandHandler, runSteps } from "@atomist/skill";
import { sleep, sleep2 } from "../longRunningTasks";

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log("Checking long running tasks");

	return await runSteps({
		context: ctx,
		// steps: [
		// 	sleep("long task 1", 35),
		// 	sleep("long task 2", 15),
		// 	sleep("long task 3", 5),
		// ],
		steps: [sleep("long task 1", 35), sleep2],
	});
};
