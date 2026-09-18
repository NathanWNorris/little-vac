/* Original Canvas artwork for Sweep Shift. No downloaded art, fonts, or assets. */
import { LOCATIONS, isWalkable } from './rooms.js';
const W = 960, H = 640, CELL = 40;
const PALETTES = LOCATIONS.map(location => location.palette);
const CONFETTI = ['#ed826e', '#f6d570', '#c4f2df', '#76cbd2', '#fcf0d7'];
const cache = new WeakMap();
const guidancePaths = new WeakMap();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const noise = (a, b = 0) => { const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); };

function rounded(ctx, x, y, w, h, r = 8) {
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.min(r, w / 2, h / 2));
}
function box(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color; rounded(ctx, x, y, w, h, r); ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}
function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, color, angle = 0) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2); ctx.fill();
}
function star(ctx, x, y, size, color, points = 5) {
  ctx.beginPath();
  for (let n = 0; n < points * 2; n++) {
    const a = n * Math.PI / points - Math.PI / 2, r = n % 2 ? size * .48 : size;
    const sx = x + Math.cos(a) * r, sy = y + Math.sin(a) * r;
    if (n) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy);
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function floor(ctx, room, palette) {
  ctx.fillStyle = palette.dark; ctx.fillRect(0, 0, W, H);
  const grid = room.grid, loc = room.location || 0;
  // The outside of the real collision grid supplies the architecture. Every
  // district keeps the exact same safe play area and caches its art once.
  if (loc === 0) {
    for (let y = 8; y < H; y += 12) for (let x = 8; x < W; x += 12) circle(ctx, x, y, 1.3, '#a1815563');
  } else if (loc === 1) {
    for (let y = 0; y < H; y += 20) {
      line(ctx, 0, y, W, y, '#53627b45');
      for (let x = y % 40 ? 0 : 30; x < W; x += 60) line(ctx, x, y, x, y + 20, '#53627b45');
    }
  } else if (loc === 2) {
    ctx.fillStyle = '#294f43'; ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 80) {
      box(ctx, x + 4, 4, 72, H - 8, 2, x % 160 ? '#82b29b' : '#9ac4a8');
      line(ctx, x + 7, 8, x + 72, 80, '#e1f5cd69', 3);
      for (let y = 4; y < H; y += 80) line(ctx, x, y, x + 80, y, '#325e51', 5);
    }
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#426b86'); sky.addColorStop(1, '#152736'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    for (let x = -12, i = 0; x < W; x += 37, i++) {
      const h = 18 + noise(i, 2) * 17;
      ctx.fillStyle = i % 2 ? '#233e52' : '#1b3448'; ctx.fillRect(x, 39 - h, 31, h);
      ctx.fillRect(x + 8, 635 - h, 32, h + 10);
      for (let xx = x + 5; xx < x + 28; xx += 8) for (let yy = 42 - h; yy < 36; yy += 8) {
        ctx.fillStyle = noise(xx, yy) > .35 ? '#edcf8280' : '#92bbca39'; ctx.fillRect(xx, yy, 3, 4);
        ctx.fillRect(xx + 8, yy + 597, 3, 4);
      }
    }
  }
  for (let gy = 0; gy < grid.length; gy++) {
    for (let gx = 0; gx < grid[gy].length; gx++) {
      if (!grid[gy][gx]) continue;
      const x = gx * CELL, y = gy * CELL;
      ctx.fillStyle = loc === 1 ? ((gx + gy) % 2 ? palette.floor : palette.floor2) : ((gx + Math.floor(gy / 2)) % 3 ? palette.floor : palette.floor2);
      ctx.fillRect(x, y, CELL, CELL);
      if (loc === 0 || loc === 3) {
        for (let py = 0; py < 40; py += 20) {
          line(ctx, x, y + py + .5, x + 40, y + py + .5, loc === 0 ? '#795c386a' : '#443d384c');
          line(ctx, x + 4, y + py + 5, x + 34, y + py + 5, '#fff1c522');
          line(ctx, x + 9, y + py + 12, x + 26 + noise(gx, gy) * 10, y + py + 12, '#60433125');
          if ((gx + gy + py) % 4 === 0) line(ctx, x + 39, y + py, x + 39, y + py + 20, '#5e443657');
        }
      } else if (loc === 1) {
        // Large repeated woven shapes read as carpet, never collectible scraps.
        ctx.strokeStyle = (gx + gy) % 2 ? '#be57852c' : '#62bbc42c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 4, y + 20); ctx.lineTo(x + 20, y + 4); ctx.lineTo(x + 36, y + 20); ctx.lineTo(x + 20, y + 36); ctx.closePath(); ctx.stroke();
        line(ctx, x + 5, y + 6, x + 15, y + 6, '#b1a1df19');
        line(ctx, x + 25, y + 34, x + 35, y + 34, '#b1a1df19');
      } else {
        // Warm paving and an occasional terracotta tile under the glasshouse.
        if ((gx + gy * 3) % 7 === 0) { ctx.fillStyle = '#bc8e70'; ctx.fillRect(x + 2, y + 2, 36, 36); }
        ctx.strokeStyle = '#706d5750'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, 38, 38);
        line(ctx, x + 4, y + 4, x + 35, y + 4, '#fff7d13d');
        if ((gx + gy) % 5 === 0) { ctx.fillStyle = '#fff9d316'; ctx.fillRect(x, y, 40, 40); }
      }
      if (!grid[gy - 1]?.[gx]) {
        ctx.fillStyle = loc === 1 ? '#e992d18a' : loc === 2 ? '#51796b' : '#ead4ab70'; ctx.fillRect(x, y, 40, 3);
        ctx.fillStyle = '#14263240'; ctx.fillRect(x, y + 3, 40, 4);
      }
      if (!grid[gy + 1]?.[gx]) { ctx.fillStyle = loc === 1 ? '#62cde67a' : '#1e343450'; ctx.fillRect(x, y + 36, 40, 4); }
      if (!grid[gy]?.[gx - 1]) { ctx.fillStyle = loc === 1 ? '#e992d16a' : '#fff3db50'; ctx.fillRect(x, y, 2, 40); }
      if (!grid[gy]?.[gx + 1]) { ctx.fillStyle = loc === 1 ? '#62cde66a' : '#1e343450'; ctx.fillRect(x + 37, y, 3, 40); }
    }
  }
  architecture(ctx, room, loc);
}

