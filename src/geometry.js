function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function canvasTex(w,h,draw,{srgb=true,repeat=null}={}){const c=mkCanvas(w,h);draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat)}return t}
function radialTex(stops,size=128){return canvasTex(size,size,(g,w)=>{const gr=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);stops.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,w)})}
const M=(o)=>new THREE.MeshStandardMaterial({fog:false,...o});       // interior
function mesh(geo,mat,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
function box(w,h,d,mat,x,y,z,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent)}
function rbox(w,h,d,r,mat,x,y,z,parent=scene){return mesh(new RoundedBoxGeometry(w,h,d,3,r),mat,x,y,z,parent)}
function cyl(rt,rb,h,mat,x,y,z,parent=scene,seg=20){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,x,y,z,parent)}
const SM=o=>new THREE.MeshStandardMaterial(o);
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const GLOW=radialTex([[0,'rgba(255,214,150,1)'],[.18,'rgba(255,180,100,.55)'],[.5,'rgba(255,150,70,.14)'],[1,'rgba(255,140,60,0)']],256);
const sprite=(tex,scale,color=0xffffff,opacity=1)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));s.scale.set(scale,scale,1);return s};
function clearGlazing({pane=false,amber=false,reflection=1}={}){
  return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,
    uniforms:{flatPane:{value:pane?1:0},amber:{value:amber?1:0},reflection:{value:reflection}},
    vertexShader:`varying vec2 tex;varying vec3 nView,vView;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);tex=uv;nView=normalMatrix*normal;vView=-mv.xyz;
        gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`#include <common>
uniform float flatPane,amber,reflection;varying vec2 tex;varying vec3 nView,vView;
      void main(){
        vec3 n=normalize(nView),v=normalize(vView);
        if(!gl_FrontFacing)n=-n;
        vec3 reflected=inverseTransformDirection(reflect(-v,n),viewMatrix);
        float rim=pow(1.-clamp(dot(v,n),0.,1.),3.);
        float edgeDistance=min(min(tex.x,1.-tex.x),min(tex.y,1.-tex.y));
        float edge=flatPane*(1.-smoothstep(.0,max(.009,1.3*fwidth(edgeDistance)),edgeDistance));
        float sky=exp(-pow(abs((reflected.y-.12-reflected.x*.24)*6.7),2.));
        float lamp=exp(-pow(abs((reflected.x+.43+reflected.y*.16)*15.),2.)-pow(abs((reflected.y-.02)*2.4),2.));
        float sheen=flatPane*exp(-pow(abs((tex.x+.24*tex.y+.11*reflected.x-.27)*11.),2.));
        vec3 tint=mix(vec3(.20,.38,.48),vec3(.57,.42,.24),amber);
        vec3 colour=tint+vec3(.17,.25,.32)*sky+vec3(.30,.48,.51)*(rim+edge)+vec3(.88,.58,.25)*lamp+vec3(.31,.40,.46)*sheen;
        gl_FragColor=vec4(colour,clamp(.018+.28*rim+.25*edge+reflection*(.019+.061*sky+.18*lamp+.105*sheen),0.,.73));
      }`
  });
}
function woodTex(base,dark,rep=[1,1],planks=6,vertical=false){return canvasTex(512,512,(c,w,h)=>{const r=rng(base.length*7+planks);
  for(let i=0;i<planks;i++){const k=r();const y0=i*h/planks;c.fillStyle=k<.5?base:dark;c.fillRect(0,y0,w,h/planks);
    for(let n=0;n<30;n++){c.strokeStyle=`rgba(20,10,4,${.04+r()*.1})`;c.lineWidth=1+r()*2;c.beginPath();const yy=y0+r()*h/planks;c.moveTo(0,yy);c.bezierCurveTo(w*.3,yy+r()*6-3,w*.6,yy+r()*6-3,w,yy+r()*4-2);c.stroke()}
    c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,y0,w,2)}
  if(vertical){const im=c.getImageData(0,0,w,h);const c2=mkCanvas(w,h).getContext('2d');c2.putImageData(im,0,0);c.save();c.clearRect(0,0,w,h);c.translate(w/2,h/2);c.rotate(Math.PI/2);c.drawImage(c2.canvas,-w/2,-h/2);c.restore()}},{repeat:rep})}
const flakeMats=[];
function flakes(S,n,box,sz,speed,drift=0,col=[1.05,1.08,1.15]){const pos=new Float32Array(n*3),rnd=new Float32Array(n*3),s=new Float32Array(n);const r=rng(11);
  for(let i=0;i<n;i++){pos.set([box[0]+r()*(box[1]-box[0]),r()*(box[3]-box[2])+box[2],box[4]+r()*(box[5]-box[4])],i*3);rnd.set([r(),r(),r()],i*3);s[i]=sz[0]+Math.pow(r(),2)*(sz[1]-sz[0])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aRand',new THREE.BufferAttribute(rnd,3));g.setAttribute('aSize',new THREE.BufferAttribute(s,1));
  const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uTime:{value:0},uPR:{value:PR*innerHeight/2},uH:{value:box[3]-box[2]},uY0:{value:box[2]},uSp:{value:speed},uDr:{value:drift},uX0:{value:box[0]},uW:{value:box[1]-box[0]}},transparent:true,depthWrite:false,
    vertexShader:`uniform float uT,uTime,uPR,uH,uY0,uSp,uDr,uX0,uW;attribute vec3 aRand;attribute float aSize;varying float vA;
      void main(){vec3 p=position;p.y=uY0+mod(p.y-uY0-uT*uSp*(.6+aRand.x*.7),uH);p.x=uX0+mod(p.x-uX0-uTime*uDr*(.85+aRand.z*.3),uW);
        p.x+=sin(uTime*(.35+aRand.y*.5)+aRand.z*6.28)*.45;p.z+=cos(uTime*(.3+aRand.x*.4)+aRand.y*6.28)*.3;
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*uPR/-mv.z;vA=.55+.45*aRand.y;vA*=smoothstep(.15,.9,-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.08,d);gl_FragColor=vec4(vec3(${col.join(',')}),a*vA*.95);}`});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;S.add(pts);flakeMats.push(m);return m}
