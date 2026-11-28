/* Online transport (Firebase Realtime Database). index.html owns the game logic.  ?room=ABCD&me=ID */
const q=new URLSearchParams(location.search),me=q.get('me'),nm=q.get('n')||'Whale';

if(q.get('room')){
  (async()=>{
    let F;try{F=await import('./fb.js')}catch(err){console.error(err);alert('Firebase is not configured. Edit fb.js.');return}
    const {db,ref,update,set,push,remove,onValue,onChildAdded,onDisconnect}=F;
    const room=q.get('room'),host=!!q.get('host'),R=p=>ref(db,`rooms/${room}/${p}`),P=R(`players/${me}`);
    let off=0;
    onValue(ref(db,'.info/serverTimeOffset'),s=>off=s.val()||0);
    const rematch=()=>{if(!host||st!=='over')return;
      remove(R('events'));
      set(R('meta'),{seed:Math.random()*1e9|0,mode:MP.mode,count:MP.count,round:MP.round+1,startAt:Date.now()+off+4000})};
    mpInit({id:me,name:nm,host,rematch:host?rematch:null,
      tx:m=>{if(m.t==='s')update(P,m);else push(R('events'),{...m,from:me})}});
    onDisconnect(P).update({al:0});
    onValue(R('meta'),s=>{const m=s.val();if(m)mpStart({...m,startAt:m.startAt-off})});
    onValue(R('players'),s=>{const v=s.val()||{};for(const id in v)if(id!==me)mpState(id,v[id])});
    onChildAdded(R('events'),s=>{const e=s.val();if(e&&e.to===me)mpEvent(e)});
    if(host)addEventListener('keydown',e=>{if(e.code==='KeyR')rematch()});
  })();
}
