// Authored campaign layouts and reproducible, bounded room generation.
// A furniture module is 80 px wide, so even the smallest aisle is 80 px.
export const LOCATIONS = [
  { name: 'Workshop', subtitle: 'A fresh start among the sawdust.', palette: { floor: '#e7c99f', floor2: '#ddbb8c', wall: '#244a4d', accent: '#e8a460', dark: '#213c3e' }, trinkets: ['Tiny wrench', 'Brass button', 'Wooden duck', 'Lucky bolt', 'Blue marble', 'Pocket robot'] },
  { name: 'After-Hours Arcade', subtitle: 'One last clean after the high scores.', palette: { floor: '#8a72b1', floor2: '#8067a6', wall: '#292640', accent: '#77dce3', dark: '#27243e' }, trinkets: ['Arcade token', 'Pixel heart', 'Prize ticket', 'Glow star', 'Mini spaceship', 'Golden joystick'] },
  { name: 'Greenhouse', subtitle: 'Give the leaves a little room to breathe.', palette: { floor: '#e5e7c6', floor2: '#daddb6', wall: '#33544b', accent: '#83bc83', dark: '#2d4d43' }, trinkets: ['Seed locket', 'Ceramic snail', 'Ladybird pin', 'Painted pebble', 'Tiny watering can', 'Sunflower badge'] },
  { name: 'Rooftop Party', subtitle: 'The party is over. The view is yours.', palette: { floor: '#dfab95', floor2: '#d39c89', wall: '#464458', accent: '#efbc63', dark: '#343546' }, trinkets: ['Paper crown', 'Disco charm', 'Little lantern', 'Confetti coin', 'Moon pendant', 'Sweep Shift trophy'] },
];

