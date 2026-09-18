import {CAMPAIGN, LOCATIONS, makeRoom} from './rooms.js';
import {UPGRADES, SHELLS, statsFor, upgradePrice, isRoomUnlocked} from './progression.js';

export const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => Math.floor(value).toLocaleString();
export const timeText = value => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '—';
export const action = (id, label, style = 'secondary', extra = '') => `<button class="${style}" data-action="${id}" ${extra}>${label}</button>`;
export const affordable = career => UPGRADES.filter(u => career.upgrades[u.key] < 5 && upgradePrice(u.key, career.upgrades[u.key]) <= career.coins);

export function navigation(career, screen, active) {
  const count = active ? 0 : affordable(career).length;
  const selected = screen === 'result' || screen === 'endless' ? 'rooms' : screen === 'shop' ? 'shop' : screen;
  const tab = (id, label, detail = '') => `<button class="nav-item ${selected === id ? 'selected' : ''}" data-action="${id}" ${selected === id ? 'aria-current="page"' : ''}><span>${label}</span>${detail}</button>`;
  return `${tab('rooms', 'Rooms')}${tab('shop', 'Upgrades', active ? '<span class="nav-lock" aria-label="Locked until you finish or quit this room" title="Finish or quit this room to upgrade">Locked</span>' : count ? `<span class="nav-count" aria-label="${count} affordable upgrade choices">${count}</span>` : '')}${tab('collection', 'Treasures')}<div class="nav-spacer"></div>${active && screen !== 'play' ? action('resume-room', 'Resume room', 'nav-resume') : ''}<span class="nav-wallet" aria-label="${money(career.coins)} saved coins">${money(career.coins)}<small>saved coins</small></span>`;
}

export function pausedRoomBanner(run) {
  return `<aside class="paused-room"><div><strong>${esc(run.room.name)} · Paused at ${Math.floor(run.percent * 100)}%</strong><p>Finish or quit this room to buy upgrades.</p></div>${action('quit','Quit room & upgrade')}</aside>`;
}

