import { createActionsPlugin } from "@ubiquity-os/plugin-sdk";
import { LogLevel } from "@ubiquity-os/ubiquity-os-logger";
import { plugin } from "./plugin";
import { SupportedEvents } from "./types/context";
import { Env, envSchema } from "./types/env";
import { PluginSettings, pluginSettingsSchema } from "./types/plugin-input";

createActionsPlugin<PluginSettings, Env, null, SupportedEvents>(
  (context) => {
    return plugin(context);
  },
  {
    envSchema: envSchema,
    postCommentOnError: true,
    settingsSchema: pluginSettingsSchema,
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? "info",
    kernelPublicKey: process.env.KERNEL_PUBLIC_KEY,
  }
).catch(console.error);
