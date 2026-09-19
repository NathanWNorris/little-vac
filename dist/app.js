import {LOCATIONS,CAMPAIGN,makeRoom,makeEndless} from './rooms.js';
import {SAVE_KEY,resetCareer,statsFor,SHELLS,buyUpgrade,settleRun,selectShell,isRoomUnlocked} from './progression.js';
import {createRun,step,runResult} from './simulation.js';
import {AREA_STRIDE} from './world.js';
import {render,drawTitle} from './render.js';
import {createCareerStore} from './career-store.js';
import {createInputController} from './input.js';
import {esc,timeText,money,coinBalance,action,affordable,navigation,pausedRoomBanner,roomsMarkup,shopMarkup,guideArt} from './ui.js';

const $=s=>document.querySelector(s), main=$('#main'),modal=$('#modal'),content=$('#modalContent');
let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};}
// The isolated QA server supplies memory-only storage; production never includes it.
if(window.sweepQaStorage)storage=window.sweepQaStorage;
let career,screen='title',run=null,paused=false,settlement=null,ctx=null,canvas=null,keys=new Set(),lastStamp=0,accumulator=0,lastHud=0,toastTimeout,audioContext,lastFocus=null,lastSeed='morning-light',roomDistrict=null,pendingStart=null,settling=false,starting=false,resetting=false,uiReady=false;
const store=createCareerStore(storage,{locks:navigator.locks,onWarning:warning,onChange:careerChanged});
career=store.career;
const input=createInputController({canvas:()=>canvas,onGesture:clearInput,onChange:({touch})=>{const knob=$('.knob');if(knob)knob.style.transform=touch?`translate(${touch.dx*24}px,${touch.dy*24}px)`:'';}});
let remoteControl=null,viewRevision=0;
let dialogScreen='';

