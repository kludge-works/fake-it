import { CommandHandler, slack } from "@atomist/skill";

export const handler: CommandHandler = async ctx => {
	await ctx.message.respond(
		slack.successMessage("Guest Speaker", "And his friend Mike", ctx),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
