import { CommandContext, Step } from "@atomist/skill";

export const sleep: Step<CommandContext> = {
	name: "sleep for 20 seconds",
	run: async (ctx, params) => {
		await new Promise(r => setTimeout(r, 20000));
		return {
			code: 0,
			reason: "Success",
		};
	},
};
