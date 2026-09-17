// Mouse movement follows a target; held touch/pen gestures retain pointer ownership.
export function createInputController({canvas,onGesture=()=>{},onChange=()=>{}}){
  let pointer=null,touch=null,captureTarget=null,captureId=null;
  const snapshot=()=>({pointer:pointer?{...pointer}:null,touch:touch?{...touch}:null});
  const changed=()=>onChange(snapshot());
  const activeId=()=>captureId??undefined;
  const finitePoint=e=>e&&Number.isFinite(e.pointerId)&&Number.isFinite(e.clientX)&&Number.isFinite(e.clientY);
  function bounds(){
    const r=canvas()?.getBoundingClientRect();
    return r&&[r.left,r.top,r.width,r.height].every(Number.isFinite)&&r.width>0&&r.height>0?r:null;
  }
  function coords(e,r){
    const scale=Math.min(r.width/960,r.height/640);
    return{x:(e.clientX-r.left-(r.width-960*scale)/2)/scale,y:(e.clientY-r.top-(r.height-640*scale)/2)/scale};
  }
  function clear(){
    const id=activeId(),target=captureTarget;
    pointer=null;touch=null;captureTarget=null;captureId=null;
    if(id!==undefined&&target?.releasePointerCapture)try{target.releasePointerCapture(id);}catch{}
    changed();
  }
  function pointerDown(e){
    if(!finitePoint(e)||e.isPrimary===false||activeId()!==undefined||(e.button!==undefined&&e.button!==0))return;
    const r=bounds();if(!r)return;
    onGesture();
    e.preventDefault?.();
    pointer=null;touch=null;
    if(e.pointerType==='touch'||e.clientY>r.top+r.height)touch={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
    else pointer={id:e.pointerId,...coords(e,r)};
    if(touch||e.pointerType!=='mouse'){
      captureTarget=e.currentTarget;captureId=e.pointerId;
      try{captureTarget?.setPointerCapture?.(e.pointerId);}catch{}
    }
    changed();
  }
  function pointerMove(e){
    if(!finitePoint(e))return;
    if(activeId()!==undefined&&activeId()!==e.pointerId)return;
    if(touch){
      const dx=e.clientX-touch.x,dy=e.clientY-touch.y,divisor=Math.max(40,Math.hypot(dx,dy));
      touch.dx=dx/divisor;touch.dy=dy/divisor;
    }else{
      if(activeId()===undefined&&(e.pointerType!=='mouse'||e.isPrimary===false))return;
      const r=bounds();if(!r)return;
      const point=coords(e,r);
      if(activeId()===undefined&&(point.x<0||point.x>960||point.y<0||point.y>640)){
        pointerLeave(e);return;
      }
      pointer={id:e.pointerId,...point};
    }
    changed();
  }
  function pointerUp(e){if(e&&activeId()!==undefined&&activeId()===e.pointerId)clear();}
  function pointerCancel(e){if(e&&Number.isFinite(e.pointerId)&&(activeId()??pointer?.id)===e.pointerId)clear();}
  function pointerLeave(e){
    if(e&&pointer&&activeId()===undefined&&pointer.id===e.pointerId)clear();
  }
  function movement(robot,keys){
    if(touch)return{x:touch.dx,y:touch.dy};
    const has=key=>keys?.has?.(key)===true;
    const x=Number(has('ArrowRight')||has('d'))-Number(has('ArrowLeft')||has('a'));
    const y=Number(has('ArrowDown')||has('s'))-Number(has('ArrowUp')||has('w'));
    if(x||y){const length=Math.max(1,Math.hypot(x,y));return{x:x/length,y:y/length};}
    if(pointer&&Number.isFinite(robot?.x)&&Number.isFinite(robot?.y)){
      const dx=pointer.x-robot.x,dy=pointer.y-robot.y,d=Math.hypot(dx,dy);
      if(d>5){const speed=Math.min(1,d/20);return{x:dx/d*speed,y:dy/d*speed};}
    }
    return{x:0,y:0};
  }
  return{pointerDown,pointerMove,pointerUp,pointerCancel,pointerLeave,clear,movement,get pointer(){return snapshot().pointer;},get touch(){return snapshot().touch;}};
}
