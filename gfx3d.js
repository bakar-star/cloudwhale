/* Babylon.js backdrop for Cloud Whale: shader sky/space/neon zone, animated sea, 3D donuts, bloom, motes.
   Whale, hazards, HUD and menus stay on the 2D canvas above. If anything fails the 2D art takes over. */
(function(){
const G=window.GFX=window.GFX||{ready:false};
if(/[?&]2d=1/.test(location.search)||!window.BABYLON){console.warn('gfx3d: Babylon.js not loaded, using 2D art');return}
const B=BABYLON,W=640,H=360,cv=document.getElementById('b');
const fail=e=>{console.warn('gfx3d: falling back to 2D',e);G.ready=false;if(cv)cv.style.display='none'};
try{
const eng=new B.Engine(cv,true,{stencil:false,powerPreference:'high-performance'},true);
cv.addEventListener('webglcontextlost',()=>fail('context lost'));
const sc=new B.Scene(eng);sc.clearColor=new B.Color4(0,0,0,1);
const cam=new B.FreeCamera('cam',new B.Vector3(W/2,-H/2,-200),sc);cam.setTarget(new B.Vector3(W/2,-H/2,0));
cam.mode=B.Camera.ORTHOGRAPHIC_CAMERA;cam.orthoLeft=-W/2;cam.orthoRight=W/2;cam.orthoTop=H/2;cam.orthoBottom=-H/2;cam.minZ=1;cam.maxZ=400;
const hl=new B.HemisphericLight('h',new B.Vector3(0,1,-.6),sc);hl.intensity=.75;
const dl=new B.DirectionalLight('d',new B.Vector3(.35,-.55,1),sc);dl.intensity=.9;
const VS='precision highp float;attribute vec3 position;attribute vec2 uv;uniform mat4 worldViewProjection;varying vec2 vUV;void main(){vUV=uv;gl_Position=worldViewProjection*vec4(position,1.);}';
function shader(name,fs,uni){B.Effect.ShadersStore[name+'VertexShader']=VS;B.Effect.ShadersStore[name+'FragmentShader']=fs;
 const m=new B.ShaderMaterial(name,sc,{vertex:name,fragment:name},{attributes:['position','uv'],uniforms:['worldViewProjection'].concat(uni)});
 m.backFaceCulling=false;m.onError=(e,err)=>fail(err);return m}
const NOISE='float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}';
/* sky + space + neon zone in one full-screen shader */
const bgM=shader('cwbg','precision highp float;varying vec2 vUV;uniform float time,scroll,spLine,gv,sun;uniform vec3 cTop,cMid,cBot;'+NOISE+
'void main(){vec2 uv=vUV;vec2 px=vec2(uv.x*640.,(1.-uv.y)*360.);'+
'vec3 col=uv.y>.5?mix(cMid,cTop,(uv.y-.5)*2.):mix(cBot,cMid,uv.y*2.);'+
'float sm=smoothstep(spLine-.03,spLine+.03,uv.y);'+
'float d=length((uv-vec2(.84,.872))*vec2(1.78,1.));col+=sun*vec3(1.,.96,.78)*(exp(-d*7.)*.55+exp(-d*2.2)*.16);'+
'float c=fbm(vec2(uv.x*3.+scroll*.0006+time*.01,uv.y*5.));col=mix(col,vec3(1.),smoothstep(.55,.82,c)*.22*sun*(1.-sm));'+
'float nb=fbm(uv*vec2(3.,2.)+vec2(scroll*.0003,time*.01));vec3 neb=mix(vec3(.35,.2,.8),vec3(.9,.25,.6),fbm(uv*3.+7.))*smoothstep(.35,.85,nb)*.5;'+
'vec2 q=px/4.+vec2(-scroll*.03,0.);float r=h(floor(q));float star=step(.985,r)*(.5+.5*sin(time*2.+r*60.));'+
'col+=sm*(neb+vec3(star));'+
'float cb=smoothstep(.45,.7,fbm(vec2(uv.x*6.+scroll*.001,(spLine-uv.y)*14.)))*smoothstep(spLine-.12,spLine-.005,uv.y)*(1.-smoothstep(spLine,spLine+.03,uv.y));col=mix(col,vec3(.95,.97,1.),cb*.9);'+
'if(gv>0.){vec3 bm=vec3(0.);for(int i=0;i<6;i++){float fi=float(i);float x=(fi+.5)/6.;float sw=sin(time*1.3+fi*1.7)*.4;float dx=abs(uv.x-(x+sw*(1.-uv.y)*.6));float w=.004+(1.-uv.y)*.05;float b=smoothstep(w,0.,dx)*uv.y;bm+=b*(.5+.5*cos(6.28*(fi/6.+time*.1+vec3(0.,.33,.67))));}'+
'float bi=floor(uv.x*32.);float bh=.05+.2*abs(sin(time*3.+bi*.7)*cos(time*1.7+bi*.31));float eq=step(uv.y,bh)*step(.1,fract(uv.x*32.));'+
'col+=gv*(bm*.4+eq*(.5+.5*cos(6.28*(bi/32.+time*.1+vec3(0.,.33,.67))))*.45);}'+
'gl_FragColor=vec4(col,1.);}',['time','scroll','spLine','gv','sun','cTop','cMid','cBot']);
const bg=B.MeshBuilder.CreatePlane('bg',{width:W,height:H},sc);bg.position.set(W/2,-H/2,50);bg.material=bgM;
/* animated sea with caustics */
const seaM=shader('cwsea','precision highp float;varying vec2 vUV;uniform float time,bgx;'+
'void main(){float x=vUV.x*660.-10.,py=(1.-vUV.y)*400.;float wave=8.+sin(x*.03+time*2.+bgx*.008)*4.;float dp=(py-wave)/290.;'+
'float a=smoothstep(0.,1.5,py-wave);vec3 col=mix(vec3(.10,.62,.77),vec3(.02,.16,.27),smoothstep(0.,1.,dp));'+
'float cs=sin(x*.05+time)+sin(py*.07-time*1.3)+sin((x+py)*.04+time*.7);col+=pow(max(0.,cs/3.),3.)*(1.-clamp(dp,0.,1.))*.28*vec3(.6,1.,1.);'+
'col+=smoothstep(.07,0.,dp)*vec3(.3,.5,.55);gl_FragColor=vec4(col,a);}',['time','bgx']);
seaM.needAlphaBlending=()=>true;
const sea=B.MeshBuilder.CreatePlane('sea',{width:660,height:400},sc);sea.position.set(W/2,-300,40);sea.material=seaM;
/* 3D donuts (dough, frosting, sprinkles), pooled */
const std=(r,g,b,e)=>{const m=new B.StandardMaterial('m',sc);m.diffuseColor=new B.Color3(r,g,b);m.specularColor=new B.Color3(.5,.5,.5);m.specularPower=32;m.emissiveColor=new B.Color3(r*(e||.22),g*(e||.22),b*(e||.22));return m};
const doughM=std(.94,.64,.35),frostM=[std(1,.44,.68),std(.96,.97,1),std(.42,.25,.18)],spr=[std(1,1,1,.5),std(.37,.78,1,.5),std(1,.88,.29,.5),std(.48,.94,.54,.5)];
const pool=[];
function make(){const root=new B.TransformNode('r',sc);
 const dough=B.MeshBuilder.CreateTorus('d',{diameter:17,thickness:7.5,tessellation:24},sc);dough.rotation.x=Math.PI/2;dough.material=doughM;dough.parent=root;
 const frost=B.MeshBuilder.CreateTorus('f',{diameter:16.5,thickness:5.6,tessellation:24},sc);frost.rotation.x=Math.PI/2;frost.scaling.y=.6;frost.position.z=-2.2;frost.material=frostM[0];frost.parent=root;
 for(let i=0;i<5;i++){const s=B.MeshBuilder.CreateBox('s',{width:3,height:.9,depth:.9},sc),a=i*1.256+.4;s.position.set(Math.cos(a)*8.3,Math.sin(a)*8.3,-4.4);s.rotation.z=a+1.2;s.material=spr[i%4];s.parent=root}
 root.setEnabled(false);return{root,frost}}
/* drifting light motes */
const dt=new B.DynamicTexture('dot',64,sc,false),cx=dt.getContext(),gr=cx.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=gr;cx.fillRect(0,0,64,64);dt.update();
const ps=new B.ParticleSystem('motes',120,sc);ps.particleTexture=dt;ps.emitter=new B.Vector3(W+20,-H/2,10);ps.minEmitBox=new B.Vector3(0,-H/2,0);ps.maxEmitBox=new B.Vector3(0,H/2,0);
ps.direction1=new B.Vector3(-1,.1,0);ps.direction2=new B.Vector3(-1,-.1,0);ps.minEmitPower=25;ps.maxEmitPower=70;ps.emitRate=9;ps.minLifeTime=6;ps.maxLifeTime=11;ps.minSize=1.5;ps.maxSize=4.5;
ps.color1=new B.Color4(1,1,.9,.5);ps.color2=new B.Color4(.8,.9,1,.4);ps.colorDead=new B.Color4(1,1,1,0);ps.blendMode=B.ParticleSystem.BLENDMODE_ONEONE;ps.start();

/* ---- 3D whale, cash and obstacles (primitives) ---- */
const WH=new B.Color3(1,1,1),hc=new Map(),hexC=h=>{let c=hc.get(h);if(!c){c=/^#[0-9a-f]{6}$/i.test(h)?B.Color3.FromHexString(h):new B.Color3(.6,.6,.6);hc.set(h,c)}return c};
function P(root,t,mat,o,pos,scl,rot){let m;
 if(t==='s')m=B.MeshBuilder.CreateSphere('p',{diameter:1,segments:12},sc);
 else if(t==='b')m=B.MeshBuilder.CreateBox('p',{size:1},sc);
 else if(t==='i')m=B.MeshBuilder.CreateIcoSphere('p',{radius:.5,subdivisions:1,flat:true},sc);
 else m=B.MeshBuilder.CreateCylinder('p',Object.assign({tessellation:20},o),sc);
 if(scl)m.scaling.set(scl[0],scl[1],scl[2]);if(pos)m.position.set(pos[0],pos[1],pos[2]);if(rot)m.rotation.set(rot[0],rot[1],rot[2]);m.material=mat;m.parent=root;return m}
const wp=[];
function mkWhale(){const r=new B.TransformNode('w',sc),mb=std(.5,.2,.7,.15),mbel=std(.9,.8,.95,.2),mt=std(.4,.1,.5,.15),mh=std(.97,.79,.28,.3),mw=std(1,1,1,.4),mk=std(0,0,0,0),ms=std(.9,.15,.15,.2),mp=std(.45,.45,.55,.2);
 P(r,'s',mb,0,[-3,0,0],[74,36,32]);P(r,'s',mbel,0,[0,-7,-4],[60,20,28]);
 const tail=new B.TransformNode('t',sc);tail.parent=r;tail.position.set(-40,0,0);P(tail,'s',mt,0,[-14,5,0],[16,28,5]);P(tail,'s',mt,0,[-6,0,0],[18,10,8]);
 P(r,'s',mt,0,[2,-5,-15],[20,9,4],[0,0,.5]);
 P(r,'c',mh,{height:38,diameterTop:0,diameterBottom:8},[48,6,0],null,[0,0,-Math.PI/2+.2]);
 for(const x of[17,27]){P(r,'s',mw,0,[x,5,-15],[10,11,6]);P(r,'s',mk,0,[x+1.5,4.5,-18],[5,6,3])}
 P(r,'c',mp,{height:8,diameter:2},[2,20,0]);const blade=P(r,'b',mp,0,[2,24,0],[34,1,3]);
 for(const x of[-3,10]){P(r,'c',mp,{height:8,diameter:3},[x,-19,-3]);P(r,'b',ms,0,[x,-23,-3],[10,5,9])}
 r.setEnabled(false);return{r,mb,mbel,mt,tail,blade,mats:[mb,mbel,mt,mh,mw,mk,ms,mp]}}
function setWhale(q,w,p){const a=hexC(w.a);q.mb.diffuseColor.copyFrom(hexC(w.b));q.mb.emissiveColor.copyFrom(hexC(w.b).scale(.15));
 q.mbel.diffuseColor.copyFrom(B.Color3.Lerp(a,WH,.6));q.mt.diffuseColor.copyFrom(hexC(w.t));
 for(const m of q.mats)m.alpha=w.al;
 q.r.setEnabled(true);q.r.position.set(w.x,-(w.y+p.cam),-30);q.r.rotation.set(0,.25,-w.ang);q.r.scaling.setAll(w.sc);
 q.tail.rotation.z=Math.sin(p.t*14)*.35;q.blade.rotation.y=p.t*30}
const obs=new Map(),HAS=new Set(['coin','cloud','storm','toilet','burger','boat','balloon','ball','dreidel','moon','ufo','disco','crow','bee','meteor','rock']);
function mkObs(k){const r=new B.TransformNode('o',sc);let wings=null;
 switch(k){
 case'coin':{P(r,'b',std(.3,.75,.35,.3),0,[0,0,0],[22,12,3]);P(r,'b',std(.9,.82,.55,.3),0,[0,0,-.3],[6,12.5,3.4]);break}
 case'cloud':case'storm':{const m=k==='cloud'?std(.97,.98,1,.55):std(.35,.38,.5,.2);P(r,'s',m,0,[-14,-2,0],[32,28,28]);P(r,'s',m,0,[2,5,0],[42,36,32]);P(r,'s',m,0,[18,-2,0],[34,28,28]);P(r,'b',m,0,[2,-8,0],[44,12,26]);break}
 case'toilet':{const m=std(.96,.97,1,.35);P(r,'c',m,{height:14,diameter:30},[0,-6,0]);P(r,'b',m,0,[0,10,6],[26,24,10]);P(r,'c',m,{height:10,diameter:16},[0,-16,0]);break}
 case'burger':{const bun=std(.88,.6,.28,.3);P(r,'c',bun,{height:8,diameter:44},[0,-10,0]);P(r,'c',std(.4,.2,.1,.2),{height:8,diameter:46},[0,-3,0]);P(r,'c',std(.3,.75,.3,.3),{height:4,diameter:48},[0,2,0]);P(r,'s',bun,0,[0,8,0],[44,22,44]);break}
 case'boat':{P(r,'b',std(.6,.38,.2,.25),0,[0,-4,0],[58,14,20]);P(r,'c',std(.4,.25,.12,.2),{height:30,diameter:2},[4,14,0]);P(r,'b',std(.9,.2,.2,.3),0,[-10,6,0],[10,8,8]);break}
 case'balloon':{P(r,'s',std(.95,.25,.25,.35),0,[0,6,0],[44,50,44]);P(r,'s',std(1,.9,.3,.4),0,[0,6,0],[10,51,45]);P(r,'b',std(.55,.35,.2,.2),0,[0,-26,0],[14,10,12]);break}
 case'ball':{P(r,'s',std(1,.45,.7,.35),0,[0,0,0],[40,40,40]);P(r,'s',std(1,1,1,.4),0,[0,0,0],[8,41,41]);break}
 case'dreidel':{const m=std(.25,.5,.95,.3);P(r,'b',m,0,[0,6,0],[28,28,28]);P(r,'c',m,{height:16,diameterTop:28,diameterBottom:0},[0,-14,0]);P(r,'c',std(.9,.8,.5,.2),{height:8,diameter:4},[0,24,0]);break}
 case'moon':{P(r,'s',std(1,.95,.7,.45),0,[0,0,0],[46,46,46]);const c=std(.85,.8,.55,.2);P(r,'s',c,0,[-8,6,-18],[10,10,5]);P(r,'s',c,0,[8,-8,-19],[7,7,4]);break}
 case'ufo':{P(r,'s',std(.7,.75,.85,.4),0,[0,0,0],[56,14,56]);P(r,'s',std(.5,.9,1,.5),0,[0,7,0],[26,22,26]);for(const x of[-18,0,18])P(r,'s',std(1,.9,.3,1),0,[x,-1,-20],[5,5,5]);break}
 case'disco':{P(r,'s',std(.85,.88,.95,.9),0,[0,0,0],[44,44,44]);break}
 case'crow':{P(r,'s',std(.08,.08,.1,.1),0,[0,0,0],[26,13,11]);P(r,'s',std(.08,.08,.1,.1),0,[12,3,0],[11,10,9]);P(r,'c',std(1,.65,.15,.3),{height:7,diameterTop:0,diameterBottom:4},[19,3,0],null,[0,0,-Math.PI/2]);
  const wm=std(.12,.12,.16,.1);wings=[P(r,'b',wm,0,[-2,9,0],[6,18,2]),P(r,'b',wm,0,[-2,-9,0],[6,18,2])];break}
 case'bee':{P(r,'s',std(1,.82,.1,.4),0,[0,0,0],[18,13,13]);const bk=std(.05,.05,.05,0);P(r,'b',bk,0,[-2,0,0],[3,13.5,13.5]);P(r,'b',bk,0,[4,0,0],[3,12,12]);
  const wm=std(.9,.95,1,.5);wings=[P(r,'s',wm,0,[0,8,2],[8,12,2]),P(r,'s',wm,0,[0,8,-2],[8,12,2])];break}
 case'meteor':{P(r,'s',std(1,.55,.2,.9),0,[0,0,0],[18,18,18]);P(r,'c',std(1,.5,.15,.8),{height:50,diameterTop:0,diameterBottom:12},[25,19,2],null,[0,0,.65-Math.PI/2]);break}
 case'rock':{P(r,'i',std(.5,.48,.5,.15),0,[0,0,0],[40,36,36]);break}
 default:return null}
 return{r,wings}}
G.has=k=>HAS.has(k);G.whale3d=true;
const cT=new B.Color3(),cM=new B.Color3(),cB=new B.Color3();let lw=0,lh=0;
G.update=p=>{if(!G.ready)return;try{
 cv.style.visibility='visible';
 if(cv.clientWidth!==lw||cv.clientHeight!==lh){lw=cv.clientWidth;lh=cv.clientHeight;eng.resize()}
 cT.set(p.top[0],p.top[1],p.top[2]);cM.set(p.mid[0],p.mid[1],p.mid[2]);cB.set(p.bot[0],p.bot[1],p.bot[2]);
 bgM.setFloat('time',p.t);bgM.setFloat('scroll',p.bgx);bgM.setFloat('spLine',p.sp);bgM.setFloat('gv',p.gv);bgM.setFloat('sun',p.sun);bgM.setColor3('cTop',cT);bgM.setColor3('cMid',cM);bgM.setColor3('cBot',cB);
 seaM.setFloat('time',p.t);seaM.setFloat('bgx',p.bgx);sea.position.y=-(p.y0-8)-200;sea.setEnabled(p.y0<H+10);
 let u=0;for(const o of p.d){if(u>=pool.length){if(pool.length>=90)break;pool.push(make())}const d=pool[u++];d.root.setEnabled(true);
  d.root.position.set(o.x,-(o.y+Math.sin(p.t*4+o.x*.05)*2.5+p.cam),0);d.root.rotation.set(Math.sin(p.t*1.1+o.x*.03)*.35,Math.sin(p.t*1.5+o.x*.05)*.6,0);d.frost.material=frostM[o.v||0]}
 for(let i=u;i<pool.length;i++)pool[i].root.setEnabled(false);
 let wi=0;for(const w of(p.w||[])){if(wi>=wp.length){if(wp.length>=8)break;wp.push(mkWhale())}setWhale(wp[wi++],w,p)}for(let i=wi;i<wp.length;i++)wp[i].r.setEnabled(false);
 const seen=new Set();for(const o of(p.o||[])){let n=obs.get(o.ref);if(!n){n=mkObs(o.k);if(!n)continue;obs.set(o.ref,n)}seen.add(o.ref);
  n.r.setEnabled(true);n.r.position.set(o.x,-(o.y+p.cam),-5);n.r.scaling.set(o.sc,o.sc*(o.hit?.8:1),o.sc);
  n.r.rotation.z=o.k==='rock'?-o.rot:o.k==='coin'?Math.sin(p.t*3+o.ph)*.15:Math.sin(p.t*2+o.x*.02)*.05;n.r.rotation.y=Math.sin(p.t*1.2+o.x*.03)*.35;
  if(n.wings){const f=Math.sin(p.t*(o.k==='bee'?50:14)+o.ph)*.8;n.wings.forEach((m,i)=>m.rotation.z=(i?-1:1)*f)}}
 for(const[ref,n]of obs)if(!seen.has(ref)){n.r.getChildMeshes().forEach(m=>m.dispose());n.r.dispose();obs.delete(ref)}
 sc.render()}catch(e){fail(e)}};
G.hide=()=>{cv.style.visibility='hidden'};
G.ready=true;
}catch(e){fail(e)}
})();
