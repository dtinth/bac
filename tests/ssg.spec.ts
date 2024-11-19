import test from "@playwright/test";

const mapping = {
  "0": "xxx xxx",
  "1": "  x  x ",
  "2": "x xxx x",
  "3": "x xx xx",
  "4": " xxx x ",
  "5": "xx x xx",
  "6": "xx xxxx",
  "7": "x x  x ",
  "8": "xxxxxxx",
  "9": "xxxx xx",
};

test("ssg challenge", async ({ page }) => {
  await page.goto("http://localhost:5174/ssg");
  const text = await page.locator(".number").innerText();
  const digits = page.locator(".seven-segment");
  for (const [i, n] of Array.from(text).entries()) {
    const segments = digits.nth(i).locator(".segment");
    for (const [j, c] of mapping[n].split("").entries()) {
      if (c === "x") {
        await segments.nth(j).click();
      }
    }
  }
});
