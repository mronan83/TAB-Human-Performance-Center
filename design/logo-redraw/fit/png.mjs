import { chromium } from "/home/user/TAB-Wellness-Collective/node_modules/@playwright/test/index.mjs";
import fs from "node:fs";
const dir = process.argv[2]; const jobs = JSON.parse(process.argv[3]);
const b = await chromium.launch();
for (const [svg, out, w, h, bg] of jobs) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const src = fs.readFileSync(`${dir}/${svg}`, "utf8");
  await p.setContent(`<html><body style="margin:0;background:${bg || "transparent"}"><img src="data:image/svg+xml;base64,${Buffer.from(src).toString("base64")}" style="width:${w}px;height:${h}px;display:block;object-fit:contain"></body></html>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: `${dir}/${out}`, omitBackground: !bg });
  await p.close();
}
await b.close();
