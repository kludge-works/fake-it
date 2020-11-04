import { HandlerStatus } from "@atomist/skill";
import { createContext } from "@atomist/skill/lib/context";
import * as assert from "power-assert";

describe("event", () => {
	it("run skill", async () => {
		const payload = {
			skill: {
				namespace: "atomist",
				name: "docker-build-skill",
				artifacts: [
					{
						__typename: "AtomistSkillDockerArtifact",
						name: "kaniko",
						args: [
							"--context=dir:///atm/home",
							"--destination=gcr.io/atomist-container-registry/watchtower:7bf855f9fa609bd55b4a62828925b47b4aba1771",
							"--dockerfile=docker/Dockerfile.gcr",
							"--cache=true",
							"--cache-repo=gcr.io/atomist-container-registry/watchtower-cache",
							"--label=org.label-schema.schema-version='1.0'",
							"--label=org.label-schema.name='watchtower'",
							"--label=org.label-schema.vendor='atomisthq'",
							"--label=org.label-schema.vcs-url='git@github.com::atomisthq/watchtower.git'",
							"--label=org.label-schema.vcs-ref='7bf855f9fa609bd55b4a62828925b47b4aba1771'",
							"--label=org.label-schema.build-date='2020-11-03T09:19:04-06:00'",
							"--force",
							"--build-arg=MVN_ARTIFACTORYMAVENREPOSITORY_USER",
							"--build-arg=MVN_ARTIFACTORYMAVENREPOSITORY_PWD",
						],
						command: null,
						env: [
							{
								name: "DOCKER_CONFIG",
								value: "/atm/input/.docker/",
							},
						],
						image: "gcr.io/kaniko-project/executor:v1.2.0",
						resources: {
							request: { memory: 5000, cpu: 2 },
							limit: { memory: 5000, cpu: 2 },
						},
					},
					{
						__typename: "AtomistSkillDockerArtifact",
						name: "image-link",
						args: ["/sdm/bin/start.js", "image-link"],
						command: null,
						env: [
							{
								name: "DOCKER_BUILD_IMAGE_NAME",
								value:
									"gcr.io/atomist-container-registry/watchtower:7bf855f9fa609bd55b4a62828925b47b4aba1771",
							},
							{
								name: "DOCKER_PROVIDER_ID",
								value:
									"T095SFFBK_9402c1b7-0d96-435b-b776-50d5f64c21a7",
							},
							{
								name: "DOCKER_FILE",
								value: "docker/Dockerfile.gcr",
							},
						],
						image:
							"gcr.io/atomist-container-skills/docker-build-skill:54815bec635ba23f8c6d99eb6ddbe7cd22a5d06c",
						resources: {
							request: { memory: 1000, cpu: 0.5 },
							limit: { memory: 1000, cpu: 0.5 },
						},
					},
				],
				platform: "docker",
				id: "a7e6c582-e43f-4067-ad1b-eaff09832724",
				version: "1.4.1",
				configuration: {
					name: "clojure services",
					resourceProviders: [
						{
							name: "github",
							typeName: "GitHubAppResourceProvider",
							selectedResourceProviders: [
								{
									id:
										"T095SFFBK_1e54dda3-d438-43b3-a5ed-fce0a125ea69",
								},
							],
						},
						{
							name: "docker_push_registry",
							typeName: "DockerRegistry",
							selectedResourceProviders: [
								{
									id:
										"T095SFFBK_9402c1b7-0d96-435b-b776-50d5f64c21a7",
								},
							],
						},
						{
							name: "secret",
							typeName: "SecretProvider",
							selectedResourceProviders: [
								{
									id:
										"T095SFFBK_bb05931f-5f04-4a6f-8e84-924c62d7ecd7",
								},
								{
									id:
										"T095SFFBK_d60bb941-0218-4f3f-bf4c-a99a7f47663e",
								},
							],
						},
					],
					parameters: [
						{
							name: "env_map",
							value:
								'[{"name":"MVN_ARTIFACTORYMAVENREPOSITORY_PWD","secret":"T095SFFBK_bb05931f-5f04-4a6f-8e84-924c62d7ecd7"}, {"name":"MVN_ARTIFACTORYMAVENREPOSITORY_USER","secret":"T095SFFBK_d60bb941-0218-4f3f-bf4c-a99a7f47663e"}]',
						},
						{
							name: "docker_env",
							value: [
								"MVN_ARTIFACTORYMAVENREPOSITORY_USER=clojure-build",
							],
						},
						{ name: "subscription_filter", value: "buildOnPush" },
						{ name: "tag", value: "${data.Push[0].after.sha}" },
						{ name: "dockerfile", value: "docker/Dockerfile.gcr" },
						{ name: "githubCheck", value: false },
						{
							name: "docker_args",
							value: [
								"--build-arg=MVN_ARTIFACTORYMAVENREPOSITORY_USER",
								"--build-arg=MVN_ARTIFACTORYMAVENREPOSITORY_PWD",
							],
						},
						{ name: "cache", value: true },
						{
							name: "repos",
							value: {
								includes: [
									{
										providerId:
											"T095SFFBK_1e54dda3-d438-43b3-a5ed-fce0a125ea69",
										ownerId:
											"T095SFFBK_atomisthq_T095SFFBK",
										repoIds: [
											"T095SFFBK_T095SFFBK_atomisthq_53470328",
											"T095SFFBK_T095SFFBK_atomisthq_169367291",
											"T095SFFBK_T095SFFBK_atomisthq_89430687",
											"T095SFFBK_T095SFFBK_atomisthq_64720075",
											"T095SFFBK_T095SFFBK_atomisthq_294165571",
											"T095SFFBK_T095SFFBK_atomisthq_110566386",
											"T095SFFBK_T095SFFBK_atomisthq_188203675",
											"T095SFFBK_T095SFFBK_atomisthq_233254470",
											"T095SFFBK_T095SFFBK_atomisthq_232122595",
											"T095SFFBK_T095SFFBK_atomisthq_73134670",
											"T095SFFBK_T095SFFBK_atomisthq_45527399",
											"T095SFFBK_T095SFFBK_atomisthq_227081363",
											"T095SFFBK_T095SFFBK_atomisthq_84632002",
											"T095SFFBK_T095SFFBK_atomisthq_202336920",
											"T095SFFBK_T095SFFBK_atomisthq_112724561",
											"T095SFFBK_T095SFFBK_atomisthq_175009646",
											"T095SFFBK_T095SFFBK_atomisthq_226893454",
											"T095SFFBK_T095SFFBK_atomisthq_145649914",
											"T095SFFBK_T095SFFBK_atomisthq_178830393",
											"T095SFFBK_T095SFFBK_atomisthq_188243037",
											"T095SFFBK_T095SFFBK_atomisthq_50709474",
											"T095SFFBK_T095SFFBK_atomisthq_247765832",
											"T095SFFBK_T095SFFBK_atomisthq_190714888",
										],
									},
								],
								excludes: null,
							},
						},
					],
				},
			},
			secrets: [
				{
					uri: "atomist://api-key",
					value:
						"4********************************************************************************0",
				},
			],
			type: "graphql_subscription_result",
			correlation_id:
				"487fad7e-c333-4202-9f4c-8bb86f7609b9.oIYnlTQ8rCUStxoxBeXmw",
			log_url:
				"h*********************************************************************************************w",
			extensions: {
				operationName: "buildOnPush",
				query_id: "81e23b4d-92f2-4e8f-bd2a-c5db36acb07a",
				team_id: "T095SFFBK",
				team_name: "atomist (prod)",
				correlation_id:
					"487fad7e-c333-4202-9f4c-8bb86f7609b9.oIYnlTQ8rCUStxoxBeXmw",
				log_url:
					"h*********************************************************************************************w",
			},
			team_id: "T095SFFBK",
			subscription: { name: "buildOnPush" },
			data: {
				Push: [
					{
						after: {
							sha: "7bf855f9fa609bd55b4a62828925b47b4aba1771",
							timestamp: "2020-11-03T09:19:04-06:00",
							url:
								"h*************************************************************************************1",
						},
						branch: "master",
						repo: {
							channels: [
								{
									name: "watchtower",
									team: { id: "T095SFFBK" },
								},
							],
							name: "watchtower",
							org: {
								provider: {
									apiUrl: "h*********************/",
									gitUrl: "g*************:",
								},
							},
							owner: "atomisthq",
							url: "h*************************************r",
						},
					},
				],
			},
		};

		const ctx = createContext(payload as any, {} as any);
		const result: HandlerStatus = (await handler(ctx as any)) as any;
		assert.strictEqual(result.code, 1);
	});
});
