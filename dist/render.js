/* Original Canvas artwork for Sweep Shift. No downloaded art, fonts, or assets. */
const W = 960, H = 640, CELL = 40;
const PALETTES = [
  { floor: '#e7c99f', floor2: '#ddbb8c', wall: '#244a4d', accent: '#e8a460', dark: '#213c3e' },
  { floor: '#8a72b1', floor2: '#8067a6', wall: '#292640', accent: '#77dce3', dark: '#27243e' },
  { floor: '#e5e7c6', floor2: '#daddb6', wall: '#33544b', accent: '#83bc83', dark: '#2d4d43' },
  { floor: '#dfab95', floor2: '#d39c89', wall: '#464458', accent: '#efbc63', dark: '#343546' },
];
const CONFETTI = ['#ed826e', '#f6d570', '#c4f2df', '#76cbd2', '#fcf0d7'];
const cache = new WeakMap();
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
  // Quiet architectural lines give the space outside the playable floor some depth.
  ctx.strokeStyle = '#ffffff07'; ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) line(ctx, 0, y, W, y, '#ffffff06');
  for (let x = 0; x < W; x += 40) line(ctx, x, 0, x, H, '#ffffff05');
  const grid = room.grid, loc = room.location || 0;
  for (let gy = 0; gy < grid.length; gy++) {
    for (let gx = 0; gx < grid[gy].length; gx++) {
      if (!grid[gy][gx]) continue;
      const x = gx * CELL, y = gy * CELL;
      ctx.fillStyle = (gx + gy) % 2 ? palette.floor : palette.floor2;
      ctx.fillRect(x, y, CELL, CELL);
      ctx.fillStyle = '#fff8e70b'; ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      if (loc === 0 || loc === 3) {
        line(ctx, x, y + 39.5, x + 40, y + 39.5, '#553c301c');
        line(ctx, x + 39.5, y, x + 39.5, y + 40, '#553c300e');
        line(ctx, x + 4, y + 12, x + 18 + noise(gx, gy) * 16, y + 12, '#745c4110');
        line(ctx, x + 14, y + 29, x + 35, y + 29, '#fff2d42a');
      } else if (loc === 1) {
        ctx.strokeStyle = '#d4d3ef24'; ctx.lineWidth = 1;
        ctx.strokeRect(x + .5, y + .5, 39, 39);
        if ((gx * 3 + gy) % 7 === 0) star(ctx, x + 20, y + 20, 3, '#d4d4f02e', 4);
      } else {
        ctx.strokeStyle = '#64765920'; ctx.lineWidth = 1;
        ctx.strokeRect(x + .5, y + .5, 39, 39);
        circle(ctx, x + 8 + noise(gx, gy) * 20, y + 8, 1, '#68825c20');
        circle(ctx, x + 27, y + 26, .8, '#fffef160');
      }
      if (!grid[gy - 1]?.[gx]) {
        ctx.fillStyle = '#fff3db70'; ctx.fillRect(x, y, 40, 3);
        ctx.fillStyle = '#1a323b35'; ctx.fillRect(x, y + 3, 40, 4);
      }
      if (!grid[gy + 1]?.[gx]) { ctx.fillStyle = '#1e343440'; ctx.fillRect(x, y + 36, 40, 4); }
      if (!grid[gy]?.[gx - 1]) { ctx.fillStyle = '#fff3db50'; ctx.fillRect(x, y, 2, 40); }
      if (!grid[gy]?.[gx + 1]) { ctx.fillStyle = '#1e343433'; ctx.fillRect(x + 37, y, 3, 40); }
    }
  }
  // Static ambient light has no frame-time cost after the room is cached.
  const light = ctx.createLinearGradient(0, 0, W, H);
  light.addColorStop(0, '#fff7dd13'); light.addColorStop(.7, '#fff7dd00'); light.addColorStop(1, '#182f4018');
  ctx.fillStyle = light; ctx.fillRect(0, 0, W, H);
}
function bolt(ctx, x, y) { circle(ctx, x, y, 2, '#efe5c690'); line(ctx, x - 1, y, x + 1, y, '#42504a', .8); }
function cup(ctx, x, y, color = '#fbefdb') {
  ellipse(ctx, x + 2, y + 3, 7, 5, '#172e3527');
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 6, y, 3, -1.3, 1.3); ctx.stroke();
  circle(ctx, x, y, 6, color); circle(ctx, x, y, 3.4, '#6e4f40'); circle(ctx, x - 1, y - 1, 1.4, '#b79569');
}
function leaves(ctx, x, y, size, tint = 0) {
  const colors = tint ? ['#83bd96', '#a9d69e', '#568d7e'] : ['#66a880', '#91c995', '#40866a'];
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + .3;
    ellipse(ctx, x + Math.cos(a) * size * .42, y + Math.sin(a) * size * .42, size * .57, size * .24, colors[i % 3], a);
  }
  circle(ctx, x, y, size * .2, '#c4e3ad');
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
      box(ctx, rx + 8, ry + 8, Math.min(rw * .45, 48), Math.min(rh - 23, 34), 3, '#47766b');
      line(ctx, rx + 14, ry + 17, rx + 32, ry + 29, '#d7e5ce', 4);
      circle(ctx, rx + 33, ry + 30, 5, '#658d8b');
      line(ctx, rx + rw - 19, ry + 13, rx + rw - 19, ry + rh - 17, '#bd7656', 5);
      box(ctx, rx + rw - 24, ry + 10, 10, 7, 2, '#d1d8be');
    } else {
      const vertical = rh > rw;
      for (let i = 1; i <= 2; i++) {
        const hx = rx + rw * (vertical ? .5 : i / 3), hy = ry + rh * (vertical ? i / 3 : .5);
        box(ctx, hx - 6, hy - 2, 12, 4, 2, '#d5d1b3');
      }
    }
    line(ctx, rx + 6, ry + 4, rx + rw - 6, ry + 4, '#d6dbc159', 2);
  } else if (/arcade/.test(kind)) {
    box(ctx, rx, ry + 4, rw, rh, 7, '#322f52'); box(ctx, rx, ry, rw, rh - 3, 7, '#51416e');
    box(ctx, rx + 4, ry + 3, rw - 8, Math.max(7, rh * .15), 3, '#df92b5');
    box(ctx, rx + 6, ry + rh * .22, rw - 12, rh * .43, 4, '#222d43');
    box(ctx, rx + 10, ry + rh * .26, rw - 20, rh * .34, 3, '#5b949e');
    const sx = rx + rw / 2, sy = ry + rh * .42;
    star(ctx, sx, sy, Math.min(rw * .2, rh * .14), '#c3efe0', 4);
    line(ctx, sx - 6, sy + 7, sx + 8, sy - 6, '#e8feef55', 2);
    box(ctx, rx + 5, ry + rh * .71, rw - 10, rh * .17, 3, '#a879a6');
    circle(ctx, rx + rw * .35, ry + rh * .79, 4.5, '#333953');
    circle(ctx, rx + rw * .35 - 1, ry + rh * .79 - 2, 3, '#8addd2');
    circle(ctx, rx + rw * .68, ry + rh * .79, 3, '#ffdb81');
    line(ctx, rx + 2, ry + 8, rx + 2, ry + rh - 5, '#b1f5e199', 2);
  } else if (/planter|pot/.test(kind)) {
    box(ctx, rx, ry + 4, rw, rh, Math.min(rw, rh) * .2, '#996c54');
    box(ctx, rx, ry, rw, rh - 3, Math.min(rw, rh) * .2, '#c89069');
    box(ctx, rx + 4, ry + 4, rw - 8, rh - 11, Math.min(rw, rh) * .16, '#6b6651');
    const horizontal = rw > rh, length = horizontal ? rw : rh, breadth = Math.min(rw, rh);
    const count = Math.max(1, Math.floor(length / 34));
    for (let n = 0; n < count; n++) {
      const px = horizontal ? rx + (n + .5) * rw / count : rx + rw / 2;
      const py = horizontal ? ry + rh / 2 - 2 : ry + (n + .5) * (rh - 4) / count;
      leaves(ctx, px, py, Math.min(22, breadth * .46), n % 2);
      if ((n + Math.floor(x / 40)) % 3 === 0) { circle(ctx, px + 3, py - 2, 4, '#f4bd95'); circle(ctx, px + 3, py - 2, 1.6, '#ffe8a9'); }
    }
  } else if (/sofa|bench/.test(kind)) {
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
    // A table is also the visual fallback for future rectangular prop kinds.
    box(ctx, rx, ry + 5, rw, rh, 9, loc === 1 ? '#5e557a' : '#997662');
    box(ctx, rx, ry, rw, rh - 3, 9, loc === 1 ? '#b597c9' : loc === 3 ? '#f0d4a8' : '#d4b37f');
    line(ctx, rx + 8, ry + 5, rx + rw - 8, ry + 5, '#fff4d955', 2);
    cup(ctx, rx + rw * .32, ry + rh * .44, loc === 1 ? '#d9e5f1' : '#f8eee0');
    if (rw > 60 || rh > 60) {
      circle(ctx, rx + rw * .71, ry + rh * .6, 9, '#fff6dc');
      circle(ctx, rx + rw * .71, ry + rh * .6, 6, '#d3926e');
      circle(ctx, rx + rw * .71 + 1, ry + rh * .6 - 1, 2, '#e7b07a');
    }
  }
}
function makeBackground(room) {
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  floor(ctx, room, PALETTES[room.location || 0]);
  for (const obstacle of room.obstacles || []) furniture(ctx, obstacle, room.location || 0);
  const floorPath = new Path2D();
  room.grid.forEach((row, gy) => row.forEach((walkable, gx) => { if (walkable) floorPath.rect(gx * CELL, gy * CELL, CELL, CELL); }));
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
    ctx.fillStyle = `rgba(251,235,142,${.13 + pulse * .08})`; ctx.beginPath(); ctx.arc(s.x, s.y, 47, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff0a2'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
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
    ctx.font = 'bold 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff2b8';
    ctx.fillText('EMPTY HERE', s.x, s.y + 43);
  }
}
function debris(ctx, d, loc, time, still) {
  if (d.collected || d.amount <= 0) return;
  const id = typeof d.id === 'number' ? d.id : Math.round(d.x * 17 + d.y), variation = noise(id);
  const angle = Number.isFinite(d.angle) ? d.angle : variation * 6.28;
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(angle);
  if (d.type === 'dust') {
    ctx.globalAlpha = clamp(d.amount ?? 1, 0, 1) * .77;
    const color = loc === 1 ? '#504c72' : loc === 2 ? '#859278' : '#957a5d';
    const r = 10 + variation * 6;
    const grad = ctx.createRadialGradient(0, 0, r * .25, 0, 0, r);
    grad.addColorStop(0, color + 'aa'); grad.addColorStop(.6, color + '70'); grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .74, 0, 0, Math.PI * 2); ctx.fill();
    for (let n = 0; n < 4; n++) circle(ctx, (noise(id, n + 4) - .5) * r * 1.2, (noise(id, n + 9) - .5) * r, .9 + noise(id, n + 15), color + '66');
  } else if (d.type === 'confetti') {
    const color = CONFETTI[Math.floor(variation * CONFETTI.length)];
    const flutter = still ? 1 : .75 + Math.sin(time * 5 + id) * .25;
    box(ctx, -2, -4, 5, 9, 1, '#24384125');
    ctx.scale(flutter, 1); box(ctx, -3, -5, 5, 9, .8, color); line(ctx, -2, -4, 1, -3, '#fff9ee77', 1);
  } else if (d.type === 'stuck') {
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
  if (!t || t.collected) return;
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
  if (run.full || run.unloading > 0 || run.phase !== 'playing') return;
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
function remainingDebrisHints(ctx, run) {
  if ((run.percent || 0) < .8 || run.phase !== 'playing') return;
  // A quiet finishing cue prevents the last few crumbs turning into a pixel hunt.
  // These outlines are static and drawn only for real, still-collectible debris.
  ctx.save();
  for (const d of run.debris) {
    if (d.collected || (d.amount ?? 1) <= .05) continue;
    const radius = d.type === 'dust' ? 17 : d.type === 'crumb' ? 7.5 : 10;
    circle(ctx, d.x, d.y, radius, '#ffe89a1c');
    ctx.beginPath(); ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff1afa8'; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.strokeStyle = '#a7833dc7'; ctx.lineWidth = .9; ctx.stroke();
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
  const fill = run.robot.bag / Math.max(1, run.stats.capacity);
  run.room.stations.forEach((s, i) => station(ctx, s, fill >= .8 && i === run.nearestStation, run.unloading > 0 && i === run.nearestStation, time, still));
  remainingDebrisHints(ctx, run);
  for (const d of run.debris) if (d.type === 'dust') debris(ctx, d, run.room.location, time, still);
  suction(ctx, run, time, still);
  for (const d of run.debris) if (d.type !== 'dust') debris(ctx, d, run.room.location, time, still);
  trinket(ctx, run.trinket, time, still);
  if (options.pointer && run.phase === 'playing') {
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
