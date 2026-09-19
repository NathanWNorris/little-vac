# Little Vac 1.6.10 upload

Version **1.6.10** passed the full earned 24-job/50-area campaign, 24 starter jobs, 144 campaign runs across six upgrade builds, additional Endless runs, and 88 app/input/progression/store groups. Fixed duplicate Resume controls, pre-start keyboard focus, stale accessible instructions, large wallet layout, and misleading treasure/suction copy. Manual browser checks covered a full first-room completion, purchases, reload persistence, startup, menus, settings, and Endless restart. See [the full audit](../docs/RELEASE-AUDIT-1.6.10.md) for exact coverage and device limits.

The 12-file ZIP is **66,161 bytes**, SHA-256 **61884fae9f3b07d70f58d10bf217e3f8a3c19bd9e03281c3f86d51974d71fca5**; source/archive/extraction hashes match. The saved hosted build displays **v1.6.10** and retains the existing player save. Browser-playable is checked; **Draft remains selected and Public unselected**. Physical phones and native fullscreen exit remain unverified; an itch.io orientation-lock warning is recorded in the audit.

The six-image gallery is retained; its two menu screenshots predate the shared balance location.

# Little Vac 1.6.9 upload

Version **1.6.9** uses a shared coin display across menus. Rooms, Upgrades, and Treasures have identical wallet coordinates at desktop and 320px widths; Home, Endless, completion, and campaign-ending screens also display it at the top right. Navigation no longer duplicates the balance. The room completion count moves into the Rooms subtitle, and paused notices follow the shared heading. Purchases refresh visible balances without changing the current screen or focus. Syntax and all **45 app checks** passed, including delayed purchases while browsing Rooms or Treasures. Narrow layouts have no horizontal overflow. The ZIP has **12 runtime files**, root `index.html`, **65,916 bytes**, and SHA-256 **5f073d1a460b2b07e0fd5f73a4c2d6e63b336396603bbd1f436a81616c956d96**; source/archive/extraction hashes match. The hosted **v1.6.9** build displays the existing **5 coins** on Home, Rooms, Upgrades, and Treasures. All three tabbed pages have identical wallet coordinates. Room 2 progress remains intact and browser warning/error logs are empty. Browser-playable is saved, **Draft** remains selected, and Public remains unselected.

The six-image store gallery is retained; its menu screenshots predate the shared balance location.

# Little Vac 1.6.8 upload

Version **1.6.8** removes Play room from Upgrades and moves the single coin balance beside its heading. Active jobs keep one Resume room action in navigation. Syntax and all **45 app checks** passed; desktop and 320px views were checked (305px client/scroll width, no horizontal overflow). The verified ZIP contains **12 runtime files**, is **65,802 bytes**, and has SHA-256 **00877bba2f4d48a63016ab5e0c04bb1a6e3a78185f70539c43706589969ec513**. Source/archive/extraction hashes match. The saved hosted build displays **v1.6.8**, with one **5-coin** balance beside Upgrades and no Play room button. Existing upgrades remain intact and browser warning/error logs are empty. The existing project remains **Draft**, with Public unselected.

The six-image gallery is retained from 1.6.7. Its upgrade screenshot shows the previous header arrangement.

# Little Vac 1.6.7 — upload handoff

Version **1.6.7** simplifies Upgrades to four icon/benefit/price rows, optional stats and robot colors, one wallet, and one Resume action for a paused job. Pending earnings remain separate. Syntax and **45 app groups** passed; **960 × 800** and **320px** browser checks passed without horizontal overflow, including expanded stats. The color section stayed open and focus remained on Mint after equipping it.

The ZIP is **65,844 bytes**, has **12 runtime files** and root `index.html`, and has SHA-256 **2f74d3afea138c01390c7f2cffc585224cc335b2257540954524d49a14110133**. Source/archive/extraction hashes match. `artifacts/publish-1.6.7` contains the current build/description/notes, retained cover/launch and five gallery images, the refreshed **1080 × 880** Upgrades screenshot, and a file manifest.

The saved/reloaded browser-playable upload displays **v1.6.7**. Hosted Upgrades showed four rows, collapsed stats/colors, and one wallet with 5 coins. Room 2 and existing upgrade ranks were retained; warning/error logs were empty. The replacement screenshot persisted as gallery image `30101140`, replacing `30099715`; exactly six images remain. No hosted purchase was performed. **Draft remains selected and Public unselected; no public-publish action was taken.**

## Historical 1.6.6 handoff

Version **1.6.6** removes the duplicate balance beside the Upgrades heading. The top navigation keeps the single coin icon and number. Purchasing and pending earnings are unchanged. Syntax checks and all **45 app checks** passed; local and hosted Upgrades screens were visually checked. The hosted v1.6.6 screen exposes exactly one balance, retains the existing 5 coins and Room 2 progress, and has no browser warnings/errors. **The itch.io project remains Draft; Public is unselected.**

