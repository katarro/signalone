(() => {
  const API_KEY = 'change_me';
  const h = (sel) => document.querySelector(sel);
  const api = (path, opts={}) =>
    fetch(path, {
      headers: {'x-api-key': API_KEY, 'Content-Type':'application/json'},
      ...opts,
    }).then(r => r.json());

  async function ping(){
    try{
      const r = await fetch('/health').then(r=>r.json());
      h('#badge').textContent = 'online';
      h('#badge').style.background = '#14532d';
      return r;
    }catch(_){
      h('#badge').textContent = 'offline';
      h('#badge').style.background = '#7f1d1d';
    }
  }

  async function loadVlans(){
    const vlans = await api('/api/vlans');
    h('#vlan-list').innerHTML = '';
    vlans.forEach(v=>{
      const b=document.createElement('div');
      b.className='badge';
      b.textContent=`VID ${v.vid} · ${v.name} · ${v.subnet} · DHCP:${v.dhcp?'ON':'OFF'}`;
      h('#vlan-list').appendChild(b);
    });
  }

  async function loadAPs(){
    const aps = await api('/api/aps');
    const tb = h('#ap-table tbody');
    tb.innerHTML = '';
    aps.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.id||''}</td>
        <td><input value="${a.name||''}"/></td>
        <td><input value="${a.ip||''}"/></td>
        <td><input value="${a.model||''}"/></td>
        <td><input value="${a.loc||''}"/></td>
        <td><input type="number" value="${a.vlan_id||''}"/></td>
        <td><input value="${a.user||''}"/></td>
        <td><input value="${a.pass||''}"/></td>
        <td>
          <button class="btn save">Guardar</button>
          <button class="btn del">Eliminar</button>
        </td>`;
      const [name,ip,model,loc,vlan_id,user,pass] = tr.querySelectorAll('input');
      tr.querySelector('.save').onclick = async ()=>{
        await api(`/api/aps/${a.id}`, {method:'PUT', body:JSON.stringify({
          name:name.value, ip:ip.value, model:model.value, loc:loc.value,
          vlan_id:Number(vlan_id.value||0), user:user.value, pass:pass.value
        })});
        await loadAPs();
      };
      tr.querySelector('.del').onclick = async ()=>{
        await api(`/api/aps/${a.id}`, {method:'DELETE'});
        await loadAPs();
      };
      tb.appendChild(tr);
    });
  }

  // FORM VLAN
  h('#vlan-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f=new FormData(e.target);
    await api('/api/vlans', {method:'POST', body:JSON.stringify({
      vid:Number(f.get('vid')), name:f.get('name'), subnet:f.get('subnet'),
      dhcp: !!f.get('dhcp')
    })});
    e.target.reset(); await loadVlans();
  });

  // FORM AP
  h('#ap-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f=new FormData(e.target);
    await api('/api/aps', {method:'POST', body:JSON.stringify({
      name:f.get('name'), ip:f.get('ip'), model:f.get('model')||'',
      loc:f.get('loc')||'', vlan_id:Number(f.get('vlan_id')||0),
      user:f.get('user')||'ubnt', pass:f.get('pass')||'ubnt'
    })});
    e.target.reset(); await loadAPs();
  });

  (async ()=>{
    await ping(); await loadVlans(); await loadAPs();
    setInterval(ping, 10000);
  })();
})();
