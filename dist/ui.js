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
  const tab = (id, label, icon, detail = '') => `<button class="nav-item ${selected === id ? 'selected' : ''}" data-action="${id}" ${selected === id ? 'aria-current="page"' : ''}><span aria-hidden="true">${icon}</span><span>${label}</span>${detail}</button>`;
  return `${tab('rooms', 'Rooms', '▦')}${tab('shop', 'Upgrades', '↑', active ? '<span class="nav-lock" aria-label="Locked until you finish or quit this room" title="Finish or quit this room to upgrade">🔒</span>' : count ? `<span class="nav-count" aria-label="${count} affordable upgrade choices">${count}</span>` : '')}${tab('collection', 'Treasures', '✧')}<div class="nav-spacer"></div>${active && screen !== 'play' ? action('resume-room', 'Resume room ↗', 'nav-resume') : ''}<span class="nav-wallet" aria-label="${money(career.coins)} saved coins"><span aria-hidden="true">✦</span> ${money(career.coins)}<small>saved coins</small></span>`;
}

export function pausedRoomBanner(run) {
  return `<aside class="paused-room"><span class="paused-room-icon" aria-hidden="true">Ⅱ</span><div><strong>${esc(run.room.name)} is paused · ${Math.floor(run.percent * 100)}% clean</strong><p>Your cleaning and bag are kept while you browse. Finish or quit this room before upgrading.</p></div>${action('quit','Quit room & upgrade')}</aside>`;
}

const previews = new Map();
export function roomPreview(id) {
  if (previews.has(id)) return previews.get(id);
  const room = makeRoom(id), colors = ['#e7cf9f', '#d8c5df', '#ccdbc0', '#e8baa8'];
  let shapes = `<rect width="960" height="640" rx="30" fill="#244944"/><path d="M40 40H920V600H40Z" fill="${colors[room.location]}"/>`;
  room.obstacles.forEach(o => { shapes += `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="12" fill="#476c61" stroke="#214a43" stroke-width="7"/>`; });
  room.debris.filter((_, i) => i % 9 === 0).forEach(d => { shapes += `<circle cx="${Math.round(d.x)}" cy="${Math.round(d.y)}" r="6" fill="#936b41" opacity=".65"/>`; });
  room.stations.forEach(s => { shapes += `<rect x="${s.x - 21}" y="${s.y - 18}" width="42" height="36" rx="10" fill="#88d8ad" stroke="#225346" stroke-width="5"/>`; });
  shapes += `<circle cx="${room.spawn.x}" cy="${room.spawn.y}" r="18" fill="#f8f5dc" stroke="#3d876a" stroke-width="8"/>`;
  const svg = `<svg class="room-preview" viewBox="0 0 960 640" aria-hidden="true" focusable="false">${shapes}</svg>`;
  previews.set(id, svg); return svg;
}

export function roomsMarkup(career, district, active = false) {
  const next = CAMPAIGN[Math.min(23, career.unlocked - 1)], done = career.completed.length === 24;
  const count = active ? 0 : affordable(career).length;
  const location = LOCATIONS[district];
  const roomCard = r => {
    const unlocked = isRoomUnlocked(career, r.id), completed = career.completed.includes(r.id), medal = ['', 'Bronze', 'Silver', 'Gold'][career.medals[r.id]];
    return `<button class="room-tile ${completed ? 'cleaned' : unlocked ? 'next-room' : 'locked'}" data-action="room:${r.id}" ${unlocked ? '' : 'disabled'}>${roomPreview(r.id)}<span class="room-tile-body"><span class="room-tile-top"><span>ROOM ${String(r.id).padStart(2, '0')}</span><span class="room-state">${completed ? '✓ Cleaned' : unlocked ? 'Up next' : 'Locked'}</span></span><strong>${esc(r.name)}</strong><span class="room-meta">${completed ? `${medal || 'Completed'} · Best ${timeText(career.bestTimes[r.id])}` : unlocked ? 'Start a fresh clean ↗' : `Finish room ${r.id - 1} to unlock`}</span></span></button>`;
  };
  return `<div class="page-head"><div><div class="eyebrow">YOUR CLEANING ADVENTURE</div><h1>Rooms</h1><p>One little transformation at a time.</p></div><span class="page-counter">${career.completed.length}<small>/ 24 clean</small></span></div>
    <section class="next-shift-card"><div class="next-shift-copy"><span class="eyebrow">${done ? 'YOU MADE EVERY ROOM LOVELY' : 'YOUR NEXT ROOM'}</span><h2>${done ? 'There’s always another little mess.' : `${next.id}. ${esc(next.name)}`}</h2><p>${done ? 'Revisit a favorite below or start an endless shift.' : `${esc(LOCATIONS[next.location].name)} · Reach 95% clean to unlock the next room. Time medals are optional.`}</p><div class="button-row">${action(done ? 'endless' : `room:${next.id}`, done ? 'Play Endless Shift ↗' : `Start room ${next.id} ↗`, 'primary')}${action('shop', count ? `Upgrades · ${count} you can afford` : 'See robot upgrades', 'secondary')}</div></div><div class="campaign-progress"><strong>${career.completed.length} / 24</strong><span>rooms restored</span><progress max="24" value="${career.completed.length}" aria-label="Campaign progress"></progress></div></section>
    <div class="section-head"><h2>Choose a location</h2><span>You can preview every location.</span></div><nav class="districts" aria-label="Locations">${LOCATIONS.map((l, i) => { const n = career.completed.filter(id => id > i * 6 && id <= (i + 1) * 6).length; return `<button data-action="district:${i}" class="district ${i === district ? 'selected' : ''}" aria-pressed="${i === district}"><span class="district-number">0${i + 1}</span><strong>${esc(l.name)}</strong><small>${career.unlocked > i * 6 ? `${n} / 6 clean` : `Opens after room ${i * 6}`}</small></button>`; }).join('')}</nav>
    <div class="location-heading"><h2>${esc(location.name)}</h2><p>${esc(location.subtitle)}</p></div><div class="room-tiles">${CAMPAIGN.filter(r => r.location === district).map(roomCard).join('')}</div>
    <section class="endless-card"><div><h2>Endless Shift ∞</h2><p>${done ? 'Keep your upgrades. Pick a seed. Enjoy a fresh room.' : `Finish ${24 - career.completed.length} more rooms to unlock unlimited fresh shifts.`}</p></div>${action('endless', done ? 'Choose a seed ↗' : 'Unlock after room 24', 'primary light', done ? '' : 'disabled')}</section>`;
}