const plans = [
  { name: 'First Sweep', brief: 'Meet your little cleaning machine.', tip: 'Move through the crumbs. Your vacuum does the rest.', n: 230, objects: [[7,3,4,2,'workbench'],[17,3,2,4,'cabinet'],[11,9,4,2,'crate']], clusters: [[6,8],[16,11],[13,4]] },
  { name: 'Bench Business', brief: 'Two workbenches, one spotless floor.', tip: 'A full bag? Park beside the green dock to empty it.', n: 275, objects: [[5,3,6,2,'workbench'],[5,9,6,2,'workbench'],[17,7,2,4,'cabinet']], clusters: [[8,7],[15,11],[17,4]] },
  { name: 'Corner Office', brief: 'Discover the hidden workshop nook.', tip: 'The last few scraps are swept up automatically at 95%.', n: 280, cuts: [[1,1,4,4],[19,11,4,4]], objects: [[9,3,2,6,'cabinet'],[15,5,4,2,'workbench'],[5,11,6,2,'crate']], clusters: [[6,7],[14,9],[20,4]] },
  { name: 'Round the Island', brief: 'Pick a side and make a clean lap.', tip: 'A wider vacuum makes clean passes easier to line up.', n: 290, objects: [[9,5,6,6,'workbench'],[3,3,2,2,'crate'],[19,11,2,2,'cabinet']], clusters: [[7,7],[17,8],[12,2]] },
  { name: 'Shelf Shuffle', brief: 'Choose your route through the storage aisles.', tip: 'Try a loop that finishes near the collection station.', n: 300, objects: [[5,3,2,8,'cabinet'],[11,5,2,8,'cabinet'],[17,3,2,8,'cabinet']], stations: [[2,13],[21,2]], clusters: [[9,7],[15,9],[20,7]] },
  { name: 'Workshop Wonder', brief: 'Leave every corner ready for tomorrow.', tip: 'Spend your coins between rooms. Each upgrade helps immediately.', n: 320, objects: [[3,3,6,2,'workbench'],[15,3,6,2,'workbench'],[7,7,2,4,'cabinet'],[15,9,6,2,'crate']], stations: [[2,13],[21,7]], clusters: [[5,8],[12,4],[14,12]] },
  { name: 'Closing Time', brief: 'A carpet of confetti after the final game.', tip: 'Confetti flutters toward you. Follow its trail.', n: 285, objects: [[3,3,2,4,'arcade'],[7,3,2,4,'arcade'],[15,3,2,4,'arcade'],[19,3,2,4,'arcade'],[9,11,6,2,'sofa']], clusters: [[12,8],[6,10],[18,9]] },
  { name: 'Fan Club', brief: 'A gentle breeze has other cleaning plans.', tip: 'Fans move loose pieces. Approach from the side if a pile drifts away.', n: 300, objects: [[5,5,4,2,'table'],[15,9,4,2,'table'],[19,3,2,2,'arcade']], fans: [[10,4,5,4,1,0,26]], clusters: [[11,6],[6,9],[18,6]] },
  { name: 'Token Alley', brief: 'Weave between two rows of glowing cabinets.', tip: 'Return along a different aisle to clean on the way back.', n: 315, objects: [[5,3,2,4,'arcade'],[5,9,2,4,'arcade'],[13,3,2,4,'arcade'],[13,9,2,4,'arcade'],[19,7,2,2,'table']], stations: [[2,13],[21,2]], clusters: [[9,5],[9,10],[18,11]] },
  { name: 'Prize Corner', brief: 'A little maze of plush prizes and paper.', tip: 'Trinkets are optional. Look for a small sparkle near the floor.', n: 330, cuts: [[1,1,4,2],[19,13,4,2]], objects: [[9,3,2,6,'arcade'],[15,5,6,2,'sofa'],[5,11,6,2,'table']], fans: [[3,6,5,4,0,1,22]], clusters: [[6,6],[14,10],[18,3]] },
  { name: 'Disco Loop', brief: 'Take a lap around the dance floor.', tip: 'Bag capacity means fewer trips back to empty.', n: 345, objects: [[9,5,6,6,'table'],[3,3,2,2,'arcade'],[19,3,2,2,'arcade'],[3,11,2,2,'sofa'],[19,11,2,2,'sofa']], stations: [[2,8],[21,8]], fans: [[7,2,8,2,1,0,28],[7,12,8,2,-1,0,28]], clusters: [[6,8],[17,8],[12,12]] },
  { name: 'High-Score Housekeeping', brief: 'The arcade deserves a clean finish.', tip: 'Medals reward good routes. Finishing always unlocks the next room.', n: 365, objects: [[3,3,4,2,'arcade'],[11,3,2,4,'arcade'],[17,3,4,2,'arcade'],[5,9,4,2,'sofa'],[15,9,4,2,'sofa']], stations: [[2,13],[21,7]], fans: [[10,8,4,4,0,-1,30]], clusters: [[8,5],[12,11],[19,7]] },
  { name: 'Leafy Welcome', brief: 'A quiet room after a windy morning.', tip: 'Stuck leaves need a moment of steady suction before they pop loose.', n: 300, objects: [[5,3,4,2,'planter'],[15,3,4,2,'planter'],[9,9,6,2,'bench']], clusters: [[7,7],[16,7],[12,12]] },
  { name: 'Potting Paths', brief: 'Follow the trail between the flower beds.', tip: 'Pull strength helps with leaves and sticky paper.', n: 315, objects: [[5,3,2,4,'planter'],[11,7,2,6,'planter'],[17,3,2,4,'planter'],[3,11,2,2,'pot'],[19,11,2,2,'pot']], stations: [[2,13],[21,2]], clusters: [[9,4],[15,10],[7,11]] },
  { name: 'Garden Rooms', brief: 'Three little gardens share one cleaner.', tip: 'Wide aisles let you turn without losing your place.', n: 330, cuts: [[1,1,4,4],[19,1,4,4]], objects: [[9,3,6,2,'bench'],[5,7,2,4,'planter'],[17,7,2,4,'planter'],[11,11,2,2,'pot']], clusters: [[4,9],[12,8],[20,9]] },
  { name: 'Sunbeam Sweep', brief: 'Reveal the tiles beneath the dusty sunlight.', tip: 'Dust patches fade as they clear. Watch the floor reappear.', n: 345, objects: [[3,3,2,2,'pot'],[7,5,2,6,'planter'],[13,3,2,6,'planter'],[19,7,2,6,'planter']], stations: [[2,13],[21,2]], clusters: [[4,7],[11,9],[17,5]], extraDust: true },
  { name: 'Breezy Beds', brief: 'The greenhouse windows are open.', tip: 'Clean a drifting pile from its downwind side.', n: 360, objects: [[5,3,4,2,'planter'],[15,3,4,2,'planter'],[5,9,4,2,'planter'],[15,9,4,2,'planter']], fans: [[10,3,4,10,0,1,24]], stations: [[2,8],[21,8]], clusters: [[6,7],[12,7],[18,7]] },
  { name: 'Room to Grow', brief: 'Give every leaf a tidy place to land.', tip: 'A smooth route matters more than racing into every corner.', n: 380, cuts: [[1,1,2,4],[21,11,2,4]], objects: [[7,3,4,2,'bench'],[15,5,4,2,'planter'],[3,9,4,2,'planter'],[11,9,2,4,'planter'],[19,1,2,2,'pot']], stations: [[2,13],[21,7]], fans: [[13,8,5,4,-1,0,26]], clusters: [[4,5],[12,6],[17,11]] },
  { name: 'The Morning After', brief: 'Confetti, sunshine, and a rooftop view.', tip: 'Everything you have learned fits in this little robot.', n: 320, objects: [[5,3,4,4,'table'],[15,3,4,2,'table'],[9,9,6,2,'sofa']], clusters: [[6,8],[17,8],[12,4]] },
  { name: 'Lounge Lap', brief: 'Take the scenic route around the sofas.', tip: 'Watch the station hint when your bag is nearly full.', n: 340, cuts: [[1,1,4,2],[19,1,4,2]], objects: [[5,5,2,6,'sofa'],[11,3,4,2,'table'],[17,5,2,6,'sofa'],[11,11,2,2,'speaker']], stations: [[2,13],[21,13]], clusters: [[3,7],[12,8],[20,7]] },
  { name: 'Table Service', brief: 'Clean the gathering spots one by one.', tip: 'You can upgrade any category. There is no required build.', n: 360, objects: [[3,3,4,2,'table'],[11,3,4,2,'table'],[19,3,2,2,'speaker'],[7,9,4,2,'table'],[15,9,4,2,'table']], stations: [[2,13],[21,7]], fans: [[8,6,8,2,1,0,30]], clusters: [[5,7],[13,7],[18,12]] },
  { name: 'Skyline Switchback', brief: 'Thread a path through the party furniture.', tip: 'Turn each trip to a station into another clean pass.', n: 380, cuts: [[1,1,2,2],[21,13,2,2]], objects: [[5,3,2,8,'sofa'],[11,5,2,8,'sofa'],[17,3,2,8,'sofa']], stations: [[2,13],[21,2]], fans: [[7,3,4,8,0,1,25],[13,5,4,8,0,-1,25]], clusters: [[9,7],[15,9],[21,7]] },
  { name: 'Last Dance', brief: 'One more sweep around the dance floor.', tip: 'The final sweep pays for the last scraps and your remaining bag.', n: 400, cuts: [[1,1,2,2],[21,1,2,2],[1,13,2,2],[21,13,2,2]], objects: [[9,5,6,6,'table'],[3,3,2,2,'speaker'],[19,3,2,2,'speaker'],[3,11,2,2,'sofa'],[19,11,2,2,'sofa']], stations: [[2,8],[21,8]], fans: [[7,2,8,2,1,0,32],[7,12,8,2,-1,0,32]], clusters: [[6,8],[18,8],[12,12]] },
  { name: 'A Spotless Send-Off', brief: 'Restore the rooftop, then enjoy the view.', tip: 'Finish this room to unlock Endless Shift and the final shell.', n: 420, objects: [[3,3,4,2,'sofa'],[11,3,2,6,'speaker'],[17,3,4,2,'sofa'],[5,9,4,2,'table'],[15,9,4,2,'table']], stations: [[2,13],[21,7]], fans: [[9,8,6,4,0,-1,28]], clusters: [[8,5],[12,11],[19,7]], extraDust: true },
];

