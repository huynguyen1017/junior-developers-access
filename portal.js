'use strict';
const statusEl=document.getElementById('status');
const openEl=document.getElementById('open');
const refreshEl=document.getElementById('refresh');
let pending=false,forwarded=false;
function destination(value){
  const u=new URL(value);
  if(u.protocol!=='https:'||!u.hostname.endsWith('.trycloudflare.com')||u.username||u.password||u.search||u.hash||!['','/'].includes(u.pathname))throw new Error('Unrecognized service address');
  return u;
}
async function load(){
  if(pending)return;
  pending=true;refreshEl.disabled=true;statusEl.textContent='Checking the latest saved connection…';
  try{
    const response=await fetch('connection.json?v='+Date.now(),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(6000)});
    if(!response.ok)throw new Error('Connection record is temporarily unavailable');
    const text=await response.text();if(text.length>4096)throw new Error('Connection record is too large');
    const data=JSON.parse(text),target=destination(data.url);
    if(typeof data.updated_at!=='number'||!Number.isFinite(data.updated_at))throw new Error('Connection timestamp is missing');
    const invite=new URLSearchParams(location.hash.slice(1)).get('invite');
    if(invite&&/^[a-zA-Z0-9_-]{24,512}$/.test(invite))target.hash='invite='+invite;
    openEl.href=target.href;openEl.hidden=false;
    document.getElementById('address').textContent=target.origin;
    document.getElementById('updated').textContent='Address updated: '+new Date(data.updated_at*1000).toLocaleString();
    statusEl.textContent='Latest address available. Open Junior to check its current availability.';
    if(target.hash&&!forwarded){forwarded=true;statusEl.textContent='Opening your invitation on Junior Developers…';location.replace(target.href);}
  }catch(error){openEl.hidden=true;statusEl.textContent='The connection record could not be loaded. Your bookmark is unchanged; try Refresh connection shortly.';}
  finally{pending=false;refreshEl.disabled=false;}
}
refreshEl.addEventListener('click',load);
load();