The verified archive is **64,876 bytes**, contains **12 runtime files** with root `index.html`, and has SHA-256 **328d71200f16f00c24b0f2daa272b5490afd126c732d3710c11a7e90be488537**. Source/archive/extraction hashes match. The current handoff is `artifacts/publish-1.6.6`.

## Historical 1.6.5 handoff

Version **1.6.5** uses a shared coin icon and number for saved balances, retains accessible amount-and-coins labels and distinct pending earnings, and wraps the mobile header. Syntax and **45 app groups** passed. Desktop QA at 395 coins and a 320px layout check passed without horizontal overflow. This update does not require new store-description copy.

`artifacts/publish-1.6.5` contains the exact `little-vac-itch.zip`, prior cover/launch artwork and six gallery PNGs, current description and notes, and a file manifest. The ZIP is **64,886 bytes**, with **12 runtime files**, root `index.html`, and SHA-256 **050b9c80275faaa56ca5d69e0655012ddaf4d6e3b9d8aeba23746d3dcbd3c22b**. Source/archive/extraction hashes match. The saved/reloaded browser-playable upload displays **v1.6.5**. Hosted Upgrades shows the coin icon and 5 in navigation/shop, with accessible “5 coins” labels. Existing progress was retained and warning/error logs were empty. **Draft remains selected and Public unselected; no public-publish action was taken.**

## Historical 1.6.4 handoff

Version **1.6.4** adds upgrades while the current job is paused. Open Upgrades from Pause or the menus, spend saved career coins, and resume with the new stats. Cleaning, bag contents, and job progress stay intact. Pending job coins remain unavailable until every area is complete; quitting is no longer required for a purchase.

Validation passed **45 app**, **16 progression**, **17 input**, and **10 career-store** groups, plus syntax for **9 runtime modules and 10 scripts**. Local Chrome verified direct menu-to-Upgrades navigation, separate pending coins, Coral selection, and resume without losing **8%** cleaning or **25 / 150** bag contents. Automated tests cover saved-coin buys, changed stats/full-bag resume, pending-only insufficient funds, asynchronous guards, and one-time settlement. No new campaign or physical-device playthrough is claimed.

