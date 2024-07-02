import { expect, test } from "@playwright/test";

test("challenge demo", async ({ page }) => {
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

test("challenge button", async ({ page }) => {
  test.slow();
  await page.goto("/?challenge=buttons");
  await page.getByRole("button", { name: "Start challenge" }).click();
  const question = page.getByText(/=/);
  for (let i = 1; i <= 100; i++) {
    await expect(page.getByText(`Question #${i}`)).toBeVisible();
    let [a, b, c] = (await question.innerText())
      .replace(/=[^]*/, "")
      .trim()
      .split(/\s+/);
    let answer = 0;
    a = a.replace(/,/g, "");
    b = b.replace(/×/g, "*").replace(/÷/g, "/");
    c = c.replace(/,/g, "");
    if (b === "+") {
      answer = parseInt(a) + parseInt(c);
    } else if (b === "-") {
      answer = parseInt(a) - parseInt(c);
    } else if (b === "*") {
      answer = parseInt(a) * parseInt(c);
    } else if (b === "/") {
      answer = Math.floor(parseInt(a) / parseInt(c));
    }
    const s = answer.toString();
    for (const ch of s) {
      await page.getByRole("button", { name: ch }).click();
    }
    await page.getByRole("button", { name: "Submit" }).click();
  }
});

test("challenge robot", async ({ page }) => {
  test.slow();
  await page.goto("/?challenge=robot");
  await page.getByRole("button", { name: "Start challenge" }).click();
  const goForward = page.getByRole("button", { name: "Go forward" });
  const turnLeft = page.getByRole("button", { name: "Turn left" });
  const turnRight = page.getByRole("button", { name: "Turn right" });
  const wallToTheLeft = page.locator("#wallToTheLeft");
  const wallToTheRight = page.locator("#wallToTheRight");
  const wallInFront = page.locator("#wallInFront");
  await expect(goForward).toBeVisible();
  for (let i = 0; i < 1000; i++) {
    if (!(await goForward.isVisible())) {
      // Challenge completed or failed
      break;
    }
    if ((await wallToTheLeft.getAttribute("data-state")) === "absent") {
      await turnLeft.click();
      await goForward.click();
    } else if ((await wallInFront.getAttribute("data-state")) === "absent") {
      await goForward.click();
    } else if ((await wallToTheRight.getAttribute("data-state")) === "absent") {
      await turnRight.click();
      await goForward.click();
    } else {
      await turnLeft.click();
      await turnLeft.click();
      await goForward.click();
    }
  }
});
