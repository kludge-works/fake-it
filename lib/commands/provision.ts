import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { HeaderBlock, SectionBlock } from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";

export const handler: CommandHandler = async ctx => {
	const channel = _.get(ctx.trigger.source, "slack.channel.name");

	const msgId = ts();

	await ctx.message.send(
		buildMessage(),
		{ users: [], channels: channel },
		{ id: msgId.toString(), ts: msgId },
	);

	return {
		code: 0,
		reason: "Success",
	};
};

function buildMessage(): slack.SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Provision training environment",
				},
			} as HeaderBlock,
			{
				type: "divider",
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "People Responsible",
				},
				accessory: {
					type: "multi_users_select",
					placeholder: {
						type: "plain_text",
						text: "Select a user",
						emoji: true,
					},
					action_id: "users_select-action",
				},
			} as SectionBlock,
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Number of machines",
				},
				accessory: {
					type: "static_select",
					placeholder: {
						type: "plain_text",
						text: "Select an item",
						emoji: true,
					},
					options: [
						{
							text: {
								type: "plain_text",
								text: "1",
								emoji: true,
							},
							value: "1",
						},
						{
							text: {
								type: "plain_text",
								text: "2",
								emoji: true,
							},
							value: "2",
						},
						{
							text: {
								type: "plain_text",
								text: "3",
								emoji: true,
							},
							value: "3",
						},
					],
					action_id: "static_select-action",
				},
			} as SectionBlock,
		],
	};
}
