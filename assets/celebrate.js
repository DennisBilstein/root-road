/* Visuelle Erfolgsrückmeldung: kleine Partikel-Ausbrüche an der Stelle, an der etwas gelöst oder abgeschlossen wurde.
   Rein dekorativ (aria-hidden): Jede Aussage steht zusätzlich als Text im jeweiligen Feedback. Bei „Bewegung reduzieren“ entfällt der Ausbruch,
   der Anker erhält nur eine ruhige Hervorhebung. Es werden ausschließlich transform und opacity animiert. */
(function(){
  var SIZES={spark:{count:9,reach:46,spread:1,ms:760},burst:{count:18,reach:92,spread:1,ms:1000},confetti:{count:34,reach:150,spread:1.7,ms:1500}};
  var layer=null,cleanup=0;
  function reduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
  function resolve(anchor){return typeof anchor==='string'?document.querySelector(anchor):anchor;}
  function highlight(el){
    if(!el||!el.classList)return;
    el.classList.remove('rp-hit');
    void el.offsetWidth;
    el.classList.add('rp-hit');
    setTimeout(function(){el.classList.remove('rp-hit');},1400);
  }
  function origin(el){
    if(!el||!el.getBoundingClientRect)return {x:window.innerWidth/2,y:window.innerHeight/3};
    var r=el.getBoundingClientRect();
    return {x:r.left+r.width/2,y:r.top+Math.min(r.height/2,60)};
  }
  /* kind: 'none' (nur Hervorhebung), 'spark' (klein), 'burst' (mittel), 'confetti' (groß). Gibt true zurück, wenn Partikel gestartet wurden. */
  window.rpCelebrate=function(anchor,kind){
    var el=resolve(anchor),cfg=SIZES[kind]||SIZES.spark;
    highlight(el);
    if(kind==='none'||reduced()||document.hidden)return false;
    var o=origin(el);
    if(!layer||!layer.isConnected){
      layer=document.createElement('div');
      layer.className='rp-fx';
      layer.setAttribute('aria-hidden','true');
      document.body.appendChild(layer);
    }
    var frag=document.createDocumentFragment(),i,p,angle,dist,x,y,up;
    for(i=0;i<cfg.count;i++){
      p=document.createElement('i');
      /* Gleichmäßig verteilte Richtungen mit leichter Streuung; Konfetti fliegt breiter und fällt am Ende nach unten. */
      angle=(i/cfg.count)*Math.PI*2+Math.random()*0.5;
      dist=cfg.reach*(0.55+Math.random()*0.45);
      x=Math.cos(angle)*dist*cfg.spread;
      y=Math.sin(angle)*dist;
      up=kind==='confetti'?y-cfg.reach*0.5:y;
      p.className='rp-p rp-c'+(i%5)+(i%3===0?' rp-round':'');
      p.style.cssText='left:'+o.x.toFixed(1)+'px;top:'+o.y.toFixed(1)+'px;--x:'+x.toFixed(1)+'px;--y1:'+up.toFixed(1)+'px;--y2:'+(kind==='confetti'?(y+cfg.reach*0.9).toFixed(1):y.toFixed(1))+'px;--r:'+Math.round((Math.random()-0.5)*720)+'deg;--d:'+Math.round(Math.random()*120)+'ms;--t:'+(cfg.ms+Math.round(Math.random()*200))+'ms';
      frag.appendChild(p);
    }
    layer.appendChild(frag);
    clearTimeout(cleanup);
    cleanup=setTimeout(function(){if(layer){layer.textContent='';}},cfg.ms+700);
    return true;
  };
  /* Nach einem Rendern: das Zielelement existiert erst im neuen DOM. */
  window.rpCelebrateAfterRender=function(anchor,kind){
    requestAnimationFrame(function(){requestAnimationFrame(function(){window.rpCelebrate(anchor,kind);});});
  };
})();
