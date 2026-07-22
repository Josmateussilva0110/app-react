const { withMainApplication } = require("expo/config-plugins");

const IPV4_PROPERTY =
  'System.setProperty("java.net.preferIPv4Stack", "true")';

function withAndroidPreferIpv4(config) {
  return withMainApplication(config, (modConfig) => {
    let contents = modConfig.modResults.contents;

    if (contents.includes("preferIPv4Stack")) {
      return modConfig;
    }

    if (contents.includes("override fun onCreate()")) {
      contents = contents.replace(
        /override fun onCreate\(\)\s*\{/,
        `override fun onCreate() {\n    ${IPV4_PROPERTY}`
      );
    } else if (contents.includes("public void onCreate()")) {
      contents = contents.replace(
        /public void onCreate\(\)\s*\{/,
        `public void onCreate() {\n    ${IPV4_PROPERTY};`
      );
    }

    modConfig.modResults.contents = contents;
    return modConfig;
  });
}

module.exports = withAndroidPreferIpv4;