const medals=['','Bronze','Silver','Gold'];
const shells=()=>SHELLS.find(s=>s.id===career.shell)||SHELLS[0];
function notify(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),2800);}
function warning(s){$('#saveWarning').hidden=false;$('#saveWarning').textContent=s;}
if(store.status==='blocked')warning('Saving is unavailable in this browser. You can play, but progress will disappear when you leave.');
if(store.status==='recovered')warning('Your saved data could not be fully recovered. Valid progress was kept where possible.');
function save(change){return store.transact(change);}
function careerWasReset(previous,next){return previous&&(next.generation!==previous.generation||next.completed.length<previous.completed.length||Object.keys(previous.upgrades).some(key=>next.upgrades[key]<previous.upgrades[key]));}
function careerChanged(next){
  career=next;if(!uiReady)return;settingsApply();
  if(run&&(careerWasReset(run.careerAtStart,next)||!isRoomUnlocked(next,run.room.id))){
    if(modal.open)closeModal();run=null;settlement=null;roomDistrict=null;
    if(!resetting){rooms();notify('Your career changed in another tab. This view now matches the latest save.');return;}
  }
  updateNav();
  if(screen==='title')renderHome(false);
}
function hasActiveRun(){return !!run && ['playing','exiting','finishing'].includes(run.phase) && !settlement;}
function purchaseBlocked(){return screen==='play'||modal.open||starting||settling||resetting;}
function updateNav(){const nav=$('#gameNav');if(!nav)return;nav.innerHTML=navigation(career,screen,hasActiveRun());bindActions(nav,false);}
function settingsApply(){document.body.classList.toggle('no-motion',career.settings.reducedMotion);$('#soundBtn').textContent=career.settings.muted?'♫̸':'♪';$('#soundBtn').setAttribute('aria-label',career.settings.muted?'Unmute sound':'Mute sound');$('#soundBtn').setAttribute('aria-pressed',String(!career.settings.muted));}
function sound(type,material){if(career.settings.muted||!audioContext)return;try{const t=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();let f=type==='pickup'?({crumb:460,confetti:710,dust:280,stuck:360}[material]||500):type==='unload'?920:type==='finish'?660:type==='trinket'?1100:170;osc.type=material==='dust'?'sine':'triangle';osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(f*(type==='full'?.65:1.55),t+.10);gain.gain.setValueAtTime(.035*career.settings.effects,t);gain.gain.exponentialRampToValueAtTime(.0001,t+(type==='finish'?.6:.16));osc.connect(gain);gain.connect(audioContext.destination);osc.start(t);osc.stop(t+.65);}catch{}}
function unlockAudio(){if(!audioContext)try{audioContext=new(window.AudioContext||window.webkitAudioContext)();}catch{}if(audioContext?.state==='suspended')audioContext.resume().catch(()=>{});}
document.addEventListener('pointerdown',unlockAudio,{once:true});document.addEventListener('keydown',unlockAudio,{once:true});
function clearInput(){if(remoteControl){const control=remoteControl;remoteControl=null;control.resolve({interrupted:true,...publicState()});}keys.clear();input.clear();}
function prepareScreen(name,keepScroll=false){clearInput();viewRevision++;screen=name;paused=modal.open&&name==='play';main.innerHTML='';canvas=null;ctx=null;document.body.dataset.screen=name;if(!keepScroll)window.scrollTo({top:0,behavior:'instant'});updateNav();}
function bindActions(root=main,focusHeading=true){if(root===main&&screen!=='play'&&screen!=='title'&&screen!=='shop'&&hasActiveRun()&&!root.querySelector('.paused-room'))root.insertAdjacentHTML('afterbegin',pausedRoomBanner(run));root.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{Promise.resolve(act(b.dataset.action,b)).catch(error=>{console.error(error);notify('That action could not finish. Please try again.');});}));if(root===main&&screen!=='play'&&focusHeading){const heading=root.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}}
function continueTarget(){
  if(hasActiveRun())return {type:'resume',room:run.room};
  if(career.completed.length===24&&!career.endingSeen)return {type:'ending'};
  if(career.lastRoom===0&&career.unlocked===25)return {type:'endless'};
  const id=career.completed.includes(career.lastRoom)?career.unlocked:(career.lastRoom||career.unlocked);
  return id===25?{type:'rooms'}:{type:'room',room:CAMPAIGN.find(r=>r.id===id)};
}
function title(){prepareScreen('title');renderHome();}
function renderHome(focus=true){
  const target=continueTarget(),room=target.room,progressed=career.completed.length>0||Object.values(career.upgrades).some(Boolean),count=affordable(career).length;
  const label={resume:'Resume room',ending:'Finish campaign',endless:'Play endless',rooms:'Choose a room',room:progressed?'Continue':'Play'}[target.type];
  const caption=room?(room.id?`Room ${room.id} · ${room.name}`:'Endless Shift'):'';
  main.innerHTML=`<section class="home-menu"><canvas id="titleArt" class="title-art" width="960" height="640" aria-hidden="true"></canvas><div class="title-content"><h1 class="title-logo">LITTLE <span>VAC</span></h1><nav class="title-options" aria-label="Main menu">${action('continue',`<span>${label}</span><span class="title-play-arrow" aria-hidden="true">▶</span>`,'home-play title-choice')}${caption?`<p class="title-next">${esc(caption)}</p>`:''}${action('rooms','Rooms','title-choice')}${action('shop',`<span>Upgrades${count?` <small>${count} ready</small>`:''}</span>`,'title-choice')}${action('controls','How to play','title-choice')}</nav></div></section>`;
  const art=$('#titleArt'),artCtx=art.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1);
  art.width=960*dpr;art.height=640*dpr;artCtx.setTransform(dpr,0,0,dpr,0,0);drawTitle(artCtx,0,true);
  bindActions(main,focus);
}
function rooms(district=roomDistrict){roomDistrict=Number.isInteger(district)?Math.max(0,Math.min(3,district)):Math.min(3,Math.floor((career.unlocked-1)/6));prepareScreen('rooms');main.innerHTML=roomsMarkup(career,roomDistrict,hasActiveRun());bindActions();}
function setupCanvas(){canvas=$('#gameCanvas');ctx=canvas.getContext('2d');const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=960*dpr;canvas.height=640*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const surface=$('.arena');surface.addEventListener('pointerdown',pointerDown);surface.addEventListener('pointermove',pointerMove);surface.addEventListener('pointerup',pointerUp);surface.addEventListener('pointercancel',e=>input.pointerCancel(e));surface.addEventListener('lostpointercapture',e=>input.pointerCancel(e));canvas.addEventListener('pointerleave',e=>input.pointerLeave(e));}
async function startRoom(id,seed){
  if(starting)return;starting=true;clearInput();
  try{const unlocked=await save(c=>{if(!isRoomUnlocked(c,id))return false;c.lastRoom=id;return true;});if(!unlocked){notify('Finish the previous room first.');return;}
    const room=id===0?makeEndless(seed??newSeed()):makeRoom(id,seed);lastSeed=room.seed;
    run=createRun(room,statsFor(career.upgrades),`${Date.now()}-${crypto.randomUUID?.()||Math.random()}`);run.careerAtStart=career;run.started=false;run.cameraX=0;settlement=null;roomDistrict=room.location;
    clearTimeout(toastTimeout);$('#toast').classList.remove('visible');$('#toast').textContent='';
    $('#announcement').textContent='Parked at the drop-off dock. Left-click the room or press WASD to start.';
    playRoom();
  }finally{starting=false;}
}
function readyToStart(){return screen==='play'&&run?.phase==='playing'&&!run.started;}
function areaCount(){return run?.areaCount||1;}
function areaNumber(){return (run?.areaIndex||0)+1;}
function areaGuide(){return `<span id="areaGuide" class="job-position">${run.room.id?`Room ${run.room.id}`:'Endless'}${areaCount()>1?` · Area ${areaNumber()} of ${areaCount()}`:''}</span>`;}
function quickGuide(){return `<ol class="picture-guide" aria-label="Three steps to play"><li><span class="guide-number" aria-hidden="true">1</span><div class="guide-picture"><span class="mouse-copy">${guideArt('move')}</span><span class="touch-copy">${guideArt('touch')}</span></div><div class="guide-copy"><h3>Move</h3><p><span class="mouse-copy">Left-click, then move your <strong>mouse.</strong> No holding.</span><span class="touch-copy">Tap Start, then <strong>drag</strong> the pad or room.</span></p><div class="guide-keys mouse-copy"><span>or use</span> <span aria-label="W A S D keys"><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></span></div></div></li><li><span class="guide-number" aria-hidden="true">2</span><div class="guide-picture">${guideArt('clean')}</div><div class="guide-copy"><h3>Clean</h3><p>Move over dirt.<br>The vacuum cleans <strong>by itself.</strong></p></div></li><li><span class="guide-number" aria-hidden="true">3</span><div class="guide-picture">${guideArt('dock')}</div><div class="guide-copy"><h3>Empty</h3><p>Bag full? Follow the <strong class="dock-color">green arrow</strong> to the dock. Park to empty.</p></div></li></ol><div class="guide-goal"><span aria-hidden="true">✓</span><p><strong>Get every area to 100%.</strong><span>Finish the job, earn coins, buy upgrades.</span></p></div>`;}
function startInstructions(){
  if(career.completed.includes(1))return `<div id="roomStart" class="room-start room-start-compact" ${run.started?'hidden':''} role="region" aria-labelledby="startTitle"><div class="start-card"><h2 id="startTitle" class="sr-only">Ready to clean?</h2>${action('begin-room','<span class="mouse-copy">Left-click or WASD to start ▶</span><span class="touch-copy">Tap to start ▶</span>','primary')}</div></div>`;
  return `<div id="roomStart" class="room-start" ${run.started?'hidden':''} role="region" aria-labelledby="startTitle"><div class="start-card"><h2 id="startTitle">Ready to clean?</h2>${quickGuide()}${action('begin-room','<span class="mouse-copy">Left-click to start ▶</span><span class="touch-copy">Tap to start ▶</span>','primary')}<p class="start-keys">Or press WASD / arrow keys · Esc pauses</p></div></div>`;
}
function focusRoom(){(readyToStart()?$('#roomStart [data-action="begin-room"]'):canvas)?.focus({preventScroll:true});}
function beginRoom(){
  if(!readyToStart()||paused||modal.open||starting||settling||resetting)return false;
  clearInput();run.started=true;lastStamp=performance.now();accumulator=0;
  $('#roomStart').hidden=true;focusRoom();gameHUD();
  $('#announcement').textContent=run.room.exit?'Area started. Clean 100% to unlock the hallway. Open hallways let you walk both ways.':'Room started. Guide the vacuum, dock when the bag is full, and clean 100% to finish.';
  return true;
}
function playRoom(){
  // Purchases use saved coins while the job is paused; keep its dirt and earnings.
  run.stats=statsFor(career.upgrades);run.full=run.robot.bag>=run.stats.capacity;
  if(!run.full)run.fullNotified=false;
  const room=run.room;prepareScreen('play');
  main.innerHTML=`<h1 class="sr-only">${esc(room.name)}</h1>
    <section class="game-hud" aria-label="Cleaning progress and bag">
      <div class="clean-readout"><strong id="cleanPercent">0%</strong><span>clean</span><small id="remainingMess" class="sr-only" hidden></small></div>
      <div id="bagMeter" class="bag-meter"><div class="bag-label"><strong id="bagText">Bag 0 / ${run.stats.capacity}</strong><span id="bagStatus" hidden></span></div><div class="progress-track"><div class="progress-fill" id="bagFill" style="width:0%"></div></div></div>
      ${action('pause','Ⅱ Pause','play-pause')}
    </section>
    <div class="arena"><canvas id="gameCanvas" width="960" height="640" tabindex="0" aria-label="Cleaning room. Parked at the drop-off dock. Left-click inside the room, or press WASD or an arrow key to start and steer. After clicking, move your mouse without holding. Touch: tap Start, then drag to steer. Suction and emptying at green docks are automatic. Clean 100% in each area. Clean this area to unlock its hallway. Walk through open hallways in either direction. Finish all areas to save your coins. Escape pauses."></canvas><div class="joystick" aria-hidden="true"><div class="knob"></div></div><div class="touch-hint">Drag to glide</div>${startInstructions()}</div>
    <div class="game-bottom"><p class="steering-guide"><span class="mouse-copy"><strong>Mouse</strong> or <strong>WASD</strong></span><span class="touch-copy">Drag to steer</span></p>${areaGuide()}</div>
    <p id="gameTip" class="game-tip" hidden></p>`;
  setupCanvas();bindActions();if(!modal.open)focusRoom();lastStamp=performance.now();accumulator=0;lastHud=0;gameHUD();
}
async function requestStart(id,seed){
  if(hasActiveRun()){
    if(run.room.id===id && id!==0)return playRoom();
    pendingStart={id,seed};
    if(modal.open)modal.close();
    openModal(`<h2 id="modalTitle">Start another room?</h2><p>Your unfinished cleaning and this room’s coins will be discarded. Completed rooms and purchases are already saved.</p><div class="button-row">${action('resume','Keep this room','primary')}${action('switch-confirm','Start new room')}</div>`);
    return;
  }
  return startRoom(id,seed);
}

