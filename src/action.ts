import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import { validateAndDecodeSchemas } from "./helpers/validator";
import { plugin } from "./plugin";
import { PluginInputs } from "./types";

/**
 * How a GitHub action executes the plugin.
 */
export async function run() {
  const payload = github.context.payload.inputs;

  payload.env = { ...(payload.env || {}), workflowName: github.context.workflow };
  const { decodedSettings, decodedEnv } = validateAndDecodeSchemas(payload.env, JSON.parse(payload.settings));
  const inputs: PluginInputs = {
    stateId: payload.stateId,
    eventName: payload.eventName,
    eventPayload: JSON.parse(payload.eventPayload),
    settings: decodedSettings,
    authToken: payload.authToken,
    ref: payload.ref,
  };

  await plugin(inputs, decodedEnv);

  return returnDataToKernel(process.env.GITHUB_TOKEN, inputs.stateId, {});
}

export async function returnDataToKernel(repoToken: string, stateId: string, output: object, eventType = "return-data-to-ubiquity-os-kernel") {
  const octokit = new Octokit({ auth: repoToken });
  return octokit.repos.createDispatchEvent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    event_type: eventType,
    client_payload: {
      state_id: stateId,
      output: JSON.stringify(output),
    },
  });
}
