import http from "k6/http";
import { browser } from "k6/experimental/browser";
import { check } from "k6";

export const options = {
  scenarios: {
    browser: {
      executor: "ramping-vus",
      exec: "browserTest",
      startVUs: 0,
      stages: [
        { duration: "5s", target: 10 },
        { duration: "1m20s", target: 10 },
      ],
      gracefulRampDown: '0s',
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
    data: {
      startVUs: 0,
      stages: [
        { duration: "5s", target: 200 },
        { duration: "1m20s", target: 200 },
      ],
      gracefulRampDown: '0s',
      executor: "ramping-vus",
      exec: "dataTest",
    },
  },
};

export async function browserTest() {
  const page = browser.newPage();

  try {
    await page.goto("http://localhost:3000/");

    check(page, {
      "h2 has rendered":
        (p) => p.locator("h2").textContent() ===
        "Hello from Rust! This string needs to be the same during hydration.",
    });
  } finally {
    page.close();
  }
}

export function dataTest() {
  const response = http.get("http://localhost:3000/");
  check(response, {
    "h2 has rendered": (r) => r.html("h2").text() === "Hello from Rust! This string needs to be the same during hydration.",
  });
}