The existing [Little Vac project](https://fooded.itch.io/little-vac), project **5021059**, remains **Draft**. The 1.6.4 browser-playable build and updated description persisted after saving/reloading, and the hosted menu/resume smoke check passed. Do not select Public or perform the final public-publish action. The previous handoff below is historical.

## Files in artifacts/publish-1.6.4

The handoff contains `little-vac-itch.zip`, current `description.html` and `UPLOAD-NOTES.md`, the existing Little Vac `cover.png` and `launch.png`, six gallery PNGs retained from 1.6.3, and `manifest.json`. The ZIP is **64,754 bytes**, has **12 runtime files** and root `index.html`, and has SHA-256 **0b181e7d4f7a2e7279069ddef47965b47d792f9c076549a068cc1cd0499c08d6**. Source, archive, and extraction hashes match. The new description removes the former quit-before-upgrading advice and explains that only saved coins can buy upgrades.

The actual iframe displays **v1.6.4**. Hosted Continue → D → Escape → Main menu → Upgrades opened directly without a quit prompt, showed Room 2 paused with **0 pending** and **5 saved** coins, and resumed the same room at **0%** with **0 / 120** bag space. Reload retained Room 2 and the existing width/bag upgrades. No browser warnings/errors appeared. No hosted purchase or completed job is claimed; automated tests cover those transactions. **Draft remained visible and Public unselected.** The hosted shop screenshot is `tmp/little-vac-1.6.4-hosted-shop.jpg`.

## Historical 1.6.3 handoff

Updated September 19, 2026. Version **1.6.3** is the Little Vac branding update. Packaging, refreshed artwork capture, and the GitHub/itch.io renames are complete. The browser-playable upload and targeted hosted startup/help check passed. The page remains in Draft and has not been published publicly.

Current draft destination: https://fooded.itch.io/little-vac (existing project 5021059). Current source destination: https://github.com/NathanWNorris/little-vac. Both renames persisted after reload. The actual hosted iframe displays LITTLE VAC v1.6.3.

## Files in artifacts/publish-1.6.3

- `little-vac-itch.zip`: HTML game with index.html at its root, **12 runtime files**, **64,759 bytes**, SHA-256 `d8e1db30193e66843f193aaeafbfcdfac69de94a1c9455bde4c6d452e2807d39`. Source, archive, and extraction hashes match.
- `cover.png`: 1260 × 1000 cover, regenerated from the Little Vac template.
- `launch.png`: 960 × 800 image with the new name, saved as the embed background and visually verified after reload. The store loads Home automatically.
- `gallery/`: six current screenshots. Rooms and Upgrades were recaptured with Little Vac branding; four gameplay images contain no old wordmark and are unchanged.
- `description.html`: current store description, opening with the Little Vac name.
- `manifest.json`: file sizes and SHA-256 hashes for every other file in this handoff.

No page banner is required. The branded banner template is retained as an optional source asset, not a required store element.

Short description: **Clean 50 areas, upgrade your vacuum, and open new hallways. Finish 24 jobs to unlock Endless Shift.**

## Draft setup

`little-vac-itch.zip` is saved as the browser-playable HTML game. The old `sweep-shift-itch.zip` is hidden and nonplayable as a rollback archive. Retain the six-image gallery, free/no-payments setup, and AI-assistance disclosure. Store colors are background #17292d, content #f2e6c9, text #203b3b, and links #a63e27. The embed is 960 × 800 with fullscreen and scrollbars enabled.

Keep autostart enabled so the Home screen appears without a separate launch-image click. Home autoloading does not begin a cleaning job. Preserve the compact prompt after the first completed room and the full manual picture guide. The saved title/slug and exactly six gallery images were confirmed after reload. Both old-wordmark screenshots were removed, and the new embed-background thumbnail visibly reads LITTLE VAC. No page banner is configured.

The legacy `sweep-shift-career-v1` save key stays unchanged for compatibility. This is a branding update; no new campaign, balance, or save-format change is claimed.

Keep the page in Draft. The user's publishing boundary is to stop at the final public-publish action, even after hosted checks finish.

Editor: https://itch.io/game/edit/5021059#published. Do not select Public or perform the final public-publish action.

## Historical 1.6.3 validation

Version 1.6.3 passed 42 app groups, 17 input groups, syntax checking, and package integrity checks. The new cover, launch, and optional banner have the required 1260 × 1000, 960 × 800, and 1260 × 320 dimensions. The hosted smoke check confirmed LITTLE VAC, v1.6.3, the new name in Credits, compact Room 2 startup at 0% with an empty 0 / 120 bag, D activation, Escape pause, and the three illustrated help steps with Back to Pause. Reload retained Room 2, 5 coins, width/bag upgrades at 1 / 5, and speed/pull at 0.

The six saved gallery IDs are `30098624`, `30098629`, `30098626`, `30098625`, `30099714`, and `30099715`; old-wordmark images `30098627` and `30098628` were removed. No game warnings/errors appeared; two itch.io dashboard `game:set_state` warnings occurred during editor saving. This check did not complete a job, buy an upgrade, or establish new fullscreen/phone results. The final editor view shows **Draft selected, Public unselected, and Save visible**. The hosted Home screenshot is saved locally at `tmp/little-vac-hosted-home.jpg`.

Five obsolete JPG screenshots are preserved locally in `artifacts/legacy-branding-1.6.2` and in Git history. They are not included in this handoff.

## Historical validation

Version 1.6.2 passed 42 app groups, 17 input groups, syntax checking, and desktop/320px visual QA. Its actual hosted startup/help check confirmed the compact start prompt, WASD activation, full manual guide, automatic Home loading, no oversized page banner, and six gallery links. Those are historical results, not validation of the renamed 1.6.3 package.

The historical 1.6.2 archive is `artifacts/publish-1.6.2/sweep-shift-itch.zip`, 64,762 bytes, SHA-256 `90c65a6ab10bb7e2596de99ed80fd9b5188ad45e1e701b0a056f09ecef2c1219`. Earlier archives and artwork remain historical evidence; do not relabel their hashes as 1.6.3 results.

The full 24-job/50-area campaign and deeper engine checks belong to earlier validation documented in PLAYTEST.md. No physical-phone test is claimed. itch.io's external fullscreen control could not be activated under automated Chrome during the 1.6.1 smoke test; errors came from the host page, not the game iframe. Fullscreen remains unverified.

## Launch preparation — 1.6.10, September 19, 2026

The actual hosted page was confirmed playable at **1.6.10**. Saved settings retain the existing cover, six screenshots, **No payments**, a **960 × 800** embed, and autostart. **Draft is selected; Public is unselected. No public-publish action was taken.**

Saved tags are `cleaning`, `cozy`, `relaxing`, `singleplayer`, `top-down`, `robots`, `incremental`, and `upgrades`. Session length is now **A few minutes**, corrected from A few seconds. Saved metadata lists **Keyboard, Mouse, Touchscreen**, **English**, and minimum/maximum players of **1**.

The local handoff is `artifacts/publish-1.6.10`, with the verified build, cover, launch image, description, six gallery images, concise launch notes, and a hash manifest. Its two menu screenshots are explicitly labeled as older layouts. Physical-phone and native fullscreen-exit limits remain as recorded in the release audit.