const previews = new Map();
export function roomPreview(id) {
  if (previews.has(id)) return previews.get(id);
  const room = makeRoom(id);
  let shapes = `<rect width="960" height="640" fill="#202329"/><path d="M40 40H920V600H40Z" fill="${LOCATIONS[room.location].palette.floor}"/>`;
  room.obstacles.forEach(o => { shapes += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="4" fill="#45484f" stroke="#202329" stroke-width="7"/>`; });
  room.debris.filter((_, i) => i % 9 === 0).forEach(d => { shapes += `<circle cx="${Math.round(d.x)}" cy="${Math.round(d.y)}" r="6" fill="#936b41" opacity=".65"/>`; });
  room.stations.forEach(s => { shapes += `<rect x="${s.x - 21}" y="${s.y - 18}" width="42" height="36" rx="10" fill="#88d8ad" stroke="#225346" stroke-width="5"/>`; });
  shapes += `<circle cx="${room.spawn.x}" cy="${room.spawn.y}" r="18" fill="#f1b94a" stroke="#202329" stroke-width="8"/>`;
  const svg = `<svg class="room-preview" viewBox="0 0 960 640" aria-hidden="true" focusable="false">${shapes}</svg>`;
  previews.set(id, svg); return svg;
}

export function roomsMarkup(career, district, active = false) {
  const done = career.completed.length === 24;
  const location = LOCATIONS[district];
  const roomCard = r => {
    const unlocked = isRoomUnlocked(career, r.id), completed = career.completed.includes(r.id), medal = ['', 'Bronze', 'Silver', 'Gold'][career.medals[r.id]], found = career.trinkets.includes(r.id);
    return `<button class="room-tile ${completed ? 'cleaned' : unlocked ? 'next-room' : 'locked'}" data-action="room:${r.id}" ${unlocked ? '' : 'disabled'}>${roomPreview(r.id)}<span class="room-tile-body"><span class="room-tile-top"><span class="room-number">${String(r.id).padStart(2, '0')}</span><strong>${esc(r.name)}</strong></span><span class="room-meta">${completed ? `${medal ? `${medal} medal` : 'Completed'} · Best ${timeText(career.bestTimes[r.id])} · ${found ? 'Treasure found' : 'Treasure missing'}` : unlocked ? 'Next room · Clean 95% to finish' : `Finish room ${r.id - 1} to unlock`}</span></span><span class="room-state">${completed ? 'Replay' : unlocked ? 'Play' : 'Locked'}</span></button>`;
  };
  return `<div class="page-head"><div><h1>Choose a room</h1><p>Finish a room to unlock the next.</p></div><span class="page-counter">${career.completed.length}<small>/ 24 complete</small></span></div>
    <nav class="districts" aria-label="Locations">${LOCATIONS.map((l, i) => `<button data-action="district:${i}" class="district ${i === district ? 'selected' : ''}" aria-pressed="${i === district}"><span class="district-number">0${i + 1}</span><strong>${esc(l.name)}</strong><small>${career.unlocked > i * 6 ? `Rooms ${i * 6 + 1}–${(i + 1) * 6}` : `Finish room ${i * 6} to unlock`}</small></button>`).join('')}</nav>
    <div class="location-heading"><h2>${esc(location.name)}</h2></div><div class="room-tiles">${CAMPAIGN.filter(r => r.location === district).map(roomCard).join('')}</div>
    <section class="endless-card"><div><h2>Endless</h2><p>${done ? 'Generated rooms. All your upgrades.' : 'Finish all 24 rooms to unlock.'}</p></div>${action('endless', done ? 'Play endless' : 'Locked', 'secondary', done ? '' : 'disabled')}</section>`;
}

function effect(key, stats) {
  if (key === 'width') return `${Math.round(stats.radius / 54 * 100)}% reach`;
  if (key === 'bag') return `${stats.capacity} pieces`;
  if (key === 'speed') return `${Math.round(stats.speed / 150 * 100)}% speed`;
  return `${stats.pull.toFixed(2)}× pull`;
}
export function shopMarkup(career, active) {
  const current = statsFor(career.upgrades), count = affordable(career).length, ranks = Object.values(career.upgrades).reduce((a, b) => a + b, 0);
  return `<div class="page-head"><div><h1>Upgrades</h1><p>Spend coins earned from completed rooms.</p></div><span class="balance" aria-label="${money(career.coins)} saved coins">${money(career.coins)}<small>saved coins</small></span></div>
    <div class="shop-guidance"><p>${ranks === 20 ? 'All upgrades purchased.' : count ? `${count} ${count === 1 ? 'upgrade' : 'upgrades'} available to buy.` : 'Finish a room to earn more coins.'}</p>${active ? '' : action('continue', career.unlocked <= 24 ? `Play room ${career.unlocked}` : 'Choose a room', 'primary')}</div>
    <section class="upgrade-grid" aria-label="Robot upgrades">${UPGRADES.map(u => {const rank = career.upgrades[u.key], price = upgradePrice(u.key, rank), maxed = rank === 5, canBuy = !maxed && career.coins >= price, next = statsFor({...career.upgrades, [u.key]:Math.min(5, rank + 1)}); return `<article class="upgrade-card ${canBuy ? 'affordable' : ''}" id="upgrade-${u.key}"><div class="upgrade-card-top"><span class="level-label">Level ${rank} / 5</span></div><h2 tabindex="-1">${esc(u.name)}</h2><p>${esc(u.description)}</p><div class="upgrade-comparison"><div><small>NOW</small><strong>${effect(u.key, current)}</strong></div>${maxed ? '' : `<div><small>NEXT</small><strong>${effect(u.key, next)}</strong></div>`}</div><div class="ranks" aria-hidden="true">${[1,2,3,4,5].map(i => `<i class="${rank >= i ? 'on' : ''}"></i>`).join('')}</div><div class="purchase-status">${maxed ? 'All five levels unlocked' : canBuy ? 'Ready to buy' : `Earn ${money(price - career.coins)} more coins`}</div>${action(`buy:${u.key}`, maxed ? 'Fully upgraded' : `Buy · ${money(price)} coins`, 'primary', maxed || !canBuy ? 'disabled' : '')}</article>`; }).join('')}</section>
    <div class="section-head"><h2>Robot color</h2><span>One new color every six rooms. Appearance only.</span></div><div class="shell-row">${SHELLS.map(s => `<button class="shell ${career.shell === s.id ? 'selected' : ''}" data-action="shell:${s.id}" aria-pressed="${career.shell === s.id}" ${career.completed.length < s.unlockAfter ? 'disabled' : ''}><span class="shell-dot" style="background:${s.color}"></span><strong>${esc(s.name)}</strong><small>${career.shell === s.id ? 'Equipped' : career.completed.length < s.unlockAfter ? `Finish room ${s.unlockAfter}` : 'Equip'}</small></button>`).join('')}</div>`;
}
