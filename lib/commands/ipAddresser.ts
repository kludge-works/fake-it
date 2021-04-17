import { CommandHandler, slack } from "@atomist/skill";
import _ = require("lodash");

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log(`ctx.message: ${JSON.stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${JSON.stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${JSON.stringify(ctx.trigger)}`);
	await ctx.message.respond(
		slack.questionMessage("hmm that seems bothersome", "some text", ctx),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
