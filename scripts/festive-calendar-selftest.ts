import assert from "node:assert/strict";

import {
  getActiveFestiveCampaign,
  istDateKey,
  presentFestiveToday,
} from "../src/lib/festiveCalendar";

const chhath = new Date("2026-11-17T12:00:00+05:30");
const normal = new Date("2026-11-18T12:00:00+05:30");
const childrens = new Date("2026-11-14T12:00:00+05:30");

const chhathCamp = getActiveFestiveCampaign(chhath);
assert.ok(chhathCamp, "Chhath window active 2026-11-17 IST");
assert.equal(chhathCamp?.theme, "chhath");

const after = getActiveFestiveCampaign(normal);
assert.equal(after, null, "Day after Chhath window is normal");

const kids = getActiveFestiveCampaign(childrens);
assert.ok(kids?.theme === "childrens", "Children's Day on calendar");

const presented = presentFestiveToday(chhath);
assert.ok(presented?.sessionKey.includes("2026-11-17"));
assert.equal(presented?.date, istDateKey(chhath));

console.log("festive-calendar-selftest: ok");