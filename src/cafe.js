// Shop coordinates are measured from the street threshold: +x is the entrant's right, -z leads inside.
function cafePoint(x,y,z){return V(3.49+z,y,.20-x)}
function furnishBookCafe(S){
  const r=rng(41791),room=new THREE.Group();room.position.copy(cafePoint(0,0,0));room.rotation.y=Math.PI/2;S.add(room);
  const timber=SM({map:woodTex('#957050','#846044',[1,1],2),roughness:.62});
  const walnut=SM({map:woodTex('#70523e','#795741',[1,1],2),roughness:.58});
  const green=SM({color:0x324e46,roughness:.65}),cream=SM({color:0xd4c4a8,roughness:.94});
  const plaster=SM({color:0xb28c63,roughness:.95}),shelfWall=SM({color:0x714a31,roughness:.95});
  const oakDark=SM({color:0x49382e,roughness:.69}),iron=SM({color:0x353c38,roughness:.61,metalness:.32});
  const brass=SM({color:0xb28b54,roughness:.37,metalness:.47}),linen=SM({color:0xc7baa2,roughness:.96});
  const leather=SM({color:0x59675a,roughness:.65}),porcelain=SM({color:0xf2ead6,roughness:.32});
  const lamp=new THREE.MeshBasicMaterial({color:new THREE.Color(1.85,1.28,.69)});
  const block=(w,h,d,m,x,y,z,g=room)=>box(w,h,d,m,x,y,z,g);
  const rounded=(w,h,d,rad,m,x,y,z,g=room)=>rbox(w,h,d,rad,m,x,y,z,g);
  const column=(rt,rb,h,m,x,y,z,g=room,n=16)=>cyl(rt,rb,h,m,x,y,z,g,n);
  const group=(x,y,z,ry=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;room.add(g);return g};
  function rod(a,b,rad,m,g=room){
    const p=V(...a),v=V(...b).sub(p),o=column(rad,rad,v.length(),m,0,0,0,g,10);o.position.copy(p).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(V(0,1,0),v.normalize());return o;
  }
  function curved(points,rad,m,g=room){
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(12,points.length*3),rad,7,false),m,0,0,0,g);
  }
  function matLabel(text,back='#e3d0a9',ink='#55422f',italic=false){
    const map=canvasTex(320,64,(c,w,h)=>{c.fillStyle=back;c.fillRect(0,0,w,h);c.strokeStyle=ink;c.globalAlpha=.55;c.strokeRect(3.5,3.5,w-7,h-7);c.globalAlpha=1;
      c.fillStyle=ink;c.font=(italic?'italic ':'')+'29px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,w/2,h*.52,w-17)});
    return SM({map,roughness:.75,emissiveMap:map,emissive:0x775f47,emissiveIntensity:.16});
  }
  const floorMap=canvasTex(768,768,(c,w,h)=>{
    c.fillStyle='#6f5947';c.fillRect(0,0,w,h);
    for(let j=0;j<12;j++)for(let k=-1;k<5;k++){const x=k*194+(j%3)*61,y=j*64,t=r();
      c.fillStyle='rgb('+Math.floor(115+26*t)+','+Math.floor(84+20*t)+','+Math.floor(60+18*t)+')';c.fillRect(x+1,y+1,192,62);
      for(let n=0;n<26;n++){c.strokeStyle=n%3?'rgba(55,37,28,.12)':'rgba(235,198,147,.13)';const yy=y+r()*62;
        c.beginPath();c.moveTo(x,yy);c.bezierCurveTo(x+55,yy+r()*4,x+113,yy-3,x+191,yy+1);c.stroke()}}
  },{repeat:[4.4,1.45]});
  const half=6.60,depth=4.30;
  const floor=mesh(new THREE.PlaneGeometry(2*half,depth),SM({map:floorMap,bumpMap:floorMap,bumpScale:.016,roughness:.66}),0,.001,-depth/2,room);floor.rotation.x=-Math.PI/2;
  block(2*half+.14,.12,depth+.12,cream,0,3.24,-depth/2);
  block(2*half+.14,3.22,.14,shelfWall,0,1.61,-depth);
  function endWall(side,a,b){
    const x=side*half,z=(a+b)/2;
    block(.13,3.22,b-a,plaster,x,1.61,z);
    block(.17,.82,b-a,green,x-side*.014,.41,z);
    block(.21,.052,b-a,timber,x-side*.024,.84,z);
    block(.18,.105,b-a,walnut,x-side*.020,.057,z);
    for(let k=a+.26;k<b-.18;k+=.58)block(.034,.63,.027,walnut,x-side*.104,.43,k);
  }
  endWall(1,-depth,0);
  endWall(-1,-depth,0);
  for(const x of [-6.46,-4.46,-2.63,-.85,.85,2.63,4.46,6.46]){
    block(.102,.106,depth,green,x,3.143,-depth/2);
    block(.137,.026,depth,timber,x,3.079,-depth/2);
  }
  for(const z of [-.12,-4.15])block(2*half,.137,.135,green,0,3.124,z);

  // Five shelves run along the back wall with their spines facing the glazing.
  const faceAtlas=canvasTex(512,640,(c,w,h)=>{
    const colours=['#854832','#455c76','#616c49','#ad8953','#73516b','#c1b79b','#4e6865','#966045'];
    const titles=['KEATS','AUSTEN','LONDON','VERSE','ESSAYS','THE SEA','WOOLF','DICKENS','ORLANDO','ELIOT','A GARDEN','POEMS','ATLAS','RIVERS','NIGHT','TALES'];
    for(let row=0;row<4;row++)for(let col=0;col<8;col++){
      const x=col*64,y=row*160,id=row*8+col;c.fillStyle=colours[(col+row*3)%8];c.fillRect(x,y,64,160);
      const grad=c.createLinearGradient(x,0,x+64,0);grad.addColorStop(0,'rgba(10,10,10,.26)');grad.addColorStop(.28,'rgba(245,218,169,.12)');grad.addColorStop(1,'rgba(20,16,14,.20)');c.fillStyle=grad;c.fillRect(x,y,64,160);
      c.fillStyle=row%3===1?'#d3c6ab':'#c0a879';for(const yy of [11,15,137,142])c.fillRect(x+7,y+yy,50,row%2?1.3:2.2);
      c.save();c.translate(x+32,y+78);c.rotate(-Math.PI/2);c.font=(id%3?'bold ':'italic ')+'15px Georgia';c.textAlign='center';c.fillText(titles[(id*7)%titles.length],0,5,94);c.restore();
      if(id%3===0){c.strokeStyle='#c8ad79';c.strokeRect(x+8,y+24,48,107)}
    }
  });
  const coverColours=[0x854832,0x455c76,0x616c49,0xad8953,0x73516b,0xc1b79b,0x4e6865,0x966045];
  const books=[],spines=[],bookTiles=[],bookColours=[],obj=new THREE.Object3D(),stationery=SM({color:0xc6b494,roughness:.88});
  function volumes(cx,y,z,width,openGap=false){
    let x=cx-width/2+.016,stop=cx+width/2-.024,count=0;
    while(x<stop-.050){
      const thick=.026+r()*.042,height=.246+r()*.151,depth=.145+r()*.062;
      if(openGap&&x>cx-.10&&x<cx+.115){x=cx+.115;continue}
      const lean=(r()-.5)*.054,angle=Math.abs(lean)<.017?0:lean;
      obj.position.set(x+thick*.5,y+height*.5,z+.043*(r()-.5));obj.rotation.set(0,0,angle);obj.scale.set(thick,height,depth);obj.updateMatrix();books.push(obj.matrix.clone());
      const tile=Math.floor(r()*32);bookColours.push(new THREE.Color(coverColours[(tile%8+3*Math.floor(tile/8))%8]));
      obj.position.z+=depth*.5+.0013;obj.scale.set(thick*.97,height*.988,1);obj.updateMatrix();spines.push(obj.matrix.clone());bookTiles.push(tile%8,Math.floor(tile/8));
      x+=thick+(.002+r()*.002);if(++count>65)break;
    }
  }
  function bookStack(x,y,z,m,n,g=room){
    for(let i=0;i<n;i++){const b=new THREE.Group();b.position.set(x+.015*Math.sin(i*2),y+i*.041,z);b.rotation.y=.07*Math.sin(i*2.4);g.add(b);
      block(.24,.026,.154,stationery,0,.019,0,b);block(.254,.008,.162,m,0,.004,0,b);block(.254,.007,.162,m,0,.036,0,b);block(.252,.031,.012,m,0,.020,.078,b)}
  }
  const bayWidth=1.075;
  for(let i=0;i<12;i++){
    const cx=(i-5.5)*bayWidth,z=-4.055;
    block(bayWidth,.274,.32,walnut,cx,.137,z+.026);
    for(const dx of [-.265,.265])rounded(.477,.184,.028,.007,timber,cx+dx,.15,z+.198);
    if(i===0)block(.040,2.70,.35,walnut,cx-bayWidth/2,1.47,z+.020);
    block(.040,2.70,.35,walnut,cx+bayWidth/2,1.47,z+.02);
    block(bayWidth,.055,.38,walnut,cx,2.844,z+.024);
    for(let j=0;j<5;j++){
      const h=.324+.557*j;
      block(bayWidth,.043,.34,timber,cx,h,z+.019);block(bayWidth,.041,.034,walnut,cx,h-.009,z+.197);
      if(j===4&&i%2===0){bookStack(cx-.28,h+.022,z+.072,green,3);volumes(cx+.251,h+.022,z+.067,.43);}
      else volumes(cx,h+.022,z+.073,bayWidth-.064,(i+j)%4===2);
    }
    if(i%2===1)mesh(new THREE.PlaneGeometry(.32,.052),matLabel(['POETRY','ESSAYS','TRAVEL','LONDON','FICTION','ART'][Math.floor(i/2)]),cx,2.844,z+.219,room);
  }
  const closedBooks=new THREE.InstancedMesh(new THREE.BoxGeometry(),SM({roughness:.82}),books.length);
  const library=new THREE.Group();library.position.copy(room.position);library.rotation.copy(room.rotation);S.add(library);
  books.forEach((m,i)=>{closedBooks.setMatrixAt(i,m);closedBooks.setColorAt(i,bookColours[i])});library.add(closedBooks);
  const bookFaces=new THREE.PlaneGeometry(1,1);bookFaces.setAttribute('spineTile',new THREE.InstancedBufferAttribute(new Float32Array(bookTiles),2));
  const covers=SM({map:faceAtlas,roughness:.82});
  covers.onBeforeCompile=shader=>{shader.vertexShader='attribute vec2 spineTile;\n'+shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
    vMapUv=(vMapUv+vec2(spineTile.x,3.-spineTile.y))/vec2(8.,4.);`);};
  const rows=new THREE.InstancedMesh(bookFaces,covers,spines.length);spines.forEach((m,i)=>rows.setMatrixAt(i,m));library.add(rows);
  // The ladder hangs from a continuous brass runner and rests on two rubber-capped feet.
  rod([-6.30,2.77,-3.70],[6.30,2.77,-3.70],.025,brass);
  const ladder=group(-.92,.005,-3.19,-.038);
  for(const x of [-.197,.197]){
    rod([x,.024,0],[x,2.77,-.51],.025,timber,ladder);column(.031,.038,.038,iron,x,.020,0,ladder);
    const roller=column(.043,.043,.028,brass,x,2.76,-.505,ladder);roller.rotation.z=Math.PI/2;
  }
  for(let k=1;k<=9;k++){const y=.26*k;rod([-.196,y,-.184*y],[.196,y,-.184*y],.019,timber,ladder)}

  // The pastry counter has a stone top, an oak serving shelf and a small espresso back bar.
  const marble=canvasTex(256,160,(c,w,h)=>{c.fillStyle='#ddd4bd';c.fillRect(0,0,w,h);for(let i=0;i<17;i++){
    const y=r()*h;c.strokeStyle='rgba(103,99,85,'+(.06+r()*.12)+')';c.lineWidth=.5+r()*1.4;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(76,y-19,182,y+29,w,y-7);c.stroke()}});
  const stone=SM({map:marble,roughness:.36}),chrome=SM({color:0xb4b1a0,roughness:.25,metalness:.62});
  const counter=group(3.0,0,-.24);
  rounded(2.19,.81,.62,.030,walnut,1.89,.47,-2.74,counter);
  rounded(2.29,.066,.73,.021,stone,1.89,.90,-2.73,counter);
  block(2.07,.055,.05,walnut,1.89,.13,-2.41,counter);block(2.15,.046,.047,brass,1.89,.801,-2.414,counter);
  for(let i=0;i<3;i++){const x=1.21+i*.68;block(.58,.49,.037,walnut,x,.489,-2.417,counter);block(.514,.427,.025,oakDark,x,.489,-2.39,counter)}
  rounded(.67,.38,.35,.047,chrome,1.56,1.13,-2.83,counter);rounded(.72,.034,.39,.012,chrome,1.56,.955,-2.82,counter);
  block(.64,.08,.055,chrome,1.56,1.19,-2.627,counter);
  for(const x of [1.43,1.68]){column(.044,.045,.054,brass,x,1.116,-2.595,counter);rod([x,1.10,-2.595],[x+.068,1.11,-2.51],.012,iron,counter)}
  const gauge=column(.043,.043,.017,porcelain,1.56,1.262,-2.642,counter,24);gauge.rotation.x=Math.PI/2;
  rod([1.56,1.262,-2.627],[1.581,1.278,-2.626],.0025,iron,counter);
  for(const x of [1.36,1.54,1.73])column(.052,.047,.059,porcelain,x,1.35,-2.82,counter);
  const crumb=SM({color:0xbc8954,roughness:.91}),jam=SM({color:0x793e46,roughness:.84});
  column(.204,.18,.022,porcelain,2.35,.953,-2.73,counter,40);column(.126,.126,.066,crumb,2.35,.995,-2.73,counter,36);
  column(.124,.124,.012,jam,2.35,1.031,-2.73,counter,36);column(.127,.127,.045,crumb,2.35,1.06,-2.73,counter,36);
  column(.126,.123,.015,porcelain,2.35,1.091,-2.73,counter,36);
  const clocheGlass=clearGlazing({pane:false});clocheGlass.side=THREE.FrontSide;
  mesh(new THREE.SphereGeometry(.182,32,16,0,Math.PI*2,0,Math.PI*.5),clocheGlass,2.35,.967,-2.73,counter);
  column(.021,.027,.026,brass,2.35,1.156,-2.73,counter,16);

  // The street entrance and both display windows share one frontage.
  const glazing=clearGlazing({pane:true,reflection:.44});glazing.side=THREE.DoubleSide;
  const pane=(x,y,w,h,z=.006)=>{
    const glass=mesh(new THREE.PlaneGeometry(w,h),glazing,x,y,z,room);glass.rotation.y=Math.PI;return glass;
  };
  block(13.35,.30,.20,green,0,3.04,-.006);
  for(const side of [-1,1]){
    const x=side*3.72;
    block(5.54,.49,.17,green,x,.245,-.006);
    block(5.60,.074,.235,timber,x,.508,-.050);
    for(const y of [.56,2.50,2.92])block(5.62,.050,.113,green,x,y,-.023);
    for(const edge of [.84,2.78,4.60,6.59]){
      const w=edge===.84||edge===6.59?.138:.054;
      block(w,2.95,.146,green,side*edge,1.485,-.016);
      block(w*.48,2.89,.025,timber,side*edge,1.48,-.100);
    }
    for(const [a,b] of [[.922,2.754],[2.807,4.573],[4.628,6.516]]){
      pane(side*(a+b)/2,1.532,b-a,1.886);pane(side*(a+b)/2,2.711,b-a,.360);
    }
  }
  const leafStart=room.children.length;
  // Painted timber stiles, a low raised panel, clear glass and a brass pull distinguish the street door.
  for(const side of [-1,1]){
    block(.080,2.89,.089,green,side*.722,1.46,-.019);
    block(.018,2.76,.025,brass,side*.670,1.46,-.072);
  }
  block(1.38,.47,.095,green,0,.263,-.021);
  block(1.16,.285,.040,timber,0,.267,-.077);
  block(1.49,.053,.12,green,0,.51,-.021);
  block(1.49,.066,.12,green,0,2.47,-.021);block(1.49,.080,.12,green,0,2.921,-.021);
  pane(0,1.49,1.36,1.895,-.002);pane(0,2.70,1.36,.365,-.002);
  for(const h of [1.02,1.31])rod([.622,h,-.048],[.622,h,-.115],.014,brass);
  rod([.622,.985,-.117],[.622,1.345,-.117],.017,brass);
  const doorPlate=mesh(new THREE.PlaneGeometry(.285,.117),matLabel('PUSH','#31463e','#d4bb82'),.43,1.43,-.078,room);doorPlate.rotation.y=Math.PI;
  mesh(new THREE.PlaneGeometry(.29,.12),matLabel('PULL','#31463e','#d4bb82'),.43,1.43,.054,room);
  const doorParts=room.children.slice(leafStart),door=group(-.765,0,-.019);
  S.attach(door);for(const piece of doorParts)door.attach(piece);
  const doorHit=box(1.47,2.88,.105,new THREE.MeshBasicMaterial({visible:false}),.765,1.45,0,door);
  block(1.52,.022,.24,brass,0,.018,-.011);
  function chair(x,z,yaw){
    const g=group(x,0,z,yaw);rounded(.402,.058,.416,.042,timber,0,.466,0,g);
    for(const dx of [-.145,.145])for(const dz of [-.137,.137])rod([dx*1.19,.008,dz*1.26],[dx,.454,dz],.020,walnut,g);
    for(const side of [-1,1])rod([side*.163,.203,-.146],[side*.163,.203,.146],.011,walnut,g);
    curved([[-.18,.477,.143],[-.205,.773,.175],[-.167,.932,.174],[0,.975,.172],[.167,.932,.174],[.205,.773,.175],[.18,.477,.143]],.020,walnut,g);
    for(const dx of [-.11,-.055,0,.055,.11])rod([dx,.49,.152],[dx*1.21,.928-Math.abs(dx)*.19,.176],.0085,timber,g);
  }
  function bistro(x,z,width,depth,top,round=false){
    const g=group(x,0,z);
    if(round){column(width/2,width/2,.046,timber,0,top-.023,0,g,40);column(width/2-.024,width/2-.035,.029,walnut,0,top-.060,0,g,40)}
    else{rounded(width,.054,depth,.032,timber,0,top-.027,0,g);rounded(width-.065,.038,depth-.062,.017,walnut,0,top-.069,0,g)}
    column(.077,.082,top-.19,iron,0,(top-.19)*.5+.087,0,g,24);
    for(const y of [.095,.168,top-.15])column(.10,.093,.029,brass,0,y,0,g,24);
    for(let j=0;j<4;j++){const a=j*Math.PI*.5+Math.PI*.25,dx=Math.cos(a),dz=Math.sin(a);
      curved([[0,.19,0],[dx*.133,.089,dz*.133],[dx*.265,.060,dz*.265],[dx*.301,.024,dz*.301]],.026,iron,g)}
    return g;
  }
  const tables=[[-2.12,-1.34],[-4.88,-1.20],[-3.52,-2.72]];
  tables.forEach(([x,z],i)=>{
    bistro(x,z,.85,.85,.75,true);
    chair(x-.60,z+.12,-Math.PI*.43);chair(x+.62,z-.10,Math.PI*.55);
    if(i<2){
      column(.079,.074,.010,porcelain,x-.075,.755,z+.07,room,24);
      column(.051,.039,.069,porcelain,x-.075,.792,z+.07,room,24);
    }
  });
  bookStack(-3.50,.75,-2.75,green,2);
  // One uninterrupted oak ledge belongs to all five window seats.
  const barStart=.99,barEnd=6.38,barX=(barStart+barEnd)/2,barWidth=barEnd-barStart;
  const barGrain=SM({map:woodTex('#a7815c','#805c40',[2.2,1],3),roughness:.55});
  rounded(barWidth,.067,.756,.023,barGrain,barX,.9865,-.49);
  block(barWidth-.045,.085,.065,walnut,barX,.928,-.817);
  block(barWidth-.072,.012,.015,brass,barX,.940,-.856);
  for(const x of [1.17,3.61,6.17]){
    for(const z of [-.20,-.77]){block(.072,.925,.071,walnut,x,.47,z);column(.052,.052,.039,brass,x,.026,z,room,16)}
    block(.078,.103,.66,timber,x,.895,-.485);
  }
  for(const x of [1.20,3.61,6.15])rod([x,.256,-.77],[x,.231,-.945],.018,brass);
  rod([1.17,.231,-.945],[6.19,.231,-.945],.021,brass);
  const seatProfile=[[.001,.003],[.183,.003],[.205,.014],[.212,.032],[.208,.052],[.184,.060],[.090,.052],[.001,.049]];
  function highStool(x){
    const g=group(x,0,-1.25);
    mesh(new THREE.LatheGeometry(seatProfile.map(([rad,y])=>new THREE.Vector2(rad,y)),40),walnut,0,.665,0,g);
    for(const sx of [-1,1])for(const sz of [-1,1])rod([sx*.172,.012,sz*.172],[sx*.113,.676,sz*.113],.022,timber,g);
    const ring=mesh(new THREE.TorusGeometry(.20,.011,8,36),brass,0,.272,0,g);ring.rotation.x=Math.PI/2;
  }
  for(const x of [1.93,2.91,3.89,4.87,5.85])highStool(x);
  bookStack(5.56,1.020,-.373,green,2);
  // A framed London print on the end wall beside the round tables.
  const print=canvasTex(512,298,(c,w,h)=>{
    c.fillStyle='#c3b59a';c.fillRect(0,0,w,h);const horizon=167;
    for(let i=0;i<105;i++){const x=i*5.22-9,hh=21+16*r();c.fillStyle=i%4?'#858076':'#767570';c.fillRect(x,horizon-hh,7,hh);if(i%7===0)c.fillRect(x+2,horizon-hh-12,2,13)}
    c.fillStyle='#6e706c';c.fillRect(78,69,14,98);c.fillRect(81,60,8,12);c.beginPath();c.moveTo(81,61);c.lineTo(85,40);c.lineTo(90,61);c.fill();
    c.fillStyle='#73736a';c.fillRect(0,164,w,8);for(let k=0;k<8;k++){c.strokeStyle='#73736a';c.lineWidth=6;c.beginPath();c.ellipse(k*73,189,37,16,0,Math.PI,2*Math.PI);c.stroke()}
    for(let i=0;i<640;i++){const x=r()*w,y=190+r()*90;c.strokeStyle=i%2?'#9d998a':'#b5a891';c.lineWidth=.75;c.beginPath();c.moveTo(x,y);c.lineTo(x+3+r()*19,y+r());c.stroke()}
    c.fillStyle='#514f49';c.font='italic 11px Georgia';c.textAlign='center';c.fillText('Westminster, from the river',w/2,286);
  });
  const mount=group(-6.49,1.70,-1.02,Math.PI/2);
  block(1.41,.84,.061,walnut,0,0,0,mount);
  mesh(new THREE.PlaneGeometry(1.31,.748),SM({map:print,roughness:.85}),0,0,.034,mount);
  for(const x of [-.666,.666])block(.016,.77,.024,brass,x,0,.042,mount);
  for(const y of [-.386,.386])block(1.350,.016,.024,brass,0,y,.042,mount);

  // The four enamel cones and their exposed warm bulbs repeat the row visible from the street.
  const enamel=SM({color:0x1f443a,metalness:.32,roughness:.36,side:THREE.DoubleSide});
  function pendant(x,z){
    const y=2.22,hang=3.13-y-.17;
    column(.060,.068,.031,brass,x,3.131,z);column(.008,.008,hang,iron,x,3.13-hang*.5,z,room,10);
    column(.039,.069,.067,brass,x,y+.143,z);
    mesh(new THREE.CylinderGeometry(.069,.242,.199,40,1,true),enamel,x,y+.012,z,room);
    const lip=mesh(new THREE.TorusGeometry(.241,.008,7,40),brass,x,y-.088,z,room);lip.rotation.x=Math.PI/2;
    const inner=mesh(new THREE.CircleGeometry(.231,40),porcelain,x,y-.083,z,room);inner.rotation.x=Math.PI/2;
    const bulb=mesh(new THREE.SphereGeometry(.067,20,12),lamp,x,y-.105,z,room);bulb.scale.y=.80;
  }
  for(const x of [-4.6,-1.6,1.6,4.6])pendant(x,-1.64);
  const lighting=[
    [0xffd4a4,10,7,-4.6,2.21,-1.64],[0xffd19b,9,7,-1.6,2.21,-1.64],
    [0xffdcbc,11,7,1.6,2.21,-1.64],[0xffd1a4,10,7,4.6,2.21,-1.64],
    [0xa9c6db,2.9,6,3.02,2.48,-.12]
  ];
  for(const [colour,power,reach,x,y,z] of lighting){const light=new THREE.PointLight(colour,power,reach,2);light.position.copy(cafePoint(x,y,z));S.add(light)}
  S.add(new THREE.HemisphereLight(0xffe2be,0x888491,.76));
  const evening=new THREE.DirectionalLight(0xaec8e5,.43);evening.position.set(6,8,4);S.add(evening);
  // Compile the stationary architecture once per finish. Blended glazing stays separate for sorting.
  room.updateWorldMatrix(true,true);
  const batches=new Map(),geometries=new Set(),loose=[];
  room.traverse(o=>{
    if(!o.isMesh)return;
    if(o.material.transparent){loose.push(o);return}
    const source=o.geometry,baked=source.index?source.toNonIndexed():source.clone();baked.applyMatrix4(o.matrixWorld);
    if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(baked);geometries.add(source);
  });
  loose.forEach(o=>S.attach(o));S.remove(room);
  for(const [finish,parts] of batches){const geo=mergeGeometries(parts,false);geo.computeBoundingSphere();S.add(new THREE.Mesh(geo,finish));for(const p of parts)p.dispose()}
  for(const original of geometries)original.dispose();
  return {door,doorHit};
}
function buildCafeCup(S,origin){
  // An open porcelain vessel, with the drink carried separately from the resting saucer.
  const cup=new THREE.Group(),saucer=new THREE.Group();
  S.add(cup,saucer);saucer.position.copy(origin);
  const glaze=M({color:0x315b57,roughness:.22}),ivory=M({color:0xf2e3c9,roughness:.25}),
    brass=M({color:0xc7a367,metalness:.52,roughness:.32}),ebony=M({color:0x52372d,roughness:.43});
  function turned(profile,material,parent){
    return mesh(new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),64),material,0,0,0,parent);
  }
  function band(parent,r,y,thickness,material){
    const b=mesh(new THREE.TorusGeometry(r,thickness,8,64),material,0,y,0,parent);b.rotation.x=Math.PI/2;
  }
  turned([[.001,.004],[.067,.004],[.075,.009],[.119,.013],[.135,.021],[.139,.026],[.138,.030],
    [.132,.032],[.119,.028],[.091,.020],[.067,.015],[.052,.013],[.001,.013]],ivory,saucer);
  band(saucer,.132,.0305,.0011,brass);
  turned([[.001,0],[.048,0],[.051,.005],[.052,.014],[.055,.022],[.064,.038],[.073,.065],
    [.082,.097],[.085,.119],[.085,.126],[.082,.129]],glaze,cup);
  turned([[.082,.129],[.079,.127],[.078,.120],[.077,.109],[.074,.095],[.067,.070],[.060,.045],
    [.053,.026],[.046,.020],[.035,.017],[.001,.017]],ivory,cup);
  band(cup,.084,.125,.00165,brass);band(cup,.052,.009,.00105,brass);
  const handlePath=new THREE.CatmullRomCurve3([
    V(.079,.109,0),V(.106,.116,0),V(.128,.106,0),V(.133,.088,0),
    V(.124,.068,0),V(.105,.047,0),V(.082,.041,0),V(.066,.054,0)]);
  mesh(new THREE.TubeGeometry(handlePath,30,.0085,10,false),glaze,0,0,0,cup);

  const crema=canvasTex(384,384,(g,w)=>{
    const noise=rng(118),wash=g.createRadialGradient(w*.40,w*.40,w*.03,w*.50,w*.50,w*.50);
    wash.addColorStop(0,'#b47545');wash.addColorStop(.59,'#b47c51');wash.addColorStop(.88,'#be8e5d');
    wash.addColorStop(.95,'#d7aa71');wash.addColorStop(1,'#96633d');g.fillStyle=wash;g.fillRect(0,0,w,w);
    for(let i=0;i<1250;i++){const x=noise()*w,y=noise()*w;g.fillStyle=noise()>.55?'rgba(254,217,158,.28)':'rgba(106,59,34,.14)';
      g.beginPath();g.arc(x,y,.3+noise()*1.05,0,Math.PI*2);g.fill()}
    // Paired, swept lobes form the barista's fern. A fine pull finishes its central stem.
    g.translate(w*.50,w*.51);g.rotate(-.27);g.scale(w/384,w/384);
    for(let i=0;i<9;i++){
      const y=59-i*15,span=13+64*Math.sin((i+1)*Math.PI/10);
      for(const k of [-1,1]){
        g.fillStyle=i%3===0?'#eee0bd':'#f1e2c3';g.beginPath();g.moveTo(0,y+7);
        g.bezierCurveTo(k*span*.35,y+11,k*span*.88,y+2,k*span,y-13);
        g.bezierCurveTo(k*span*.69,y-3,k*span*.34,y-8,0,y+3);g.closePath();g.fill();
      }
    }
    g.strokeStyle='#f0dfbc';g.lineWidth=3.1;g.lineCap='round';g.beginPath();g.moveTo(-2,-82);g.quadraticCurveTo(-4,11,4,87);g.stroke();
  });
  const ringCount=64,coffeeGeo=new THREE.BufferGeometry(),xyz=new Float32Array((ringCount+1)*3),uv=[.5,.5],tri=[],circle=[];
  for(let i=0;i<ringCount;i++){
    const a=2*Math.PI*i/ringCount,x=Math.cos(a),z=Math.sin(a);circle.push([x,z]);
    uv.push(.5+x*.5,.5-z*.5);tri.push(0,1+(i+1)%ringCount,1+i);
  }
  coffeeGeo.setAttribute('position',new THREE.BufferAttribute(xyz,3).setUsage(THREE.DynamicDrawUsage));
  coffeeGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));coffeeGeo.setIndex(tri);
  const coffee=mesh(coffeeGeo,M({map:crema,roughness:.29}),0,0,0,cup);
  // The surface stays level in the tilted cup, with its boundary following the inner wall.
  let oldLevel=-1,oldTilt=-1;
  function surface(level,tilt){
    if(Math.abs(level-oldLevel)<.00005&&Math.abs(tilt-oldTilt)<.0005)return;
    oldLevel=level;oldTilt=tilt;const slope=Math.tan(tilt),base=Math.min(level,.123-.078*slope);
    xyz[1]=base;
    for(let i=0;i<ringCount;i++){
      const [x,z]=circle[i],r=(.0463+.283*base)/(1-.283*z*slope);
      xyz[3*i+3]=x*r;xyz[3*i+4]=base+z*r*slope;xyz[3*i+5]=z*r;
    }
    coffeeGeo.attributes.position.needsUpdate=true;coffeeGeo.computeVertexNormals();coffeeGeo.computeBoundingSphere();
  }

  // Three very thin, translucent columns curl over the surface rather than following the cup's tilt.
  const ribbon=[],ribbonIndices=[];
  for(let k=0;k<3;k++)for(let j=0;j<=18;j++){
    const u=j/18,at=ribbon.length/3;ribbon.push(-1,u,k,1,u,k);
    if(j>0)ribbonIndices.push(at-2,at-1,at,at,at-1,at+1);
  }
  const steamGeo=new THREE.BufferGeometry();steamGeo.setAttribute('position',new THREE.Float32BufferAttribute(ribbon,3));steamGeo.setIndex(ribbonIndices);
  const vapor=mesh(steamGeo,new THREE.ShaderMaterial({uniforms:{t:{value:0},strength:{value:1}},
    vertexShader:`uniform float t;varying float side,amount;void main(){
      float u=position.y,id=position.z,k=id*2.14;side=position.x;
      float rise=u*(.14+.024*sin(k+1.));float spread=.003+.009*u;
      vec3 p=vec3((id-1.)*.014+(.005+.011*u)*sin(u*6.1-t*1.5+k)+side*spread,rise,.006*cos(u*5.2-t+k));
      amount=sin(3.14159*u)*(.67+.26*sin(t*1.12+k+u*3.));
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float strength;varying float side,amount;void main(){gl_FragColor=vec4(.85,.81,.72,.20*amount*(1.-side*side)*strength);}`,
    transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,0,0,S);
  vapor.frustumCulled=false;

  const wand=new THREE.Group();S.add(wand);
  turned([[.003,0],[.007,.003],[.009,.014],[.007,.034],[.011,.058],[.009,.075],
    [.006,.088],[.004,.157],[.002,.238],[.0009,.252]],ebony,wand);
  for(const [r,y] of [[.008,.016],[.0102,.055],[.007,.079]])band(wand,r,y,.00135,brass);
  const spark=sprite(GLOW,.032,0xffdc9a,.40);spark.position.y=.253;wand.add(spark);
  const home=origin.clone().add(V(0,.015,0)),restQ=new THREE.Quaternion().setFromAxisAngle(V(0,1,0),-.19),
    endQ=new THREE.Quaternion(),rotation=new THREE.Euler(0,0,0,'YXZ'),
    target=V(0,0,0),look=V(0,0,0),aim=V(0,0,0),up=V(0,1,0),
    handle=origin.clone().add(V(.19,.65,-.31)),mark=home.clone().add(V(.061,.15,.007));
  const full=.106,bottom=.032;
  let clock=-1,level=full,fromLevel=full,nextLevel=full,refill=false,swallowed=false,voice=null;
  function reset(){
    if(voice){const now=voice.src.context.currentTime;voice.gain.gain.setTargetAtTime(0,now,.017);voice.src.stop(now+.07);voice=null}
    clock=-1;level=fromLevel=nextLevel=full;refill=swallowed=false;cup.position.copy(home);cup.quaternion.copy(restQ);
    surface(level,0);wand.visible=false;vapor.material.uniforms.strength.value=1;vapor.position.copy(home);vapor.position.y+=level}
  function start(){
    if(clock>=0)return;
    refill=level<=bottom+.001;fromLevel=level;nextLevel=Math.max(bottom,(refill?full:level)-.0215);clock=0;swallowed=false;wand.visible=true;
  }
  function update(dt,t){
    let amount=0,tilt=0;
    if(clock>=0){
      clock+=dt;const hold=refill?.78:.20,age=clock-hold;
      const fly=sstep(0,1.58,age)*(1-sstep(2.98,4.45,age));amount=sstep(1.56,2.31,age)*(1-sstep(2.60,3.03,age));
      const startLevel=refill?lerp(fromLevel,full,sstep(.05,.72,clock)):fromLevel;
      level=lerp(startLevel,nextLevel,sstep(1.82,2.59,age));tilt=(.46+.13*(1-startLevel/full))*amount;
      camera.updateMatrixWorld();camera.getWorldDirection(look);
      target.set(.015,-.158-.013*amount,-.365+.145*amount);camera.localToWorld(target);
      cup.position.lerpVectors(home,target,fly);cup.position.y+=Math.sin(Math.PI*fly)*.105;
      endQ.setFromEuler(rotation.set(tilt,Math.atan2(-look.x,-look.z),0,'YXZ'));cup.quaternion.slerpQuaternions(restQ,endQ,fly);
      if(!swallowed&&age>=2.18){
        swallowed=true;
        if(!journey&&place==='cafe'){
          voice=Snd.sipCoffee();
          if(voice){const playing=voice;playing.src.addEventListener('ended',()=>{if(voice===playing)voice=null},{once:true})}
        }
      }
      // The tip follows the body of the cup throughout the lift, sip and landing.
      aim.set(0,.075,0);cup.localToWorld(aim);
      wand.position.copy(handle);wand.position.x+=.032*Math.sin(clock*2.2);wand.position.y+=.027*Math.cos(clock*2.7);
      wand.quaternion.setFromUnitVectors(up,aim.sub(wand.position).normalize());
      wand.scale.setScalar(sstep(0,.31,clock)*(1-sstep(4.28,4.73,age)));
      if(age>=4.73){clock=-1;level=nextLevel;wand.visible=false;cup.position.copy(home);cup.quaternion.copy(restQ)}
    }
    surface(level,tilt);vapor.position.set(0,Math.min(level,.123-.078*Math.tan(tilt))+.005,0);cup.localToWorld(vapor.position);
    vapor.material.uniforms.t.value=t;vapor.material.uniforms.strength.value=(.67+.33*(level/full))*(1-.86*amount);
  }
  reset();
  return{mark,hit:cup,available:()=>clock<0,start,update,reset,prewarm:[wand]};
}
function makeCafe(S){
  const {door,doorHit}=furnishBookCafe(S);
  const seat=cafePoint(1.93,1.63,-1.35),focus=cafePoint(1.826,1.365,-.35);
  const coffee=buildCafeCup(S,cafePoint(1.66,1.020,-.31)),book=new THREE.Group();S.add(book);
  book.position.copy(cafePoint(1.975,1.021,-.32));book.rotation.y=-Math.PI/2+.09;
  const board=SM({color:0x34483e,roughness:.91}),paper=SM({color:0xe0ccb1,roughness:1});
  rbox(.252,.007,.337,.003,board,0,.004,0,book);rbox(.245,.024,.325,.003,paper,.001,.018,0,book);
  const hinge=new THREE.Group();hinge.position.set(-.124,.034,0);book.add(hinge);
  rbox(.252,.007,.337,.003,board,.124,0,0,hinge);rbox(.014,.035,.336,.005,board,-.123,.019,0,book);
  const cover=canvasTex(384,512,(c,w,h)=>{
    c.fillStyle='#364d42';c.fillRect(0,0,w,h);const seed=rng(77);
    for(let i=0;i<5000;i++){c.fillStyle=i%2?'#69755a35':'#152d293d';c.fillRect(seed()*w,seed()*h,1,1+seed()*3)}
    c.strokeStyle='#bcab7d';c.lineWidth=1.4;c.strokeRect(31,27,w-57,h-55);
    c.fillStyle='#e2c891';c.textAlign='center';c.font='500 48px "Songti SC",serif';c.fillText('顾城诗选',w/2,185);
    c.font='15px Georgia,serif';c.fillText('G U   C H E N G',w/2,228);
    c.beginPath();c.moveTo(91,386);c.bezierCurveTo(137,341,172,310,266,286);c.moveTo(161,328);c.quadraticCurveTo(170,300,197,284);c.moveTo(189,314);c.quadraticCurveTo(224,323,248,311);c.stroke();
  });
  const label=mesh(new THREE.PlaneGeometry(.249,.333),SM({map:cover,roughness:.9}),.124,.0038,0,hinge);label.rotation.x=-Math.PI/2;
  for(let i=0;i<5;i++)box(.239,.0006,.0007,SM({color:i%2?0xbfae90:0xcab79a}),.002,.010+i*.0031,.163,book);
  box(.017,.0018,.048,SM({color:0x926c39}),.063,.020,.173,book);
  const bookMark=book.localToWorld(V(.01,.057,.031));
  let opening=false,opened=0;
  function readBook(){if(place==='cafe'&&!journey&&!opening&&opened<.01&&coffee.available())opening=true}
  return {seat,focus,door,doorHit,
    coffee,book,bookMark,readBook,browsing:()=>opening||opened>.01||poemReader.isOpen(),
    enter(){opening=false;opened=0;hinge.rotation.z=0;coffee.reset()},
    leave(){opening=false;opened=0;hinge.rotation.z=0;coffee.reset();poemReader.close()},
    update(dt,t){coffee.update(dt,t);
      if(opening||opened>0){
        const step=matchMedia('(prefers-reduced-motion: reduce)').matches?1:dt/.55;
        opened=clamp(opened+(opening||poemReader.isOpen()?step:-step));hinge.rotation.z=ease(opened)*2.91;
        if(opening&&opened===1){opening=false;poemReader.open()}
      }
    }};
}
