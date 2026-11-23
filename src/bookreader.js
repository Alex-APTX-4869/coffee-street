window.poemReader=(()=>{
  const get=id=>document.getElementById(id),dialog=get('poetryReader');
  const poems=[
  {"title":"门前","text":"我多么希望，有一个门口\n早晨，阳光照在草上\n\n我们站着\n扶着自己的门扇\n门很低，但太阳是明亮的\n\n草在结它的种子\n风在摇它的叶子\n我们站着，不说话\n就十分美好\n\n有门，不用开开\n是我们的，就十分美好\n\n早晨，黑夜还要流浪\n我们把六弦琴给他\n我们不走了，我们需要\n土地，需要永不毁灭的土地\n我们要乘着它\n度过一生\n\n土地是粗糙的，有时狭隘\n然而，它有历史\n有一分天空，一分月亮\n一分露水和早晨\n\n我们爱土地\n我们站着，用木鞋挖着\n泥土，门也晒热了\n我们轻轻靠着\n十分美好\n\n墙后的草\n不会再长大了\n它只用指尖，触了触阳光"},
  {"title":"星月的来由","text":"树枝想去撕裂天空，\n却只戳了几个微小的窟窿，\n它透出了天外的光亮，\n人们把它叫作月亮和星星。"},
  {"title":"烟囱","text":"烟囱犹如平地耸立起来的巨人，\n望着布满灯火的大地，\n不断地吸着烟卷，\n思索着一种谁也不知道的事情。"}
];
  const drawings=[
    'M19 125 Q72 118 131 124 M36 120V68l7-6v56m53 0V66l7-5v59 M44 74l51-2m-51 9 51-2m-49 20 46 14m-46-5 46-24 M49 76v37m10-38v39m12-39v41m12-42v43m8-43v44 M18 124q4-19 1-34m2 20-9-11m7-1 8-11m79 37q12-13 13-34m-9 25 10-6m-5-9 6-6m-93 25 6-11',
    'M13 144q31-31 43-67t22-38 M24 135q20-32 25-56L40 55m9 24 12-23m-6 29 23-11 14-23m-15 24 18-6m-31-3 2-24-8-15m10 23 12-19m-2 10 14-13 M99 37q13 17 26 1-8 24-26 12-7-5-5-13 M26 42h5m-2-2v4m76 29h5m-2-2v4m16-57h4',
    'M11 123l27-21 25 15 16-13 36 15 21-4 M14 129h124 M75 106l4-55h16l4 61m-22-61v-6h20v6zm3 14 13 2m-13 6 13 1m-15 13 16 1m-15 6 16 1 M84 41c-11-19 24-16 11-30m-5 31c-2-13 22-14 13-27 M32 120v-6h6v6m11 1v-6h6v6m57 3v-5h6v5'
  ];
  const book=dialog.querySelector('.boundBook'),papers=Array.from(book.querySelectorAll('.bookPaper'));
  const ruler=book.querySelector('.poemRuler'),prev=get('poemPrev'),next=get('poemNext');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let leaves=[],spread=0,bookmark=null,moving=null;

  function paginate(work,height){
    const text=poems[work].text;
    leaves.push({work,title:true});
    const firstBody=leaves.length;
    let start=-1,end=0;
    function fits(a,b){ruler.textContent=text.slice(a,b);return ruler.getBoundingClientRect().height<=height+.05}
    function flush(){if(start<0)return;leaves.push({work,start,end});start=-1}
    function place(a,b){
      if(start>=0&&!fits(start,b))flush();
      if(start<0)start=a;
      end=b;
    }
    // Keep a stanza together whenever it fits on a fresh leaf, otherwise break at verse lines.
    for(const stanza of text.matchAll(/[^\n]+(?:\n[^\n]+)*/gu)){
      const a=stanza.index,b=a+stanza[0].length;
      if(fits(a,b)){place(a,b);continue}
      for(const line of stanza[0].matchAll(/[^\n]+/gu)){
        const x=a+line.index,y=x+line[0].length;
        if(fits(x,y)){place(x,y);continue}
        let i=x;
        for(const character of line[0]){place(i,i+character.length);i+=character.length}
      }
    }
    flush();
    // An opening always pairs a left-hand title with the first right-hand verse.
    // Split one continuation at a stanza or line break to finish this poem on the right.
    if((leaves.length-firstBody)%2===0){
      let best=null;
      for(let i=firstBody;i<leaves.length;i++){
        const page=leaves[i],body=text.slice(page.start,page.end);
        for(const br of body.matchAll(/\n+/g)){
          const before=br.index,after=br.index+br[0].length;
          const weight=(br[0].length>1?1.25:1)*(i===firstBody?.75:1);
          const score=Math.min(before,body.length-after)*weight;
          if(score>0&&(!best||score>best.score))best={i,before:page.start+before,after:page.start+after,score};
        }
      }
      if(!best){
        // A very short viewport can hold only one wrapped line. Split at a character boundary.
        for(let i=firstBody;i<leaves.length;i++){
          const page=leaves[i],characters=Array.from(text.slice(page.start,page.end));
          if(characters.length<2||best&&characters.length<=best.score)continue;
          const at=page.start+characters.slice(0,Math.ceil(characters.length/2)).join('').length;
          best={i,before:at,after:at,score:characters.length};
        }
      }
      if(best){
        const page=leaves[best.i],last=page.end;
        page.end=best.before;leaves.splice(best.i+1,0,{work,start:best.after,end:last});
      }else if(leaves.length>firstBody){
        leaves.push({work,start:text.length,end:text.length});
      }
    }
  }
  function mark(leaf){return leaf?{work:leaf.work,title:!!leaf.title,offset:leaf.start??0}:null}
  function drawPaper(paper,index){
    const leaf=leaves[index],area=paper.firstElementChild,folio=paper.lastElementChild;
    area.replaceChildren();folio.textContent=leaf?String(index+2):'';
    paper.setAttribute('aria-label',leaf?'第'+(index+2)+'页':'空白页');
    if(!leaf)return;
    const poem=poems[leaf.work];
    if(!leaf.title){
      const body=document.createElement('p');body.className='poemText';body.textContent=poem.text.slice(leaf.start,leaf.end);area.append(body);return;
    }
    const heading=document.createElement('div'),title=document.createElement('h2'),author=document.createElement('p');
    heading.className='poemHeading';title.textContent=poem.title;author.className='poet';author.textContent='顾城';heading.append(title,author);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');
    svg.setAttribute('class','poemArt');svg.setAttribute('viewBox','0 0 150 160');svg.setAttribute('aria-hidden','true');
    path.setAttribute('d',drawings[leaf.work]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');
    path.setAttribute('stroke-width','1.15');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);
    area.append(heading,svg);
  }
  function render(){
    papers.forEach((paper,side)=>drawPaper(paper,spread+side));
    prev.disabled=spread===0;next.disabled=spread+2>=leaves.length;
  }
  function settle(){
    if(!moving)return;
    const {sheet,animation}=moving;moving=null;animation.onfinish=null;animation.cancel();sheet.remove();render();
  }
  function layout(){
    if(!dialog.open)return;
    settle();
    const boxes=papers.map(p=>p.firstElementChild.getBoundingClientRect());
    const width=Math.min(...boxes.map(b=>b.width)),height=Math.min(...boxes.map(b=>b.height));
    if(!width||!height)return;
    ruler.style.width=width+'px';leaves=[];
    poems.forEach((_,work)=>paginate(work,height));ruler.textContent='';
    const index=bookmark?leaves.findIndex(l=>l.work===bookmark.work&&(bookmark.title?l.title:!l.title&&l.start<=bookmark.offset&&l.end>bookmark.offset)):0;
    spread=Math.max(0,index-index%2);render();
  }
  function turn(direction){
    settle();
    const target=spread+direction*2;
    if(target<0||target>=leaves.length)return;
    const old=spread;spread=target;bookmark=mark(leaves[spread]);
    dialog.dispatchEvent(new CustomEvent('poetrypaper',{detail:'turn'}));
    if(reduce.matches||typeof book.animate!=='function'){render();return}
    const side=direction>0?1:0,source=papers[side],opposite=papers[1-side];
    const front=source.cloneNode(true),back=opposite.cloneNode(true),sheet=document.createElement('div');
    drawPaper(back,spread+1-side);
    sheet.className='flippingLeaf';sheet.setAttribute('aria-hidden','true');sheet.inert=true;sheet.append(front,back);
    const box=source.getBoundingClientRect(),outer=book.getBoundingClientRect();
    Object.assign(sheet.style,{left:(box.left-outer.left-book.clientLeft)+'px',top:(box.top-outer.top-book.clientTop)+'px',width:box.width+'px',height:box.height+'px',transformOrigin:side?'left center':'right center'});
    book.append(sheet);
    drawPaper(source,spread+side);
    drawPaper(opposite,old+1-side);
    prev.disabled=spread===0;next.disabled=spread+2>=leaves.length;
    const animation=sheet.animate([{transform:'rotateY(0deg)'},{transform:'rotateY('+(-direction*180)+'deg)'}],
      {duration:400,easing:'cubic-bezier(.4,0,.24,1)',fill:'forwards'});
    moving={sheet,animation};animation.onfinish=settle;
  }
  new ResizeObserver(layout).observe(book);document.fonts?.addEventListener('loadingdone',layout);
  prev.onclick=()=>turn(-1);next.onclick=()=>turn(1);
  get('poemClose').onclick=()=>dialog.close();dialog.addEventListener('close',settle);
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();turn(e.key==='ArrowRight'?1:-1)}});
  return {open(){if(dialog.open)return;dialog.showModal();layout();get('poemClose').focus();dialog.dispatchEvent(new CustomEvent('poetrypaper',{detail:'open'}))},
    close(){if(dialog.open)dialog.close()},isOpen:()=>dialog.open};
})();
