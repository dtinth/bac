import { expect, test } from "@playwright/test";

test("challenge demo", async ({ page }) => {
  await page.goto("/?challenge=demo");
  await page.getByRole("button", { name: "Start challenge" }).click();
  const typeTheFollowingText = page.getByText(/Type the following/);
  const text = (await typeTheFollowingText.innerText()).match(/:\s*(\w+)/)![1];
  await page.getByRole("textbox").pressSequentially(text);
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

test("challenge buttons", async ({ page }) => {
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

test("challenge towers", async ({ page }) => {
  test.slow();
  await page.goto("/?challenge=towers");
  await page.getByRole("button", { name: "Start challenge" }).click();

  const completed = page.getByText("Challenge completed!");

  for (let i = 1; i <= 24; i++) {
    if (await completed.isVisible()) break;
    const source = page.locator("[draggable]", {
      hasText: new RegExp(`^${i}$`),
    });
    const destination = page.locator("[draggable]").nth(i - 1);
    await source.dragTo(destination);
  }
});

test("challenge mui", async ({ page }) => {
  const challenges = `2010-03-25 01:25
2010-09-25 01:50
2019-06-08 18:45
1986-10-17 03:15
1983-09-17 22:20
2006-08-23 18:30
2008-05-16 04:05
1980-01-18 04:25
1992-07-02 01:40
2000-09-22 01:00
1986-01-04 20:20
1993-07-18 06:10
1985-09-01 11:05
1980-12-29 07:15
1993-07-24 02:35
2029-09-18 21:58
2028-01-20 14:50
1995-07-09 10:33
2013-06-01 16:15
2009-02-25 05:37`.split(`
`);
  expect(challenges.length).toBe(20);

  // Rearrange the challenges by month because switching month takes the most time
  challenges.push(
    ...challenges.splice(5).sort((a, b) => a.slice(5).localeCompare(b.slice(5)))
  );

  await page.goto("/?challenge=mui");
  await page.getByRole("button", { name: "Start challenge" }).click();

  for (const challenge of challenges) {
    const [y, mo, d, h, m] = challenge.match(/\d+/g)!.map((x) => +x);

    const buttons = page
      .locator(".MuiPickersToolbar-content")
      .getByRole("button");
    const yearButton = buttons.nth(0);
    await yearButton.click();

    await page
      .locator(".MuiPickersYear-root")
      .getByRole("radio", { name: `${y}` })
      .click();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const label = page.locator(".MuiPickersCalendarHeader-label");
    const currentMonthName = (await label.innerText()).match(/(\w+)/)![1];
    const currentMonthIndex = monthNames.indexOf(currentMonthName);
    const previousMonth = page.getByLabel("Previous month");
    const nextMonth = page.getByLabel("Next month");
    expect(currentMonthIndex).toBeGreaterThan(-1);
    const targetMonthIndex = mo - 1;
    if (currentMonthIndex < targetMonthIndex) {
      for (let i = currentMonthIndex; i < targetMonthIndex; i++) {
        await nextMonth.click();
      }
    } else if (currentMonthIndex > targetMonthIndex) {
      for (let i = currentMonthIndex; i > targetMonthIndex; i--) {
        await previousMonth.click();
      }
    }

    // Wait for animation to finish
    const rowgroups = page.getByRole("rowgroup");
    await expect(rowgroups).toHaveCount(1);

    await page.getByRole("gridcell", { name: `${d}`, exact: true }).click();

    const mask = page.locator(".MuiClock-squareMask");
    await expect(mask).toBeVisible();
    const clickMask = async (r: number, θ: number) => {
      const bbox = (await mask.boundingBox())!;
      const radius = bbox.height / 2;
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      const x = cx + r * radius * Math.sin(θ * 2 * Math.PI);
      const y = cy - r * radius * Math.cos(θ * 2 * Math.PI);
      return page.mouse.click(x, y);
    };
    if (h >= 1 && h <= 12) {
      await clickMask(0.9, h / 12);
    } else {
      await clickMask(0.6, h / 12);
    }
    await clickMask(0.8, m / 60);
    await page.getByRole("button", { name: "OK" }).click();
  }
});
