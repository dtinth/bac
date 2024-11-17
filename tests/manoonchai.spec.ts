import test, { expect } from "@playwright/test";

const keymap = { น: "f", ม: "g", อ: "h", า: "j" };
const toManoonchai = (word: string) =>
  word.replace(/./g, (c) => keymap[c] || c);

test("manoonchai challenge", async ({ page }) => {
  await page.goto("https://learn.manoonchai.com/");
  const input = page.getByTestId("input");
  for (let i = 0; i < 50; i++) {
    await expect(input).toHaveValue(/^$/);
    const text = (await input.getAttribute("placeholder")) as string;
    await input.pressSequentially(toManoonchai(text) + " ", { delay: 33 });
    if (await page.getByRole("dialog").isVisible()) break;
  }
});
