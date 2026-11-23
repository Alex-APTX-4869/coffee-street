const $ = id => document.getElementById(id);
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(52,1,.045,160);
const PR = Math.min(devicePixelRatio || 1,1.65);
const canvas=$('view'), placeButton=$('placeToggle'), soundButton=$('audioToggle'), stick=$('stick');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const touch=matchMedia('(pointer: coarse)');
let renderer,composer,cafe,street,ready=false,place='cafe',journey=null;
let yaw=0,pitch=0,clock=0,previous=0,doorOpen=0,soundStarted=false,guideTimer;
const held=new Set(),thumb=new THREE.Vector2();
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),point=V(),candidate=V();
const doorPoint=cafePoint(0,1.38,0),outside=cafePoint(.05,1.65,1.46);
const markers=[$('cupMark'),$('bookMark'),$('doorMark')];

function say(message){
  const guide=$('guide');clearTimeout(guideTimer);guide.textContent=message;guide.classList.add('shown');
  guideTimer=setTimeout(()=>guide.classList.remove('shown'),3600);
}
function setSoundLabel(){
  const on=soundStarted&&Snd.on;
  soundButton.classList.toggle('silent',!on);
  const label=on?'关闭声音':'开启音乐';
  soundButton.title=label;soundButton.setAttribute('aria-label',label);soundButton.setAttribute('aria-pressed',String(on));
}
function startAudio(){
  if(!ready)return;
  if(!soundStarted){soundStarted=true;Snd.setOn(true);setSoundLabel()}
  Snd.init();
}
function unlock(ev){if(ev.target!==soundButton&&!soundButton.contains(ev.target))startAudio()}
document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
soundButton.addEventListener('click',()=>{
  if(!soundStarted)startAudio();else{Snd.setOn(!Snd.on);Snd.init();setSoundLabel()}
});
$('poetryReader').addEventListener('poetrypaper',()=>Snd.turnPage());

function resize(){
  const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=w/h<.8?66:52;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);composer.setSize(w,h);
  flakeMats.forEach(m=>m.uniforms.uPR.value=PR*h/2);
}
function ui(){
  document.body.dataset.place=place;document.body.dataset.travelling=String(!!journey);
  placeButton.textContent=place==='cafe'?'去街上':'回咖啡店';
  placeButton.disabled=!ready||!!journey||poemReader.isOpen();
  stick.hidden=place!=='street'||!!journey||!(touch.matches||innerWidth<700);
}
let moveFinger=null,lookFinger=null;
function resetStick(){
  thumb.set(0,0);
  stick.firstElementChild.style.transform='';
  stick.style.removeProperty('--stick-left');stick.style.removeProperty('--stick-top');
}
function clearControls(){
  held.clear();moveFinger=lookFinger=null;resetStick();
}
function seatView(){
  camera.position.copy(cafe.seat);camera.lookAt(cafe.focus);
  camera.rotation.reorder('YXZ');yaw=camera.rotation.y;pitch=camera.rotation.x;
}
function pointMarker(el,p,visible){
  if(visible){
    point.copy(p).project(camera);visible=Math.abs(point.x)<.95&&Math.abs(point.y)<.93&&Math.abs(point.z)<=1;
    if(visible){el.style.left=(point.x+1)*innerWidth/2+'px';el.style.top=(1-point.y)*innerHeight/2+'px'}
  }
  el.hidden=!visible;
}
function updateMarkers(){
  camera.updateMatrixWorld();
  const active=ready&&!journey&&!cafe.browsing(),atTable=active&&place==='cafe'&&cafe.coffee.available();
  pointMarker(markers[0],cafe.coffee.mark,atTable);pointMarker(markers[1],cafe.bookMark,atTable);
  const atDoor=active&&(place==='cafe'||camera.position.distanceToSquared(doorPoint)<5.3**2);
  pointMarker(markers[2],doorPoint,atDoor);
}
function cup(){if(ready&&place==='cafe'&&!journey&&!cafe.browsing()&&cafe.coffee.available())cafe.coffee.start()}
function book(){if(ready&&place==='cafe'&&!journey&&!cafe.browsing())cafe.readBook()}
const markActions=[cup,book,travel];
markers.forEach((button,i)=>{
  // Pointer taps are resolved after the gesture. Keyboard/assistive clicks activate the button directly.
  button.onclick=e=>{if(e.detail===0)markActions[i]()};
});
placeButton.onclick=travel;