function wallLabel(ctx, text, x, y, width, color, background) {
  box(ctx, x, y, width, 23, 3, background);
  ctx.strokeStyle = color; ctx.lineWidth = 1; rounded(ctx, x + 2, y + 2, width - 4, 19, 2); ctx.stroke();
  ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  ctx.fillText(text, x + width / 2, y + 12);
}
function architecture(ctx, room, loc) {
  // All foreground structure is clipped to non-walkable cells, including
  // irregular wall cutouts; it can never hide the vacuum or imply a new wall.
  ctx.save();
  ctx.beginPath(); room.grid.forEach((row, gy) => row.forEach((v, gx) => { if (!v) ctx.rect(gx * CELL, gy * CELL, CELL, CELL); })); ctx.clip();
  if (loc === 0) {
    for (const y of [2, 607]) {
      box(ctx, 38, y, W - 76, 31, 3, '#8b6440');
      for (let x = 46; x < W - 45; x += 12) for (let yy = y + 6; yy < y + 30; yy += 10) circle(ctx, x, yy, 1, '#4d3929');
    }
    wallLabel(ctx, 'WOODWORK SHOP', 393, 7, 174, '#efd49d', '#3c372c');
    for (const x of [112, 222, 687, 797]) {
      line(ctx, x, 10, x + 23, 27, '#d8c39c', 4); box(ctx, x + 17, 21, 17, 7, 1, '#445b5c');
      box(ctx, x + 37, 10, 25, 16, 2, '#cfab74'); line(ctx, x + 40, 13, x + 58, 22, '#745533', 2);
    }
    wallLabel(ctx, 'MEASURE TWICE', 414, 608, 132, '#d9c094', '#4a3d2e');
  } else if (loc === 1) {
    line(ctx, 43, 8, 917, 8, '#f485cf', 3); line(ctx, 44, 31, 916, 31, '#6ad9f1', 2);
    wallLabel(ctx, 'AFTER HOURS', 386, 9, 188, '#f49be1', '#21182f');
    wallLabel(ctx, 'CLOSED', 752, 9, 99, '#7de5ef', '#161e34');
    wallLabel(ctx, 'INSERT COIN', 112, 9, 125, '#f9cf83', '#21182f');
    // Flush wall displays remain visible even in rooms with one small machine.
    for (let y = 75; y < 576; y += 105) for (const x of [5, 926]) {
      box(ctx, x, y, 29, 71, 3, '#765078'); box(ctx, x + 3, y + 4, 23, 61, 2, '#193a50');
      for (let p = 0; p < 4; p++) box(ctx, x + 7 + (p % 2) * 10, y + 12 + p * 10, 6, 6, 0, p % 2 ? '#75d2dd' : '#cc79b2');
    }
    line(ctx, 48, 610, 912, 610, '#bc5e9c', 2); line(ctx, 48, 627, 912, 627, '#5bafcb', 2);
    wallLabel(ctx, 'HIGH SCORES  •  08 420', 373, 607, 214, '#e8c978', '#21182f');
  } else if (loc === 2) {
    for (let x = 43; x < 923; x += 80) {
      line(ctx, x, 0, x, H, '#3b6d5d', 6);
      line(ctx, x + 4, 0, x + 4, H, '#d7eac383', 2);
      for (let y = 9; y < H; y += 80) line(ctx, x + 6, y, x + 68, y + 59, '#eaffd742', 2);
    }
    line(ctx, 0, 35, W, 35, '#2d5c4d', 7); line(ctx, 0, 605, W, 605, '#2d5c4d', 7);
    wallLabel(ctx, 'THE GLASSHOUSE', 384, 7, 192, '#f5e7be', '#43664e');
    for (let y = 87; y < 591; y += 94) {
      ellipse(ctx, 18, y, 13, 19, '#92715b'); leaves(ctx, 18, y - 4, 18);
      ellipse(ctx, 943, y + 15, 13, 18, '#92715b'); leaves(ctx, 943, y + 10, 18, 1);
    }
    wallLabel(ctx, 'SEEDLINGS  /  GROWING', 377, 608, 206, '#dce8b9', '#365b47');
  } else {
    // City silhouettes, steel parapet, and a party-light cable frame the deck.
    for (const x of [26, 934]) {
      line(ctx, x, 45, x, 599, '#a6bcc4', 4);
      for (let y = 50; y < 600; y += 40) line(ctx, x - 10, y, x + 10, y, '#7b929d', 3);
    }
    for (const y of [37, 602]) {
      line(ctx, 36, y, 924, y, '#bdc5be', 4);
      for (let x = 40; x <= 920; x += 40) line(ctx, x, y - 13, x, y + 5, '#7c929c', 3);
    }
    ctx.strokeStyle = '#152733'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(46, 7); ctx.quadraticCurveTo(245, 34, 438, 9); ctx.quadraticCurveTo(670, 34, 914, 7); ctx.stroke();
    for (let x = 66; x < 922; x += 47) {
      const yy = 10 + Math.sin((x - 46) / 868 * Math.PI * 2) ** 2 * 12;
      line(ctx, x, yy, x, yy + 5, '#29313a', 2);
      circle(ctx, x, yy + 9, 7, '#f4cd5b26'); circle(ctx, x, yy + 9, 3.4, '#fff0ac');
    }
    wallLabel(ctx, 'ROOFTOP SOCIAL CLUB', 365, 608, 230, '#f8dcad', '#233b49');
  }
  ctx.restore();
}
function bolt(ctx, x, y) { circle(ctx, x, y, 2, '#efe5c690'); line(ctx, x - 1, y, x + 1, y, '#42504a', .8); }
function cup(ctx, x, y, color = '#fbefdb') {
  ellipse(ctx, x + 2, y + 3, 7, 5, '#172e3527');
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 6, y, 3, -1.3, 1.3); ctx.stroke();
  circle(ctx, x, y, 6, color); circle(ctx, x, y, 3.4, '#6e4f40'); circle(ctx, x - 1, y - 1, 1.4, '#b79569');
}
function leaves(ctx, x, y, size, tint = 0) {
  const colors = tint ? ['#82ab65', '#a5c574', '#4e814d'] : ['#44875b', '#72ad67', '#2d6549'];
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + .3;
    ellipse(ctx, x + Math.cos(a) * size * .42, y + Math.sin(a) * size * .42, size * .57, size * .24, colors[i % 3], a);
  }
  circle(ctx, x, y, size * .2, '#c4e3ad');
}
function arcadeMachine(ctx, x, y, w, h, variant = 0, cocktail = false) {
  const neon = variant % 2 ? '#ee85bf' : '#74dce8';
  box(ctx, x, y + 3, w, h - 3, 5, '#111624');
  box(ctx, x + 2, y, w - 4, h - 5, 5, '#484568');
  box(ctx, x + 5, y + 3, w - 10, cocktail ? 9 : Math.max(12, h * .12), 2, variant % 2 ? '#a3427b' : '#317c9b');
  line(ctx, x + 8, y + 7, x + w - 8, y + 7, neon, 2);
  const sy = y + h * .19, sh = h * .47, sx = x + 9, sw = w - 18;
  box(ctx, sx - 3, sy - 3, sw + 6, sh + 6, 3, '#171d30');
  box(ctx, sx, sy, sw, sh, 2, '#153649');
  const glow = ctx.createLinearGradient(sx, sy, sx, sy + sh); glow.addColorStop(0, '#429ab629'); glow.addColorStop(1, '#64cee063');
  ctx.fillStyle = glow; ctx.fillRect(sx, sy, sw, sh);
  // Tiny original pixel games in the lit screens: invaders, a maze, or paddles.
  ctx.save(); ctx.beginPath(); ctx.rect(sx + 2, sy + 2, sw - 4, sh - 4); ctx.clip();
  if (variant % 3 === 0) {
    const px = Math.max(2, Math.min(4, sw / 16));
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
      const xx = sx + 7 + col * (sw - 14) / 3, yy = sy + 7 + row * Math.max(12, sh * .29);
      ctx.fillStyle = row ? '#ebcf6c' : '#9ce49b'; ctx.fillRect(xx, yy + px, px * 3, px); ctx.fillRect(xx + px, yy, px, px * 3);
    }
    box(ctx, sx + sw * .5 - 5, sy + sh - 10, 11, 3, 0, '#f398c3');
  } else if (variant % 3 === 1) {
    ctx.strokeStyle = '#7699df'; ctx.lineWidth = 2;
    ctx.strokeRect(sx + 5, sy + 5, sw - 10, sh - 10);
    line(ctx, sx + 9, sy + sh * .5, sx + sw * .62, sy + sh * .5, '#79bbe1', 3);
    line(ctx, sx + sw * .62, sy + sh * .5, sx + sw * .62, sy + 9, '#79bbe1', 3);
    circle(ctx, sx + sw * .3, sy + sh * .28, 3, '#f9db73');
  } else {
    line(ctx, sx + 7, sy + sh * .25, sx + 7, sy + sh * .63, '#9ae2c8', 3);
    line(ctx, sx + sw - 7, sy + sh * .4, sx + sw - 7, sy + sh * .78, '#eaa6ce', 3);
    circle(ctx, sx + sw * .64, sy + sh * .37, 2.5, '#fff0bf');
  }
  ctx.restore();
  box(ctx, x + 5, y + h * .73, w - 10, h * .16, 3, '#25243b');
  circle(ctx, x + w * .3, y + h * .81, 5, '#151e2a'); circle(ctx, x + w * .3, y + h * .79, 3.4, neon);
  circle(ctx, x + w * .65, y + h * .79, 2.8, '#f4d177'); circle(ctx, x + w * .78, y + h * .81, 2.6, '#d97faf');
  box(ctx, x + w * .44, y + h * .94, w * .18, 2, 0, '#b7a780');
  line(ctx, x + 2, y + 7, x + 2, y + h - 7, neon, 2); line(ctx, x + w - 3, y + 7, x + w - 3, y + h - 7, neon + '99', 2);
}
function pottingBench(ctx, x, y, w, h) {
  box(ctx, x, y + 4, w, h - 4, 5, '#4e624d'); box(ctx, x, y, w, h - 5, 5, '#b89567');
  for (let yy = y + 12; yy < y + h - 8; yy += 13) line(ctx, x + 4, yy, x + w - 4, yy, '#795f425e');
  const tw = w * .59, th = h - 17;
  box(ctx, x + 7, y + 6, tw, th, 3, '#425342');
  const cols = Math.max(2, Math.floor(tw / 23)), rows = Math.max(2, Math.floor(th / 23));
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const px = x + 7 + (col + .5) * tw / cols, py = y + 6 + (row + .5) * th / rows;
    box(ctx, px - 7, py - 7, 14, 14, 2, '#2d3c2f'); leaves(ctx, px, py, 7, (row + col) % 2);
  }
  const cx = x + w * .82, cy = y + h * .48;
  circle(ctx, cx, cy, Math.min(14, w * .13), '#508d83');
  ctx.strokeStyle = '#346a62'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy - 8, 7, Math.PI, Math.PI * 2); ctx.stroke();
  line(ctx, cx + 8, cy + 2, cx + 17, cy - 9, '#58958a', 5); ellipse(ctx, cx + 18, cy - 10, 4, 2, '#b5d8ba', -.7);
  box(ctx, x + w * .72, y + h - 17, w * .2, 7, 1, '#e8cf96');
}
function furniture(ctx, o, loc) {
  const { x, y, w, h } = o, kind = String(o.kind || 'crate').toLowerCase();
  const rx = x + 4, ry = y + 3, rw = w - 8, rh = h - 8;
  if (rw < 4 || rh < 4) return;
  box(ctx, x + 5, y + 10, w - 7, h - 10, 9, '#17232b46');
  if (/crate|box/.test(kind)) {
    box(ctx, rx, ry + 4, rw, rh, 5, '#8e6949'); box(ctx, rx, ry, rw, rh - 3, 5, '#c7925e');
    ctx.save(); rounded(ctx, rx + 3, ry + 3, rw - 6, rh - 9, 3); ctx.clip();
    for (let yy = ry + 7; yy < ry + rh; yy += 14) line(ctx, rx + 4, yy, rx + rw - 4, yy, '#8d60363d', 2);
    line(ctx, rx + 5, ry + 5, rx + rw - 5, ry + rh - 10, '#e3b17c', 7);
    line(ctx, rx + rw - 5, ry + 5, rx + 5, ry + rh - 10, '#d5a371', 7); ctx.restore();
    [rx + 5, rx + rw - 5].forEach(bx => [ry + 5, ry + rh - 9].forEach(by => bolt(ctx, bx, by)));
  } else if (/workbench|cabinet/.test(kind)) {
    box(ctx, rx, ry + 5, rw, rh, 7, '#254b4c'); box(ctx, rx, ry, rw, rh - 2, 7, '#56817a');
    box(ctx, rx + 3, ry + 3, rw - 6, rh - 10, 4, kind === 'workbench' ? '#bc9e72' : '#77978c');
    if (kind === 'workbench') {
      for (let yy = ry + 14; yy < ry + rh - 10; yy += 17) line(ctx, rx + 5, yy, rx + rw - 5, yy, '#6a482f32');
      box(ctx, rx + 10, ry + 9, rw * .51, rh * .57, 2, '#d8b27a');
      // Carpenter's square, saw, hammer, and a yellow measuring rule.
      line(ctx, rx + 16, ry + 15, rx + 16, ry + rh * .43, '#59666a', 5);
      line(ctx, rx + 16, ry + rh * .43, rx + rw * .38, ry + rh * .43, '#59666a', 5);
      const sy = ry + rh * .67;
      ctx.fillStyle = '#c5cfca'; ctx.beginPath(); ctx.moveTo(rx + 15, sy); ctx.lineTo(rx + rw * .57, sy - 8); ctx.lineTo(rx + rw * .57, sy + 9); ctx.lineTo(rx + 15, sy + 4); ctx.fill();
      for (let xx = rx + 17; xx < rx + rw * .55; xx += 5) line(ctx, xx, sy + 5, xx + 3, sy + 9, '#7b887f', 1.3);
      box(ctx, rx + rw * .57, sy - 7, 16, 16, 3, '#9c5735'); box(ctx, rx + rw * .57 + 4, sy - 3, 8, 8, 2, '#cba16b');
      line(ctx, rx + rw - 25, ry + 19, rx + rw - 25, ry + rh - 18, '#a45f39', 6);
      box(ctx, rx + rw - 37, ry + 12, 26, 11, 2, '#737f7c');
      box(ctx, rx + 7, ry + rh - 13, rw - 14, 6, 1, '#e9c363');
      for (let xx = rx + 12; xx < rx + rw - 9; xx += 8) line(ctx, xx, ry + rh - 13, xx, ry + rh - 10, '#796632');
      box(ctx, rx + rw * .48, ry + rh - 8, 28, 9, 2, '#435959');
    } else {
      const vertical = rh > rw;
      for (let i = 1; i <= 2; i++) {
        const hx = rx + rw * (vertical ? .5 : i / 3), hy = ry + rh * (vertical ? i / 3 : .5);
        box(ctx, hx - 6, hy - 2, 12, 4, 2, '#d5d1b3');
      }
    }
    line(ctx, rx + 6, ry + 4, rx + rw - 6, ry + 4, '#d6dbc159', 2);
  } else if (/arcade/.test(kind)) {
    const columns = Math.max(1, Math.round(w / 85)), rows = Math.max(1, Math.round(h / 170));
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      arcadeMachine(ctx, rx + col * rw / columns, ry + row * rh / rows, rw / columns - 3, rh / rows - 3, col + row + Math.floor(x / 80));
    }
  } else if (/planter|pot/.test(kind)) {
    if (kind === 'pot') {
      const radius = Math.min(rw, rh) * .46, cx = rx + rw / 2, cy = ry + rh / 2;
      ellipse(ctx, cx, cy + 4, radius, radius * .94, '#75503b'); circle(ctx, cx, cy, radius, '#c88b5c');
      circle(ctx, cx, cy, radius * .81, '#685440'); leaves(ctx, cx, cy, radius * .93);
      for (let i = 0; i < 3; i++) { const a = i * 2.1; circle(ctx, cx + Math.cos(a) * radius * .5, cy + Math.sin(a) * radius * .5, 4, '#e5b77b'); }
      return;
    }
    box(ctx, rx, ry + 4, rw, rh, Math.min(rw, rh) * .2, '#996c54');
    box(ctx, rx, ry, rw, rh - 3, Math.min(rw, rh) * .2, '#c89069');
    box(ctx, rx + 4, ry + 4, rw - 8, rh - 11, Math.min(rw, rh) * .16, '#6b6651');
    const horizontal = rw > rh, length = horizontal ? rw : rh, breadth = Math.min(rw, rh);
    const count = Math.max(1, Math.floor(length / 36));
    for (let n = 0; n < count; n++) {
      const px = horizontal ? rx + (n + .5) * rw / count : rx + rw / 2;
      const py = horizontal ? ry + rh / 2 - 2 : ry + (n + .5) * (rh - 4) / count;
      leaves(ctx, px, py, Math.min(31, breadth * .46), n % 2);
      if ((n + Math.floor(x / 40)) % 3 === 0) { circle(ctx, px + 3, py - 2, 4, '#f4bd95'); circle(ctx, px + 3, py - 2, 1.6, '#ffe8a9'); }
    }
    box(ctx, rx + rw - 16, ry + rh - 22, 7, 13, 1, '#f5e1b3'); line(ctx, rx + rw - 14, ry + rh - 18, rx + rw - 11, ry + rh - 18, '#5b774d');
  } else if (/sofa|bench/.test(kind)) {
    if (kind === 'bench' && loc === 2) { pottingBench(ctx, rx, ry, rw, rh); return; }
    const wood = kind === 'bench', color = wood ? '#b99364' : loc === 1 ? '#d986a7' : '#83b6a3';
    box(ctx, rx, ry + 4, rw, rh, 9, wood ? '#6d6850' : '#50616a');
    box(ctx, rx, ry, rw, rh - 3, 9, color);
    const horizontal = rw >= rh;
    if (wood) {
      for (let i = 1; i <= 3; i++) {
        if (horizontal) line(ctx, rx + 6, ry + i * (rh - 3) / 4, rx + rw - 6, ry + i * (rh - 3) / 4, '#715c4044', 2);
        else line(ctx, rx + i * rw / 4, ry + 6, rx + i * rw / 4, ry + rh - 7, '#715c4044', 2);
      }
    } else {
      const n = Math.max(1, Math.floor((horizontal ? rw : rh) / 44));
      for (let i = 0; i < n; i++) {
        const bx = horizontal ? rx + 7 + i * (rw - 14) / n : rx + 7;
        const by = horizontal ? ry + 9 : ry + 7 + i * (rh - 18) / n;
        box(ctx, bx, by, horizontal ? (rw - 18) / n : rw - 14, horizontal ? rh - 20 : (rh - 22) / n, 5, '#ffffff20');
      }
      box(ctx, rx + 3, ry + 3, horizontal ? rw - 6 : 7, horizontal ? 7 : rh - 10, 4, '#ffffff26');
    }
  } else if (/speaker/.test(kind)) {
    box(ctx, rx, ry + 4, rw, rh, 7, '#252b3b'); box(ctx, rx, ry, rw, rh - 3, 7, '#424455');
    const s = Math.min(rw * .33, rh * .23);
    [ry + rh * .28, ry + rh * .69].forEach(py => { circle(ctx, rx + rw / 2, py, s, '#272f3c'); circle(ctx, rx + rw / 2, py, s * .68, '#686372'); circle(ctx, rx + rw / 2, py, s * .32, '#a8a0a0'); });
    circle(ctx, rx + rw - 7, ry + 7, 2, '#c8e2a4');
  } else {
    if (loc === 1) {
      // Even the sparse fan room has recognizable two-player cocktail cabinets.
      box(ctx, rx, ry, rw, rh, 7, '#534260');
      const columns = Math.max(1, Math.floor(rw / 85));
      for (let col = 0; col < columns; col++) arcadeMachine(ctx, rx + 4 + col * (rw - 6) / columns, ry + 3, (rw - 9) / columns, rh - 5, col + 1, true);
      return;
    }
    // A table is also the visual fallback for future rectangular prop kinds.
    box(ctx, rx, ry + 5, rw, rh, 9, loc === 1 ? '#5e557a' : '#997662');
    box(ctx, rx, ry, rw, rh - 3, 9, loc === 1 ? '#b597c9' : loc === 3 ? '#f0d4a8' : '#d4b37f');
    line(ctx, rx + 8, ry + 5, rx + rw - 8, ry + 5, '#fff4d955', 2);
    if (loc === 3) {
      // Coral table runners, plates and place settings mark the party tables.
      box(ctx, rx + rw * .43, ry + 2, rw * .22, rh - 7, 1, '#b5675c');
      for (let yy = ry + 6; yy < ry + rh - 8; yy += 9) line(ctx, rx + rw * .46, yy, rx + rw * .62, yy, '#f4c89c55');
    }
    cup(ctx, rx + rw * .32, ry + rh * .44, loc === 1 ? '#d9e5f1' : '#f8eee0');
    if (rw > 60 || rh > 60) {
      circle(ctx, rx + rw * .71, ry + rh * .6, 9, '#fff6dc');
      circle(ctx, rx + rw * .71, ry + rh * .6, 6, '#d3926e');
      circle(ctx, rx + rw * .71 + 1, ry + rh * .6 - 1, 2, '#e7b07a');
    }
    if (loc === 3) {
      const cx = rx + rw * .67, cy = ry + rh * .3;
      circle(ctx, cx, cy, 9, '#faf0da'); circle(ctx, cx, cy, 6, '#dcbca0');
      line(ctx, cx - 13, cy - 5, cx - 13, cy + 6, '#e9e7d1', 2); line(ctx, cx + 13, cy - 5, cx + 13, cy + 6, '#e9e7d1', 2);
    }
  }
}
function makeBackground(room) {
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  floor(ctx, room, PALETTES[room.location || 0]);
  const floorPath = new Path2D();
  room.grid.forEach((row, gy) => row.forEach((walkable, gx) => { if (walkable) floorPath.rect(gx * CELL, gy * CELL, CELL, CELL); }));
  if (room.location === 2) {
    // Broad, quiet roof-glass light bands do not resemble loose dirt or walls.
    ctx.save(); ctx.clip(floorPath);
    for (let x = -320; x < W; x += 260) {
      ctx.fillStyle = '#fff8be17'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 150, 0); ctx.lineTo(x + 550, H); ctx.lineTo(x + 400, H); ctx.fill();
      line(ctx, x + 150, 0, x + 550, H, '#365e4022', 5);
    }
    ctx.restore();
  }
  for (const obstacle of room.obstacles || []) furniture(ctx, obstacle, room.location || 0);
  return { image: canvas, floorPath };
}
function drawFans(ctx, fans, time, still) {
  for (const fan of fans || []) {
    ctx.save(); rounded(ctx, fan.x, fan.y, fan.w, fan.h, 12); ctx.clip();
    ctx.fillStyle = '#edfff515'; ctx.fillRect(fan.x, fan.y, fan.w, fan.h);
    ctx.strokeStyle = '#ecfff548'; ctx.lineWidth = 1; ctx.setLineDash([4, 7]);
    rounded(ctx, fan.x + 2, fan.y + 2, fan.w - 4, fan.h - 4, 10); ctx.stroke(); ctx.setLineDash([]);
    const angle = Math.atan2(fan.dy, fan.dx), shift = still ? 0 : (time * 25) % 44;
    for (let yy = fan.y + 22; yy < fan.y + fan.h; yy += 44) {
      for (let xx = fan.x + 22; xx < fan.x + fan.w; xx += 44) {
        ctx.save(); ctx.translate(xx + fan.dx * shift, yy + fan.dy * shift); ctx.rotate(angle);
        ctx.strokeStyle = '#f7ffed77'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(8, 0); ctx.moveTo(2, -5); ctx.lineTo(8, 0); ctx.lineTo(2, 5); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }
}
function station(ctx, s, hint, active, time, still) {
  const pulse = still ? .55 : .5 + Math.sin(time * 4) * .5;
  if (hint) {
    ctx.fillStyle = `rgba(162,244,207,${.13 + pulse * .08})`; ctx.beginPath(); ctx.arc(s.x, s.y, 47, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b9ffe0'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.arc(s.x, s.y, 45, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  ellipse(ctx, s.x + 2, s.y + 9, 31, 23, '#17343838');
  box(ctx, s.x - 29, s.y - 20, 58, 48, 12, '#2b6965');
  box(ctx, s.x - 29, s.y - 24, 58, 46, 12, '#9bdbc0');
  box(ctx, s.x - 24, s.y - 20, 48, 13, 6, '#cff0d8');
  box(ctx, s.x - 19, s.y - 4, 38, 18, 5, '#225354');
  box(ctx, s.x - 14, s.y + 1, 28, 9, 3, '#173c44');
  line(ctx, s.x - 21, s.y + 18, s.x + 21, s.y + 18, '#e4f7d279', 2);
  circle(ctx, s.x + 18, s.y - 13, 3, active ? '#fff09f' : '#4aab82');
  ctx.strokeStyle = '#315d56'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(s.x - 8, s.y - 16); ctx.lineTo(s.x - 8, s.y - 10); ctx.moveTo(s.x - 12, s.y - 13); ctx.lineTo(s.x - 8, s.y - 9); ctx.lineTo(s.x - 4, s.y - 13); ctx.stroke();
  if (hint) {
    box(ctx, s.x - 44, s.y + 33, 88, 20, 10, '#23474c');
    ctx.font = 'bold 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#c8ffe4';
    ctx.fillText(typeof hint === 'string' ? hint : 'DROP-OFF', s.x, s.y + 43);
  }
}
function debris(ctx, d, loc, time, still) {
  if (d.collected || d.amount <= 0) return;
  const id = typeof d.id === 'number' ? d.id : Math.round(d.x * 17 + d.y), variation = noise(id);
  const angle = Number.isFinite(d.angle) ? d.angle : variation * 6.28;
  const weight = clamp(((d.resistance ?? 1) - 1) / 1.6, 0, 1);
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(angle);
  if (d.type === 'dust') {
    ctx.globalAlpha = clamp(d.amount ?? 1, 0, 1) * .77;
    const color = loc === 1 ? '#cab6da' : loc === 2 ? '#6e7050' : '#766046';
    const r = 10 + variation * 6 + weight * 2;
    const grad = ctx.createRadialGradient(0, 0, r * .25, 0, 0, r);
    grad.addColorStop(0, color + 'aa'); grad.addColorStop(.6, color + '70'); grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .74, 0, 0, Math.PI * 2); ctx.fill();
    for (let n = 0; n < 4 + Math.floor(weight * 5); n++) circle(ctx, (noise(id, n + 4) - .5) * r * 1.2, (noise(id, n + 9) - .5) * r, .9 + noise(id, n + 15) + weight * .4, color + (weight > .3 ? '99' : '66'));
    if (weight > .3) {
      // Compacted dirt has a darker, cracked center. All of it fades with the
      // real remaining amount, so the tougher patch still shows its progress.
      ctx.strokeStyle = color + '88'; ctx.lineWidth = .9 + weight * .4;
      ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(0, 1); ctx.lineTo(4, -2); ctx.moveTo(0, 1); ctx.lineTo(-1, 5); ctx.stroke();
    }
  } else if (d.type === 'confetti') {
    const color = CONFETTI[Math.floor(variation * CONFETTI.length)];
    const flutter = still ? 1 : .75 + Math.sin(time * 5 + id) * .25;
    box(ctx, -2, -4, 5, 9, 1, '#24384125');
    ctx.scale(flutter, 1); box(ctx, -3, -5, 5, 9, .8, color); line(ctx, -2, -4, 1, -3, '#fff9ee77', 1);
  } else if (d.type === 'stuck') {
    if (weight > .2 && !d.loose) {
      // The fastening ring disappears as the scrap loosens; it is not another
      // collectible or a second progress meter covering the actual scrap.
      ctx.strokeStyle = loc === 1 ? '#e3c29690' : '#68533899'; ctx.lineWidth = 1 + weight;
      ctx.beginPath(); ctx.arc(0, 0, 10 + weight * 2, -.5 * Math.PI + clamp(d.progress || 0, 0, 1) * Math.PI * 2, Math.PI * 1.5); ctx.stroke();
    }
    const pulling = Math.hypot(d.vx || 0, d.vy || 0) > 1 || (d.progress || 0) > 0 || (d.amount ?? 1) < 1;
    if (pulling && !still) ctx.rotate(Math.sin(time * 35 + id) * .13);
    if (loc === 2) {
      ellipse(ctx, 1, 2, 7, 4, '#344e392e', -.5);
      ctx.fillStyle = variation > .5 ? '#73934b' : '#bca45e';
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(1, -9, 8, -1); ctx.quadraticCurveTo(1, 8, -8, 0); ctx.fill();
      line(ctx, -7, 0, 7, 0, '#e8d58c99', 1.2);
    } else {
      box(ctx, -6, -5, 12, 11, 2, '#344e392e');
      box(ctx, -6, -7, 12, 11, 1.5, variation > .5 ? '#efb67d' : '#e4d395');
      ctx.fillStyle = '#f9edc6'; ctx.beginPath(); ctx.moveTo(6, -7); ctx.lineTo(6, -2); ctx.lineTo(1, -7); ctx.fill();
      line(ctx, -3, -2, 2, -2, '#906c5140', 1);
    }
  } else {
    const size = 2 + variation * 2.3;
    circle(ctx, 1, 1.5, size, '#4c4a3340');
    ctx.fillStyle = loc === 1 ? '#eac78d' : loc === 2 ? '#b2a06a' : '#bd8852';
    ctx.beginPath(); ctx.moveTo(-size, size * .65); ctx.lineTo(-size * .55, -size); ctx.lineTo(size * .75, -size * .65); ctx.lineTo(size, size * .5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = loc === 1 ? '#826343' : loc === 2 ? '#686035' : '#795132'; ctx.lineWidth = .85; ctx.stroke();
    line(ctx, -size * .4, -size * .45, size * .35, -size * .4, '#ffe0a88c', 1);
  }
  ctx.restore();
}
function trinket(ctx, t, time, still) {
  if (!t || t.hidden || t.collected) return;
  const bob = still ? 0 : Math.sin(time * 2.5) * 2;
  const glow = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, 24);
  glow.addColorStop(0, '#fff0a26b'); glow.addColorStop(1, '#fff0a200');
  circle(ctx, t.x, t.y, 24, glow);
  ellipse(ctx, t.x + 1, t.y + 9, 9, 3, '#384a4230');
  star(ctx, t.x, t.y + bob, 10, '#fff5c5'); star(ctx, t.x, t.y + bob, 7, '#e9b757');
  circle(ctx, t.x - 1.5, t.y + bob - 2, 1.6, '#fff4d0');
  const sparkle = still ? 1 : .65 + Math.sin(time * 3) * .35;
  star(ctx, t.x + 13, t.y - 13 + bob, 4 * sparkle, '#fff9d7', 4);
}
function robot(ctx, r, capacity, color, time, still, full = false) {
  const moving = clamp(r.move || 0, 0, 1), fill = clamp((r.bag || 0) / Math.max(1, capacity), 0, 1);
  const vibration = still ? 0 : Math.sin(time * 26) * moving * .5;
  ellipse(ctx, r.x + 2, r.y + 7, 23, 18, '#16374135');
  ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.angle || 0);
  const squash = still ? 0 : clamp(r.squash || 0, 0, 1) * .07;
  ctx.scale(1 + squash, 1 - squash); ctx.translate(0, vibration);
  // Rubber wheels and their moving tread, the brush roller, then the molded shell.
  box(ctx, -12, -22, 24, 8, 3.5, '#264349'); box(ctx, -12, 14, 24, 8, 3.5, '#264349');
  for (let i = 0; i < 4; i++) {
    const wx = -9 + ((i * 6 + (still ? 0 : time * moving * 18)) % 24);
    line(ctx, wx, -20, wx, -16, '#7b9792', 1.5); line(ctx, wx, 16, wx, 20, '#7b9792', 1.5);
  }
  box(ctx, 14, -17, 10, 34, 4, '#36676a'); box(ctx, 19, -15, 7, 30, 3, '#faf2d2');
  for (let n = -11; n <= 11; n += 5) {
    const bx = 22 + (still ? 0 : Math.sin(time * 19 + n) * 1.2);
    line(ctx, bx, n, 26, n + 2, '#acb9a0', 1.3);
  }
  box(ctx, -20, -18, 40, 38, 14, '#3b7370'); box(ctx, -20, -20, 40, 37, 14, color);
  box(ctx, -17, -17, 34, 31, 11, '#fffdf111');
  ctx.strokeStyle = '#fff9e57a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-12, -16); ctx.quadraticCurveTo(-17, -15, -17, -8); ctx.stroke();
  // Transparent bag window: its colored contents rise with the real bag meter.
  box(ctx, -15, -11, 14, 22, 4, '#426f70'); box(ctx, -13, -9, 10, 18, 2, '#abdacb');
  ctx.save(); rounded(ctx, -13, -9, 10, 18, 2); ctx.clip();
  ctx.fillStyle = full ? '#efb871' : '#dfc587'; ctx.fillRect(-13, 9 - fill * 18, 10, fill * 18);
  for (let i = 0; i < Math.ceil(fill * 16); i++) {
    box(ctx, -12 + noise(i + 2) * 7, 6 - Math.floor(i / 3) * 3, 3, 3, .6, CONFETTI[i % CONFETTI.length]);
  }
  line(ctx, -11, -7, -11, 4, '#f6fff77d', 1.4); ctx.restore();
  // Large glossy eyes read well even on a small viewport.
  ellipse(ctx, 6, -7, 4, 5, '#fff9e8'); ellipse(ctx, 6, 7, 4, 5, '#fff9e8');
  const blink = !still && Math.sin(time * .8) > .997;
  if (blink) {
    line(ctx, 4, -7, 9, -7, '#24484d', 2); line(ctx, 4, 7, 9, 7, '#24484d', 2);
  } else {
    circle(ctx, 7.2, -7, 2.3, '#24484d'); circle(ctx, 7.2, 7, 2.3, '#24484d');
    circle(ctx, 7.7, -7.6, .7, '#ffffff'); circle(ctx, 7.7, 6.4, .7, '#ffffff');
  }
  ctx.strokeStyle = '#315c56'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(12, -3); ctx.quadraticCurveTo(full ? 10 : 16, 0, 12, 3); ctx.stroke();
  line(ctx, -11, -18, -15, -27, '#386765', 2.2);
  circle(ctx, -15, -27, 3.4, full ? '#efad65' : '#fff0a3'); circle(ctx, -15.7, -28, 1.1, '#fff8d8');
  box(ctx, -20, -4, 3, 8, 1.5, '#edf0d8');
  ctx.restore();
}
function suction(ctx, run, time, still) {
  if (run.started === false || run.full || run.unloading > 0 || run.phase !== 'playing') return;
  const r = run.robot, radius = run.stats.radius;
  const grad = ctx.createRadialGradient(r.x, r.y, 21, r.x, r.y, radius);
  grad.addColorStop(0, '#fffbe800'); grad.addColorStop(.64, '#fff8dd13'); grad.addColorStop(1, '#fff8dd00');
  circle(ctx, r.x, r.y, radius, grad);
  ctx.lineWidth = 1.2; ctx.strokeStyle = '#fff7de3c';
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + (still ? .4 : time * .7), rr = radius * (.7 + (i % 2) * .13);
    ctx.beginPath(); ctx.arc(r.x, r.y, rr, a, a + .32); ctx.stroke();
  }
  if (still) return;
  for (const d of run.debris) {
    if (d.collected || d.type === 'dust') continue;
    const speed = Math.hypot(d.vx || 0, d.vy || 0);
    if (speed < 25 || Math.hypot(d.x - r.x, d.y - r.y) > radius + 15) continue;
    const length = Math.min(17, speed * .033);
    const dx = (d.vx || 0) / speed, dy = (d.vy || 0) / speed;
    line(ctx, d.x - dx * length, d.y - dy * length, d.x, d.y, '#fff7d981', 1.7);
  }
}
function unloading(ctx, run, time, still) {
  if (!(run.unloading > 0)) return;
  const s = run.room.stations[run.nearestStation || 0], r = run.robot;
  if (!s) return;
  ctx.strokeStyle = '#fff0b47a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.quadraticCurveTo((r.x + s.x) / 2, Math.min(r.y, s.y) - 17, s.x, s.y + 5); ctx.stroke();
  for (let i = 0; i < 11; i++) {
    const t = still ? i / 11 : (i / 11 + time * 1.6) % 1;
    const mx = (r.x + s.x) / 2, my = Math.min(r.y, s.y) - 17;
    const x = (1 - t) ** 2 * r.x + 2 * (1 - t) * t * mx + t * t * s.x;
    const y = (1 - t) ** 2 * r.y + 2 * (1 - t) * t * my + t * t * (s.y + 5);
    circle(ctx, x, y, 2.3, CONFETTI[i % CONFETTI.length]);
  }
}
function remainingDebrisHints(ctx, run, time, still) {
  if (run.phase !== 'playing') return;
  const remaining = run.debris.filter(d => !d.collected && (d.amount ?? 1) > 0);
  const lastFew = remaining.length > 0 && remaining.length <= 5;
  if (!lastFew && (run.percent || 0) < .8) return;
  // Keep late-room rings quiet, then make the final five pieces unmistakable.
  // Markers follow the actual dirt and disappear only when it is collected.
  ctx.save();
  for (const d of remaining) {
    if (lastFew) {
      const pulse = still ? 0 : (1 + Math.sin(time * 3)) * 1.5;
      const radius = (d.type === 'dust' ? 20 : 16) + pulse;
      circle(ctx, d.x, d.y, radius + 5, '#ffe36b38');
      ctx.beginPath(); ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#292318'; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = '#ffdf59'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = '#fff9dd'; ctx.lineWidth = 1.3; ctx.stroke();
      // A small downward pointer locates even a nearly transparent dust patch.
      ctx.beginPath(); ctx.moveTo(d.x - 6, d.y - radius - 12);
      ctx.lineTo(d.x, d.y - radius - 6); ctx.lineTo(d.x + 6, d.y - radius - 12);
      ctx.strokeStyle = '#292318'; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = '#ffdf59'; ctx.lineWidth = 3.5; ctx.stroke();
      continue;
    }
    const radius = d.type === 'dust' ? 17 : d.type === 'crumb' ? 7.5 : 10;
    circle(ctx, d.x, d.y, radius, '#ffe89a1c');
    ctx.beginPath(); ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff1afa8'; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.strokeStyle = '#a7833dc7'; ctx.lineWidth = .9; ctx.stroke();
  }
  ctx.restore();
}

function clearRouteSegment(room, from, to) {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 6));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (!isWalkable(room, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, 18)) return false;
  }
  return true;
}
function routeTo(room, robot, destination, kind) {
  if (!destination) return [];
  const cols = room.grid[0].length, rows = room.grid.length;
  let targets = guidancePaths.get(room);
  if (!targets) { targets = new Map(); guidancePaths.set(room, targets); }
  const key = `${kind}:${destination.x}:${destination.y}`;
  let data = targets.get(key);
  if (!data) {
    // Each area and target has its own reverse search. Switching between the
    // exit and a drop-off can never reuse a route to the wrong destination.
    const next = new Int16Array(cols * rows).fill(-1), queue = [];
    const end = Math.floor(destination.y / CELL) * cols + Math.floor(destination.x / CELL);
    next[end] = end; queue.push(end);
    for (let head = 0; head < queue.length; head++) {
      const cell = queue[head], x = cell % cols, y = Math.floor(cell / cols);
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nx = x + dx, ny = y + dy, index = ny * cols + nx;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || next[index] !== -1 || !isWalkable(room, nx * CELL + CELL / 2, ny * CELL + CELL / 2, 18)) continue;
        next[index] = cell; queue.push(index);
      }
    }
    data = { next, end, start: -1, points: [] }; targets.set(key, data);
  }
  const start = Math.floor(robot.y / CELL) * cols + Math.floor(robot.x / CELL);
  if (start !== data.start) {
    data.start = start; data.points = [];
    if (data.next[start] >= 0) {
      let cell = start;
      for (let count = 0; count < cols * rows; count++) {
        data.points.push({ x: (cell % cols) * CELL + CELL / 2, y: Math.floor(cell / cols) * CELL + CELL / 2 });
        if (cell === data.end) break;
        cell = data.next[cell];
      }
      data.points.push({ x: destination.x, y: destination.y });
    }
  }
  return data.points;
}
function guidanceTarget(run) {
  if (run.started === false || !['playing', 'exiting'].includes(run.phase) || run.unloading > 0) return null;
  const fill = run.robot.bag / Math.max(1, run.stats.capacity);
  if (run.full || fill >= .8) {
    const point = run.room.stations[run.nearestStation || 0];
    if (point) return { point, kind: 'dock', shadow: '#21493b', line: '#a4f5cf', arrow: '#ceffe7' };
  }
  return run.phase === 'exiting' && run.room.exit ? { point: run.room.exit, kind: 'exit', shadow: '#493a21', line: '#ffdd7d', arrow: '#ffe499' } : null;
}
function routeGuidance(ctx, run, target, time, still) {
  const route = routeTo(run.room, run.robot, target.point, target.kind);
  if (!route.length) return;
  // Smooth only the first few steps, and only when the vacuum itself fits on
  // that line. This stops a diagonal arrow clipping the corner of a cabinet.
  let first = 0;
  for (let i = 0; i < Math.min(route.length, 5); i++) {
    if (clearRouteSegment(run.room, run.robot, route[i])) first = i;
  }
  const waypoint = route[first], dx = waypoint.x - run.robot.x, dy = waypoint.y - run.robot.y, distance = Math.hypot(dx, dy);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(run.robot.x, run.robot.y);
  let last = run.robot, length = 0;
  for (let i = first; i < route.length; i++) {
    const point = route[i], segment = Math.hypot(point.x - last.x, point.y - last.y);
    if (length + segment > 220) {
      const portion = (220 - length) / Math.max(1, segment);
      ctx.lineTo(last.x + (point.x - last.x) * portion, last.y + (point.y - last.y) * portion); break;
    }
    ctx.lineTo(point.x, point.y); length += segment; last = point;
  }
  ctx.strokeStyle = target.shadow + '99'; ctx.lineWidth = 4; ctx.setLineDash([3, 10]); ctx.stroke();
  ctx.strokeStyle = target.line; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
  if (distance > 28) {
    const angle = Math.atan2(dy, dx), reach = Math.min(distance - 4, 51 + (still ? 0 : Math.sin(time * 3) * 3));
    ctx.translate(run.robot.x + Math.cos(angle) * reach, run.robot.y + Math.sin(angle) * reach); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(0, 0); ctx.lineTo(-9, 8);
    ctx.strokeStyle = target.shadow; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = target.arrow; ctx.lineWidth = 3.5; ctx.stroke();
  }
  ctx.restore();
}
function areaEntry(ctx, room) {
  const door = room.entry;
  if (!door) return;
  // The matching left-hand doorway marks where this area was entered. It stays
  // quiet and beneath the dirt; only the outgoing doorway gets a glowing cue.
  ctx.save();
  box(ctx, door.x - 36, door.y - 33, 25, 66, 4, '#243139');
  box(ctx, door.x - 31, door.y - 29, 15, 58, 2, '#384542');
  line(ctx, door.x - 13, door.y - 32, door.x - 13, door.y + 32, '#a2aba3', 3);
  line(ctx, door.x - 8, door.y, door.x + 10, door.y, '#d0d6bf70', 2);
  line(ctx, door.x + 4, door.y - 5, door.x + 10, door.y, '#d0d6bf70', 2);
  line(ctx, door.x + 4, door.y + 5, door.x + 10, door.y, '#d0d6bf70', 2);
  ctx.restore();
}
function areaDoor(ctx, run, time, still) {
  const door = run.room.exit;
  if (!door) return;
  const open = run.phase === 'exiting', color = open ? '#ffdb83' : '#bac0ad';
  ctx.save();
  if (open) {
    const pulse = still ? .6 : .5 + Math.sin(time * 3) * .5;
    circle(ctx, door.x, door.y, 31, `rgba(255,216,116,${.13 + pulse * .1})`);
    ctx.strokeStyle = '#ffdf90'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(door.x, door.y, 28, 0, Math.PI * 2); ctx.stroke();
  }
  // A narrow frame on the far side leaves the arrival circle visible and
  // clearly walkable; its amber floor arrow is the actual destination.
  box(ctx, door.x + 11, door.y - 33, 25, 66, 4, '#243139');
  box(ctx, door.x + 16, door.y - 29, 15, 58, 2, open ? '#493b26' : '#69716b');
  line(ctx, door.x + 13, door.y - 32, door.x + 13, door.y + 32, color, 3);
  if (open) {
    line(ctx, door.x - 13, door.y, door.x + 13, door.y, color, 4);
    line(ctx, door.x + 5, door.y - 8, door.x + 13, door.y, color, 4);
    line(ctx, door.x + 5, door.y + 8, door.x + 13, door.y, color, 4);
  } else {
    box(ctx, door.x + 18, door.y - 1, 10, 9, 2, '#d0d0b7');
    ctx.strokeStyle = '#d0d0b7'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(door.x + 23, door.y - 2, 3.5, Math.PI, 0); ctx.stroke();
  }
  if (open) {
    const labelWidth = 132, labelX = clamp(door.x + 30 - labelWidth, 44, W - labelWidth - 44), labelY = clamp(door.y - 66, 44, H - 92);
    box(ctx, labelX, labelY, labelWidth, 25, 5, '#302b20');
    ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    ctx.fillText('NEXT AREA  →', labelX + labelWidth / 2, labelY + 13);
    if (door.nextName) {
      const caption = String(door.nextName);
      box(ctx, labelX, labelY - 20, labelWidth, 19, 4, '#302b20e6');
      ctx.font = '10px system-ui, sans-serif'; ctx.fillStyle = '#f8edcb';
      ctx.fillText(caption, labelX + labelWidth / 2, labelY - 10, labelWidth - 10);
    }
  }
  ctx.restore();
}

