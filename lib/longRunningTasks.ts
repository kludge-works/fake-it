import { CommandContext, Step } from "@atomist/skill";

export function sleep(
	stepName: string,
	sleepTime: number,
): Step<CommandContext> {
	return {
		name: stepName,
		run: async (ctx, params) => {
			await ctx.audit.log(`stepname: ${stepName}`);
			await ctx.audit.log(`sleepTime: ${sleepTime}`);
			await new Promise(r => setTimeout(r, sleepTime));
			return {
				code: 0,
				reason: "Success",
			};
		},
	};
}
