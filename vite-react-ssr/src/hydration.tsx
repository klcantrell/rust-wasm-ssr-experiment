import ReactDOM from "react-dom/client";

import App, { AppProps } from "./App.tsx";

const hydrationData =
  window.__HYDRATION_DATA__ !== undefined
    ? (JSON.parse(window.__HYDRATION_DATA__) as AppProps)
    : undefined;

ReactDOM.hydrateRoot(
  document.getElementById("react-app")!,
  <App message={hydrationData?.message ?? "Missing __HYDRATION_DATA__"} />
);
