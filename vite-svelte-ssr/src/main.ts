import App from "./App.svelte";

import "./app.css";

const app = new App({
  props: {
    message: "Hello world!",
  },
  target: document.getElementById("app")!,
});

export default app;
