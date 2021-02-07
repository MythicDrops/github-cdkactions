import { Job, Stack, Workflow } from "cdkactions";
import dedent from "ts-dedent";

import { GradleLibraryConfig } from "./types";

export const createGradleLibraryPullRequestWorkflow = (
  stack: Stack,
  config?: GradleLibraryConfig
): Workflow => {
  const workflow = new Workflow(stack, "pull-request", {
    name: "Pull Request",
    on: {
      pullRequest: { branches: ["main"] },
      push: { branchesIgnore: ["main"] },
    },
  });

  const gradleVersion = config?.gradleVersion ?? "6.8.2";
  const preTestSteps = config?.preTestSteps ?? [];

  new Job(workflow, "pull-request", {
    name: "CI",
    runsOn: "ubuntu-latest",
    steps: [
      {
        name: "Check-out Code",
        uses: "actions/checkout@v2",
        with: { "fetch-depth": 0 },
      },
      {
        name: "Set up JDK",
        uses: "actions/setup-java@v1",
        with: { "java-version": "1.8" },
      },
      {
        name: "Make Gradle Wrapper Executable",
        run: dedent`chmod +x ./gradlew`,
      },
      {
        name: "Set Gradle Version",
        run: dedent`./gradlew wrapper --gradle-version ${gradleVersion}`,
      },
      ...preTestSteps, // expand preTestSteps
      {
        name: "Test Library with Gradle",
        run: dedent`./gradlew check`,
      },
    ],
  });
  return workflow;
};
