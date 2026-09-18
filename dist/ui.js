import {CAMPAIGN, LOCATIONS, makeRoom} from './rooms.js';
import {UPGRADES, SHELLS, statsFor, upgradePrice, isRoomUnlocked} from './progression.js';

export const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => Math.floor(value).toLocaleString();
export const timeText = value => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '—';
export const action = (id, label, style = 'secondary', extra = '') => `<button class="${style}" data-action="${id}" ${extra}>${label}</button>`;
export const affordable = career => UPGRADES.filter(u => career.upgrades[u.key] < 5 && upgradePrice(u.key, career.upgrades[u.key]) <= career.coins);

export function menuIcon(kind) {
  const shapes = {
    play: '<path d="M8 5l11 7-11 7Z"/>',
    rooms: '<path d="M5 21V3h14v18M3 21h18"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>',
    upgrades: '<path d="M12 16V4m-6 6 6-6 6 6M5 20h14"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.4 8.5a2.6 2.6 0 0 1 5 1c0 1.8-2.4 1.7-2.4 3.5"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/>',
    home: '<path d="m3 11 9-8 9 8M5 9.3V21h5v-7h4v7h5V9.3"/>',
    restart: '<path d="M4 3v5h5M4.8 7.2a8 8 0 1 1-.4 9"/>',
    settings: '<path d="M6 3v4m0 6v8M12 3v9m0 6v3M18 3v4m0 6v8"/><circle cx="6" cy="10" r="3"/><circle cx="12" cy="15" r="3"/><circle cx="18" cy="10" r="3"/>',
  };
  return shapes[kind] ? `<svg class="menu-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${shapes[kind]}</svg>` : '';
}

function guideRobot(x, y, full = false) {
  return `<g transform="translate(${x} ${y})" stroke-linejoin="round">
    <rect x="-17" y="-27" width="34" height="12" rx="5" fill="#10161b"/><rect x="-17" y="17" width="34" height="12" rx="5" fill="#10161b"/>
    <rect x="20" y="-21" width="12" height="42" rx="4" fill="#fff0bd" stroke="#315c56" stroke-width="3"/>
    <rect x="-28" y="-25" width="55" height="52" rx="18" fill="#84d9b3" stroke="#183e3b" stroke-width="3"/>
    <path d="M-18-17q-4 1-4 7" fill="none" stroke="#d8ffe9" stroke-width="3" stroke-linecap="round"/>
    <rect x="-20" y="-13" width="17" height="28" rx="4" fill="#254f4e"/>
    <rect x="-16" y="${full ? -9 : 4}" width="9" height="${full ? 20 : 7}" rx="2" fill="#f5b83d"/>
    <ellipse cx="10" cy="-9" rx="6" ry="7" fill="#fff9e8"/><ellipse cx="10" cy="9" rx="6" ry="7" fill="#fff9e8"/>
    <circle cx="12" cy="-9" r="3" fill="#183e3b"/><circle cx="12" cy="9" r="3" fill="#183e3b"/>
  </g>`;
}

