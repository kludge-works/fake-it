import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { info } from "@atomist/skill/lib/log";
import stringify = require("json-stable-stringify");

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const requestingUserId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const response = _.get(ctx.message, "request.parameters") as Array<{
		name: string;
		value: string;
	}>;

	await info(`raw_message: ${raw_message}`);
	await info(`requestingUserId: ${requestingUserId}`);
	await info(`parentMsg: ${parentMsg}`);
	await info(`channel: ${channel}`);
	await info(`ctx.message: ${stringify(ctx.message)}`);
	await info(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await info(`ctx.trigger: ${stringify(ctx.trigger)}`);
	await info(`request.parameters: ${stringify(response)}`);

	await ctx.message.respond(
		slack.infoMessage(
			"Here's some ideas",
			`@atomist show error
			@atomist show info
			@atomist show question
			@atomist show success
			@atomist show warning`,
			ctx,
		),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
