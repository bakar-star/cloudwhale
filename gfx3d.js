/* Babylon.js backdrop for Cloud Whale: shader sky/space/neon zone, animated sea, 3D donuts, bloom, motes.
   Whale, hazards, HUD and menus stay on the 2D canvas above. If anything fails the 2D art takes over. */
(function(){
const G=window.GFX=window.GFX||{ready:false};
if(!window.BABYLON){console.warn('gfx3d: Babylon.js not loaded, using 2D art');return}
const B=BABYLON,W=640,H=360,cv=document.getElementById('b');
const fail=e=>{console.warn('gfx3d: falling back to 2D',e);G.ready=false;if(cv)cv.style.display='none'};
try{
const eng=new B.Engine(cv,true,{stencil:false,powerPreference:'high-performance'},true);
eng.setHardwareScalingLevel(1/Math.min(2,window.devicePixelRatio||1));
cv.addEventListener('webglcontextlost',()=>fail('context lost'));
const sc=new B.Scene(eng);sc.clearColor=new B.Color4(0,0,0,1);
const cam=new B.FreeCamera('cam',new B.Vector3(W/2,-H/2,-200),sc);cam.setTarget(new B.Vector3(W/2,-H/2,0));
cam.mode=B.Camera.ORTHOGRAPHIC_CAMERA;cam.orthoLeft=0;cam.orthoRight=W;cam.orthoTop=0;cam.orthoBottom=-H;cam.minZ=1;cam.maxZ=400;
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
/* bloom + vignette + antialiasing */
const pl=new B.DefaultRenderingPipeline('pl',false,sc,[cam]);pl.fxaaEnabled=true;pl.bloomEnabled=true;pl.bloomThreshold=.78;pl.bloomWeight=.32;pl.bloomKernel=40;pl.bloomScale=.5;
pl.imageProcessingEnabled=true;pl.imageProcessing.vignetteEnabled=true;pl.imageProcessing.vignetteWeight=1.4;pl.imageProcessing.contrast=1.08;
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
 sc.render()}catch(e){fail(e)}};
G.hide=()=>{cv.style.visibility='hidden'};
G.ready=true;
}catch(e){fail(e)}
})();
