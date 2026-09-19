# Little Vac 1.2.1 deep audit (historical)

Historical record from before the Little Vac rename. Original package filenames, hashes, mechanics, and test results below describe that version.

September 18, 2026. Scope: another code audit, full automated campaign, real-time browser play, and fixes supported by reproduction. Testing used isolated QA careers; the normal player save was not used for purchases or resets.

## Confirmed defects and fixes

1. **95% dust rounding:** a real-step fixture collected 19 of 20 dust patches but produced `0.949999999999988`, leaving the room playing indefinitely. The browser greenhouse run also reached `0.9499999999999754`. The finish comparison now tolerates `1e-12` floating-point error; it still refuses genuinely incomplete rooms. The new regression checks ordinary suction steps, the boundary, and one final payout.
2. **Old rooms surviving a career reset:** an old room-one run could settle after another tab reset progress, including when a Sound transaction read that reset before its storage event. Persisted reset generations now distinguish careers, with deterministic generation-zero migration for existing v1 saves. Save callbacks discard invalidated runs, and settlement rejects old-career rewards before mutation.
3. **Stale home and treasure totals:** storage synchronization now refreshes those screens as well as Rooms, Upgrades, and the play HUD.
4. **False delayed ending:** campaign eligibility is rechecked inside and after the save transaction, so a reset while the ending waits cannot show a completed campaign.
5. **Endgame navigation mismatch:** the shop's Choose a room button explicitly opens Rooms after an Endless run. Completed campaigns get appropriate replay/Endless guidance.
6. **Tiny mobile finish target:** raised the goal from 7px to 10px on phones and 11px on desktop. Increased phone tips, reserved sufficient room for 100%, stacked the bag meter on the narrowest screens, and removed the redundant navigation balance during play. Also removed excessive stylesheet indentation without changing its rules.

## Automated verification

Final integrated build passed `node scripts/check.mjs` and `node scripts/verify.mjs --deep`:

- Eight game modules and ten development/test scripts passed syntax checks.
- 16 progression, 17 input, 10 career-store, and 24 application regression groups passed.
- 24 campaign layouts and 1,000 Endless seeds passed layout checks.
- 24 campaign rooms completed with genuinely earned upgrades; another 24 completed with starter equipment.
- 43 Endless completions, one campaign replay, and 86,400 frames of random movement passed.
- Earned campaign routing used 938.73 simulated seconds; reward/purchase accounting remained conserved. These are automated simulation times, not human playtime.

Before the fixes, the extended build audit also passed 144 campaign runs across six builds and nine Endless inputs at production's 120 Hz timestep. Independent physics review additionally passed all 24 max-upgrade rooms at the largest supported timestep and 120,000 line-of-sight cases. The matrix was not repeated after the rounding-only physics fix; the final deep suite was repeated.

Balance review found no forced replay or mandatory upgrade build. The existing bronze/no-treasure economy check funds all upgrades by room 24, and every individual upgrade category reduces total automated route time. No balance changes were made from automation alone.

## Browser playthrough and interface checks

- Completed greenhouse room 13 using ordinary real-time directional input, collision, suction, full-bag movement, a dock visit, and treasure pickup. Its result awarded 585 cleaning coins plus 115 new bonuses: saved balance 63 → 763.
- Reloaded the fixed build, replayed room 1, and received 255 cleaning coins with zero repeated bonuses: 763 → 1,018.
- Bought Quicker wheels level 4 for 900 coins. Reload retained level 4, 118 coins, 13 completed rooms, and room 14 next. Opened room 14 and checked pause/confirmed quit-to-upgrades.
- Used an earned 24-room fixture to view the ending, open Endless seed `0`, quit it through the normal confirmation, and verify Choose a room opens the campaign list. All maximum upgrade labels and shell unlocks were visible.
- Checked the 390 × 844 phone HUD and the 960 × 800 game embed. The packaged 320 × 640 play view had no horizontal overflow, document height 640, canvas bottom about 470, and control-tray bottom about 575 pixels. Goal text was 10px and all controls remained reachable.
- The exact extracted package displayed v1.2.1, started room 1, and opened Pause. Browser warning/error logs were empty.

Cross-tab reset races were reproduced and verified in the app/store harness; the QA browser uses separate session storage. No physical-phone, Safari, or Firefox claim is made.

## Package

`artifacts/sweep-shift-itch.zip`: **44,629 bytes**, **11 files**, root `index.html`. Archive and extracted file hashes match current `dist`.

SHA-256: `0bdaa62122417944cb8406a2c20e4022dd9e2510c702f5a1cb35dbc3d2b22788`.

The itch.io draft and store artwork were not changed during this audit.
