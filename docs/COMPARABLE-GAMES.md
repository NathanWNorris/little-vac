# Little Vac: comparable-game research

Research date: 2026-09-17. This historical research informed versions 1.1–1.1.2; the product name was updated to Little Vac in 1.6.3. The older 95% finish target and startup wording below are historical and do not describe the current game. The first pass reviewed developer/publisher store copy; the second pass reviewed developer support posts and patch notes. This is not a playtest of the comparison games or evidence that a particular wording will increase sales. Prices, reviews, and user-assigned tags were not used to make design decisions.

## What the sources show

| Primary source | What its published copy actually supports | Lesson inferred for Little Vac |
| --- | --- | --- |
| [PowerWash Simulator — developer Steam listing](https://store.steampowered.com/app/1290000/PowerWash_Simulator/) | The title names the central activity. Its opening describes the cleaning action and sensory satisfaction. The longer description connects career jobs to tools and upgrades. Separate sections distinguish relaxed career/free play from timed or resource-based challenges. | State the action immediately, then the upgrade loop. Explain that medals are optional rather than implying Little Vac has no recorded time. |
| [Fresh Start Cleaning Simulator — publisher Steam listing](https://store.steampowered.com/app/1856030/Fresh_Start_Cleaning_Simulator/) | A distinctive name is followed by a literal cleaning descriptor. The description emphasizes visible environmental restoration. Separate sections explain collected rubbish becoming experience and experience buying efficiency upgrades. | Keep the Little Vac name while adding a short genre descriptor in discovery surfaces. Explicitly connect finishing rooms, saved coins, and robot upgrades. |
| [Loddlenaut — publisher Steam listing](https://store.steampowered.com/app/1644940/Loddlenaut/) | The developer-written description establishes the player's role and setting, then uses short action-led feature bullets for exploration, creature care, cleaning, special tools, and recycling into upgrades. | A playful brand can work if the next sentence tells the player who they control and what they do. Separate core actions, progression, and optional treasures into short, concrete explanations. |
| [Dream Cleaner — creator itch.io page](https://overcookedwalrus.itch.io/dream-cleaner) | The creator's short About paragraph describes cleaning rooms, disposing of trash, earning money, and buying upgrades. A nearby Controls list names movement, interaction, and the key that opens the upgrade store. The page labels the game as in development. | Put the complete cleaning/reward loop and how to reach upgrades near the Play control. For Little Vac, visible navigation is clearer than requiring players to discover an undocumented key. |

These pages establish how those games describe themselves. The recommendations in the last column are our editorial interpretation. No claim about their in-game menus, conversion rates, or control quality is made from store copy alone.

## Original wording for Little Vac

Use the existing **Little Vac** brand. For the store title, browser title, or search description, a clear expanded name is **Little Vac — Cozy Robot Cleaning**. Keep the short wordmark in the game itself.

Suggested short description:

> Guide a tiny vacuum robot through 24 messy rooms. Clean up, earn coins, and upgrade your robot—then unlock endless shifts.

Suggested longer introduction:

> Steer a little vacuum robot through workshops, arcades, greenhouses, and rooftop parties. Vacuuming happens automatically as you move. Empty your bag at a dock, finish the room to save your coins, and choose upgrades that make the next clean easier.
>
> Restore all 24 rooms to unlock Endless Shift. Look for optional treasures, unlock new robot colors, or revisit a favorite room for a better medal. There are no lives or failed rooms; time medals are an optional extra.

### First-time instructions

1. **Move to vacuum.** Move your mouse over the room; no click or hold is needed. WASD and arrow keys also work. The robot picks up nearby mess automatically. Moving the cursor outside the room stops mouse steering.
2. **Dock to empty.** When the bag fills, park beside the green dock. Emptying is automatic.
3. **Finish, then upgrade.** A room finishes at 95% clean. Its coins are saved, the next room opens, and Upgrades shows what you can afford.

Touch instructions should be shown when relevant to the input/viewport: **Drag the pad or room to steer.** This copy does not constitute physical-phone validation.

### Navigation and progression wording

- Primary new-career action: **Start cleaning**.
- Persistent destinations: **Rooms**, **Upgrades**, **Treasures**.
- Next campaign action: **Start room 2** / **Next room 3**, with the actual number.
- Upgrade card: **Level 1 / 5**, **Now**, **Next level**, **Buy upgrade · [price] coins**.
- Unaffordable upgrade: **Earn [difference] more coins**.
- In-room currencies: **Saved coins** and **+[amount] this room**. Clarify that the latter is saved at completion.
- Upgrades during an unfinished room: **Finish this room to save its coins, or quit it before upgrading. Pausing keeps your room in progress.** Upgrades remain locked while a room is active, including when paused or browsing menus.
- Quit confirmation: **Quitting discards this room's cleaning and coins. Your previously saved coins and upgrades are kept.** The player must confirm before the active room is discarded and the shop opens.
- Resume action: **Resume cleaning**, followed by the room name and saved in-session cleaning percentage.
- Relaxed-play reassurance: **No lives or failed rooms. Time medals are optional.**

Avoid replacing literal navigation labels with mood copy such as “Your next fresh start” or “A better kind of clean.” Those phrases can remain as supporting flavor. Avoid advertising idle automation, prestige, or an infinite campaign: Little Vac has a finite authored campaign and an unlockable generated mode.

All proposed Little Vac sentences above are original wording based on this game's implemented behavior. No comparison-game taglines, artwork, or long passages are copied.

## Applied in version 1.1

At version 1.1, the store and browser titles used the former brand name. The current name is **Little Vac**. The saved store tagline is: “Clean 24 rooms, earn coins, and upgrade a tiny vacuum robot. A cozy browser game with endless shifts to unlock.” The opening, feature bullets, controls, and save explanation were rewritten in marketing/description.html. The game now says **Move to vacuum**, **Dock to empty**, and **Finish & upgrade**, and distinguishes saved coins from unfinished-room earnings.

## Second pass: clarity while playing

This pass reviewed local version 1.1.1 and informed the local 1.1.2 changes listed below. Mouse steering follows the cursor without a held button. Purchases and shell changes are available only between rooms, after completing or explicitly quitting the active room. The changes preserve those user-requested rules.

### Primary evidence

| Developer source and date | Published fact | Design inference for Little Vac |
| --- | --- | --- |
| [PowerWash Simulator: Help, Where's The Last Dirt?](https://steamcommunity.com/app/1290000/discussions/2/3111403360720627988/) — developer-tagged pinned post, May 19, 2021, edited December 9, 2021 | The developer describes a remaining-dirt highlight and a Details view with per-part completion percentages and selected-part highlighting. This is historical documented behavior, not a claim that today's controls are identical. | Finishing should depend on finding visible work, not spotting nearly invisible pixels. Keep Little Vac's automatic hints and forgiving finish threshold. Explain the target beside the live percentage. |
| [Loddlenaut: official news](https://steamcommunity.com/app/1644940/allnews/) — September 19 and October 30, 2024 entries | The Goddles update adds a progression-gated map view for locating pollutants and an inventory-capacity upgrade. Version 1.2.3 fixes pollution tracking and a fully cleaned biome remaining at 99%. | Progress totals must match actual remaining work, including when objects disappear. Capacity upgrades should explain the practical benefit. Little Vac already has a visible bag count, comparison values, and 80%-clean debris outlines; it does not need a separate scanner system. |
| [Fresh Start Cleaning Simulator: official news](https://steamcommunity.com/app/1856030/allnews/) — December 29, 2022 and January 19, 2023 entries | Patch notes add an explicit replay button on the world map and a controls guide accessible beyond the tutorial. | Players should not have to restart the tutorial to remember controls. Completed room buttons should make their replay action explicit. |
| [Fresh Start Cleaning Simulator: official news](https://steamcommunity.com/app/1856030/allnews/) — December 20, 2022 and January 28, 2025 entries | The release announcement calls out more readable UI and a larger objective icon. The later patch documents fixes to completion, scanner behavior, obscured buttons, and loading-bar visibility. | Check instructions and important states at the actual browser embed size. Distinguish a mechanic that is functioning from one the player can readily understand. |

The official news feeds were read directly, including the entries and dates named above. Search results containing player comments or third-party summaries were discovery aids only and are not evidence for these conclusions. Store pages and developer patch notes do not establish the best price curve, retention, or session duration for this game.

### Applied locally in version 1.1.2

The following changes are present in the local source. This research note does not claim browser validation, external publication, or a measured improvement in player behavior.

1. **Finishing target beside progress.** The HUD now says “Finish at 95%” beside the live clean percentage. The existing remaining-debris outlines begin at 80%, followed by the 95% finishing sweep. No additional player action is required.
2. **Controls available in every room.** Pause now includes **How to play**, with mouse-follow, WASD/arrows, touch dragging, green docks, full-bag behavior, the 95% target, and the finish-or-quit upgrade rule. It explains that leaving the room with the mouse stops steering. This keeps help available after first-room tips have disappeared.
3. **Explicit replay and optional treasure status.** Completed room cards now say “Replay room” and show the best time and either “Treasure found” or “Treasure to find.” The visible “Cleaned” state and unlock prerequisites remain. Available fresh rooms also show their short room description.
4. **Concrete reward-to-upgrade step.** Results now open with “Room complete!” and separate cleaning coins, new bonus coins, and saved balance. A missed optional treasure has a replay reminder. Current prices and payouts are preserved. Prior automated campaign results show that all upgrades can be earned; they do not measure how satisfying the pace feels to a person.

The room-2 tip now says “green dock,” matching its rendered appearance, instead of referring to stripes that were not present.

### Keep the scope simple

The evidence supports readable goals, repeatable instructions, visible rewards, and correct completion tracking. It does not justify adding currencies, chores, mandatory timers, a talent tree, or an idle loop. The four upgrade choices already communicate separate benefits. The six-room location changes and color unlocks provide milestones without requiring new systems. Optional treasures and replay medals should remain optional.

For the next hands-on pass, check whether a new player can find the dock, explain the 95% target, recover controls after returning to a later room, understand why Upgrades is locked, and buy an upgrade after finishing or quitting. Those observations would be stronger evidence for further changes than copying another game's feature list.
