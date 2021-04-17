import { CommandHandler, slack } from "@atomist/skill";
import * as _ from "lodash";
import { bold, emoji, user } from "@atomist/slack-messages";

export const handler: CommandHandler = async ctx => {
	const raw_message = _.get(ctx.message, "request.raw_message");
	const userId = _.get(ctx.message, "source.user.id");

	await ctx.audit.log(`ctx.message: ${JSON.stringify(ctx.message)}`);
	await ctx.audit.log(`ctx.parameters: ${JSON.stringify(ctx.parameters)}`);
	await ctx.audit.log(`ctx.trigger: ${JSON.stringify(ctx.trigger)}`);

	const {
		groups: { ipAddress },
	} = /^allow (jenkins|nexus) access for (?<ipAddress>.*)$/.exec(raw_message);
	await ctx.audit.log(`ipAddress: ${ipAddress}`);

	if ("127.0.0.1" === ipAddress) {
		await ctx.message.respond(
			slack.errorMessage("Theres no place like", bold("no"), ctx),
		);
	} else {
		await ctx.message.respond(
			slack.questionMessage(
				"hmm I don't know you",
				`${user("U018XUBKWAF")} can I give ${user(
					"userId",
				)} firewall access?`,
				ctx,
			),
		);
	}

	return {
		code: 0,
		reason: "Success",
	};
};