const pathPoints=()=>[cafe.seat.clone(),cafePoint(1.69,1.67,-1.77),cafePoint(.50,1.66,-1.68),
  cafePoint(.04,1.65,-.90),cafePoint(.03,1.65,.30),outside.clone()];
const shortest=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
function travel(){
  if(!ready||journey||poemReader.isOpen())return;
  startAudio();clearControls();
  const outbound=place==='cafe',stops=pathPoints(),far=!outbound&&camera.position.distanceToSquared(outside)>2.3**2;
  if(outbound)cafe.leave();
  else{stops.reverse();if(!far)stops[0]=camera.position.clone()}
  const rest=cafe.focus.clone().sub(cafe.seat),endYaw=outbound?-.16:Math.atan2(-rest.x,-rest.z);
  journey={outbound,far,elapsed:0,duration:reducedMotion.matches?.42:2.85,curve:new THREE.CatmullRomCurve3(stops),
    yaw0:far?Math.PI/2:yaw,yawEnd:endYaw,pitch0:far?-.06:pitch,pitchEnd:outbound?-.025:Math.atan2(rest.y,Math.hypot(rest.x,rest.z))};
  Snd.setPlace(outbound?'street':'cafe');ui();
}
function travelFrame(dt){
  const j=journey;j.elapsed+=dt;
  const dissolve=j.far||reducedMotion.matches,lead=j.far&&!reducedMotion.matches?.32:0;
  if(lead&&j.elapsed<lead){$('shade').style.opacity=String(sstep(0,lead,j.elapsed));return}
  const u=clamp((j.elapsed-lead)/j.duration),t=sstep(0,1,u);
  if(reducedMotion.matches){
    $('shade').style.opacity=String(Math.sin(Math.PI*u));
    if(u>=.50){camera.position.copy(j.curve.getPointAt(1));yaw=j.yawEnd;pitch=j.pitchEnd}
  }else{
    if(dissolve)$('shade').style.opacity=String(1-sstep(0,.24,u));
    j.curve.getPointAt(t,camera.position);
    const faceDoor=j.outbound?-2.30:Math.PI/2;
    const a=sstep(0,.44,u),b=sstep(.43,1,u);
    const mid=j.yaw0+shortest(j.yaw0,faceDoor)*a;
    yaw=mid+shortest(faceDoor,j.yawEnd)*b;
    pitch=lerp(j.pitch0,j.pitchEnd,t);
  }
  // The leaf swings towards the pavement and stays open until the viewer clears the threshold.
  doorOpen=j.outbound?sstep(.16,.58,u)*(1-sstep(.86,1,u)):sstep(0,.11,u)*(1-sstep(.50,.80,u));
  if(u<1)return;
  place=j.outbound?'street':'cafe';journey=null;doorOpen=0;$('shade').style.opacity='0';
  if(place==='cafe'){cafe.enter();seatView()}else{yaw=j.yawEnd;pitch=j.pitchEnd;say(stick.hidden&&!(touch.matches||innerWidth<700)?'WASD 或方向键移动 · 拖动环顾':'左下按住滑动行走 · 右侧滑动转向')}
  ui();
}