export const CAMPAIGN = plans.map((p, i) => ({
  id: i + 1, name: p.name, location: Math.floor(i / 6), brief: p.brief,
  tip: p.tip, goldTime: 95 + Math.floor(i / 6) * 5 + (i % 6) * 4,
  silverTime: 170 + Math.floor(i / 6) * 5 + (i % 6) * 5,
}));

function seedNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value >>> 0;
  const text = String(value ?? '1').trim();
  if (/^\d+$/.test(text)) return Number(text) >>> 0;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return hash >>> 0;
}

function randomFor(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function baseGrid() {
  return Array.from({ length: 16 }, (_, y) => Array.from({ length: 24 }, (_, x) => +(x > 0 && x < 23 && y > 0 && y < 15)));
}

function carve(grid, [x, y, w, h]) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (grid[j]?.[i] !== undefined) grid[j][i] = 0;
  }
}

// Exact circle-to-cell clearance, shared with live robot collision.
export function isWalkable(room, x, y, radius = 17) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 0) return false;
  if (x - radius < 0 || y - radius < 0 || x + radius >= room.width || y + radius >= room.height) return false;
  const x0 = Math.floor((x - radius) / 40), x1 = Math.floor((x + radius) / 40);
  const y0 = Math.floor((y - radius) / 40), y1 = Math.floor((y + radius) / 40);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    if (room.grid[cy]?.[cx]) continue;
    const nearX = Math.max(cx * 40, Math.min(x, (cx + 1) * 40));
    const nearY = Math.max(cy * 40, Math.min(y, (cy + 1) * 40));
    if ((nearX - x) ** 2 + (nearY - y) ** 2 <= radius ** 2) return false;
  }
  return true;
}

