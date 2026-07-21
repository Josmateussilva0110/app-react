import * as Application from "expo-application";
import Constants from "expo-constants";

export function getAppVersionLabel(): string {
  const version =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    "—";

  const build = Application.nativeBuildVersion;

  if (build) {
    return `Versão ${version} (build ${build})`;
  }

  if (__DEV__) {
    return `Versão ${version} (dev)`;
  }

  return `Versão ${version}`;
}
