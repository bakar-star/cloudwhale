/* Accounts + cloud save. Email/password sign-up with a unique username; coins, best, skins, boosts and the
   tutorial flag live in Firebase under users/<uid> and are guarded by database.rules.json. */
const C=window.cloud={on:false,state:'pending'};
const setState=(s,n)=>{C.state=s;window.cloudAuth&&cloudAuth(s,n)};
(async()=>{
let F;try{F=await import('./fb.js')}catch(e){console.warn('cloud: firebase unavailable',e);setState('off');return}
const {db,auth,ref,get,set,update,serverTimestamp,authReady,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendPasswordResetEmail}=F;
let S=null,U=null,q=Promise.resolve();
const need=()=>{if(!U)throw {code:'app/signed-out'}};
const sync=async()=>{S=(await get(U)).val();return S};
const run=fn=>{const p=q.then(()=>{need();return fn()});q=p.catch(()=>{});return p};
/* if the server refuses something, the server copy wins */
const refuse=async e=>{console.warn('cloud: refused',e);try{window.cloudApply&&cloudApply(await sync(),true)}catch(_){}throw e};
/* load the profile, or create it the first time (the username claim is what makes names unique) */
async function profile(user){
  const R=ref(db,'users/'+user.uid);let s=await get(R);
  if(!s.exists()){
    const name=user.displayName;if(!name)throw {code:'app/no-name'};
    const cl=ref(db,'usernames/'+name.toLowerCase()),c=await get(cl);
    if(!c.exists())await set(cl,user.uid);else if(c.val()!==user.uid)throw {code:'app/name-taken'};
    await set(R,{name,coins:0,best:0,skin:'0',owned:{0:true},n:1,t:serverTimestamp(),joined:serverTimestamp(),tut:false});
    s=await get(R);
  }
  U=R;S=s.val();
}
const enter=()=>{C.on=true;C.name=S.name;setState('in',S.name);window.cloudApply&&cloudApply(S)};

C.signup=async(name,email,pw)=>{
  if(!/^[A-Za-z0-9_]{3,16}$/.test(name))throw {code:'app/bad-name'};
  const cred=await createUserWithEmailAndPassword(auth,email,pw);
  try{await set(ref(db,'usernames/'+name.toLowerCase()),cred.user.uid)}
  catch(e){await cred.user.delete().catch(()=>{});throw {code:'app/name-taken'}}
  await updateProfile(cred.user,{displayName:name});
  await profile(cred.user);enter();
};
C.login=async(email,pw)=>{const cred=await signInWithEmailAndPassword(auth,email,pw);await profile(cred.user);enter()};
C.reset=email=>sendPasswordResetEmail(auth,email);
C.logout=async()=>{await signOut(auth);U=S=null;C.on=false;C.name='';setState('out');window.cloudLoggedOut&&cloudLoggedOut()};

C.earn=(coins,best)=>run(async()=>{const u={};if(coins>S.coins)u.coins=coins;if(best>S.best)u.best=best;if(!Object.keys(u).length)return;u.t=serverTimestamp();try{await update(U,u);await sync()}catch(e){await refuse(e)}});
C.buy=(kind,id,price)=>run(async()=>{const u={coins:S.coins-price,n:S.n+1};
  if(kind==='boost')u['ownedB/'+id]=true;else{u['owned/'+id]=true;u.skin=String(id)}
  try{await update(U,u);await sync()}catch(e){await refuse(e)}});
C.equip=i=>run(async()=>{try{await update(U,{skin:String(i)});await sync()}catch(e){await refuse(e)}});
C.tutDone=()=>run(async()=>{if(S.tut)return;try{await update(U,{tut:true});await sync()}catch(e){await refuse(e)}});

try{
  const u=await authReady;
  if(u){await profile(u);enter()}else setState('out');
}catch(e){console.warn('cloud: could not load account',e);setState('off')}
})();
