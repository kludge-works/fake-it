/*
 * Copyright © 2020 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommandHandler, slack } from "@atomist/skill";

export const handler: CommandHandler = async ctx => {
	await ctx.audit.log("Obtaining linked repository");

	await ctx.message.respond(
		slack.successMessage("Guest Speaker", "And his friend Mike", ctx),
	);

	return {
		code: 0,
		reason: "Success",
	};
};
