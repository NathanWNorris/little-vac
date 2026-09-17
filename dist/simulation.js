import {isWalkable} from './rooms.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createRun(room,stats,runId='run-'+Date.now()) {
  return {room,stats:{...stats},runId,phase:'playing',robot:{...room.spawn,angle:0,move:0,bag:0,bagValue:0,squash:0},debris:room.debris.map((d,i)=>({...d,vx:0,vy:0,angle:i*2.39996,amount:1,collected:false,progress:0,loose:d.type!=='stuck'})),trinket:{...room.trinket,collected:false},cleaned:0,total:room.debris.length,percent:0,coins:0,time:0,unloading:0,nearestStation:0,full:false,finishProgress:0,particles:[],events:[],collectedCount:0,pickupCooldown:0,fullNotified:false};
}
export function clearLine(room,ax,ay,bx,by) {
  const n=Math.ceil(Math.hypot(bx-ax,by-ay)/12);
  for(let i=1;i<n;i++)if(!isWalkable(room,ax+(bx-ax)*i/n,ay+(by-ay)*i/n,2))return false;
  return true;
}
function burst(r,x,y,color,count=4) {
  for(let i=0;i<count&&r.particles.length<110;i++){let a=(i*2.4+r.time)*3,s=20+(i%4)*12;r.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45,maxLife:.45,color,size:2+i%3});}
}
function finish(r) {
  r.phase='finishing'; r.coins+=r.robot.bagValue; r.robot.bag=0;r.robot.bagValue=0;r.unloading=0;
  for(const d of r.debris)if(!d.collected){r.coins+=d.value;d.collected=true;d.amount=0;}
  r.cleaned=r.total;r.percent=1;r.full=false;r.events.push({type:'finish',value:r.coins});
}
export function step(r,dt,input={x:0,y:0}) {
  dt=clamp(Number.isFinite(dt)?dt:0,0,.05); if(!dt)return;
  for(const p of r.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;}
  r.particles=r.particles.filter(p=>p.life>0);r.robot.squash=Math.max(0,r.robot.squash-dt*5);
  if(r.phase==='complete')return;
  if(r.phase==='finishing'){r.finishProgress+=dt/1.2;if(r.finishProgress>=1){r.finishProgress=1;r.phase='complete';}return;}
  r.time+=dt;r.pickupCooldown=Math.max(0,r.pickupCooldown-dt);
  let ix=Number.isFinite(input.x)?input.x:0,iy=Number.isFinite(input.y)?input.y:0,m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m;}
  const b=r.robot,oldX=b.x,oldY=b.y,dx=ix*r.stats.speed*dt,dy=iy*r.stats.speed*dt;
  if(isWalkable(r.room,b.x+dx,b.y,17))b.x+=dx;
  if(isWalkable(r.room,b.x,b.y+dy,17))b.y+=dy;
  b.move=Math.hypot(b.x-oldX,b.y-oldY)/dt;
  if(b.move>3){const target=Math.atan2(b.y-oldY,b.x-oldX);let diff=Math.atan2(Math.sin(target-b.angle),Math.cos(target-b.angle));b.angle+=diff*Math.min(1,dt*14);}
  let nearest=Infinity;r.room.stations.forEach((s,i)=>{let d=Math.hypot(s.x-b.x,s.y-b.y);if(d<nearest){nearest=d;r.nearestStation=i;}});
  if(nearest<48&&b.bag>0){
    r.unloading=Math.min(1,r.unloading+dt/0.85);
    if(r.unloading>=1){let v=b.bagValue;r.coins+=v;b.bag=0;b.bagValue=0;r.unloading=0;r.fullNotified=false;r.events.push({type:'unload',value:v});burst(r,b.x,b.y,'#f4c95d',9);}
  }else r.unloading=0;
  r.full=b.bag>=r.stats.capacity;
  if(r.full&&!r.fullNotified){r.events.push({type:'full'});r.fullNotified=true;}
  if(!r.full&&r.unloading===0) {
    for(const d of r.debris) {
      if(d.collected)continue;
      let tx=b.x-d.x,ty=b.y-d.y,dist=Math.hypot(tx,ty),near=dist<r.stats.radius&&clearLine(r.room,b.x,b.y,d.x,d.y);
      if(near&&b.bag<r.stats.capacity){
        if(d.type==='dust'){
          const before=d.amount;d.amount=Math.max(0,d.amount-dt*1.9*r.stats.pull);r.cleaned+=before-d.amount;
          if(d.amount>.00001)continue;
        } else if(d.type==='stuck'&&!d.loose){
          d.progress+=dt*r.stats.pull/.55;if(d.progress<1)continue;d.loose=true;burst(r,d.x,d.y,'#b7c36c',3);
        }
        if(d.type!=='dust'){
          const acceleration=410*r.stats.pull*(1+.35*(1-dist/r.stats.radius));
          const swirl=(d.type==='confetti'?.26:.11)*Math.max(0,1-dist/r.stats.radius);
          d.vx+=(tx/(dist||1)-ty/(dist||1)*swirl)*acceleration*dt;
          d.vy+=(ty/(dist||1)+tx/(dist||1)*swirl)*acceleration*dt;
        }
        if(dist<23||d.type==='dust'&&d.amount===0){
          d.collected=true;b.bag++;b.bagValue+=d.value;r.collectedCount++;b.squash=.65;
          if(d.type!=='dust')r.cleaned++;d.amount=0;
          if(!r.pickupCooldown){r.events.push({type:'pickup',material:d.type,value:d.value});r.pickupCooldown=.045;}
          burst(r,b.x,b.y,d.type==='confetti'?'#ec9179':d.type==='dust'?'#d5bf91':'#edc964',2);
          if(b.bag>=r.stats.capacity)break;
        }
      }else if(d.type==='stuck'&&!d.loose)d.progress=Math.max(0,d.progress-dt*2);
    }
    let t=r.trinket;
    if(!t.collected&&Math.hypot(t.x-b.x,t.y-b.y)<30&&clearLine(r.room,t.x,t.y,b.x,b.y)){t.collected=true;r.events.push({type:'trinket'});burst(r,t.x,t.y,'#ffdf78',10);}
  }
  // Loose pieces always remain on reachable floor; fans never create new dirt.
  for(const d of r.debris)if(!d.collected&&d.type!=='dust'&&d.loose){
    for(const f of r.room.fans||[])if(d.x>=f.x&&d.x<=f.x+f.w&&d.y>=f.y&&d.y<=f.y+f.h){d.vx+=f.dx*f.strength*dt*(d.type==='confetti'?1:.3);d.vy+=f.dy*f.strength*dt*(d.type==='confetti'?1:.3);}
    const speed=Math.hypot(d.vx,d.vy);if(speed>400){d.vx*=400/speed;d.vy*=400/speed;}
    const nx=d.x+d.vx*dt,ny=d.y+d.vy*dt;
    if(isWalkable(r.room,nx,d.y,3))d.x=nx;else d.vx*=-.15;
    if(isWalkable(r.room,d.x,ny,3))d.y=ny;else d.vy*=-.15;
    const friction=Math.exp(-dt*4.2);d.vx*=friction;d.vy*=friction;d.angle+=dt*(d.vx-d.vy)*.022;
  }
  r.percent=clamp(r.cleaned/r.total,0,1);r.full=b.bag>=r.stats.capacity;
  if(r.percent>=.95)finish(r);
}
export function runResult(r) {
  if(r.phase!=='complete')return null;
  return {runId:r.runId,roomId:r.room.id,coins:r.coins,time:Math.round(r.time*100)/100,medal:r.time<=r.room.goldTime?3:r.time<=r.room.silverTime?2:1,trinket:r.trinket.collected};
}