function reachableCells(grid, start) {
  const seen = new Set(), queue = [start];
  seen.add(start.join(','));
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      const key = `${nx},${ny}`;
      if (grid[ny]?.[nx] && !seen.has(key)) { seen.add(key); queue.push([nx, ny]); }
    }
  }
  return queue;
}

function chooseType(location, id, random, extraDust) {
  const n = random();
  if (location === 0) return n < (id === 1 ? .88 : .73) ? 'crumb' : 'dust';
  if (location === 1) return n < .58 ? 'confetti' : n < .82 ? 'crumb' : 'dust';
  if (location === 2) return n < .30 ? 'stuck' : n < (extraDust ? .78 : .62) ? 'dust' : 'crumb';
  return n < .40 ? 'confetti' : n < .63 ? 'stuck' : n < (extraDust ? .91 : .83) ? 'dust' : 'crumb';
}

function materialValue(type) { return type === 'stuck' ? 3 : type === 'dust' ? 2 : 1; }

function buildRoom(meta, plan, seed) {
  const random = randomFor(seed), grid = baseGrid();
  for (const cut of plan.cuts || []) carve(grid, cut);
  for (const object of plan.objects) carve(grid, object);
  const room = { ...meta, seed, width: 960, height: 640, grid,
    obstacles: plan.objects.map(([x,y,w,h,kind]) => ({x:x*40,y:y*40,w:w*40,h:h*40,kind})),
    stations: (plan.stations || [[2,13]]).map(([x,y]) => ({x:x*40+20,y:y*40+20})),
    spawn: {x:140,y:540},
    fans: (plan.fans || []).map(([x,y,w,h,dx,dy,strength]) => ({x:x*40,y:y*40,w:w*40,h:h*40,dx,dy,strength})),
    debris: [], trinket: null,
  };
  // Find a valid start near the first station, including procedural edge cases.
  const station = room.stations[0];
  const nearby = [[80,0],[-80,0],[0,-80],[0,80],[60,0],[-60,0],[0,-60],[0,60]];
  const offset = nearby.find(([dx,dy]) => Array.from({length:9},(_,i)=>i/8).every(t=>isWalkable(room,station.x+dx*t,station.y+dy*t,18)));
  if (!offset) throw new Error('Room station needs a clear entrance at least 60 px away.');
  room.spawn = {x:station.x+offset[0],y:station.y+offset[1]};
  const cells = reachableCells(grid, [Math.floor(room.spawn.x / 40),Math.floor(room.spawn.y / 40)]);
  const valid = cells.filter(([x,y]) => isWalkable(room,x*40+20,y*40+20,18));
  const clusters = plan.clusters || [[6,5],[12,9],[19,6]];
  const clusterPools = clusters.map(([x,y]) => valid.filter(([cx,cy]) => (cx-x)**2+(cy-y)**2 < 25));
  for (let i = 0; i < plan.n; i++) {
    const pool = random() < .58 ? clusterPools[i % clusterPools.length] : valid;
    const candidates = pool.length ? pool : valid;
    let x, y, success = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const cell = candidates[Math.floor(random()*candidates.length)];
      x = cell[0]*40+20+(random()-.5)*30;
      y = cell[1]*40+20+(random()-.5)*30;
      if (isWalkable(room,x,y,18) && room.stations.every(s => Math.hypot(s.x-x,s.y-y)>34)) { success=true; break; }
    }
    if (!success) {
      const cell = valid.find(([cx,cy]) => room.stations.every(s => Math.hypot(s.x-(cx*40+20),s.y-(cy*40+20))>34));
      x=cell[0]*40+20; y=cell[1]*40+20;
    }
    const type=chooseType(meta.location,meta.id,random,plan.extraDust);
    room.debris.push({id:i,x,y,type,value:materialValue(type)});
  }
  // Place optional collectibles well away from the entrance, on accessible floor.
  const far = valid.filter(([x,y]) => Math.hypot(x*40+20-room.spawn.x,y*40+20-room.spawn.y)>400);
  const trinketCell = (far.length ? far : valid)[Math.floor(random()*(far.length || valid.length))];
  room.trinket = {x:trinketCell[0]*40+20,y:trinketCell[1]*40+20,name:meta.id ? LOCATIONS[meta.location].trinkets[(meta.id-1)%6] : 'Shift souvenir'};
  return room;
}

