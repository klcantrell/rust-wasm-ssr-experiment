import App from "../generated/AppDom";
import type { AppProps } from "./AppProps";

const hydrationData =
  window.__HYDRATION_DATA__ !== undefined
    ? (JSON.parse(window.__HYDRATION_DATA__) as AppProps)
    : undefined;

const app = new App({
  props: { message: hydrationData?.message ?? "Missing __HYDRATION_DATA__" },
  target: document.getElementById("island")!,
  hydrate: true,
});

export default app;