function pointerDown(e){
  if(screen!=='play'||paused||modal.open||starting||!['playing','exiting'].includes(run?.phase))return;
  if(!run.started){
    // Touch users can scroll the picture guide. Its Start button begins the job.
    if(e.pointerType==='touch'||e.pointerType==='pen')return;
    if(e.button!==0||e.isPrimary===false||!Number.isFinite(e.pointerId))return;
    e.preventDefault?.();
    beginRoom();
    return;
  }
  input.pointerDown(e);
}
function pointerMove(e){if(screen!=='play'||paused||modal.open||!run?.started||!['playing','exiting'].includes(run.phase))return;if(remoteControl)clearInput();input.pointerMove(e);}
function pointerUp(e){input.pointerUp(e);}
function movement(){
  if(remoteControl)return{x:remoteControl.x,y:remoteControl.y};
  // The mouse lives on the screen; room coordinates change at the hallway seam.
  return input.movement({x:run.robot.x+run.areaIndex*AREA_STRIDE-(run.cameraX||0),y:run.robot.y},keys);
}
function updateCamera(delta){
  const target=Math.max(0,Math.min((run.areaCount-1)*AREA_STRIDE,run.robot.x+run.areaIndex*AREA_STRIDE-480));
  const current=run.cameraX||0;
  run.cameraX=career.settings.reducedMotion?target:current+(target-current)*(1-Math.exp(-8*delta));
}
function gameHUD(){
  if(!run||screen!=='play')return;
  const r=run,b=r.robot,pct=Math.min(100,Math.floor(r.percent*100)),fill=b.bag/r.stats.capacity;
  const remaining=r.debris.filter(d=>!d.collected).length;
  const lastFew=r.phase==='playing'&&remaining>0&&remaining<=5;
  $('#remainingMess').hidden=!lastFew;
  $('#remainingMess').textContent=lastFew?`${remaining} ${remaining===1?'piece':'pieces'} left`:'';
  $('#cleanPercent').textContent=pct+'%';$('#bagText').textContent=`Bag ${b.bag} / ${r.stats.capacity}`;
  $('#bagFill').style.width=(fill*100)+'%';
  $('#bagStatus').textContent=r.unloading?'Emptying…':r.full?'Full':fill>=.8?'Nearly full':'';
  $('#bagStatus').hidden=fill<.8&&!r.unloading;
  $('#bagMeter').classList.toggle('full',fill>=.8);
  let tip='';
  if(!r.started)tip='';
  else if(r.phase==='finishing')tip='All clean! Saving your coins…';
  else if(r.unloading)tip='Emptying… stay beside the dock.';
  else if(r.full)tip='Bag full. Follow the green arrow to empty it.';
  else if(fill>=.8)tip='Nearly full. Follow the green arrow to the dock.';
  else if(r.phase==='exiting')tip='Area clean! Walk through the open hallway. You can come back.';
  else if(r.robot.x<40||r.robot.x>920)tip='Open hallways go both ways. Your bag stays with you.';
  else if(lastFew)tip=`${remaining} ${remaining===1?'piece':'pieces'} left. Look for the bright yellow circles and pointers.`;
  else if(r.percent>=.95)tip=`${remaining} pieces left. Look for the yellow rings.`;
  else if(r.room.exit&&Math.hypot(r.robot.x-r.room.exit.x,r.robot.y-r.room.exit.y)<95)tip='Door locked. Clean this area to 100% to open it.';
  else if(r.room.toughness>1.4&&r.time<18)tip='Heavy dirt? Stay over it a little longer.';
  if($('#gameTip').textContent!==tip)$('#gameTip').textContent=tip;
  $('#gameTip').hidden=!tip;
}
async function completed(){if(settling||settlement||!run||!runResult(run))return;settling=true;const finished=run;try{const reward=await save(c=>careerWasReset(finished.careerAtStart,c)?{ok:false,message:'Your career changed in another tab. Start a room from your latest save.'}:settleRun(c,runResult(finished)));if(run!==finished)return;settlement=reward;if(!reward.ok){run=null;settlement=null;rooms();notify(reward.message);return;}results();}catch(error){console.error(error);warning('This room’s reward could not be recorded. Keep the tab open and try again.');}finally{settling=false;}}
function results(){prepareScreen('result');const r=run,s=settlement;const next=r.room.id===24&&!career.endingSeen?'ending':r.room.id>0&&r.room.id<24?`room:${r.room.id+1}`:'endless';main.innerHTML=`<section class="result"><div class="eyebrow" style="justify-content:center">${esc(LOCATIONS[r.room.location].name)} · SHIFT COMPLETE</div><div class="result-icon" aria-hidden="true">✓</div><h1>Room complete!</h1><p>${esc(r.room.name)} cleaned.${areaCount()>1?` All ${areaCount()} areas complete.`:''} Your coins are saved.</p><div class="result-stats"><div class="result-stat"><strong>+${money(s.coins)}</strong><small>COINS EARNED</small></div><div class="result-stat"><strong>${timeText(r.time)}</strong><small>YOUR TIME</small></div><div class="result-stat"><strong>${medals[runResult(r).medal]}</strong><small>ROOM MEDAL</small></div></div><div class="reward-breakdown"><span>Cleaning <strong>+${money(s.coins-s.bonus)}</strong></span><span>New bonuses <strong>+${money(s.bonus)}</strong></span><span>${coinBalance(career.coins)}</span></div>${r.room.id>0&&!career.trinkets.includes(r.room.id)?'<p class="replay-note">Optional treasure still to find. Replay this room anytime to look for it.</p>':''}${s.newTrinket?`<div class="bonus-note">Treasure found: ${esc(r.trinket.name)}.</div>`:''}${s.newShell?`<div class="bonus-note">Robot color unlocked: ${esc(s.newShell.name)}. Find it in Upgrades.</div>`:''}${s.endlessUnlocked?'<div class="bonus-note">All 24 rooms restored. Endless Shift is now open!</div>':''}<div class="button-row">${action(next,next==='ending'?'Finish campaign':next==='endless'?'Play endless':`Play room ${r.room.id+1}`,'primary')}${action('shop',affordable(career).length?'Buy upgrades':'View upgrades')}${action('replay',r.room.id===0?'Replay this seed':'Replay room','ghost')}</div><div class="button-row">${action('rooms','Choose a room','ghost')}${action('collection','Treasure shelf','ghost')}</div><p style="font-size:12px">${s.bonus?`${money(s.bonus)} first-time bonuses included. `:''}Replays earn cleaning coins; previous bonuses are never paid twice.</p></section>`;bindActions();sound('finish');$('#announcement').textContent=`Room complete. ${s.coins} coins earned. ${medals[runResult(r).medal]} medal.`;}
function shop(keepScroll=false){
  const expanded=keepScroll?[...main.querySelectorAll('.shop-disclosure[open]')].map(d=>d.id):[];
  prepareScreen('shop',keepScroll);main.innerHTML=shopMarkup(career,hasActiveRun()?run:null);
  for(const id of expanded){const disclosure=main.querySelector('#'+id);if(disclosure)disclosure.open=true;}
  bindActions(main,!keepScroll);
}
function collection(){prepareScreen('collection');main.innerHTML=`<div class="page-head"><div><h1>Treasures</h1><p>${career.trinkets.length} / 24 found. One hidden in each room.</p></div></div><div class="button-row">${action('rooms','Back to rooms','primary')}</div>${LOCATIONS.map((l,i)=>`<div class="section-head"><h2>${esc(l.name)}</h2></div><div class="shelf">${l.trinkets.map((t,j)=>{let found=career.trinkets.includes(i*6+j+1);return`<div class="trinket-card ${found?'':'missing'}"><span>${found?'✧':'?'}</span><small>${found?esc(t):`Hidden in room ${i*6+j+1}`}</small></div>`}).join('')}</div>`).join('')}`;bindActions();}
function newSeed(){return `${['sunny','mint','cosy','little','bright','coral'][Math.floor(Math.random()*6)]}-${Math.random().toString(36).slice(2,7)}`;}
function endless(){if(career.unlocked<25)return;prepareScreen('endless');main.innerHTML=`<section class="result"><div class="result-icon">∞</div><div class="eyebrow" style="justify-content:center">ENDLESS SHIFT</div><h1>Endless rooms</h1><p>Enter a seed to generate a room. Use the same seed to play it again.</p><form class="seed-form" id="seedForm"><input id="seedInput" aria-label="Room seed" value="${esc(newSeed())}" maxlength="40" required><button class="primary" type="submit">Play</button></form><p style="font-size:12px">Your purchased upgrades carry over.</p><div class="button-row">${action('shop','Robot upgrades')}${action('rooms','Back to rooms','ghost')}</div></section>`;$('#seedForm').onsubmit=e=>{e.preventDefault();let seed=$('#seedInput').value.trim().slice(0,40);if(seed)requestStart(0,seed);};bindActions();}
async function ending(){if(career.completed.length<24)return;const revision=viewRevision;const eligible=await save(c=>{if(c.completed.length<24)return false;c.endingSeen=true;return true;});if(revision!==viewRevision)return;if(!eligible||career.completed.length<24)return rooms();prepareScreen('ending');main.innerHTML=`<section class="result"><div class="eyebrow" style="justify-content:center">CAMPAIGN COMPLETE</div><div class="ending-stamp" aria-label="24 of 24 rooms cleaned"><strong>24 <span>/ 24</span></strong><span>ROOMS CLEANED</span></div><h1>All rooms complete!</h1><p>You cleaned all 24 rooms across four locations.</p><p>Replay rooms for better medals, find missing treasures, or try Endless.</p><div class="bonus-note">Endless Shift and your final robot shell are unlocked.</div><div class="button-row">${action('endless','Play endless','primary')}${action('collection','View treasures')}${action('credits','Credits','ghost')}</div><div class="button-row">${action('rooms','Choose a room','ghost')}</div></section>`;bindActions();}
function openModal(html,kind=''){lastFocus=document.activeElement;paused=screen==='play';clearInput();dialogScreen=kind;content.innerHTML=html;bindActions(content);modal.showModal();}
function closeModal(){modal.close();dialogScreen='';paused=false;clearInput();lastStamp=performance.now();accumulator=0;if(screen==='play')focusRoom();else if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else main.querySelector('h1')?.focus({preventScroll:true});}
function dismissModal(){const back=dialogScreen==='pause-child';closeModal();if(back)pause();}
function jobDetails(){const r=run;return `<details class="pause-details"><summary>Job details & coins</summary><div><p>${esc(LOCATIONS[r.room.location].name)} · ${r.room.id?`Room ${r.room.id}`:'Endless'}${areaCount()>1?`<br>Area ${areaNumber()} of ${areaCount()} · ${esc(r.room.areaName)}`:''}</p><p>${coinBalance(career.coins)}<br><span id="bagValue">In bag: ${money(r.robot.bagValue)} ${r.robot.bagValue===1?'coin':'coins'}</span><br><span id="pendingCoins">+${money(r.coins+r.robot.bagValue)} this ${areaCount()>1?'job':'room'}</span></p><p>Coins save when you finish the whole job.</p><p>Time ${timeText(r.time)}<br>Gold ${timeText(r.jobRoom.goldTime)} · Silver ${timeText(r.jobRoom.silverTime)}${r.room.id===0?`<br>Seed: ${esc(r.room.seed)}`:''}</p></div></details>`;}
function pause(){if(screen!=='play'||!hasActiveRun()||modal.open)return;openModal(`<section class="pause-menu"><p class="pause-caption">TAKE A BREATHER</p><h2 id="modalTitle">PAUSED</h2><p class="pause-room">${esc(run.room.name)}<br>${areaCount()>1?`Area ${areaNumber()} of ${areaCount()} · `:''}${Math.floor(run.percent*100)}% clean</p><div class="pause-options">${action('resume','<span>Resume</span><span aria-hidden="true">▶</span>','pause-resume')}<div class="pause-shortcuts">${action('rooms','Rooms')}${action('shop','Upgrades')}</div>${action('controls','How to play')}${action('settings','Settings')}${action('title','Main menu')}</div>${jobDetails()}<div class="pause-leave"><div>${action('restart','Restart','ghost')}${action('quit','Quit & upgrade','pause-quit')}</div><p>Restarting or quitting loses unfinished coins.</p></div></section>`,'pause');}
function settings(){const backToPause=dialogScreen==='pause';if(modal.open)modal.close();openModal(`<h2 id="modalTitle">Settings</h2><label class="setting-row">Sound effects<input id="muteSetting" type="checkbox" ${!career.settings.muted?'checked':''}></label><label class="setting-row">Effects volume<input id="volumeSetting" aria-label="Effects volume" type="range" min="0" max="1" step=".05" value="${career.settings.effects}"></label><label class="setting-row">Reduced motion<input id="motionSetting" type="checkbox" ${career.settings.reducedMotion?'checked':''}></label><p>Finished rooms, coins, and purchases save automatically. Browsing menus keeps your current room paused. Spend saved coins on upgrades while the room is paused. This job’s coins become available only when you finish it. Restarting, quitting, or closing the game discards unfinished cleaning.</p><div class="button-row">${action(backToPause?'back-pause':'resume',backToPause?'Back to pause':'Done','primary')}${action('new','Reset career','ghost')}</div>`,backToPause?'pause-child':'');$('#muteSetting').onchange=async e=>{const value=!e.target.checked;await save(c=>{c.settings.muted=value;});};$('#volumeSetting').onchange=async e=>{const value=Number(e.target.value);await save(c=>{c.settings.effects=value;});};$('#motionSetting').onchange=async e=>{const value=e.target.checked;await save(c=>{c.settings.reducedMotion=value;});};}
function controls(){const backToPause=dialogScreen==='pause';if(modal.open)modal.close();openModal(`<section class="how-to-play"><h2 id="modalTitle">How to play</h2>${quickGuide()}<details class="guide-tips"><summary>A few extra tips</summary><ul><li><strong>Pause:</strong> press Esc or the Pause button.</li><li><strong>Stop:</strong> move the mouse outside the room, or release your keys / touch.</li><li><strong>Last bits of dirt:</strong> look for yellow circles.</li><li><strong>Heavy dust:</strong> stay over it a little longer.</li><li><strong>Hallways:</strong> clean 100% to unlock the next door. Once open, walk both ways. Rooms and your bag stay as you left them.</li><li><strong>Upgrades:</strong> pause and open Upgrades, or visit them from the main menu. Spend saved coins now; finish the whole job to collect its coins.</li></ul></details><div class="button-row">${action(backToPause?'back-pause':'resume',backToPause?'Back to pause':screen==='play'?'Back to room':'Got it','primary')}</div></section>`,backToPause?'pause-child':'');}
function credits(){if(modal.open)modal.close();openModal(`<h2 id="modalTitle">Credits</h2><div class="credit-list"><p><strong>Little Vac</strong><br>A tiny cleaning game by Nathan Norris.</p><p>Built with JavaScript, Canvas, and synthesized Web Audio. All game artwork is drawn by original code. No external runtime assets or libraries are required.</p><p>Created with AI assistance for implementation, design iteration, writing, and testing.</p><p>Thanks for playing.</p></div><div class="button-row">${action('resume','Close','primary')}</div>`);}
function confirmReset(){const backToPause=dialogScreen==='pause-child';if(modal.open)modal.close();openModal(`<h2 id="modalTitle">Reset your progress?</h2><p>This resets your rooms, coins, upgrades, medals, and treasures. Your current career cannot be restored afterward.</p><div class="button-row">${action(backToPause?'back-pause':'resume','Keep my career','primary')}${action('reset-confirm','Reset and start again')}</div>`,backToPause?'pause-child':'');}
function continueShift(){
  const target=continueTarget();
  if(target.type==='resume')return playRoom();
  if(target.type==='ending')return ending();
  if(target.type==='endless')return endless();
  if(target.type==='rooms')return rooms();
  return startRoom(target.room.id);
}
function restorePurchaseFocus(id){const button=main.querySelector('[data-action="'+id+'"]');const target=button?.disabled?button.closest('article')?.querySelector('h2'):button;target?.focus({preventScroll:true});}
async function act(a,b){
  if(starting||settling||resetting)return;
  if(['rooms','shop','collection','title','resume-room','endless'].includes(a)&&modal.open)closeModal();
  if(a.startsWith('room:'))return requestStart(Number(a.split(':')[1]));
  if(a.startsWith('district:')){const y=window.scrollY;rooms(Number(a.split(':')[1]));main.querySelector('[data-action="'+a+'"]')?.focus({preventScroll:true});window.scrollTo({top:y,behavior:'instant'});return;}
  if(a.startsWith('buy:')||a.startsWith('shell:')){
    if(screen!=='shop'||purchaseBlocked())return;
    if(b)b.disabled=true;
    const result=await save(c=>purchaseBlocked()?{ok:false,message:'Pause and open Upgrades before buying.'}:a.startsWith('buy:')?buyUpgrade(c,a.split(':')[1]):selectShell(c,a.split(':')[1]));
    if(screen==='shop'){shop(true);restorePurchaseFocus(a);}if(result.ok&&a.startsWith('buy:'))sound('unload');return notify(result.message);
  }
  switch(a){
    case'begin-room':beginRoom();break;case'title':title();break;case'continue':return continueShift();case'rooms':rooms();break;case'shop':shop();break;case'collection':collection();break;case'endless':endless();break;case'ending':return ending();case'pause':pause();break;case'back-pause':closeModal();pause();break;case'resume':closeModal();break;case'resume-room':if(hasActiveRun())playRoom();else rooms();break;case'settings':settings();break;case'controls':controls();break;case'credits':credits();break;case'new':confirmReset();break;
    case'reset-confirm':closeModal();resetting=true;clearInput();try{await save(resetCareer);run=null;settlement=null;roomDistrict=0;return await startRoom(1);}finally{resetting=false;}
    case'replay':return requestStart(run.room.id,run.room.seed);
    case'restart':case'quit':{const restart=a==='restart';modal.close();openModal(`<h2 id="modalTitle">${restart?'Restart this room?':'Quit room & upgrade?'}</h2><p>This room’s unfinished cleaning and coins will be lost. Your previously saved coins, completed rooms, and upgrades are kept.</p><div class="button-row">${action('resume','Keep this room','primary')}${action(restart?'restart-confirm':'quit-confirm',restart?'Restart room':'Quit & open upgrades')}</div>`);break;}
    case'restart-confirm':closeModal();return startRoom(run.room.id,run.room.seed);
    case'quit-confirm':closeModal();run=null;settlement=null;shop();break;
    case'switch-confirm':{const next=pendingStart;pendingStart=null;closeModal();if(next)return startRoom(next.id,next.seed);break;}
  }
}
modal.addEventListener('cancel',e=>{e.preventDefault();dismissModal();});
$('#homeLink').onclick=e=>{e.preventDefault();if(screen==='play')pause();else title();};$('#soundBtn').onclick=async()=>{unlockAudio();await save(c=>{c.settings.muted=!c.settings.muted;});};$('#settingsBtn').onclick=settings;$('#creditsBtn').onclick=credits;
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Escape'){e.preventDefault();if(e.repeat)return;if(modal.open)dismissModal();else pause();return;}
  if(screen!=='play'||modal.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(e.key===' '&&e.target.closest('button,a,summary'))return;
  const key=e.key.length===1?e.key.toLowerCase():e.key;
  const steering=['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key);
  if(!steering&&key!==' ')return;
  e.preventDefault();
  if(!run?.started){
    // A held key from a menu or the previous room is not a fresh start action.
    if(!steering||e.repeat||!beginRoom())return;
  }
  if(remoteControl)clearInput();
  if(steering)input.clear();
  keys.add(key);
});
document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>{clearInput();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();}lastStamp=performance.now();accumulator=0;});
function frame(stamp){
  if(remoteControl&&stamp>=remoteControl.until){const control=remoteControl;remoteControl=null;control.resolve({interrupted:false,...publicState()});}
  const delta=Math.min(.1,(stamp-(lastStamp||stamp))/1000);lastStamp=stamp;
  if(screen==='play'&&run&&ctx){
    if(run.started&&!paused&&!modal.open&&!starting&&!settling&&!resetting&&!document.hidden){
      accumulator+=delta;const direction=movement();
      while(accumulator>=1/120&&run.started){const previousArea=run.areaIndex;step(run,1/120,direction);accumulator-=1/120;if(run.areaIndex!==previousArea){accumulator=0;break;}}
      let entered=false;
      for(const e of run.events){
        if(['pickup','unload','finish','trinket','full'].includes(e.type))sound(e.type,e.material);
        if(e.type==='trinket')notify(`Found: ${run.trinket.name}!`);
        if(e.type==='unload')notify(`Bag emptied. ${e.value} ${e.value===1?'coin':'coins'} ready to bank when you finish.`);
        if(e.type==='full')$('#announcement').textContent='Bag full. Follow the green arrow to the dock.';
        if(e.type==='area-clear'){$('#announcement').textContent=run.full?'Hallway unlocked. Your bag is full. Follow the green arrow to empty it, or carry it into the next area.':'Area clean! The hallway is unlocked. You can now walk both ways.';}
        if(e.type==='area-enter')entered=true;
      }
      run.events=[];
      if(entered){
        // Keep the canvas and active mouse, touch, or keyboard gesture intact.
        $('#areaGuide').outerHTML=areaGuide();
        gameHUD();
        $('#announcement').textContent=`Entered area ${areaNumber()} of ${areaCount()}: ${run.room.areaName}. Your bag still holds ${run.robot.bag} pieces worth ${run.robot.bagValue} coins. ${run.full?'Follow the green arrow to the drop-off dock.':'Keep steering with your mouse or WASD.'}`;
      }
      if(run.phase==='complete'){completed();requestAnimationFrame(frame);return;}
      updateCamera(delta);
    }
    const pointer=input.pointer;
    render(ctx,run,{time:stamp/1000,reducedMotion:career.settings.reducedMotion,shellColor:shells().color,cameraX:run.cameraX||0,pointer:pointer?{...pointer,x:pointer.x+(run.cameraX||0)-run.areaIndex*AREA_STRIDE}:null});
    if(stamp-lastHud>100){gameHUD();lastHud=stamp;}
  }
  requestAnimationFrame(frame);
}
// Optional browser-agent input uses the live movement loop; it cannot award progress.
function publicState(){return{screen,paused:paused||(hasActiveRun()&&screen!=='play'),room:run?{id:run.room.id,name:run.room.name,seed:run.room.seed}:null,area:run?{number:areaNumber(),count:areaCount(),name:run.room.areaName||run.room.name,toughness:run.room.toughness||1,exit:run.room.exit||null,canGoBack:run.areaIndex>0,cleared:run.areaStates[run.areaIndex].cleared}:null,phase:run?.phase,awaitingStart:!!run&&!run.started,robot:run?{x:run.robot.x,y:run.robot.y,worldX:run.robot.x+run.areaIndex*AREA_STRIDE,bag:run.robot.bag,bagValue:run.robot.bagValue,capacity:run.stats.capacity}:null,cameraX:run?.cameraX||0,percent:run?.percent,roomCoins:run?.coins,pendingCoins:run?run.coins+run.robot.bagValue:0,time:run?.time,career:JSON.parse(JSON.stringify(career))};}
const modelContext=document.modelContext;
if(modelContext?.registerTool){
  const lifecycle=new AbortController();
  const tools=[
    {name:'read_sweep_state',description:'Read the current room, robot, cleaning progress, and saved career.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:publicState},
    {name:'move_robot',description:'Hold a direction for up to four real seconds, using normal movement, collision, suction, and bag rules. A real input or pause interrupts this movement.',inputSchema:{type:'object',properties:{x:{type:'number',minimum:-1,maximum:1},y:{type:'number',minimum:-1,maximum:1},seconds:{type:'number',minimum:.05,maximum:4}},required:['x','y','seconds'],additionalProperties:false},execute:input=>{if(screen!=='play'||paused||modal.open||document.hidden||!run?.started||!['playing','exiting'].includes(run.phase)||remoteControl)throw Error('The robot is not available to move. Start the room first.');if(!input||![input.x,input.y,input.seconds].every(Number.isFinite)||Math.abs(input.x)>1||Math.abs(input.y)>1||input.seconds<.05||input.seconds>4)throw Error('Use a direction from -1 to 1 and a duration of 0.05–4 seconds.');clearInput();return new Promise(resolve=>{remoteControl={x:input.x,y:input.y,until:performance.now()+input.seconds*1000,resolve};});}},
    {name:'open_sweep_room',description:'Start an unlocked room from between-room screens, using the ordinary room-selection action.',inputSchema:{type:'object',properties:{id:{type:'integer',minimum:0,maximum:24},seed:{type:'string',maxLength:40}},required:['id'],additionalProperties:false},execute:async input=>{if(hasActiveRun()||modal.open||!Number.isInteger(input?.id)||!isRoomUnlocked(career,input.id))throw Error('This room is unavailable. Finish or leave the active room first.');await startRoom(input.id,input.seed);return publicState();}}
  ];
  for(const tool of tools)try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>{clearInput();lifecycle.abort();},{once:true});
}
window.addEventListener('storage',async e=>{if(e.key!==SAVE_KEY&&e.key!==null)return;await store.sync();if(screen==='shop')shop(true);else if(screen==='rooms')rooms();else if(screen==='title')title();else if(screen==='collection')collection();else if(screen==='play')gameHUD();});
if(store.status==='new'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)await save(c=>{c.settings.reducedMotion=true;});
uiReady=true;settingsApply();title();requestAnimationFrame(frame);