function isCrossing(z){return z>7.55&&z<10.45}
function allowed(x,z){
  if(x<3.82||x>18.83||Math.abs(z)>29.4)return false;
  const road=x>6.40&&x<15.63;
  if(road){
    if(!isCrossing(z))return false;
    if((camera.position.x<=6.40||camera.position.x>=15.63)&&!street.canCross())return false;
  }
  return !street.obstacles.some(o=>x>o.minX-.19&&x<o.maxX+.19&&z>o.minZ-.19&&z<o.maxZ+.19);
}
function walk(dt){
  const forward=(held.has('KeyW')||held.has('ArrowUp')?1:0)-(held.has('KeyS')||held.has('ArrowDown')?1:0)-thumb.y;
  const side=(held.has('KeyD')||held.has('ArrowRight')?1:0)-(held.has('KeyA')||held.has('ArrowLeft')?1:0)+thumb.x;
  const span=Math.hypot(forward,side);if(span<.02)return;
  const step=dt*2.65/Math.max(1,span);
  candidate.copy(camera.position);
  candidate.x+=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*step;
  candidate.z+=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*step;
  if(allowed(candidate.x,camera.position.z))camera.position.x=candidate.x;
  if(allowed(camera.position.x,candidate.z))camera.position.z=candidate.z;
}
window.addEventListener('keydown',e=>{
  if(!ready||journey||poemReader.isOpen()||e.altKey||e.metaKey||e.ctrlKey)return;
  if(place==='street'&&['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.code)){
    e.preventDefault();held.add(e.code);
  }else if(place==='cafe'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){
    e.preventDefault();yaw+=e.code==='ArrowLeft'?.09:e.code==='ArrowRight'?-.09:0;
    pitch=clamp(pitch+(e.code==='ArrowUp'?.07:e.code==='ArrowDown'?-.07:0),-.98,.92);
  }
});
window.addEventListener('keyup',e=>held.delete(e.code));
window.addEventListener('blur',clearControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearControls();previous=0});
window.addEventListener('resize',clearControls);

