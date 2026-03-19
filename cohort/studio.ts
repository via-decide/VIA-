const HELP_TEXT = `Usage: ts-node --esm studio.ts <command> [manifest-path]\n\nCommands:\n  validate  Validate production.json inputs and manifest structure\n  info      Probe media files and print the execution plan\n  dry       Print the ffmpeg commands without running them\n  trim      Export trimmed source clips into renders/trimmed\n  merge     Render the final composition into renders/`;

type CommandModule = {
  runValidateCommand?: (manifestPath?: string) => Promise<void>;
  runInfoCommand?: (manifestPath?: string) => Promise<void>;
  runDryCommand?: (manifestPath?: string) => Promise<void>;
  runTrimCommand?: (manifestPath?: string) => Promise<void>;
  runMergeCommand?: (manifestPath?: string) => Promise<void>;
};

const COMMANDS: Record<string, { importer: () => Promise<CommandModule>; runner: keyof CommandModule }> = {
  validate: {
    importer: () => import("./src/commands/validate.ts"),
    runner: "runValidateCommand",
  },
  info: {
    importer: () => import("./src/commands/info.ts"),
    runner: "runInfoCommand",
  },
  dry: {
    importer: () => import("./src/commands/dry.ts"),
    runner: "runDryCommand",
  },
  trim: {
    importer: () => import("./src/commands/trim.ts"),
    runner: "runTrimCommand",
  },
  merge: {
    importer: () => import("./src/commands/merge.ts"),
    runner: "runMergeCommand",
  },
};

const main = async (): Promise<void> => {
  const command = process.argv[2];
  const manifestPath = process.argv[3];

  if (!command || !(command in COMMANDS)) {
    console.error(`Unknown or missing command: ${command ?? "<none>"}`);
    console.error(HELP_TEXT);
    process.exitCode = 1;
    return;
  }

  const definition = COMMANDS[command];
  const module = await definition.importer();
  const run = module[definition.runner];

  if (typeof run !== "function") {
    throw new Error(`Command module for "${command}" is missing ${String(definition.runner)}`);
  }

  await run(manifestPath);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