const upgradeIcons = {width:'◎', bag:'▤', speed:'↗', pull:'〰'};
function effect(key, stats) {
  if (key === 'width') return `${Math.round(stats.radius / 54 * 100)}% reach`;
  if (key === 'bag') return `${stats.capacity} pieces`;
  if (key === 'speed') return `${Math.round(stats.speed / 150 * 100)}% speed`;
  return `${stats.pull.toFixed(2)}× pull`;
}
export function shopMarkup(career, active) {
  const current = statsFor(career.upgrades), count = affordable(career).length, ranks = Object.values(career.upgrades).reduce((a, b) => a + b, 0);
  return `<div class="page-head"><div><div class="eyebrow">A HAPPIER LITTLE ROBOT</div><h1>Robot upgrades</h1><p>Spend your cleaning coins on more reach, a bigger bag, faster wheels, or stronger suction.</p></div><span class="balance" aria-label="${money(career.coins)} saved coins">✦ ${money(career.coins)}<small>saved coins</small></span></div>
    <div class="shop-guidance"><p><strong>${ranks === 20 ? 'Your robot is fully upgraded.' : count ? `${count} upgrade ${count === 1 ? 'choice is' : 'choices are'} ready to buy.` : 'Finish a room to earn more coins.'}</strong>${active ? '' : '<span>Room rewards are saved when you finish. Choose any upgrade you like.</span>'}</p>${active ? '' : action('continue', career.unlocked <= 24 ? `Play room ${career.unlocked} ↗` : 'Choose a room ↗', 'primary')}</div>
    <section class="upgrade-grid" aria-label="Robot upgrades">${UPGRADES.map(u => {const rank = career.upgrades[u.key], price = upgradePrice(u.key, rank), maxed = rank === 5, canBuy = !maxed && career.coins >= price, next = statsFor({...career.upgrades, [u.key]:Math.min(5, rank + 1)}); return `<article class="upgrade-card ${canBuy ? 'affordable' : ''}" id="upgrade-${u.key}"><div class="upgrade-card-top"><span class="upgrade-icon" aria-hidden="true">${upgradeIcons[u.key]}</span><span class="level-label">Level ${rank} / 5</span></div><h2 tabindex="-1">${esc(u.name)}</h2><p>${esc(u.description)}</p><div class="upgrade-comparison"><div><small>NOW</small><strong>${effect(u.key, current)}</strong></div>${maxed ? '<span class="upgrade-arrow" aria-hidden="true">✓</span>' : `<span class="upgrade-arrow" aria-hidden="true">→</span><div><small>NEXT LEVEL</small><strong>${effect(u.key, next)}</strong></div>`}</div><div class="ranks" aria-hidden="true">${[1,2,3,4,5].map(i => `<i class="${rank >= i ? 'on' : ''}"></i>`).join('')}</div><div class="purchase-status">${maxed ? 'All five levels unlocked' : canBuy ? 'Ready to buy' : `Earn ${money(price - career.coins)} more coins`}</div>${action(`buy:${u.key}`, maxed ? 'Fully upgraded ✓' : `Buy upgrade · ✦ ${money(price)}`, 'primary', maxed || !canBuy ? 'disabled' : '')}</article>`; }).join('')}</section>
    <div class="section-head"><h2>Robot colors</h2><span>Unlock a new shell every six rooms. Colors don’t affect stats.</span></div><div class="shell-row">${SHELLS.map(s => `<button class="shell ${career.shell === s.id ? 'selected' : ''}" data-action="shell:${s.id}" aria-pressed="${career.shell === s.id}" ${career.completed.length < s.unlockAfter ? 'disabled' : ''}><span class="shell-dot" style="background:${s.color}"></span><strong>${esc(s.name)}</strong><small>${career.shell === s.id ? '✓ Equipped' : career.completed.length < s.unlockAfter ? `Unlock after room ${s.unlockAfter}` : 'Equip color'}</small></button>`).join('')}</div>`;
}
