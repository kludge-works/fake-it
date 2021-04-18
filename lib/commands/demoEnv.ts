import { CommandHandler, MessageOptions } from "@atomist/skill";
import * as _ from "lodash";
import { ActionsBlock, SlackMessage } from "@atomist/slack-messages";
import { ts } from "@atomist/skill/lib/slack";
import { Contextual } from "@atomist/skill/src/lib/handler";
import stringify = require("json-stable-stringify");

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const requestingUserId = _.get(ctx.message, "source.slack.user.id");
	const parentMsg = _.get(ctx.trigger.source, "slack.message.id");
	const channel = _.get(ctx.trigger.source, "slack.channel.name");

	await ctx.audit.log(`raw_message: ${raw_message}`);
	await ctx.audit.log(`requestingUserId: ${requestingUserId}`);
	await ctx.audit.log(`parentMsg: ${parentMsg}`);
	await ctx.audit.log(`channel: ${channel}`);
	await ctx.audit.log(`ctx.message: ${stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${stringify(ctx.trigger)}`);

	const msgId = ts();
	const msgOptions = {
		id: msgId.toString(),
		ts: msgId,
		// thread: parentMsg,
	} as MessageOptions;

	const response = await ctx.message.send(
		provisionDemoEnvMessage(ctx),
		{ users: [], channels: channel },
		msgOptions,
	);
	await ctx.audit.log(`response: ${stringify(response)}`);

	return {
		code: 0,
		reason: "success",
	};
};

function provisionDemoEnvMessage(ctx: Contextual<any, any>): SlackMessage {
	return {
		blocks: [
			{
				type: "header",
				text: {
					type: "plain_text",
					text: "Provision training environment",
					emoji: true,
				},
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: "*Requested by:*\n@timsparg",
					},
				],
			},
			{
				type: "section",
				fields: [
					{
						type: "mrkdwn",
						text: "*users to be notified:*",
					},
				],
				block_id: "section678",
				accessory: {
					action_id: "text1234",
					type: "multi_users_select",
					placeholder: {
						type: "plain_text",
						text: "Select users",
					},
				},
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "Pick an item from the dropdown list",
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
							},
							value: "1",
						},
						{
							text: {
								type: "plain_text",
								text: "2",
							},
							value: "21",
						},
						{
							text: {
								type: "plain_text",
								text: "3",
							},
							value: "3",
						},
						{
							text: {
								type: "plain_text",
								text: "4",
							},
							value: "4",
						},
						{
							text: {
								type: "plain_text",
								text: "5",
							},
							value: "5",
						},
					],
					action_id: "static_select-action",
				},
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "*Available date*",
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "timepicker",
						initial_time: "13:37",
						placeholder: {
							type: "plain_text",
							text: "Select time",
							emoji: true,
						},
						action_id: "actionId-0",
					},
					{
						type: "datepicker",
						initial_date: "1990-04-28",
						placeholder: {
							type: "plain_text",
							text: "Select a date",
							emoji: true,
						},
						action_id: "actionId-1",
					},
				],
			},
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: "*Decommision date*",
				},
			},
			{
				type: "actions",
				elements: [
					{
						type: "timepicker",
						initial_time: "13:37",
						placeholder: {
							type: "plain_text",
							text: "Select time",
							emoji: true,
						},
						action_id: "actionId-98",
					},
					{
						type: "datepicker",
						initial_date: "1990-04-28",
						placeholder: {
							type: "plain_text",
							text: "Select a date",
							emoji: true,
						},
						action_id: "actionId-99",
					},
				],
			},
			{
				type: "actions",
				elements: [
					{
						type: "button",
						style: "primary",
						text: {
							type: "plain_text",
							text: "Schedule provisioning",
							emoji: true,
						},
						value: "click_me_123",
						action_id: "actionId-0",
					},
				],
			} as ActionsBlock,
		],
	} as SlackMessage;
}

export function footer(ctx: Contextual<any, any>): string {
	return `${ctx.skill.namespace}/${ctx.skill.name}:${ctx.skill.version}`;
}
