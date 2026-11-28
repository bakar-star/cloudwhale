/* Cloud save: coins, best, skins, boosts and the tutorial flag live in Firebase under users/<uid>.
   The security rules in database.rules.json check every change (shop prices, earning speed), so editing the page cannot give free coins. */
const C=window.cloud={on:false};
(async()=>{
let F;try{F=await import('./fb.js')}catch(e){console.warn('cloud: firebase unavailable',e);return}
const {db,ref,get,set,update,serverTimestamp,authReady}=F;
let S,U,q=Promise.resolve();
try{
  const uid=await authReady;if(!uid)throw new Error('not signed in');
  U=ref(db,'users/'+uid);let s=await get(U);
  if(!s.exists()){await set(U,{coins:0,best:0,skin:'0',owned:{0:true},n:1,t:serverTimestamp(),tut:false});s=await get(U)}
  S=s.val();
}catch(e){console.warn('cloud: playing offline',e);return}
const sync=async()=>{S=(await get(U)).val();return S};
const run=fn=>{const p=q.then(fn);q=p.catch(()=>{});return p};
/* if the server refuses something, the server copy wins */
const refuse=async e=>{console.warn('cloud: refused',e);try{window.cloudApply&&cloudApply(await sync(),true)}catch(_){}throw e};
C.on=true;
C.earn=(coins,best)=>run(async()=>{const u={};if(coins>S.coins)u.coins=coins;if(best>S.best)u.best=best;if(!Object.keys(u).length)return;u.t=serverTimestamp();try{await update(U,u);await sync()}catch(e){await refuse(e)}});
C.buy=(kind,id,price)=>run(async()=>{const u={coins:S.coins-price,n:S.n+1};
  if(kind==='boost')u['ownedB/'+id]=true;else{u['owned/'+id]=true;u.skin=String(id)}
  try{await update(U,u);await sync()}catch(e){await refuse(e)}});
C.equip=i=>run(async()=>{try{await update(U,{skin:String(i)});await sync()}catch(e){await refuse(e)}});
C.tutDone=()=>run(async()=>{if(S.tut)return;try{await update(U,{tut:true});await sync()}catch(e){await refuse(e)}});
window.cloudApply&&cloudApply(S);
})();
