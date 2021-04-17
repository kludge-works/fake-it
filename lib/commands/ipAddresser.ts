import { CommandHandler, slack } from "@atomist/skill";

export const handler: CommandHandler = async ctx => {
	await ctx.message.respond(
		slack.questionMessage("hmm that seems bothersome", "some text", ctx),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
