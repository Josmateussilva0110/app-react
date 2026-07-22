const { loadAppEnv } = require("./scripts/load-app-env");

loadAppEnv(__dirname);

const fs = require("fs");
const path = require("path");
const appJson = require("./app.json");
const packageJson = require("./package.json");
const withAndroidPreferIpv4 = require("./plugins/with-android-prefer-ipv4");

const versionFile = path.join(__dirname, "version.build.json");
const buildMeta = fs.existsSync(versionFile)
  ? JSON.parse(fs.readFileSync(versionFile, "utf8"))
  : { versionCode: 1 };

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

/** @type {import("@expo/config").ExpoConfig} */
module.exports = {
  ...appJson.expo,
  version: packageJson.version,
  android: {
    ...appJson.expo.android,
    versionCode: buildMeta.versionCode,
  },
  plugins: [...(appJson.expo.plugins ?? []), withAndroidPreferIpv4],
  extra: {
    ...appJson.expo.extra,
    appVersion: packageJson.version,
    versionCode: buildMeta.versionCode,
    apiUrl,
  },
};
