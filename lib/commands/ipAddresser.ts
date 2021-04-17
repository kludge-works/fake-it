import { CommandHandler, slack } from "@atomist/skill";
import _ = require("lodash");

export const handler: CommandHandler = async ctx => {
	const parameters = _.get(ctx.message, "request.parameters");
	await ctx.audit.log(JSON.stringify(parameters));

	await ctx.message.respond(
		slack.questionMessage("hmm that seems bothersome", "some text", ctx),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
