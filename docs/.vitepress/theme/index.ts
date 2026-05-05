import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "./custom.css";

import VideoPlaceholder from "./components/VideoPlaceholder.vue";
import AsciinemaPlaceholder from "./components/AsciinemaPlaceholder.vue";
import RunRecords from "./components/RunRecords.vue";
import LatestRunsSummary from "./components/LatestRunsSummary.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VideoPlaceholder", VideoPlaceholder);
    app.component("AsciinemaPlaceholder", AsciinemaPlaceholder);
    app.component("RunRecords", RunRecords);
    app.component("LatestRunsSummary", LatestRunsSummary);
  },
} satisfies Theme;
