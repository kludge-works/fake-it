import { HandlerStatus } from "@atomist/skill";
import { createContext } from "@atomist/skill/lib/context";
import * as assert from "power-assert";
import { handler } from "../lib/commands/runLongRunningTasks";

describe.skip("event", function () {
	this.timeout(20000);
	it("run skill", async () => {
		const payload = {
			skill: {
				id: "skill.id",
				name: "fake-it-skill",
				namespace: "kludge-works",
				version: "0.1.0-31",
				dispatchStyle: "multiple",
				platform: "gcf",
				artifacts: [
					{
						__typename: "AtomistSkillGCFArtifact",
						name: "gcf",
						entryPoint: "entryPoint",
						memory: 512,
						runtime: "nodejs12",
						timeout: 540,
						url: "gs://fake-it-workspace-storage/skills/fake-it/kludge-works/fake-it/184e15e3d09844e70cdbc8a516358d9ac0f40578.zip",
					},
				],
				configuration: {
					repository: {
						commitSha: "eab72a589de6e1d47e81d80cb91881d7da09edf8",
					},
					instances: [
						{
							name: "fake_it",
							resourceProviders: [
								{
									name: "chat",
									typeName: "ChatProvider",
									selectedResourceProviders: [
										{
											id: "selected-resource-provider-id",
										},
									],
								},
							],
							parameters: [
								{
									name: "schedule",
									value: {
										cronExpression: "15 * * * *",
										timeZone: null,
									},
								},
							],
						},
					],
				},
			},
			mapped_parameters: [],
			secrets: [
				{
					uri: "atomist://api-key",
					value: "atomist.api.key",
				},
			],
			configurations: [
				{
					name: "fake_it",
					resourceProviders: [
						{
							name: "chat",
							typeName: "ChatProvider",
							selectedResourceProviders: [
								{
									id: "selected-resource-provider-id",
								},
							],
						},
					],
					parameters: [
						{
							name: "schedule",
							value: {
								cronExpression: "15 * * * *",
								timeZone: null,
							},
						},
					],
				},
			],
			command: "runLongRunningTasks",
			source: {
				user_agent: "slack",
				slack: {
					team: {
						id: "team.id",
						name: "kludge-works",
					},
					channel: {
						id: "channel.id",
						name: "fake-it",
						type: "channel",
					},
					user: {
						id: "user.id",
						name: "timothy.sparg",
					},
					thread_ts: null,
					message: {
						ts: "message.id",
						id: "message.id",
						url: "https://X.slack.com/archives/channel.id/message.id",
					},
				},
			},
			atomist_type: "command_handler_request",
			correlation_id: "correlation.id",
			team: {
				id: "fake-it",
				name: "kludge-works",
			},
			automation: {
				name: "kludge-works/fake-it-skill",
				version: "0.1.0-31-skill.id",
			},
			api_version: "1",
			parameters: [],
			handler: {
				name: "runLongRunningTasks",
				intent: ["^long tasks.*$"],
				description: "some long running tasks",
			},
			raw_message: "long tasks",
		};

		const ctx = createContext(payload as any, {} as any);
		// info = function (msg: string) {
		// 	console.info(msg);
		// 	return Promise.resolve();
		// };
		const result: HandlerStatus = (await handler(ctx as any)) as any;
		assert.strictEqual(result.code, 0);
	});
});