export function makeRoom(id, seed) {
  if (!Number.isInteger(id) || id < 1 || id > 24) throw new RangeError('Campaign room must be from 1 to 24.');
  return buildRoom(CAMPAIGN[id-1],plans[id-1],seedNumber(seed ?? (104729+id*7919)));
}

export function makeEndless(seed = 1) {
  const normalized=seedNumber(seed), random=randomFor(normalized ^ 0x9e3779b9);
  const location=Math.floor(random()*4), objects=[], grid=baseGrid();
  const kinds=[['workbench','crate','cabinet'],['arcade','sofa','table'],['planter','pot','bench'],['table','sofa','speaker']][location];
  const target=4+Math.floor(random()*4);
  for (let attempt=0;attempt<100 && objects.length<target;attempt++) {
    const x=3+Math.floor(random()*9)*2, y=3+Math.floor(random()*5)*2;
    const w=random()<.58?2:4, h=random()<.65?2:4;
    if(x+w>22||y+h>14)continue;
    const rectangle=[x,y,w,h,kinds[Math.floor(random()*kinds.length)]];
    // Furniture may not overlap. Whole 2x2 modules preserve 80px passages.
    if(objects.some(([ox,oy,ow,oh])=>x<ox+ow&&x+w>ox&&y<oy+oh&&y+h>oy))continue;
    const trial=grid.map(row=>[...row]);carve(trial,rectangle);
    const total=trial.flat().reduce((a,b)=>a+b,0);
    if(total<200||reachableCells(trial,[2,13]).length!==total)continue;
    objects.push(rectangle);carve(grid,rectangle);
  }
  const n=320+Math.floor(random()*101);
  const plan={objects,n,stations:[[2,13],[21,2]],clusters:[[4+Math.floor(random()*16),4],[5,8+Math.floor(random()*5)],[17,10]],fans:[]};
  if(location!==0&&random()<.75)plan.fans.push([8,6,8,2,random()<.5?-1:1,0,22+Math.floor(random()*11)]);
  return buildRoom({id:0,name:'Endless Shift',location,brief:'A fresh, reproducible cleaning challenge.',tip:`Seed ${normalized}: replay this exact room whenever you like.`,goldTime:120,silverTime:200},plan,normalized);
}