// Text stays in the surrounding HTML so the same pictures work at any screen size.
export function guideArt(kind) {
  const arrow = (path, head, color = '#f5b83d') => `<g fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/><path d="${head}"/></g>`;
  let picture;
  if (kind === 'move') {
    picture = `<circle cx="182" cy="61" r="37" fill="#f5b83d" fill-opacity=".1" stroke="#f5b83d" stroke-width="3"/>
      ${arrow('M98 80Q119 59 142 59', 'M132 49l11 10-11 10')}
      <path d="M169 33v49l13-11 13 22 10-6-13-21h23Z" fill="#fff9e8" stroke="#22262d" stroke-width="4" stroke-linejoin="round"/>
      ${guideRobot(56, 77)}`;
  } else if (kind === 'touch') {
    picture = `<circle cx="179" cy="57" r="36" fill="#f5b83d" fill-opacity=".1" stroke="#f5b83d" stroke-width="3"/>
      ${arrow('M98 80Q119 59 142 59', 'M132 49l11 10-11 10')}
      <path d="M164 104l-15-20c-7-10 4-18 10-9l7 9V42c0-12 15-12 15 0v25c5-8 15-4 15 3 6-6 15-1 14 6 9-3 15 5 11 15l-7 18h-42Z" fill="#fff0bd" stroke="#22262d" stroke-width="4" stroke-linejoin="round"/>
      ${guideRobot(56, 77)}`;
  } else if (kind === 'clean') {
    picture = `<path d="M93 55l99-36v92L93 91Z" fill="#84d9b3" fill-opacity=".09"/>
      <g fill="none" stroke="#ffe06b" stroke-width="3"><circle cx="186" cy="39" r="18"/><circle cx="193" cy="99" r="17"/></g>
      <g fill="#edc38a"><circle cx="182" cy="36" r="5"/><circle cx="190" cy="43" r="4"/><circle cx="189" cy="95" r="5"/><circle cx="197" cy="103" r="4"/></g>
      <g fill="#f5b83d"><circle cx="151" cy="48" r="4"/><circle cx="140" cy="91" r="3"/><circle cx="124" cy="57" r="3"/></g>
      ${arrow('M181 69H121', 'M131 59l-11 10 11 10', '#b9ffe0')}
      ${guideRobot(64, 72)}`;
  } else if (kind === 'dock') {
    picture = `<circle cx="184" cy="68" r="42" fill="#84d9b3" fill-opacity=".1" stroke="#a4f5cf" stroke-width="3"/>
      ${arrow('M95 78Q121 51 141 64', 'M138 51l5 14-15 4', '#a4f5cf')}
      <g transform="translate(184 67)">
        <rect x="-29" y="-20" width="58" height="48" rx="12" fill="#2b6965"/>
        <rect x="-29" y="-24" width="58" height="46" rx="12" fill="#9bdbc0" stroke="#225354" stroke-width="3"/>
        <rect x="-23" y="-19" width="46" height="13" rx="5" fill="#cff0d8"/>
        <rect x="-19" y="-2" width="38" height="17" rx="5" fill="#173c44"/>
        <path d="M-8-17v8m-5-4 5 5 5-5" fill="none" stroke="#315d56" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="17" cy="-13" r="3" fill="#4aab82"/>
      </g>${guideRobot(55, 78, true)}`;
  } else return '';
  return `<svg class="guide-art" data-guide-art="${kind}" viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${picture}</svg>`;
}

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
function previewFurniture(o, location, palette, index) {
  const {x, y, w, h, kind} = o, cx = x + w / 2, cy = y + h / 2;
  const rect = (inset, fill, radius = 7, stroke = palette.dark, width = 5) => `<rect x="${x + inset}" y="${y + inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
  let detail = rect(3, palette.dark);
  if (kind === 'arcade') {
    const glow = index % 2 ? '#f17dc8' : palette.accent;
    detail += rect(7, '#252437', 6, glow, 6);
    detail += `<rect x="${x + w * .18}" y="${y + h * .15}" width="${w * .64}" height="${h * .43}" rx="4" fill="${glow}"/><path d="M${cx - w * .15} ${y + h * .45}L${cx} ${y + h * .25}L${cx + w * .15} ${y + h * .45}Z" fill="#343049"/><circle cx="${x + w * .35}" cy="${y + h * .78}" r="8" fill="${glow}"/><circle cx="${x + w * .68}" cy="${y + h * .78}" r="6" fill="#f9d075"/>`;
  } else if (kind === 'planter' || kind === 'pot') {
    detail = kind === 'pot' ? `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * .45}" fill="#ae714c" stroke="${palette.dark}" stroke-width="7"/>` : rect(3, '#a77d55', 5) + rect(13, '#4e6741', 3, '#6f4e35', 4);
    const count = kind === 'pot' ? 1 : Math.max(2, Math.floor(Math.max(w, h) / 55));
    for (let i = 0; i < count; i++) {
      const px = kind === 'pot' || h > w ? cx : x + (i + .5) * w / count;
      const py = kind === 'pot' || w >= h ? cy : y + (i + .5) * h / count;
      const radius = kind === 'pot' ? Math.min(w, h) * .25 : Math.min(w, h) * .27;
      detail += `<circle cx="${px - radius * .5}" cy="${py - radius * .35}" r="${radius}" fill="#71a957"/><circle cx="${px + radius * .5}" cy="${py + radius * .3}" r="${radius}" fill="#3f803f"/><circle cx="${px}" cy="${py}" r="${radius * .4}" fill="${index % 2 ? '#efc76d' : '#b1d681'}"/>`;
    }
  } else if (kind === 'sofa') {
    const fabric = location === 1 ? '#8563a7' : '#c87e68';
    detail += rect(7, fabric, 10) + rect(18, location === 1 ? '#b492cc' : '#efb18a', 6, fabric, 5);
    for (let i = 1; i < 3; i++) detail += w >= h ? `<path d="M${x + w * i / 3} ${y + 18}V${y + h - 18}" stroke="${fabric}" stroke-width="7"/>` : `<path d="M${x + 18} ${y + h * i / 3}H${x + w - 18}" stroke="${fabric}" stroke-width="7"/>`;
  } else if (kind === 'speaker') {
    detail += rect(8, '#4c4858', 5);
    const r = Math.min(w, h) * .22;
    detail += `<circle cx="${cx}" cy="${y + h * .3}" r="${r * .7}" fill="#181d28" stroke="#92929a" stroke-width="4"/><circle cx="${cx}" cy="${y + h * .68}" r="${r}" fill="#181d28" stroke="#92929a" stroke-width="4"/>`;
  } else if (kind === 'table' && location === 1) {
    detail += rect(7, '#534260', 7, palette.accent, 5);
    const count = Math.max(1, Math.floor((w - 8) / 85)), unit = (w - 20) / count;
    for (let i = 0; i < count; i++) {
      const left = x + 10 + i * unit, glow = i % 2 ? palette.accent : '#ee85bf';
      detail += `<rect x="${left + 5}" y="${y + h * .19}" width="${unit - 10}" height="${h * .47}" rx="3" fill="#153649" stroke="${glow}" stroke-width="4"/><path d="M${left + unit * .22} ${y + h * .3}V${y + h * .54}M${left + unit * .77} ${y + h * .34}V${y + h * .59}" stroke="#a4e8d3" stroke-width="6"/><circle cx="${left + unit * .54}" cy="${y + h * .4}" r="5" fill="#ffe3a0"/><rect x="${left + 3}" y="${y + h * .75}" width="${unit - 6}" height="${h * .15}" rx="3" fill="#25243b"/><circle cx="${left + unit * .3}" cy="${y + h * .81}" r="6" fill="${glow}"/><circle cx="${left + unit * .68}" cy="${y + h * .81}" r="5" fill="#f4d177"/>`;
    }
  } else if (kind === 'table') {
    detail += rect(7, '#cf9970', 13, palette.accent, 5);
    detail += `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * .24}" fill="#f2cd83"/><circle cx="${cx}" cy="${cy}" r="7" fill="${palette.dark}"/>`;
  } else if (kind === 'bench' && location === 2) {
    detail += rect(6, '#b89567', 4);
    const trayWidth = w * .56, columns = Math.max(2, Math.floor(trayWidth / 33));
    detail += `<rect x="${x + 12}" y="${y + 12}" width="${trayWidth}" height="${h - 24}" rx="3" fill="#354d39"/>`;
    for (let row = 0; row < 2; row++) for (let column = 0; column < columns; column++) {
      const px = x + 12 + (column + .5) * trayWidth / columns, py = y + 12 + (row + .5) * (h - 24) / 2;
      detail += `<ellipse cx="${px - 4}" cy="${py - 3}" rx="9" ry="5" fill="#82b96b"/><ellipse cx="${px + 4}" cy="${py + 3}" rx="9" ry="5" fill="#afd38a"/>`;
    }
    const canX = x + w * .81, canY = y + h * .44, radius = Math.min(16, w * .12);
    detail += `<circle cx="${canX}" cy="${canY}" r="${radius}" fill="#508d83"/><path d="M${canX + radius * .7} ${canY}l${radius * .65} ${-radius * .8}M${canX - radius * .5} ${canY - radius * .7}v${-radius * .5}h${radius}v${radius * .5}" fill="none" stroke="#92c5b0" stroke-width="5"/><rect x="${x + w * .73}" y="${y + h - 22}" width="${w * .16}" height="11" fill="#ead49c"/>`;
  } else {
    detail += rect(6, kind === 'cabinet' ? '#7f998d' : '#b98851', 4);
    if (kind === 'crate') {
      detail += `<path d="M${x + 14} ${y + 14}L${x + w - 14} ${y + h - 14}M${x + w - 14} ${y + 14}L${x + 14} ${y + h - 14}" stroke="#edc58a" stroke-width="10"/>`;
    } else {
      const lineColor = kind === 'cabinet' ? '#415951' : '#e1b77d';
      for (let i = 1; i < 3; i++) detail += `<path d="M${x + 12} ${y + h * i / 3}H${x + w - 12}" stroke="${lineColor}" stroke-width="7"/>`;
      if (kind === 'workbench') detail += `<rect x="${x + w - 43}" y="${y + 18}" width="23" height="${h - 36}" rx="3" fill="#526573"/>`;
    }
  }
  return `<g data-prop="${kind}">${detail}</g>`;
}

