function makeCoffeeStreet(S){
  const axis=new THREE.Group(),fixed=new THREE.Group(),r=rng(74261);
  axis.position.set(3.49,0,.20);axis.rotation.y=Math.PI/2;axis.add(fixed);S.add(axis);
  const v3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  const material=(color,roughness=.78,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
  const iron=material(0x242c30,.55,{metalness:.38}),green=material(0x233e35,.48),gilt=material(0xb49866,.36,{metalness:.48});
  const snow=material(0xdbe1e9,.89),stone=material(0xb0a497,.88),slate=material(0x414a56,.82),darkWood=material(0x4a352c,.67);
  const sashPaint=material(0xbeb7a6,.65),brown=material(0x846348,.74),red=material(0x883527,.48),roadLevel=-.135,edgeA=3.05,edgeB=12.0,farSide=15.60;
  function group(x,y,z,turn=0,parent=fixed){const o=new THREE.Group();o.position.set(x,y,z);o.rotation.y=turn;parent.add(o);return o}
  const block=(w,h,d,m,x,y,z,parent=fixed)=>box(w,h,d,m,x,y,z,parent);
  const post=(rt,rb,h,m,x,y,z,parent=fixed,n=14)=>cyl(rt,rb,h,m,x,y,z,parent,n);
  function line(a,b,thick,mat,parent=fixed,tip=thick){const p=v3(...a),d=v3(...b).sub(p);
    const stem=post(tip,thick,d.length(),mat,0,0,0,parent,7);stem.position.copy(p).addScaledVector(d,.5);stem.quaternion.setFromUnitVectors(v3(0,1,0),d.normalize());return stem}
  function oval(x,y,z,sx,sy,sz,mat,parent=fixed){
    const fine=Math.max(sx,sy,sz)>.30&&sy>.08,small=sy<.07||Math.max(sx,sy,sz)<.15;
    const o=mesh(new THREE.SphereGeometry(1,fine?16:small?9:12,fine?10:small?6:8),mat,x,y,z,parent);o.scale.set(sx,sy,sz);return o
  }
  function label(text,w,h,bg,fg,font='500 85px Georgia,serif'){
    const cw=Math.max(384,Math.min(2048,Math.round(128*w/h))),ch=Math.min(144,Math.max(65,Math.round(cw*h/w)));
    const map=canvasTex(cw,ch,(c,pw,ph)=>{c.fillStyle=bg;c.fillRect(0,0,pw,ph);c.strokeStyle=fg;c.lineWidth=Math.max(1,ph*.015);c.strokeRect(7,ph*.059,pw-14,ph*.882);
      c.fillStyle=fg;c.textAlign='center';c.textBaseline='middle';c.font=font.replace(/(\d+)px/,(_,n)=>Math.round(Number(n)*ph/144)+'px');
      if(w>10){c.letterSpacing=(ph*.226)+'px'}c.fillText(text,pw/2,ph*.53,pw-32)});
    return {geo:new THREE.PlaneGeometry(w,h),mat:material(0xffffff,.60,{map,emissiveMap:map,emissive:0x827862,emissiveIntensity:.37})}
  }
  function sign(text,w,h,x,y,z,parent,bg='#233b32',fg='#d9c598',font){
    const q=label(text,w,h,bg,fg,font);return mesh(q.geo,q.mat,x,y,z,parent)
  }
  const paneMaps=[
    ['#b68c63','#e9cc9a','#6e5343'],['#8c7c6c','#c3b299','#4b555a'],['#323c50','#65738a','#333c49'],['#a7805a','#ddba86','#71503d']
  ].map(([base,light,edge],j)=>{
    const map=canvasTex(128,176,(c,w,h)=>{const g=c.createLinearGradient(0,0,w*.68,h);g.addColorStop(0,light);g.addColorStop(.72,base);g.addColorStop(1,edge);c.fillStyle=g;c.fillRect(0,0,w,h);
      c.fillStyle=edge;for(let i=0;i<6;i++){c.globalAlpha=.11+(i%3)*.07;c.fillRect(5+i*3,0,3,h);c.fillRect(w-20+i*3,0,3,h)}c.globalAlpha=1;
      if(j!==2){const x=j===0?80:57;c.fillStyle='#5b514980';c.beginPath();c.moveTo(x,106);c.lineTo(x+15,106);c.lineTo(x+22,126);c.lineTo(x-7,126);c.fill();c.fillRect(x+6,126,2,23);c.fillRect(x-2,147,17,2)}
      c.strokeStyle='#d5e4f12a';c.lineWidth=5;c.beginPath();c.moveTo(8,142);c.lineTo(45,52);c.stroke()});
    return material(0xffffff,.46,{map,emissiveMap:map,emissive:0xffffff,emissiveIntensity:j===2?.18:.54})
  });
  const bricks=[[110,82,67],[96,78,74],[145,116,91],[105,93,81]].map(([R,G,B])=>{
    const map=canvasTex(512,256,(c,w,h)=>{c.fillStyle='rgb('+(R+25)+','+(G+24)+','+(B+23)+')';c.fillRect(0,0,w,h);
      for(let y=0;y<14;y++)for(let x=-1;x<14;x++){const a=x*43+(y%2)*21.5,b=y*18.3,t=(r()-.52)*22;
        c.fillStyle='rgb('+Math.round(R+t)+','+Math.round(G+t*.78)+','+Math.round(B+t*.70)+')';c.fillRect(a+.6,b+.8,41.7,16.7);
        c.fillStyle='rgba(65,53,50,.13)';c.fillRect(a+1,b+14.8,40,1.3)}
      for(let k=0;k<2900;k++){c.fillStyle=k%3?'#ecd5b521':'#332b2a21';c.fillRect(r()*w,r()*h,1,1+r()*1.5)}
    },{repeat:[1,1]});return material(0xffffff,.94,{map,side:THREE.DoubleSide})
  });
  // Fronts share metre-scaled brickwork irrespective of each house's size.
  function wallFace(shape,mat,g,z=0){
    const geo=new THREE.ShapeGeometry(shape,40),p=geo.attributes.position,uv=geo.attributes.uv;
    for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/2.72,p.getY(i)/1.03);return mesh(geo,mat,0,0,z,g)
  }
  function rectangle(l,b,rt,t){const sh=new THREE.Shape();sh.moveTo(l,b);sh.lineTo(rt,b);sh.lineTo(rt,t);sh.lineTo(l,t);sh.closePath();return sh}
  function windowUnit(g,x,y,w,h,kind=0){
    block(w+.16,h+.17,.109,stone,x,y,.018,g);
    const glass=typeof kind==='number'?paneMaps[kind%paneMaps.length]:kind;
    mesh(new THREE.PlaneGeometry(w,h),glass,x,y,.08,g);
    for(const xx of [-1,1])block(.039,h+.046,.07,sashPaint,x+xx*w/2,y,.092,g);
    for(const yy of [-1,1])block(w,.047,.070,sashPaint,x,y+yy*h/2,.093,g);
    block(.032,h,.042,iron,x,y,.108,g);block(w,.040,.048,sashPaint,x,y+.018,.113,g);
    block(w+.26,.074,.203,stone,x,y-h/2-.087,.051,g);block(w+.266,.029,.21,snow,x,y-h/2-.034,.052,g);
  }
  function roof(g,w,y,brick){
    block(w+.22,.15,.42,stone,0,y,.027,g);block(w+.27,.055,.435,snow,0,y+.102,.032,g);
    const pitched=block(w, .113, 2.87,slate,0,y+.49,-1.37,g);pitched.rotation.x=.28;
    const powder=block(w-.06,.027,2.77,snow,0,y+.564,-1.39,g);powder.rotation.x=.28;
    for(const x of [-w*.32,w*.31]){block(.47,.87,.54,brick,x,y+.78,-1.27,g);block(.57,.083,.65,stone,x,y+1.225,-1.27,g);
      for(const dx of [-.125,.125]){post(.061,.086,.20,brown,x+dx,y+1.36,-1.27,g);post(.088,.088,.045,brown,x+dx,y+1.462,-1.27,g)}}
  }

  // The original dark-green bookshop fascia sits above the real interior windows and the operable central door.
  const shop=group(0,0,0);
  const upper=rectangle(-6.73,3.54,6.73,9.08);wallFace(upper,bricks[2],shop,-.08);
  block(13.53,.63,.24,green,0,3.255,.095,shop);block(13.66,.105,.39,green,0,3.605,.095,shop);
  block(13.70,.046,.402,snow,0,3.68,.097,shop);block(13.39,.042,.04,gilt,0,2.961,.219,shop);
  sign('BOOKS  ·  COFFEE  ·  CAKE',12.57,.445,0,3.264,.224,shop,'#243d34','#e2c991','600 103px Georgia,serif');
  for(const u of [-6.61,-.845,.845,6.61]){
    block(.121,2.92,.116,green,u,1.46,.065,shop);block(.184,.118,.173,green,u,.083,.084,shop);
    block(.184,.106,.183,green,u,2.88,.081,shop);
  }
  for(const side of [-1,1]){
    const x=side*3.74,wide=5.52,slope=.29;
    const awning=canvasTex(384,64,(c,w,h)=>{for(let i=0;i<16;i++){c.fillStyle=i%2?'#cfc9ac':'#365346';c.fillRect(i*w/16,0,w/16,h)}});
    const fabric=material(0xffffff,.91,{map:awning});
    const aw=block(wide,.048,.96,fabric,x,2.815,.535,shop);aw.rotation.x=slope;
    const drift=block(wide-.04,.030,.87,snow,x,2.855,.52,shop);drift.rotation.x=slope;
    block(wide,.128,.037,fabric,x,2.612,1.001,shop);
    for(const k of [-1,1])line([x+k*2.38,2.285,.098],[x+k*2.38,2.665,.904],.014,iron,shop);
    for(const xx of [-1.78,0,1.78]){windowUnit(shop,x+xx,4.85,.86,1.52,(Math.floor((x+xx+8)*2)%4));windowUnit(shop,x+xx,7.09,.86,1.41,(Math.floor((x+xx+15)*3)%4))}
  }
  roof(shop,13.6,9.12,bricks[2]);
  const porcelainGlow=new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,1.77,.88)}),lightCord=material(0x564b3d,.82);
  const bulbs=[];for(let i=0;i<=42;i++){const u=-6.52+13.04*i/42,y=3.016-.076*Math.sin((i%7)/7*Math.PI),z=.298;bulbs.push([u,y,z]);if(i%2===0)oval(u,y-.039,z,.025,.038,.025,porcelainGlow,shop)}
  for(let i=1;i<bulbs.length;i++)line(bulbs[i-1],bulbs[i],.006,lightCord,shop);

  const streetLength=92,sidewalk=canvasTex(512,256,(c,w,h)=>{
    c.fillStyle='#8b8b8d';c.fillRect(0,0,w,h);
    for(let j=0;j<4;j++)for(let k=-1;k<8;k++){const x=k*85+(j%2)*40,y=j*64,t=(r()-.5)*16;
      c.fillStyle='rgb('+Math.round(142+t)+','+Math.round(144+t)+','+Math.round(149+t)+')';c.fillRect(x+1.2,y+1.2,82.9,61.8)}
    for(let i=0;i<2600;i++){const x=r()*w,y=r()*h;c.fillStyle=i%3?'#d9e0e62b':'#5e687421';c.fillRect(x,y,1+r()*4,.7+r()*1.6)}
  },{repeat:[11,1]});
  const paving=material(0xffffff,.86,{map:sidewalk}),kerb=material(0x8e9197,.78);
  for(const [start,end] of [[-.05,edgeA],[edgeB,farSide+.04]]){
    const surface=mesh(new THREE.PlaneGeometry(streetLength,end-start),paving,0,.002,(start+end)/2,fixed);surface.rotation.x=-Math.PI/2;
    const k=start<0?end:start;block(streetLength,.163,.16,kerb,0,-.066,k);block(streetLength,.019,.175,snow,0,.020,k);
  }
  const roadMap=canvasTex(896,288,(c,w,h)=>{
    const image=c.createImageData(w,h),track=[.18,.335,.67,.824],drifts=[];
    for(let k=0;k<10;k++)drifts.push([r()*6.28,r()*6.28]);
    for(let x=0;x<w;x++){const u=x/w*2*Math.PI;
      const centers=track.map((centre,j)=>centre+.013*Math.sin(u*2+drifts[j][0])+.006*Math.sin(u*4+drifts[j][1]));
      for(let y=0;y<h;y++){const v=y/h,edge=Math.min(v,1-v),nearest=Math.min(...centers.map(t=>Math.abs(v-t)));
        const wheel=Math.exp(-nearest*nearest/.0011),patch=.52+.24*Math.sin(u*2+v*11)+.16*Math.sin(u*5-v*18);
        const dust=clamp(.12+.65*Math.exp(-edge*edge/.0033)+.31*patch*(1-wheel)-.13*wheel);
        const grain=(r()-.5)*14+2.2*Math.sin(u*13+v*87),off=(y*w+x)*4;
        image.data[off]=75+dust*104+grain;image.data[off+1]=82+dust*103+grain;image.data[off+2]=94+dust*101+grain;image.data[off+3]=255}
    }c.putImageData(image,0,0);
    for(let k=0;k<1800;k++){const x=r()*w,y=r()*h,near=Math.min(y,h-y)/h;c.fillStyle=k%4?'rgba(206,215,226,'+(.045+.10*Math.exp(-near*9))+')':'rgba(63,68,79,.10)';
      c.beginPath();c.ellipse(x,y,1+r()*10,.55+r()*1.55,.15*(r()-.5),0,7);c.fill()}
  },{repeat:[5.7,1]});
  const carriageway=mesh(new THREE.PlaneGeometry(streetLength,edgeB-edgeA+.18),material(0xffffff,.67,{map:roadMap}),0,roadLevel,(edgeA+edgeB)/2,fixed);carriageway.rotation.x=-Math.PI/2;
  const stripe=material(0xc1bbb1,.89),yellow=material(0xaaa17b,.92);
  for(let x=-44;x<45;x+=4.30)if(Math.abs(x+8.8)>3.9)block(1.55,.006,.075,stripe,x,roadLevel+.006,(edgeA+edgeB)/2);
  for(const z of [edgeA+.19,edgeB-.19])for(const dz of [-.052,.052])block(streetLength,.006,.046,yellow,0,roadLevel+.005,z+dz);
  for(let i=0;i<11;i++)block(3.48,.007,.435,stripe,-8.8,roadLevel+.008,edgeA+.52+i*.80);
  // Low irregular snowbanks collect at the buildings and leave generous continuous footways.
  const oldSnow=material(0xc3cbd4,.94);
  for(let i=0;i<185;i++){const x=(r()-.5)*83,side=r()>.5,z=side?edgeB+.09:edgeA-.09;if(Math.abs(x+8.8)<2.1)continue;
    oval(x,.006,z+(r()-.5)*.11,.09+r()*.32,.012+r()*.020,.058+r()*.105,oldSnow)}

  const doorColours=[green,material(0x364759,.64),material(0x693f37,.63)];
  function houseDoor(g,x,w,col){
    block(w+.22,2.40,.13,stone,x,1.20,.04,g);block(w,2.25,.102,col,x,1.125,.119,g);
    for(const xx of [-1,1])for(const [y,h] of [[.60,.60],[1.44,.70]]){block(w*.349,h,.034,darkWood,x+xx*w*.217,y,.182,g);
      block(w*.295,h-.077,.024,col,x+xx*w*.217,y,.206,g)}
    block(w*.28,.057,.044,gilt,x,1.10,.203,g);oval(x+w*.30,.99,.218,.025,.027,.021,gilt,g);
    block(w+.25,.109,.35,stone,x,.054,.125,g);
  }
  function rowHouse(u,v,width,height,turn,id){
    const g=group(u,0,v,turn),br=bricks[(id+24)%4];wallFace(rectangle(-width/2,-.15,width/2,height),br,g);
    roof(g,width,height,br);for(const y of [2.84,5.39])if(height>y+.5){block(width+.03,.084,.13,stone,0,y,.018,g);block(width+.036,.021,.14,snow,0,y+.055,.024,g)}
    const shopBay=id%5===0||id%7===0;
    if(shopBay){
      const sg=doorColours[(id+42)%3],left=-width*.12;houseDoor(g,width*.343,.82,sg);
      block(width*.69,.36,.12,sg,left,.18,.05,g);block(width*.69,.25,.19,sg,left,2.40,.07,g);
      const ts=['PRINTS & MAPS','THE STATIONER','FLORIST','WATCH REPAIRS','ANTIQUES'];
      sign(ts[(id+35)%ts.length],width*.66,.20,left,2.40,.173,g,'#3b4540','#d3c19c','500 70px Georgia');
      for(let n=0;n<3;n++)windowUnit(g,left+(n-1)*width*.205,1.26,width*.18,1.50,(id+n+63)%4);
    }else{
      houseDoor(g,-width*.308,.82,doorColours[(id+30)%3]);
      const bay=id%3===1;
      if(bay){block(width*.54,.62,.42,br,width*.151,.31,.13,g);
        for(const y of [.56,2.36])block(width*.59,.12,.55,stone,width*.151,y,.17,g)}
      const wg=bay?group(0,0,.35,0,g):g;for(const k of [-1,1])windowUnit(wg,width*.14+k*width*.122,1.48,width*.166,1.36,(id+k+40)%4);
    }
    const floors=height>8?3:2;
    for(let f=1;f<=floors;f++)for(const k of [-1,0,1]){
      const yy=1.22+f*(height-2.25)/floors;
      windowUnit(g,k*width*.290,yy,Math.min(.88,width*.16),f===floors?1.05:1.30,(id*3+k+f*3+60)%4);
    }
    if(id%3===0&&!shopBay){
      block(1.22,.061,.55,slate,-width*.308,2.48,.17,g);block(1.24,.025,.56,snow,-width*.308,2.525,.17,g);
      for(const xx of [-.39,.39])line([-width*.308+xx,2.18,.06],[-width*.308+xx,2.445,.385],.018,iron,g);
    }
    if(id%3!==1){const foliage=doorColours[0],x=width*.29,y=1.22+(height-2.25)/floors-.76;
      block(.91,.158,.227,darkWood,x,y,.206,g);
      for(let k=0;k<6;k++){const bx=x-.34+k*.134;oval(bx,y+.10,.227,.124,.088+r()*.055,.085,foliage,g);
        oval(bx-.012,y+.168,.223,.092,.029,.064,snow,g)}
    }
    for(const side of [-1,1])block(.092,height,.122,stone,side*(width*.5-.032),height*.5,.02,g);
    post(.039,.039,height-.11,iron,width*.5-.18,(height-.11)/2,.129,g,9);
  }
  let next=6.78;
  for(let n=0;next<48;n++){const w=[4.85,5.94,5.33,4.74][n%4];for(const side of [-1,1])rowHouse(side*(next+w*.5),-.10,w,7.05+((n+(side>0?1:0))%3)*.83,0,10+n*2+(side>0?1:0));next+=w}
  next=3.56;
  for(let n=0;next<47;n++){const w=[5.08,4.67,5.86,5.37][n%4];for(const side of [-1,1])rowHouse(side*(next+w*.5),farSide,w,7.26+((n+(side>0?1:0))%3)*.65,Math.PI,30+n*2+(side>0?1:0));next+=w}
  // Two ordinary London terrace houses, with warm light filtered through drawn curtains.
  const opposite=group(0,0,farSide,Math.PI),wall=rectangle(-3.56,-.14,3.56,8.37);
  wallFace(wall,bricks[0],opposite);roof(opposite,7.12,8.37,bricks[0]);
  const curtained=[0,1].map(style=>{
    const map=canvasTex(192,256,(c,w,h)=>{
      const glow=c.createRadialGradient(w*(style?.64:.38),h*.67,3,w*.5,h*.62,w*.9);
      glow.addColorStop(0,style?'#e9c898':'#eed2a4');glow.addColorStop(.48,'#c69970');glow.addColorStop(1,'#836b60');
      c.fillStyle=glow;c.fillRect(0,0,w,h);
      for(const side of [-1,1]){
        const boundary=side<0?w*(style?.32:.41):w*(style?.61:.72),fringe=side<0?4:-4;
        c.save();c.beginPath();c.moveTo(side<0?0:w,0);c.lineTo(boundary,0);
        c.bezierCurveTo(boundary+fringe*1.7,h*.31,boundary-fringe*1.4,h*.69,boundary+fringe,h*.986);
        c.lineTo(side<0?0:w,h);c.closePath();c.clip();
        c.fillStyle=style?'#bfad93':'#c3b29c';c.fillRect(0,0,w,h);
        for(let x=-8;x<w+8;x+=10){const shade=c.createLinearGradient(x,0,x+11,0);
          shade.addColorStop(0,'rgba(77,61,55,.25)');shade.addColorStop(.46,'rgba(250,227,185,.22)');shade.addColorStop(1,'rgba(83,64,55,.16)');
          c.fillStyle=shade;c.fillRect(x,0,11,h)}
        c.restore();
      }
      c.fillStyle='rgba(105,86,69,.32)';c.fillRect(0,h-7,w,7);
      const cool=c.createLinearGradient(0,0,w,h*.56);cool.addColorStop(0,'rgba(176,200,223,.13)');cool.addColorStop(.58,'rgba(168,184,209,0)');c.fillStyle=cool;c.fillRect(0,0,w,h);
    });
    return material(0xffffff,.60,{map,emissiveMap:map,emissive:0xffe4c0,emissiveIntensity:.60})
  });
  for(const y of [2.84,5.54,8.34]){block(7.12,.104,.18,stone,0,y,.029,opposite);block(7.14,.034,.187,snow,0,y+.069,.028,opposite)}
  for(const side of [-1,1]){
    const centre=side*1.78;
    houseDoor(opposite,side*2.79,.80,doorColours[side>0?0:1]);
    block(1.04,.075,.39,stone,side*2.79,2.39,.17,opposite);block(1.05,.024,.395,snow,side*2.79,2.442,.17,opposite);
    for(const [k,offset] of [0.69,1.64].entries())windowUnit(opposite,side*offset,1.40,.71,1.48,curtained[(k+(side>0?1:0))%2]);
    for(const [row,y] of [[0,4.06],[1,6.96]])for(const k of [-1,1]){
      const x=centre+k*.771;windowUnit(opposite,x,y,.76,row===0?1.43:1.24,(side+k+row+2)%3===0?2:curtained[(row+(k>0?1:0))%2]);
    }
    for(const x of [side*3.49,side*.064])block(.07,8.32,.085,stone,x,4.17,.021,opposite);
    post(.049,.049,8.13,iron,side*3.34,4.09,.146,opposite,9);
  }
  // Railings enclose short front areas and leave both doorways open.
  for(const [a,b] of [[-2.13,-.12],[.12,2.13]]){
    for(const y of [.25,.678])block(b-a,.035,.037,iron,(a+b)/2,y,.55,opposite);
    block(b-a,.013,.041,snow,(a+b)/2,.705,.55,opposite);
    for(let x=a+.06;x<b;x+=.18){post(.012,.014,.73,iron,x,.365,.55,opposite,7);post(.002,.025,.073,iron,x,.765,.55,opposite,5)}
  }

  const obstacles=[];
  function footprint(u,v,halfU,halfV){obstacles.push({minX:3.49+v-halfV,maxX:3.49+v+halfV,minZ:.20-u-halfU,maxZ:.20-u+halfU})}
  const lampPool=new THREE.MeshBasicMaterial({map:GLOW,color:0xffce91,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending});
  function streetLamp(u,v,lit){
    const g=group(u,.015,v);footprint(u,v,.135,.135);
    post(.119,.164,.153,iron,0,.079,0,g);post(.081,.123,.51,iron,0,.394,0,g);post(.044,.071,2.38,iron,0,1.83,0,g);
    for(const [y,rad] of [[.62,.092],[2.87,.073],[3.03,.109]])post(rad,rad*.95,.056,iron,0,y,0,g);
    const globe=mesh(new THREE.CylinderGeometry(.174,.113,.367,4,1,false),material(0xf4d7a0,.39,{emissive:0xffbc65,emissiveIntensity:.47,transparent:true,opacity:.74}),0,3.24,0,g);globe.rotation.y=Math.PI/4;
    oval(0,3.22,0,.067,.113,.067,porcelainGlow,g);
    for(const x of [-1,1])for(const z of [-1,1])line([x*.085,3.065,z*.085],[x*.122,3.422,z*.122],.009,iron,g);
    const cap=post(.026,.232,.168,iron,0,3.509,0,g,4);cap.rotation.y=Math.PI/4;
    const top=post(.020,.196,.118,snow,0,3.55,0,g,4);top.rotation.y=Math.PI/4;oval(0,3.644,0,.027,.052,.027,iron,g);
    const halo=sprite(GLOW,1.0,0xffc47f,.20);halo.position.set(0,3.239,0);g.add(halo);
    const ground=mesh(new THREE.PlaneGeometry(3.70,2.55),lampPool,0,.024,0,g);ground.rotation.x=-Math.PI/2;
    if(lit){const l=new THREE.PointLight(0xffc58a,8.0,8.5,2);l.position.set(0,3.14,0);g.add(l)}
  }
  for(const u of [-35,-23,-12.6,-4.50,7.45,18.55,31,42])streetLamp(u,edgeA-.30,u===-4.5||u===18.55);
  for(const u of [-33,-20.10,-6.34,3.96,15.86,27.1,40.8])streetLamp(u,edgeB+.32,u===3.96);
  // British pedestrian crossing beacons, on the kerb rather than in either walking approach.
  const amberBeacon=material(0xf8b642,.40,{emissive:0xffab28,emissiveIntensity:.72});
  for(const [u,v] of [[-10.72,edgeA-.32],[-6.88,edgeB+.31]]){
    const pole=group(u,0,v);footprint(u,v,.074,.074);
    for(let i=0;i<8;i++)post(.038,.042,.278,i%2===0?iron:sashPaint,0,.14+i*.275,0,pole,9);oval(0,2.29,0,.115,.115,.115,amberBeacon,pole);
  }
  // A K6 booth and a pillar box mark the far pavement, keeping the home window and the crossing clear.
  const kiosk=group(6.16,0,14.72,Math.PI*.80);footprint(6.16,14.72,.56,.56);
  block(.86,.089,.86,iron,0,.051,0,kiosk);const phoneGlass=clearGlazing({pane:true,reflection:.47});
  for(const dx of [-.378,.378])for(const dz of [-.378,.378])block(.077,1.96,.077,red,dx,1.04,dz,kiosk);
  for(let j=0;j<4;j++){
    const face=group(0,0,0,j*Math.PI/2,kiosk);block(.76,.295,.065,red,0,.225,.39,face);
    block(.764,.168,.074,red,0,1.98,.389,face);
    mesh(new THREE.PlaneGeometry(.68,1.52),phoneGlass,0,1.139,.389,face);
    for(const x of [-.118,.118])block(.023,1.51,.034,red,x,1.132,.403,face);
    for(let row=0;row<5;row++)block(.69,.023,.035,red,0,.495+row*.284,.403,face);
    sign('TELEPHONE',.643,.104,0,1.988,.429,face,'#d5c9af','#453a34','bold 77px Georgia');
  }
  block(.91,.087,.91,red,0,2.096,0,kiosk);const kioskRoof=oval(0,2.13,0,.454,.159,.454,red,kiosk);
  const powder=oval(-.01,2.159,-.012,.419,.128,.419,snow,kiosk);block(.22,.35,.095,iron,0,1.15,-.23,kiosk);
  const mail=group(-14.15,0,2.56,Math.PI*.10);footprint(-14.15,2.56,.267,.267);
  post(.232,.285,.164,iron,0,.083,0,mail,24);post(.221,.232,.966,red,0,.645,0,mail,28);post(.245,.223,.096,red,0,1.174,0,mail,28);
  oval(0,1.222,0,.258,.083,.258,red,mail);oval(0,1.257,0,.238,.057,.238,snow,mail);
  block(.193,.045,.029,iron,0,.985,.215,mail);sign('POST',.19,.096,0,.79,.225,mail,'#913f30','#deca98','bold 82px Georgia');
  const bark=material(0x574d47,.96),twig=material(0x695e55,.92),soil=material(0x615e55,.96);
  function winterTree(u,v,height){
    footprint(u,v,.241,.241);const g=group(u,0,v);
    const bed=block(.78,.023,.69,soil,0,.020,0,g);for(const s of [-1,1]){block(.052,.030,.76,iron,s*.394,.024,0,g);block(.83,.03,.046,iron,0,.024,s*.352,g)}
    line([0,.02,0],[.032,height*.49,-.035],.093,bark,g,.060);
    function branch(a,dir,len,thick,level){
      const tip=a.clone().addScaledVector(dir,len),mid=a.clone().lerp(tip,.49);
      mid.x+=.056*len*Math.sin(tip.z*3+level);mid.z+=.052*len*Math.cos(tip.x*4+level);
      line(a.toArray(),mid.toArray(),thick,level>1?bark:twig,g,thick*.80);line(mid.toArray(),tip.toArray(),thick*.80,twig,g,thick*.61);
      if(level>1&&dir.y<.82){const lift=v3(0,thick*.65,0);line(a.clone().add(lift).toArray(),mid.clone().add(lift).toArray(),thick*.36,snow,g,thick*.20)}
      if(!level)return;
      for(const k of [-1,1]){const d=dir.clone();d.x+=k*(.34+.33*r());d.z+=(r()-.45)*.78;d.y+=.10+r()*.14;d.normalize();
        branch(tip,d,len*(.59+.13*r()),thick*.58,level-1)}
    }
    for(let i=0;i<6;i++){const a=i*2.40+.32*r(),lift=.28+r()*.29,y=height*(.33+i*.035);
      branch(v3(.015,y,-.012),v3(Math.cos(a)*.86,.70+lift,Math.sin(a)*.64).normalize(),height*(.27+.04*r()),.052-i*.0034,2)}
    branch(v3(.032,height*.49,-.035),v3(-.13,.99,.07).normalize(),height*.28,.058,2);
  }
  for(const [u,v,h] of [[-26.6,2.51,4.57],[10.65,2.55,4.64],[27.4,2.56,4.22],[-26.2,12.65,4.39],[-12.42,12.66,4.86],[10.42,12.63,4.5],[30.60,12.67,4.47]])winterTree(u,v,h);
  function bench(u,v,angle){
    const g=group(u,0,v,angle);footprint(u,v,.82,.35);
    for(const z of [-.16,-.047,.066,.179])block(1.51,.051,.093,brown,0,.446,z,g);
    for(const y of [.624,.765,.90])block(1.53,.087,.051,brown,0,y,-.213,g);
    for(const x of [-.55,.55]){line([x,.022,-.22],[x,.921,-.213],.027,iron,g);line([x,.024,.22],[x,.428,.15],.030,iron,g)}
  }
  bench(-17.55,14.87,0);bench(14.16,1.04,Math.PI);
  // A late-night sky remains coherent while walking or turning; nearby and distant roofs mask the horizon.
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,
    vertexShader:'varying vec3 direction;void main(){direction=position;vec4 q=projectionMatrix*vec4(mat3(viewMatrix)*position,1.);gl_Position=vec4(q.xy,q.w*.99999,q.w);}',
    fragmentShader:`varying vec3 direction;void main(){vec3 d=normalize(direction);float h=clamp(d.y,0.,1.);
      vec3 col=mix(vec3(.077,.104,.159),vec3(.009,.020,.050),pow(h,.62));
      vec3 moon=normalize(vec3(.40,.46,-.78));float chord=length(d-moon);
      col+=vec3(.16,.18,.19)*exp(-chord*12.)+vec3(.80,.83,.78)*(1.-smoothstep(.012,.015,chord));
      vec3 cell=floor(d*375.);float flick=fract(sin(dot(cell,vec3(15.313,41.35,28.7)))*4131.89);
      float spot=length(fract(d*375.)-.5);col+=vec3(.23,.26,.3)*step(.9955,flick)*(1.-smoothstep(.10,.44,spot))*smoothstep(.04,.37,h);
      gl_FragColor=vec4(col,1.);}`});
  const night=new THREE.Mesh(new THREE.SphereGeometry(41,30,16),skyMat);night.frustumCulled=false;night.renderOrder=-20;S.add(night);
  for(const far of [-1,1]){
    const g=group(far*49.9,0,7.3,far>0?-Math.PI/2:Math.PI/2);for(let i=-3;i<=3;i++){
      const hh=6.2+(i%3)*.65;block(3.14,hh,2.65,bricks[(i+4)%4],i*3.12,hh/2,-1.38,g);
      for(const y of [1.55,3.25,4.88])for(const x of [-.64,.63])windowUnit(g,i*3.12+x,y,.60,.83,(i+7+Math.round(y))%4);
      block(3.2,.088,2.67,snow,i*3.12,hh+.055,-1.38,g);
    }
  }
  // Keep transparent panes and light sources separate; opaque façades share draw calls by finish.
  fixed.updateWorldMatrix(true,true);
  const batches=new Map(),originals=new Set(),loose=[];
  fixed.traverse(o=>{
    if(o.isLight||o.isSprite||o.isMesh&&o.material.transparent){loose.push(o);return}
    if(!o.isMesh)return;const src=o.geometry,baked=src.index?src.toNonIndexed():src.clone();baked.applyMatrix4(o.matrixWorld);originals.add(src);
    if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(baked);
  });
  for(const o of loose)S.attach(o);axis.remove(fixed);
  for(const [finish,parts] of batches){const geo=mergeGeometries(parts,false);geo.computeBoundingSphere();S.add(new THREE.Mesh(geo,finish));for(const p of parts)p.dispose()}
  for(const original of originals)original.dispose();

  const tyres=material(0x24272c,.92),chrome=material(0xa5abb2,.26,{metalness:.75}),seatMat=material(0x494b50,.87);
  const lens=new THREE.MeshBasicMaterial({color:new THREE.Color(2.08,2.0,1.72)}),tailLight=material(0x9b4638,.4,{emissive:0xd84f3b,emissiveIntensity:.92});
  const windscreen=clearGlazing({pane:true,reflection:.61}),steel=material(0x3c464d,.41,{metalness:.32});
  const contactShadow=new THREE.MeshBasicMaterial({map:GLOW,color:0x1a2026,transparent:true,opacity:.71,depthWrite:false});
  function vehicle(spec){
    const {length:l,width:w,taxi:tint}=spec,g=group(spec.start,roadLevel+.012,spec.lane,spec.dir>0?0:Math.PI,axis),
      skin=material(spec.colour,.35,{metalness:.37}),cab=tint,lid=cab?1.56:1.39,low=.84,top=lid-.07;
    const rear=-l*.355,front=l*.292,roofBack=rear+.17,roofFront=front-.31;
    const underbody=mesh(new THREE.PlaneGeometry(l*1.35,w*1.52),contactShadow,0,.016,0,g);underbody.rotation.x=-Math.PI/2;
    rbox(l,.57,w,.126,skin,0,.575,0,g);rbox(l*.89,.098,w+.025,.042,steel,-.025,.382,0,g);
    rbox(l*.30,.146,w*.93,.075,skin,l*.31,.848,0,g);rbox(l*.20,.121,w*.95,.048,skin,-l*.38,.810,0,g);
    block(front-rear,.053,w*.95,seatMat,(front+rear)/2,.843,0,g);
    rbox(roofFront-roofBack+.16,.107,w*.84,.050,skin,(roofBack+roofFront)/2,lid,0,g);
    const powder=rbox(Math.max(.5,roofFront-roofBack-.12),.025,w*.65,.010,oldSnow,(roofBack+roofFront)/2-.018,lid+.056,-.027,g);
    for(const zSign of [-1,1]){
      const z=zSign*w*.455;
      line([rear,low,z],[roofBack,top,z*.92],.035,steel,g);line([front,low,z],[roofFront,top,z*.92],.033,steel,g);
      line([(roofFront+roofBack)*.5,low,z],[(roofFront+roofBack)*.5,top,z*.92],.031,steel,g);
      const shp=new THREE.Shape();shp.moveTo(rear,low);shp.lineTo(front,low);shp.lineTo(roofFront,top);shp.lineTo(roofBack,top);shp.closePath();
      const side=new THREE.ShapeGeometry(shp),pp=side.attributes.position,uu=side.attributes.uv;
      for(let j=0;j<pp.count;j++){const y=pp.getY(j);uu.setXY(j,(pp.getX(j)-rear)/(front-rear),(y-low)/(top-low));pp.setZ(j,z*(1-.08*((y-low)/(top-low))))}
      side.computeVertexNormals();
      if(zSign<0){const ix=side.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}side.computeVertexNormals()}
      const sm=windscreen.clone();sm.side=THREE.FrontSide;mesh(side,sm,0,0,0,g);
      block(l*.83,.024,.033,chrome,0,.857,zSign*w*.506,g);
      for(const x of [-l*.186,l*.093])block(.113,.025,.021,chrome,x,.795,zSign*w*.503,g);
    }
    for(const [xb,xt] of [[rear,roofBack],[front,roofFront]]){
      const p=new Float32Array([xb,low,-w*.455,xb,low,w*.455,xt,top,w*.418, xb,low,-w*.455,xt,top,w*.418,xt,top,-w*.418]);
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1],2));geo.computeVertexNormals();
      const glass=windscreen.clone();glass.side=THREE.DoubleSide;mesh(geo,glass,0,0,0,g);
    }
    for(const x of [-.61,.33]){rbox(.28,.294,w*.68,.052,seatMat,x,1.00,0,g);rbox(.173,.14,w*.52,.044,seatMat,x-.027,1.197,0,g)}
    const wheelSet=[];for(const x of [-l*.31,l*.31])for(const side of [-1,1]){
      const z=side*w*.482,assy=group(x,.324,z,0,g);wheelSet.push(assy);
      const patch=mesh(new THREE.PlaneGeometry(.61,.35),contactShadow,x,.009,z,g);patch.rotation.x=-Math.PI/2;
      post(.316,.316,.175,tyres,0,0,0,assy,22).rotation.x=Math.PI/2;
      post(.17,.17,.184,chrome,0,0,0,assy,18).rotation.x=Math.PI/2;
      for(let j=0;j<5;j++){const a=j*2*Math.PI/5;line([Math.cos(a)*.062,Math.sin(a)*.062,side*.095],[Math.cos(a)*.142,Math.sin(a)*.142,side*.095],.010,steel,assy)}
    }
    for(const s of [-1,1]){
      oval(l*.49,.697,s*w*.334,.029,.071,.121,lens,g);oval(-l*.495,.690,s*w*.36,.023,.067,.10,tailLight,g);
      const halo=sprite(GLOW,.47,0xffe1ab,.21);halo.position.set(l*.50,.702,s*w*.335);g.add(halo);
    }
    const wash=mesh(new THREE.PlaneGeometry(3.01,1.73),lampPool,l*.5+1.29,.028,0,g);wash.rotation.x=-Math.PI/2;
    block(.036,.132,w*.47,iron,l*.498,.60,0,g);for(let i=0;i<8;i++)block(.018,.085,.017,chrome,l*.506,.60,-w*.19+i*w*.055,g);
    if(cab){rbox(.347,.120,.259,.030,iron,-.02,lid+.085,0,g);const badge=sign('TAXI',.299,.083,-.02,lid+.09,.134,g,'#d5b277','#423a32','bold 90px Georgia')}
    return {...spec,model:g,wheels:wheelSet,u:spec.start,speed:spec.cruise,committed:false,half:l*.5}
  }
  const fleet=[
    {start:-24,dir:1,lane:5.30,cruise:4.7,length:4.22,width:1.65,colour:0x23352f,taxi:true},
    {start:20,dir:1,lane:5.30,cruise:4.35,length:3.82,width:1.60,colour:0x68433e,taxi:false},
    {start:4,dir:-1,lane:9.72,cruise:4.51,length:4.12,width:1.66,colour:0x303845,taxi:true},
    {start:43,dir:-1,lane:9.72,cruise:4.05,length:3.97,width:1.62,colour:0x60625b,taxi:false}
  ].map(vehicle);
  const crossingU=-8.80,crossingHalf=1.75,stopMargin=.74,braking=3.25,routeHalf=46;
  const along=c=>(c.u-crossingU)*c.dir;
  let requestedLastStep=false;
  function canCross(){
    return fleet.every(car=>{
      const q=along(car),front=q+car.half,rear=q-car.half;
      if(rear>crossingHalf+.12)return true;
      if(front>=-crossingHalf-.11)return false;
      const gap=-crossingHalf-stopMargin-front;
      return !car.committed&&(requestedLastStep||car.speed<.12||gap>=car.speed*car.speed/(2*braking)-.025);
    });
  }
  function drive(dt,yielding){
    for(const c of fleet){
      const q=along(c),freeToStop=-crossingHalf-stopMargin-c.half-q;
      if(!yielding||q-c.half>crossingHalf+.13)c.committed=false;
      else if(!requestedLastStep&&q-c.half<crossingHalf+.13&&c.speed>.15&&freeToStop<c.speed*c.speed/(2*braking)-.025)c.committed=true;
      let target=c.cruise;
      if(yielding&&!c.committed&&q<-crossingHalf)
        target=Math.min(target,Math.sqrt(2*braking*Math.max(0,freeToStop-.06)));
      for(const lead of fleet){if(c===lead||lead.dir!==c.dir)continue;
        const distance=THREE.MathUtils.euclideanModulo((lead.u-c.u)*c.dir,2*routeHalf)-lead.half-c.half;
        target=Math.min(target,Math.sqrt(2*braking*Math.max(0,distance-1.58)));
      }
      c.speed+=Math.max(-braking*dt,Math.min(1.54*dt,target-c.speed));
      let step=Math.max(0,c.speed)*dt;
      if(yielding&&!c.committed&&freeToStop>=0)step=Math.min(step,freeToStop);
      c.u+=c.dir*step;if(c.u>routeHalf||c.u< -routeHalf){c.u=-c.dir*routeHalf;c.committed=false}
      c.model.position.x=c.u;c.model.position.y=roadLevel+.008+.0025*Math.sin(c.u*4.7);
      for(const w of c.wheels)w.rotation.z-=step/.316;
    }
    requestedLastStep=yielding;
  }
  const coats=[0x40534c,0x695046,0x49566b,0x56505c,0x736c53].map(c=>material(c,.94));
  const trouser=material(0x3d4148,.91),shoes=material(0x333334,.62),skinA=material(0xb68b73,.85),skinB=material(0x986f55,.86),
    scarfM=[material(0xa98a6b,.96),material(0x917d76,.96),material(0x7e8a80,.96)],hair=material(0x433b35,.93);
  function person(i,start,lane,dir,speed){
    const g=group(start,.011,lane,dir*Math.PI/2,axis),body=group(0,0,0,0,g),mat=coats[i%coats.length],scarf=scarfM[i%3],skin=i%3?skinA:skinB;
    const coatProfile=[[.216,0],[.220,.041],[.171,.34],[.196,.486],[.141,.558],[.07,.589]];
    const jacket=mesh(new THREE.LatheGeometry(coatProfile.map(([rad,y])=>new THREE.Vector2(rad,y)),20),mat,0,.79,0,body);jacket.scale.z=.80;
    const legs=[],arms=[];for(const side of [-1,1]){
      const hip=group(side*.086,.86,0,0,body),knee=group(0,-.399,0,0,hip);
      oval(0,-.196,0,.072,.215,.075,trouser,hip);oval(0,-.185,0,.057,.202,.062,trouser,knee);oval(0,-.372,.050,.070,.059,.124,shoes,knee);
      const shoulder=group(side*.174,1.28,-.004,0,body),elbow=group(0,-.277,0,0,shoulder);elbow.rotation.x=-.29;
      oval(0,-.137,0,.066,.162,.07,mat,shoulder);oval(0,-.103,.005,.052,.126,.058,mat,elbow);oval(0,-.234,.017,.046,.059,.044,shoes,elbow);legs.push([hip,knee]);arms.push(shoulder);
    }
    const shadow=mesh(new THREE.PlaneGeometry(.53,.45),contactShadow,0,.017,0,g);shadow.rotation.x=-Math.PI/2;
    oval(.002,1.515,.027,.099,.129,.100,skin,body);oval(0,1.605,.009,.108,.074,.103,i%2?hair:mat,body);oval(0,1.514,.111,.026,.036,.031,skin,body);
    oval(0,1.393,.009,.095,.058,.09,scarf,body);const end=block(.063,.188,.021,scarf,.058,1.29,.124,body);end.rotation.z=-.16;
    if(i===1||i===5){const canopy=group(.18,1.89,.18,.13,body);post(.008,.008,.78,shoes,0,-.345,0,canopy,8);
      const cloth=material(i===1?0x41555c:0x66545a,.91,{side:THREE.DoubleSide});const dome=mesh(new THREE.SphereGeometry(.452,14,7,0,Math.PI*2,0,1.34),cloth,0,0,0,canopy);dome.scale.y=.40;oval(0,.19,0,.016,.029,.016,shoes,canopy)}
    g.scale.setScalar(.97+(i%4)*.028);return {g,body,legs,arms,id:i,u:start,v:lane,dir,speed,current:speed,phase:i*1.22}
  }
  const walkers=[[-16,1.62,1,.91],[14,2.06,-1,.91],[32,1.62,1,1.01],[-34,2.06,-1,.82],[-21,13.16,1,.91],[4,13.78,-1,.84],[25,13.16,1,.96]].map((a,i)=>person(i,...a));
  const flakesMat=flakes(S,1720,[3.57,19.05,.08,12.74,-40,40],[.019,.057],.82,.089,[.86,.92,1.02]);
  function walk(dt,pu,pv){
    for(const guest of walkers){
      let goal=guest.speed;
      if(pu!==null&&Math.abs(pv-guest.v)<.72){const gap=(pu-guest.u)*guest.dir;
        if(gap>.03&&gap<1.72)goal*=clamp((gap-.45)/1.02);}
      if(pu!==null){
        const crossingBusy=Math.abs(pu-crossingU)<crossingHalf&&pv>edgeA-.94&&pv<edgeB+.93;
        const enteringDoor=Math.abs(pu)<.90&&pv>.46&&pv<2.91&&guest.v<edgeA;
        if(crossingBusy||enteringDoor){const centre=enteringDoor?0:crossingU,w=enteringDoor?.92:crossingHalf;
          const before=(centre-guest.u)*guest.dir-w;if(before>=0&&before<1.25)goal*=clamp((before-.20)/.91)}
      }
      guest.current+=Math.max(-1.92*dt,Math.min(1.02*dt,goal-guest.current));guest.u+=guest.dir*guest.current*dt;
      if(Math.abs(guest.u)>routeHalf-1)guest.u=-guest.dir*(routeHalf-1);
      guest.phase+=guest.current*dt*5.84;const weight=clamp(guest.current/guest.speed);
      guest.g.position.x=guest.u;guest.body.position.y=.012+.015*weight*Math.cos(guest.phase*2);guest.body.rotation.z=.023*weight*Math.sin(guest.phase);
      guest.legs.forEach(([hip,knee],j)=>{const a=guest.phase+j*Math.PI;hip.rotation.x=-.44*Math.sin(a)*weight;
        knee.rotation.x=.06+.48*weight*Math.max(0,-Math.cos(a));guest.arms[j].rotation.x=(guest.id===1||guest.id===5)&&j===1?-.58:.30*weight*Math.sin(a)});
    }
  }
  return {obstacles,canCross,update(dt,t,viewer=null){
    const pu=viewer==null?null:.20-viewer.z,pv=viewer==null?null:viewer.x-3.49;
    const nearCrossing=pu!==null&&Math.abs(pu-crossingU)<crossingHalf+.26&&pv>=edgeA-.95&&pv<=edgeB+.95;
    // Small substeps preserve stopping distances even after an occasional slow frame.
    let remaining=Math.max(0,Math.min(dt,.30));
    while(remaining>.00001){const step=Math.min(remaining,.050);drive(step,nearCrossing);walk(step,pu,pv);remaining-=step}
    flakesMat.uniforms.uT.value=t;if(flakesMat.uniforms.uTime)flakesMat.uniforms.uTime.value=t;
  }};
}
