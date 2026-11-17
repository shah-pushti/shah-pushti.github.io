(function(){
var d=document;d.documentElement.classList.add('js');
function each(sel,fn,root){var n=(root||d).querySelectorAll(sel);for(var i=0;i<n.length;i++)fn(n[i]);}
/* grow charts and the path line when they scroll into view */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.25});
  each('[data-inview]',function(el){io.observe(el);});
}else{each('[data-inview]',function(el){el.classList.add('in');});}
/* copy email address */
each('[data-copy]',function(b){b.addEventListener('click',function(){
  var done=function(){var t=b.textContent;b.textContent=b.getAttribute('data-done');setTimeout(function(){b.textContent=t;},1800);};
  try{navigator.clipboard.writeText('pushtishah02@gmail.com').then(done,function(){});}catch(e){}
});});
/* overlap figure */
each('[data-overlap]',function(fig){
  var note=fig.querySelector('.overlap-note');
  function pick(el){each('.part,.lens-part',function(p){p.classList.remove('on');},fig);el.classList.add('on');
    note.textContent=fig.getAttribute('data-'+el.getAttribute('data-k'));note.classList.add('set');}
  each('.part,.lens-part',function(p){
    p.addEventListener('click',function(){pick(p);});
    p.addEventListener('mouseenter',function(){pick(p);});
    p.addEventListener('focus',function(){pick(p);});
    p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(p);}});
  },fig);
});
/* forest plot rows */
each('[data-forest]',function(f){var note=f.querySelector('.f-note');
  each('.f-row[data-note]',function(r){function on(){each('.f-row',function(x){x.classList.remove('on');},f);r.classList.add('on');note.textContent=r.getAttribute('data-note');}
    r.addEventListener('click',on);r.addEventListener('mouseenter',on);r.addEventListener('focus',on);},f);
});
/* mouth self-check */
each('[data-check]',function(c){var h=c.querySelector('.check-text h3'),p1=c.querySelector('.check-text .do'),p2=c.querySelector('.check-text .look');
  function set(k){each('.zone',function(z){z.classList.toggle('on',z.getAttribute('data-k')===k);},c);
    each('.check-steps button',function(b){var on=b.getAttribute('data-k')===k;b.setAttribute('aria-pressed',on?'true':'false');
      if(on){h.textContent=k+'. '+b.textContent;p1.textContent=b.getAttribute('data-do');p2.textContent=b.getAttribute('data-pre')+': '+b.getAttribute('data-look');}},c);}
  each('.check-steps button',function(b){b.addEventListener('click',function(){set(b.getAttribute('data-k'));});},c);
  each('.zone',function(z){z.addEventListener('click',function(){set(z.getAttribute('data-k'));});
    z.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();set(z.getAttribute('data-k'));}});},c);
  set('1');
});
/* reading progress */
each('.progress',function(bar){var art=bar.parentNode,fill=bar.firstChild;
  function upd(){if(!art.offsetHeight){fill.style.width='0';return;}var r=art.getBoundingClientRect(),h=r.height-window.innerHeight;
    fill.style.width=(h>0?Math.max(0,Math.min(1,-r.top/h))*100:0)+'%';}
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);window.addEventListener('hashchange',function(){setTimeout(upd,60);});upd();
});
/* hero figure: two rotating point clouds (3D, drawn on canvas without a library) */
each('[data-overlap]',function(fig){
  var cv=fig.querySelector('canvas.cloud');if(!cv||!cv.getContext)return;
  var ctx=cv.getContext('2d'),R=105,N=640,pts=[],i;
  for(i=0;i<N;i++){var yy=1-2*(i+0.5)/N,rr=Math.sqrt(1-yy*yy),t=i*2.399963;pts.push([Math.cos(t)*rr,yy,Math.sin(t)*rr]);}
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ang=0.5,tilt=0.32,ttilt=0.32,yaw=0,tyaw=0,t0=null,last=null,running=false,visible=false;
  var COL=[[110,26,45],[63,96,104]],IN=[84,19,34];
  fig.classList.add('has-cloud');
  function scale(){var w=cv.clientWidth,h=cv.clientHeight,d=Math.min(window.devicePixelRatio||1,2);if(!w)return 0;
    var W=Math.round(w*d),H=Math.round(h*d);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}return W/420;}
  function draw(now){
    var s=scale();if(!s)return;
    if(t0===null)t0=now;
    var k=reduce?1:Math.min(1,(now-t0)/1100);k=1-Math.pow(1-k,3);
    var off=116-46*k,sel=fig.getAttribute('data-sel'),list=[],si,j;
    for(si=0;si<2;si++){var cx=si?off:-off,a=(ang+yaw)*(si?-1:1),ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(tilt),st=Math.sin(tilt);
      for(j=0;j<N;j++){var p=pts[j],x=p[0]*ca+p[2]*sa,z=-p[0]*sa+p[2]*ca,y=p[1]*ct-z*st,z2=p[1]*st+z*ct;
        var wx=cx+x*R,wy=y*R,wz=z2*R,ox=wx+cx;list.push([wz,wx,wy,si,(ox*ox+wy*wy+wz*wz)<R*R]);}}
    list.sort(function(m,n){return m[0]-n[0];});
    ctx.clearRect(0,0,cv.width,cv.height);
    for(j=0;j<list.length;j++){var q=list[j],d=(q[0]+R)/(2*R),ins=q[4],c=ins?IN:COL[q[3]];
      var al=ins?0.4+0.6*d:0.16+0.6*d;
      if(sel==='left')al*=(q[3]===0?1.35:0.5);else if(sel==='right')al*=(q[3]===1?1.35:0.5);else if(sel==='core'&&!ins)al*=0.5;
      if(al>1)al=1;
      var rad=(ins?2.0:1.35)*(0.55+0.65*d)*s;
      ctx.fillStyle='rgba('+c[0]+','+c[1]+','+c[2]+','+al.toFixed(3)+')';
      ctx.beginPath();ctx.arc(q[1]*s+210*s,150*s-q[2]*s,rad,0,6.2832);ctx.fill();}
  }
  function frame(now){if(!running)return;if(last!==null)ang+=Math.min(0.05,(now-last)/1000)*0.16;last=now;
    tilt+=(ttilt-tilt)*0.07;yaw+=(tyaw-yaw)*0.07;draw(now);window.requestAnimationFrame(frame);}
  function start(){if(reduce){draw(window.performance.now());return;}if(running)return;running=true;last=null;window.requestAnimationFrame(frame);}
  function stop(){running=false;}
  fig.addEventListener('pointermove',function(e){var r=fig.getBoundingClientRect();tyaw=((e.clientX-r.left)/r.width-0.5)*1.1;ttilt=0.32+((e.clientY-r.top)/r.height-0.5)*0.6;});
  fig.addEventListener('pointerleave',function(){tyaw=0;ttilt=0.32;});
  fig.addEventListener('click',function(){var on=fig.querySelector('.part.on,.lens-part.on');if(on)fig.setAttribute('data-sel',on.getAttribute('data-k'));if(reduce)draw(window.performance.now());});
  fig.addEventListener('focusin',function(){var on=fig.querySelector('.part.on,.lens-part.on');if(on)fig.setAttribute('data-sel',on.getAttribute('data-k'));});
  fig.addEventListener('mouseover',function(){var on=fig.querySelector('.part.on,.lens-part.on');if(on)fig.setAttribute('data-sel',on.getAttribute('data-k'));});
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){visible=en.isIntersecting;if(visible)start();else stop();});}).observe(fig);}else{start();}
  window.addEventListener('resize',function(){if(reduce)draw(window.performance.now());});
});
})();
(function(){
var d=document;
function each(sel,fn,root){var n=(root||d).querySelectorAll(sel);for(var i=0;i<n.length;i++)fn(n[i]);}
/* five-step figure on the home page */
each('[data-pathway]',function(pw){
  var btns=pw.querySelectorAll('.pw-btn'),pans=pw.querySelectorAll('.pw-panel'),fill=pw.querySelector('.pw-fill'),n=btns.length,cur=0;
  function set(i,focus){cur=(i+n)%n;
    for(var k=0;k<n;k++){var on=k===cur;btns[k].setAttribute('aria-pressed',on?'true':'false');
      btns[k].classList.toggle('past',k<cur);pans[k].classList.toggle('on',on);}
    fill.style.width=(cur/(n-1)*100)+'%';if(focus)btns[cur].focus();}
  each('.pw-btn',function(b){
    b.addEventListener('click',function(){set(+b.getAttribute('data-i'));});
    b.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();set(cur+1,true);}
      else if(e.key==='ArrowLeft'){e.preventDefault();set(cur-1,true);}});
  },pw);
  var nx=pw.querySelector('.pw-next');if(nx)nx.addEventListener('click',function(){set(cur+1);});
  function fromHash(){var m=/^#step-([1-5])$/.exec(window.location.hash);if(m){set(+m[1]-1);pw.scrollIntoView();}}
  set(0);fromHash();window.addEventListener('hashchange',fromHash);
});
})();
(function(){
var d=document;
function each(sel,fn,root){var n=(root||d).querySelectorAll(sel);for(var i=0;i<n.length;i++)fn(n[i]);}
/* one graphic per step: build the dot grids and replay the drawing when a step is shown */
each('.dots',function(g){var a=+g.getAttribute('data-a'),b=+g.getAttribute('data-b'),i,e;
  for(i=0;i<100;i++){e=d.createElement('i');if(i<a)e.className='f';else if(i<b)e.className='h';
    e.style.transitionDelay=(i<Math.max(a,b)?i*9:0)+'ms';g.appendChild(e);}});
each('[data-pathway]',function(pw){
  var seen=false;
  function play(){each('.pw-panel',function(p){p.classList.remove('go');},pw);
    var on=pw.querySelector('.pw-panel.on');if(!on||!seen)return;void on.offsetWidth;on.classList.add('go');}
  if('MutationObserver' in window){each('.pw-panel',function(p){
    new MutationObserver(function(){if(p.classList.contains('on')&&!p.classList.contains('go'))play();}).observe(p,{attributes:true,attributeFilter:['class']});},pw);}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){seen=true;play();io.disconnect();}});},{threshold:0.2});
    io.observe(pw.querySelector('.pw-panels'));}else{seen=true;play();}
});
})();