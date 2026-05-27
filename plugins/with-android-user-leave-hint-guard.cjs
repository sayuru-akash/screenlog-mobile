const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withAndroidUserLeaveHintGuard(config) {
  return withMainActivity(config, (currentConfig) => {
    const mainActivity = currentConfig.modResults;
    if (mainActivity.language !== "kt") return currentConfig;
    if (mainActivity.contents.includes("override fun onUserLeaveHint()")) {
      return currentConfig;
    }

    const marker = "\n  /**\n    * Align the back button behavior";
    const guard = `
  override fun onUserLeaveHint() {
      try {
          super.onUserLeaveHint()
      } catch (_: NullPointerException) {
          // React Native can fire this before its delegate exists during background transitions.
      }
  }
`;

    if (mainActivity.contents.includes(marker)) {
      mainActivity.contents = mainActivity.contents.replace(
        marker,
        `${guard}${marker}`,
      );
    }

    return currentConfig;
  });
};
