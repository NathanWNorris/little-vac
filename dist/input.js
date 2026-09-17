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
  const inRoom=point=>point.x>=0&&point.x<=960&&point.y>=0&&point.y<=640;
  function clear(){
    const id=activeId(),target=captureTarget;
    pointer=null;touch=null;captureTarget=null;captureId=null;
    if(id!==undefined&&target?.releasePointerCapture)try{target.releasePointerCapture(id);}catch{}
    changed();
  }
  function pointerDown(e){
    if(!finitePoint(e)||e.isPrimary===false||activeId()!==undefined||(e.button!==undefined&&e.button!==0))return;
    const r=bounds();if(!r)return;
    const joystick=e.pointerType==='touch'||e.clientY>r.top+r.height,point=coords(e,r);
    if(!joystick&&!inRoom(point)){pointerLeave(e);return;}
    onGesture();
    e.preventDefault?.();
    pointer=null;touch=null;
    if(joystick)touch={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
    else pointer={id:e.pointerId,...point};
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
      if(activeId()===undefined&&!inRoom(point)){
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
    const right=has('ArrowRight')||has('d'),left=has('ArrowLeft')||has('a'),down=has('ArrowDown')||has('s'),up=has('ArrowUp')||has('w');
    if(right||left||down||up){
      // Once keys take over, releasing them must not steer back to an old cursor.
      if(pointer){pointer=null;changed();}
      const x=Number(right)-Number(left),y=Number(down)-Number(up),length=Math.max(1,Math.hypot(x,y));
      return{x:x/length,y:y/length};
    }
    if(pointer&&Number.isFinite(robot?.x)&&Number.isFinite(robot?.y)){
      const dx=pointer.x-robot.x,dy=pointer.y-robot.y,d=Math.hypot(dx,dy);
      if(d>5){const speed=Math.min(1,d/20);return{x:dx/d*speed,y:dy/d*speed};}
    }
    return{x:0,y:0};
  }
  return{pointerDown,pointerMove,pointerUp,pointerCancel,pointerLeave,clear,movement,get pointer(){return snapshot().pointer;},get touch(){return snapshot().touch;}};
}
