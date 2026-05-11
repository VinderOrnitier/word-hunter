import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  moduleNameMapper: {
    "\\.(css|woff2?)$": "<rootDir>/tests/style-mock.ts",
    "^@testing-library/preact$":
      "<rootDir>/node_modules/@testing-library/preact/dist/cjs/index.js",
    "^@testing-library/preact/pure$":
      "<rootDir>/node_modules/@testing-library/preact/dist/cjs/pure.js",
  },
};

export default config;
