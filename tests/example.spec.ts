import { test } from "@playwright/test";

test("challenge 1", async ({ page }) => {
  await page.goto("/?challenge=demo");
  await page.getByRole("button", { name: "Start challenge" }).click();
  const typeTheFollowingText = page.getByText(/Type the following/);
  const text = (await typeTheFollowingText.innerText()).match(/:\s*(\w+)/)![1];
  await page.getByRole("textbox").fill(text);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("checkbox").press("Space");
  await page.getByRole("button", { name: "Next" }).click();
  const instruction = await page.getByText(/Click the button (\d+) times/);
  const number = parseInt((await instruction.innerText()).match(/(\d+)/)![1]);
  for (let i = 0; i < number; i++) {
    await page.getByRole("button", { name: i.toString() }).click();
  }
  await page.getByRole("button", { name: "Next" }).click();
});
