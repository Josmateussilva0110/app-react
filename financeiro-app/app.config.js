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
/** Cleartext só quando a API for HTTP local (dev); produção com HTTPS fica bloqueado. */
const allowCleartextTraffic = Boolean(apiUrl && apiUrl.startsWith("http://"));

const plugins = (appJson.expo.plugins ?? []).map((plugin) => {
  if (Array.isArray(plugin) && plugin[0] === "expo-build-properties") {
    return [
      "expo-build-properties",
      {
        ...plugin[1],
        android: {
          ...plugin[1].android,
          usesCleartextTraffic: allowCleartextTraffic,
        },
      },
    ];
  }
  return plugin;
});

/** @type {import("@expo/config").ExpoConfig} */
module.exports = {
  ...appJson.expo,
  version: packageJson.version,
  android: {
    ...appJson.expo.android,
    versionCode: buildMeta.versionCode,
    usesCleartextTraffic: allowCleartextTraffic,
  },
  plugins: [...plugins, withAndroidPreferIpv4],
  extra: {
    ...appJson.expo.extra,
    appVersion: packageJson.version,
    versionCode: buildMeta.versionCode,
    apiUrl,
  },
};
