import { HandlerStatus } from "@atomist/skill";
import { createContext } from "@atomist/skill/lib/context";
import * as assert from "power-assert";
import { handler } from "../lib/commands/runLongRunningTasks";

describe("event", function () {
	this.timeout(20000);
	it("run skill", async () => {
		const payload = {
			skill: {
				id: "d8041b4e-d5cd-4b2d-bd32-65182feff655",
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
						url:
							"gs://anamrmopn-workspace-storage/skills/ANAMRMOPN/kludge-works/fake-it/184e15e3d09844e70cdbc8a516358d9ac0f40578.zip",
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
											id:
												"7B86FA25-249B-4730-A471-9AC7FA3F0BC5",
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
					value:
						"eyJhbGciOiJSUzI1NiIsImtpZCI6ImdpdGh1Ym9hdXRocmVkaXJlY3QifQ.eyJjbG0iOlsic2VjcmV0czpyZWFkOkFOQU1STU9QTiIsImRhdGE6KjpBTkFNUk1PUE4iLCJhdXRvbWF0aW9uczoqOkFOQU1STU9QTiJdLCJsb2MiOiJhdG9taXN0LnBvY2h0YS50b2tlbnM6MjEiLCJ0eXAiOiJCZWFyZXIiLCJpc3MiOiJodHRwczovL2FwaS5hdG9taXN0LmNvbSIsImlkIjoiYWI2YmMxMjEtZTVhMi00ZDgyLTkzZGYtNTI0ZDNlYWU0OThkIiwiZXhwIjoxNjA0NTE4ODQzLCJpYXQiOjE2MDQ1MTUyNDN9.osLiNkJ1hjSt6WSanY3tKagfcbOfq7uT-zZ9KIhnhJY4XhH9cRdWqQUs_JZncjlHDz7o__FiZK9zNbGJ6zadKssIVJ8_XLeARugGeHHPGZZcgfK9trdwdDWDg0Pkt43Dzu1oR-S4lBb4oRBO080nCSKU3G6xDQKgwhFxNW8VyN9wnRnzYY_DgPXWys7VZa4qJsExyOrpdZHMFNWAyS_VsxZux6tn8ddyVgoDJLI7N_LVojFBptk7klW6U7Xg3rfMksiicDbXHEoMEYx_B7N0XD_E-59M0lPNaS_w0gc9ClJwbirFLs7AYU_OABUlC632rZ-h8mc1IrkKcUU3RJRMfQ",
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
									id: "7B86FA25-249B-4730-A471-9AC7FA3F0BC5",
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
						id: "T0193TRLXSQ",
						name: "kludge-works",
					},
					channel: {
						id: "C01CH6MDZ7H",
						name: "fake-it",
						type: "channel",
					},
					user: {
						id: "U018XUBKWAF",
						name: "timothy.sparg",
					},
					thread_ts: null,
					message: {
						ts: "1604515242.002300",
						id: "1604515242.002300",
						url:
							"https://X.slack.com/archives/C01CH6MDZ7H/1604515242.002300",
					},
				},
			},
			atomist_type: "command_handler_request",
			correlation_id:
				"60f5999b-bc43-4431-9867-d814052949e7.IugdyNI4yOdxzsQzblMJe",
			team: {
				id: "ANAMRMOPN",
				name: "kludge-works",
			},
			automation: {
				name: "kludge-works/fake-it-skill",
				version: "0.1.0-31-d8041b4e-d5cd-4b2d-bd32-65182feff655",
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
		ctx.audit.log = function (msg: string) {
			console.info(msg);
			return Promise.resolve();
		};
		const result: HandlerStatus = (await handler(ctx as any)) as any;
		assert.strictEqual(result.code, 0);
	});
});