export function roomPreview(id) {
  if (previews.has(id)) return previews.get(id);
  const room = makeRoom(id);
  const p = LOCATIONS[room.location].palette, floor = ['', ''];
  // Use the same occupied cells as collision so corners and alcoves preview honestly.
  room.grid.forEach((row, y) => row.forEach((walkable, x) => {
    if (!walkable) return;
    const alternate = room.location === 1 || room.location === 2 ? (x + y) % 2 : y % 2;
    floor[alternate] += `M${x * 40} ${y * 40}h40v40h-40Z`;
  }));
  let shapes = `<rect width="960" height="640" fill="${p.wall}"/><path data-floor="0" d="${floor[0]}" fill="${p.floor}"/><path data-floor="1" d="${floor[1]}" fill="${p.floor2}"/>`;
  if (room.location === 1) shapes += `<path d="M70 20H390M570 20H890" stroke="${p.accent}" stroke-width="8"/><path d="M70 620H390M570 620H890" stroke="#eb79c7" stroke-width="8"/>`;
  if (room.location === 2) {
    for (let x = 80; x < 900; x += 100) shapes += `<rect x="${x}" y="8" width="68" height="24" fill="#b8d7bf"/><rect x="${x}" y="608" width="68" height="24" fill="#b8d7bf"/>`;
  }
  if (room.location === 3) {
    shapes += `<path d="M55 20H905" stroke="#8995a5" stroke-width="5"/>`;
    for (let x = 70; x < 900; x += 90) shapes += `<circle cx="${x}" cy="20" r="8" fill="#ffe4a2"/>`;
  }
  room.obstacles.forEach((o, i) => { shapes += previewFurniture(o, room.location, p, i); });
  room.debris.filter((_, i) => i % 9 === 0).forEach((d, i) => {
    const x = Math.round(d.x), y = Math.round(d.y);
    shapes += d.type === 'confetti' ? `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${['#f3cf73', '#70d4d9', '#ef81b8'][i % 3]}"/>` : d.type === 'stuck' ? `<ellipse cx="${x}" cy="${y}" rx="9" ry="5" fill="#729846"/>` : `<circle cx="${x}" cy="${y}" r="5" fill="${room.location === 1 ? '#edc5a0' : '#936b41'}" opacity=".75"/>`;
  });
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
    return `<button class="room-tile ${completed ? 'cleaned' : unlocked ? 'next-room' : 'locked'}" data-location="${r.location}" data-action="room:${r.id}" ${unlocked ? '' : 'disabled'}>${roomPreview(r.id)}<span class="room-tile-body"><span class="room-tile-top"><span class="room-number">${String(r.id).padStart(2, '0')}</span><strong>${esc(r.name)}</strong></span><span class="room-meta">${r.areaCount>1?`${r.areaCount} connected areas · `:''}${completed ? `${medal ? `${medal} medal` : 'Completed'} · Best ${timeText(career.bestTimes[r.id])} · ${found ? 'Treasure found' : 'Treasure missing'}` : unlocked ? (r.areaCount>1?'Clean 100% in each area':'Next room · Clean 100% to finish') : `Finish room ${r.id - 1} to unlock`}</span></span><span class="room-state">${completed ? 'Replay' : unlocked ? 'Play' : 'Locked'}</span></button>`;
  };
  return `<div class="page-head"><div><h1>Choose a room</h1><p>${done ? 'All rooms unlocked. Replay a room or try Endless.' : 'Finish a room to unlock the next.'}</p></div><span class="page-counter">${career.completed.length}<small>/ 24 complete</small></span></div>
    <nav class="districts" aria-label="Locations">${LOCATIONS.map((l, i) => `<button data-action="district:${i}" data-location="${i}" class="district ${i === district ? 'selected' : ''}" aria-pressed="${i === district}"><span class="district-number">0${i + 1}</span><strong>${esc(l.name)}</strong><small>${career.unlocked > i * 6 ? `Rooms ${i * 6 + 1}–${(i + 1) * 6}` : `Finish room ${i * 6} to unlock`}</small></button>`).join('')}</nav>
    <div class="location-heading" data-location="${district}"><h2>${esc(location.name)}</h2><p>${esc(location.subtitle)}</p></div><div class="room-tiles" data-location="${district}">${CAMPAIGN.filter(r => r.location === district).map(roomCard).join('')}</div>
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
    <div class="shop-guidance"><p>${ranks === 20 ? 'All upgrades purchased.' : count ? `${count} ${count === 1 ? 'upgrade' : 'upgrades'} available to buy.` : 'Finish a room to earn more coins.'}</p>${active ? '' : action(career.unlocked <= 24 ? 'continue' : 'rooms', career.unlocked <= 24 ? `Play room ${career.unlocked}` : 'Choose a room', 'primary')}</div>
    <section class="upgrade-grid" aria-label="Robot upgrades">${UPGRADES.map(u => {const rank = career.upgrades[u.key], price = upgradePrice(u.key, rank), maxed = rank === 5, canBuy = !maxed && career.coins >= price, next = statsFor({...career.upgrades, [u.key]:Math.min(5, rank + 1)}); return `<article class="upgrade-card ${canBuy ? 'affordable' : ''}" id="upgrade-${u.key}"><div class="upgrade-card-top"><span class="level-label">Level ${rank} / 5</span></div><h2 tabindex="-1">${esc(u.name)}</h2><p>${esc(u.description)}</p><div class="upgrade-comparison"><div><small>NOW</small><strong>${effect(u.key, current)}</strong></div>${maxed ? '' : `<div><small>NEXT</small><strong>${effect(u.key, next)}</strong></div>`}</div><div class="ranks" aria-hidden="true">${[1,2,3,4,5].map(i => `<i class="${rank >= i ? 'on' : ''}"></i>`).join('')}</div><div class="purchase-status">${maxed ? 'All five levels unlocked' : canBuy ? 'Ready to buy' : `Earn ${money(price - career.coins)} more coins`}</div>${action(`buy:${u.key}`, maxed ? 'Fully upgraded' : `Buy · ${money(price)} coins`, 'primary', maxed || !canBuy ? 'disabled' : '')}</article>`; }).join('')}</section>
    <div class="section-head"><h2>Robot color</h2><span>One new color every six rooms. Appearance only.</span></div><div class="shell-row">${SHELLS.map(s => `<button class="shell ${career.shell === s.id ? 'selected' : ''}" data-action="shell:${s.id}" aria-pressed="${career.shell === s.id}" ${career.completed.length < s.unlockAfter ? 'disabled' : ''}><span class="shell-dot" style="background:${s.color}"></span><strong>${esc(s.name)}</strong><small>${career.shell === s.id ? 'Equipped' : career.completed.length < s.unlockAfter ? `Finish room ${s.unlockAfter}` : 'Equip'}</small></button>`).join('')}</div>`;
}