/** Draw an entire world in 960 × 640 coordinates. State remains owned by simulation. */
export function render(ctx, run, options = {}) {
  if (!run?.room) return;
  const still = !!options.reducedMotion, time = options.time ?? run.time ?? 0;
  ctx.save(); ctx.globalAlpha = 1; ctx.lineCap = 'round';
  let background = cache.get(run.room);
  if (!background) { background = makeBackground(run.room); cache.set(run.room, background); }
  ctx.drawImage(background.image, 0, 0);
  ctx.save(); ctx.clip(background.floorPath);
  drawFans(ctx, run.room.fans, time, still);
  ctx.restore();
  const target = guidanceTarget(run);
  if (target) {
    ctx.save(); ctx.clip(background.floorPath); routeGuidance(ctx, run, target, time, still); ctx.restore();
  }
  const fill = run.robot.bag / Math.max(1, run.stats.capacity);
  const nearestStation = run.nearestStation || 0, needsDock = ['playing', 'exiting'].includes(run.phase) && (run.full || fill >= .8);
  run.room.stations.forEach((s, i) => station(ctx, s, needsDock && i === nearestStation ? (run.full ? 'EMPTY BAG' : 'DROP-OFF') : false, run.unloading > 0 && i === nearestStation, time, still));
  areaEntry(ctx, run.room);
  if (run.phase !== 'exiting') areaDoor(ctx, run, time, still);
  remainingDebrisHints(ctx, run, time, still);
  for (const d of run.debris) if (d.type === 'dust') debris(ctx, d, run.room.location, time, still);
  suction(ctx, run, time, still);
  for (const d of run.debris) if (d.type !== 'dust') debris(ctx, d, run.room.location, time, still);
  trinket(ctx, run.trinket, time, still);
  if (run.phase === 'exiting') {
    areaDoor(ctx, run, time, still);
  }
  if (options.pointer && ['playing', 'exiting'].includes(run.phase)) {
    const p = options.pointer;
    ctx.strokeStyle = '#fffcdf9a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, p.x, p.y, 2, '#fff2bb');
  }
  robot(ctx, run.robot, run.stats.capacity, options.shellColor || '#84d9b3', time, still, run.full);
  unloading(ctx, run, time, still);
  for (const p of run.particles || []) {
    if (still) continue;
    ctx.globalAlpha = clamp(p.life / (p.maxLife || 1), 0, 1);
    circle(ctx, p.x, p.y, Math.max(.3, p.size || 2), p.color || '#ffefaf');
  }
  ctx.globalAlpha = 1;
  if (run.phase === 'finishing') {
    const progress = clamp(run.finishProgress || 0, 0, 1);
    if (still) {
      ctx.fillStyle = '#fffbdf20'; ctx.fillRect(0, 0, W, H);
    } else {
      const radius = progress * 1100;
      ctx.strokeStyle = `rgba(255,248,192,${.65 * (1 - progress)})`; ctx.lineWidth = 9 + progress * 22;
      ctx.beginPath(); ctx.arc(run.robot.x, run.robot.y, radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = `rgba(255,250,216,${.09 * Math.sin(progress * Math.PI)})`; ctx.fillRect(0, 0, W, H);
    }
  }
  ctx.restore();
}

/** Original, text-free title diorama. Keep the upper-left area open for UI copy. */
export function drawTitle(ctx, time = 0, reducedMotion = false) {
  ctx.save();
  const still = !!reducedMotion;
  ctx.fillStyle = '#f6eedb'; ctx.fillRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#fff9e9'); grad.addColorStop(1, '#e1eadb'); ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  circle(ctx, 833, 106, 174, '#c1ded2'); circle(ctx, 100, 641, 176, '#f0b79b');
  ctx.strokeStyle = '#d9e5d5'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(832, 109, 196 + i * 15, .7, 3.5); ctx.stroke(); }
  // A tray-like room, floating above the background.
  ctx.save(); ctx.translate(560, 387); ctx.rotate(-.075);
  box(ctx, -313, -184, 618, 384, 35, '#234c4e15');
  box(ctx, -320, -207, 620, 384, 32, '#49827c');
  box(ctx, -320, -225, 620, 384, 32, '#83b9a3');
  box(ctx, -308, -213, 596, 355, 24, '#e8d2aa');
  ctx.save(); rounded(ctx, -308, -213, 596, 355, 24); ctx.clip();
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 12; col++) {
      box(ctx, -308 + col * 52, -213 + row * 54, 51, 53, .5, (row + col) % 2 ? '#e8d2aa' : '#eddbb7');
    }
  }
  // The right half is pristine; the debris field thins toward the robot.
  for (let i = 0; i < 74; i++) {
    const x = -280 + noise(i, 14) * 360, y = -174 + noise(i, 27) * 281;
    if (x > 0 && y > -95 && y < 60) continue;
    debris(ctx, { id: i + 50, x, y, type: i % 4 === 0 ? 'confetti' : i % 7 === 0 ? 'dust' : 'crumb', amount: 1, angle: noise(i, 3) * 6.28 }, 0, time, still);
  }
  ctx.restore();
  furniture(ctx, { x: -299, y: -204, w: 119, h: 74, kind: 'planter' }, 2);
  furniture(ctx, { x: 173, y: 56, w: 108, h: 74, kind: 'crate' }, 0);
  station(ctx, { x: 217, y: -147 }, false, false, time, still);
  const bob = still ? 0 : Math.sin(time * 1.4) * 3;
  ctx.save(); ctx.translate(80, -6 + bob); ctx.scale(3.45, 3.45);
  const fake = { robot: { x: 0, y: 0, angle: -.22, move: .13, bag: 58, squash: 0 }, stats: { radius: 54 }, full: false, unloading: 0, phase: 'playing', debris: [] };
  suction(ctx, fake, time, still);
  robot(ctx, fake.robot, 100, '#88d5b0', time, still); ctx.restore();
  // Larger scraps make the collectible materials legible at title-card scale.
  for (let i = 0; i < 6; i++) {
    const a = 2.45 + i * .19, r = 126 + i * 14;
    ctx.save(); ctx.translate(80 + Math.cos(a) * r, -6 + Math.sin(a) * r); ctx.scale(1.7, 1.7);
    debris(ctx, { id: i + 127, x: 0, y: 0, type: i % 2 ? 'confetti' : 'stuck', amount: 1, angle: -.4 + i * .27 }, 0, time, still); ctx.restore();
  }
  star(ctx, 124, -134, 14, '#fff9d1', 4); star(ctx, 268, -40, 8, '#fff5ba', 4);
  ctx.restore();
  // Small, graphic corner details feel like a toy package, without title text.
  for (let i = 0; i < 3; i++) circle(ctx, 65 + i * 19, 69, 5, ['#4d827d', '#efb198', '#e2bd65'][i]);
  star(ctx, 857, 541, 13, '#edb270', 4); circle(ctx, 888, 509, 5, '#83b8a7');
  ctx.restore();
}
