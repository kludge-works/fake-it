import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");
	const msgId = _.get(ctx.trigger.source, "slack.message.id");
	const msg = slack.progressMessage(
		"A progess message",
		"Some progress",
		{
			state: "requested",
			total: 1,
			count: 1,
		},
		ctx,
	);
	await ctx.message.send(msg, { channels: channel, users: [] }, { msgId });

	return {
		code: 0,
		reason: "Success",
	};
};