function steerStick(dx,dy){
  const radius=38,deadZone=5,length=Math.hypot(dx,dy);
  const visualScale=27/Math.max(radius,length);
  // A small push gives a gentle walking speed. The circular limit also normalizes diagonals.
  thumb.set(dx,dy).normalize().multiplyScalar(clamp((length-deadZone)/(radius-deadZone)));
  stick.firstElementChild.style.transform='translate('+(dx*visualScale)+'px,'+(dy*visualScale)+'px)';
}
function beginPointer(e){
  if(!ready||journey||poemReader.isOpen()||e.button!==0)return;
  const isTouch=e.pointerType==='touch';
  const movement=place==='street'&&(e.currentTarget===stick||(isTouch&&e.clientX<innerWidth*.5&&e.clientY>=innerHeight*.55));
  const owner=movement?moveFinger:lookFinger;
  if(owner){owner.tap=false;return}

  const finger={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,tap:true,started:e.timeStamp,isTouch,marker:markers.indexOf(e.currentTarget)};
  if(movement){
    moveFinger=finger;
    if(isTouch){
      stick.hidden=false;
      stick.style.setProperty('--stick-left',(finger.x-stick.offsetWidth/2)+'px');
      stick.style.setProperty('--stick-top',(finger.y-stick.offsetHeight/2)+'px');
    }else{
      const r=stick.getBoundingClientRect();finger.x=r.left+r.width/2;finger.y=r.top+r.height/2;
      steerStick(e.clientX-finger.x,e.clientY-finger.y);
    }
  }else lookFinger=finger;
  if(moveFinger&&lookFinger){moveFinger.tap=false;lookFinger.tap=false}
  // Window listeners still finish a contact if capture is unavailable or the original target is hidden.
  try{e.currentTarget.setPointerCapture?.(e.pointerId)}catch{}
}
for(const surface of [canvas,stick,...markers])surface.addEventListener('pointerdown',beginPointer);
window.addEventListener('pointermove',e=>{
  if(moveFinger?.id===e.pointerId){
    const dx=e.clientX-moveFinger.x,dy=e.clientY-moveFinger.y;
    if(Math.hypot(dx,dy)>4)moveFinger.tap=false;
    steerStick(dx,dy);return;
  }
  const finger=lookFinger;if(!finger||finger.id!==e.pointerId)return;
  const dx=e.clientX-finger.lastX,dy=e.clientY-finger.lastY;
  const distance=Math.hypot(e.clientX-finger.x,e.clientY-finger.y);
  if(finger.isTouch&&finger.tap&&distance<=3)return;
  if(distance>3)finger.tap=false;
  if(finger.isTouch){
    // A comfortable thumb stroke turns through a quarter circle in either phone orientation.
    const quarterTurn=clamp(Math.min(innerWidth,innerHeight)*.38,115,205);
    const gain=Math.PI/(2*quarterTurn);
    yaw-=dx*gain;pitch=clamp(pitch-dy*gain*.58,-.98,.92);
  }else{
    const gain=3.75/Math.max(innerWidth,innerHeight);
    yaw+=dx*gain;pitch=clamp(pitch+dy*gain*.82,-.98,.92);
  }
  finger.lastX=e.clientX;finger.lastY=e.clientY;
});
function endPointer(e){
  let finger;
  if(moveFinger?.id===e.pointerId){finger=moveFinger;moveFinger=null;resetStick()}
  else if(lookFinger?.id===e.pointerId){finger=lookFinger;lookFinger=null}
  if(!finger||e.type!=='pointerup'||!finger.tap||journey||cafe.browsing())return;
  if(finger.isTouch&&e.timeStamp-finger.started>420)return;
  if(finger.marker>=0){if(!markers[finger.marker].hidden)markActions[finger.marker]();return}
  ndc.set(2*e.clientX/innerWidth-1,1-2*e.clientY/innerHeight);ray.setFromCamera(ndc,camera);
  const objects=[cafe.doorHit];
  if(place==='cafe'&&cafe.coffee.available())objects.push(cafe.book,cafe.coffee.hit);
  const hit=ray.intersectObjects(objects,true)[0];if(!hit)return;
  if(hit.object===cafe.doorHit){if(place==='cafe'||hit.distance<5.3)travel();return}
  let o=hit.object;while(o&&o!==cafe.book&&o!==cafe.coffee.hit)o=o.parent;
  if(o===cafe.book)book();else if(o===cafe.coffee.hit)cup();
}
for(const event of ['pointerup','pointercancel','lostpointercapture'])window.addEventListener(event,endPointer);

function frame(ms){
  const dt=previous?Math.min(.10,(ms-previous)/1000):0;previous=ms;clock+=dt;
  if(journey)travelFrame(dt);else if(place==='street')walk(dt);
  camera.rotation.set(pitch,yaw,0,'YXZ');
  cafe.door.rotation.y=Math.PI/2-1.49*doorOpen;
  cafe.update(dt,clock);street.update(dt,clock,place==='street'||journey?camera.position:null);
  updateMarkers();composer.render();requestAnimationFrame(frame);
}
async function stage(n,label){
  $('loading').querySelector('progress').value=n;$('stage').textContent=label;
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
}
(async()=>{
  await stage(12,'正在准备咖啡店');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(PR);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  scene.background=new THREE.Color(0x26344c);
  cafe=makeCafe(scene);await stage(50,'正在布置雪街');
  street=makeCoffeeStreet(scene);
  composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.20,.45,1.05));composer.addPass(new OutputPass());
  resize();window.addEventListener('resize',resize);seatView();
  await stage(81,'正在点亮窗灯');for(const o of cafe.coffee.prewarm)o.visible=true;
  try{await renderer.compileAsync(scene,camera)}finally{for(const o of cafe.coffee.prewarm)o.visible=false}
  cafe.enter();street.update(0,0,null);composer.render();
  $('loading').hidden=true;ready=true;soundButton.disabled=false;setSoundLabel();ui();requestAnimationFrame(frame);
})().catch(err=>{console.error(err);$('stage').textContent='场景未能加载，请用支持 WebGL 2 的浏览器重新打开。';$('loading').querySelector('progress').hidden=true});
