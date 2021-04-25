import { CommandHandler, MessageOptions } from "@atomist/skill";
import * as _ from "lodash";

import { ts } from "@atomist/skill/lib/slack";
import stringify = require("json-stable-stringify");
import { info } from "@atomist/skill/lib/log";
import { ActionTypes, CardFactory } from "botbuilder";

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const requestingUserId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	// const response = _.get(ctx.message, "request.parameters") as Array<{
	// 	name: string;
	// 	value: string;
	// }>;

	await info(`raw_message: ${raw_message}`);
	await info(`requestingUserId: ${requestingUserId}`);
	await info(`parentMsg: ${parentMsg}`);
	await info(`channel: ${channel}`);
	await info(`ctx.message: ${stringify(ctx.message)}`);
	await info(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await info(`ctx.trigger: ${stringify(ctx.trigger)}`);
	// await info(`request.parameters: ${stringify(response)}`);
	await info(`ctx: ${stringify(ctx)}`);

	const msgId = ts();
	const msgOptions = {
		id: msgId.toString(),
		ts: msgId,
		// thread: parentMsg,
	} as MessageOptions;

	const response = await ctx.message.send(
		await sendIntroCard(),
		{ users: [], channels: channel },
		msgOptions,
	);
	await info(`response: ${stringify(response)}`);

	return {
		code: 0,
		reason: "success",
	};
};

async function sendIntroCard(): Promise<any> {
	return CardFactory.heroCard(
		"Welcome to Bot Framework!",
		"Welcome to Welcome Users bot sample! This Introduction card is a great way to introduce your Bot to the user and suggest some things to get them started. We use this opportunity to recommend a few next steps for learning more creating and deploying bots.",
		["https://aka.ms/bf-welcome-card-image"],
		[
			{
				title: "Get an overview",
				type: ActionTypes.OpenUrl,
				value:
					"https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0",
			},
			{
				title: "Ask a question",
				type: ActionTypes.OpenUrl,
				value:
					"https://stackoverflow.com/questions/tagged/botframework",
			},
			{
				title: "Learn how to deploy",
				type: ActionTypes.OpenUrl,
				value:
					"https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0",
			},
		],
	);
}
