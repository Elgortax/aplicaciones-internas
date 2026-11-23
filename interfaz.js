/* Interfaz sin dependencias. Abrir index.html directamente. */
(function iniciar(){
  'use strict';
  const db = Terreno.read();
  const $ = id => document.getElementById(id);
  const nav = [
    ['inicio','Vista general','◩',''],
    ['cartera','Gestión de cartera','▤','Consulta lotes, registra abonos y revisa los saldos por cobrar.'],
    ['evaluador','Evaluador de loteos','∆','Ajusta precios y costos para comparar el margen y el punto de equilibrio.'],
    ['nexo','Nexo Tierra','◎','Compara oportunidades por superficie, acceso y precio por hectárea.'],
    ['proyectos','Estado de proyectos','◫','Revisa el próximo hito y registra los avances de cada proyecto.'],
    ['tareas','Tablero de tareas','☷','Asigna compromisos y mueve el trabajo entre etapas.'],
    ['sala','Sala de reuniones','◷','Consulta la agenda y reserva la sala en bloques de media hora.'],
    ['oficina','Gestión de oficina','⊞','Registra préstamos y devoluciones de equipos compartidos.']
  ];
  const num = n => Number(n).toLocaleString('es-CL',{maximumFractionDigits:1});
  const money = n => '$'+num(Math.round(n));
  const million = n => '$'+num(n/1e6)+' M';
  const html = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time = m => [Math.floor(m/60),m%60].map(n=>String(n).padStart(2,'0')).join(':');
  const dateLabel = d => new Date(d+'T12:00:00').toLocaleDateString('es-CL',{day:'numeric',month:'short'});
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2);
  const main=$('contenido'), dialog=$('dialog');
  let module='inicio', filter='Todos', date=Terreno.day(), onlySaved=false, search='', handler=null, timer, resized;
  function button(action,label,id='',primary=false){
    return `<button type="button" class="${primary?'primary':'secondary'}" data-action="${action}" data-id="${html(id)}">${html(label)}</button>`;
  }
  function stat(label,value,detail){
    return `<div class="stat"><span class="label">${html(label)}</span><strong>${html(value)}</strong><small>${html(detail)}</small></div>`;
  }
  const metrics = (...items)=>`<div class="metrics">${items.join('')}</div>`;
  const badge = (text,color='')=>`<span class="pill ${color}">${html(text)}</span>`;
  const meter = pct=>`<div class="meter" aria-hidden="true"><i style="width:${Math.min(100,Math.max(0,pct))}%"></i></div>`;
  const empty = text=>`<p class="empty">${html(text)}</p>`;
  function table(head,rows){
    return `<div class="tablewrap"><table><thead><tr>${head.map(t=>`<th scope="col">${html(t)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${head.length}">${empty('No hay registros con esta selección.')}</td></tr>`}</tbody></table></div>`;
  }
  function field(name,label,type='text',value='',attrs=''){
    return `<label>${html(label)}<input required name="${name}" type="${type}" value="${html(value)}" ${attrs}></label>`;
  }
  function select(name,label,values){
    return `<label>${html(label)}<select name="${name}">${values.map(([v,t])=>`<option value="${html(v)}">${html(t)}</option>`).join('')}</select></label>`;
  }
  function notify(msg){clearTimeout(timer);$('toast').textContent=msg;timer=setTimeout(()=>$('toast').textContent='',3200)}
  function persist(){
    const saved=Terreno.save(db);
    $('saveStatus').textContent=saved?'Cambios en este navegador':'Cambios solo en esta sesión';
  }
  function modal(title,body,submit,callback){
    $('dialogTitle').textContent=title;$('fields').innerHTML=body;$('error').textContent='';$('submit').textContent=submit;handler=callback;
    dialog.showModal();
  }
  $('form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const values=Object.fromEntries(new FormData(event.target));
      for(const key of Object.keys(values)){values[key]=values[key].trim();if(!values[key])throw Error('Completa los campos antes de guardar.')}
      const msg=handler(values);persist();dialog.close();render();notify(msg);
    }catch(error){$('error').textContent=error.message}
  });
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  function home(){
    const active=db.tasks.filter(t=>t.state<2).length;
    return `<section class="hero"><canvas id="landscape" aria-hidden="true"></canvas><span class="label">Alexis Rodríguez · Portafolio</span><h1>Operación inmobiliaria.</h1><p>Siete aplicaciones para explorar cómo se evalúa un terreno, se administra una cartera y se coordina una oficina.</p></section>`
    +metrics(stat('Cartera activa',db.lots.filter(l=>l.status==='Promesado').length,'Lotes con promesa'),stat('Proyectos',db.projects.length,'Con hitos de seguimiento'),stat('Por resolver',active,'Tareas abiertas'))
    +`<div class="section"><h2>Explorar las aplicaciones</h2></div><div class="cards">${nav.slice(1).map(([id,title,sym,desc])=>`<a class="card" href="#${id}"><span><span class="symbol" aria-hidden="true">${sym}</span><span class="go" aria-hidden="true">↗</span></span><h3>${title}</h3><p>${desc}</p></a>`).join('')}</div>`;
  }
  function terrain(){
    const canvas=$('landscape');if(!canvas)return;
    const bounds=canvas.getBoundingClientRect(),w=bounds.width,h=bounds.height,r=Math.min(2,window.devicePixelRatio||1);
    canvas.width=w*r;canvas.height=h*r;
    const ctx=canvas.getContext('2d');ctx.scale(r,r);
    const gradient=ctx.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#122120');gradient.addColorStop(.68,'#203d34');gradient.addColorStop(1,'#142523');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#577b654a';for(let x=7;x<w;x+=18)for(let y=7;y<h;y+=18)ctx.fillRect(x,y,1.1,1.1);
    for(let line=0;line<58;line++){
      const radius=10+line*6.4;ctx.beginPath();
      for(let p=0;p<=320;p++){
        const a=p*Math.PI*2/320;
        const shape=1+.14*Math.sin(3*a+line*.016)+.08*Math.cos(5*a-.48)+.04*Math.cos(8*a);
        let x=radius*shape*Math.cos(a)*1.52, y=radius*shape*Math.sin(a)*.77;
        const xx=w*.83+x*.93+y*.36, yy=h*.48-x*.25+y*.97;
        p?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);
      }
      ctx.closePath();ctx.strokeStyle=line%5===0?'#bded92a0':'#75af8c85';ctx.lineWidth=line%5===0?1.35:.75;ctx.stroke();
    }
  }
  function lotTable(){
    const rows=db.lots.filter(l=>(filter==='Todos'||l.status===filter)&&(l.id+' '+l.project).toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))).map(l=>{
      const balance=l.status==='Disponible'?'—':money(l.price-l.paid);
      return `<tr><td><strong>${html(l.id)}</strong><small>${html(l.project)}</small></td><td>${badge(l.status,l.status==='Disponible'?'gold':'')}</td><td class="num">${money(l.price)}</td><td class="num">${balance}</td><td>${button('lot','Ver ficha',l.id)}</td></tr>`;
    });
    return table(['Lote / proyecto','Estado','Precio','Saldo','Ficha'],rows);
  }
  function cartera(){
    const active=db.lots.filter(l=>l.status!=='Disponible');
    return metrics(stat('Venta comprometida',million(active.reduce((s,l)=>s+l.price,0)),'Promesas y escrituras'),stat('Abonado',million(active.reduce((s,l)=>s+l.paid,0)),'Pagos registrados'),stat('Disponible',db.lots.length-active.length,'Lotes en inventario'))
    +`<div class="toolbar"><label>Buscar lote o proyecto<input id="lotSearch" class="search" type="search" value="${html(search)}" placeholder="Ej. Loma Austral"></label><label>Estado<select id="lotFilter">${['Todos','Disponible','Promesado','Escriturado'].map(s=>`<option ${s===filter?'selected':''}>${s}</option>`).join('')}</select></label></div><div id="lotsTable">${lotTable()}</div>`;
  }
  const inputs=[['units','Lotes',4,80,1],['price','Precio por lote',8000000,55000000,500000],['land','Adquisición del terreno',30000000,500000000,5000000],['works','Obras y habilitación',10000000,300000000,5000000],['fee','Comercialización',0,25,1]];
  const formatParam=(k,v)=>k==='units'?num(v):k==='fee'?v+' %':money(v);
  function scenarioResults(){
    const s=Terreno.scenario(db.scenarios), base=Terreno.scenario(Terreno.seed().scenarios);
    return metrics(stat('Margen',num(s.margin)+' %','Sobre ventas proyectadas'),stat('Resultado',million(s.profit),'Ventas menos costos'),stat('Equilibrio',s.breakEven+' lotes','Unidades mínimas para cubrir costos'))
    +`<div class="panel"><h3>Composición del escenario</h3><div class="bars">${[['Ventas',s.sales],['Terreno',db.scenarios.land],['Habilitación',db.scenarios.works],['Comercialización',s.selling]].map(([n,v])=>`<div><div class="row"><span>${n}</span><span class="num">${money(v)}</span></div>${meter(v/Math.max(s.sales,db.scenarios.land,db.scenarios.works,1)*100)}</div>`).join('')}</div><p class="context">Diferencia de resultado frente al ejemplo inicial: <strong>${money(s.profit-base.profit)}</strong>. Modelo simplificado, antes de impuestos y financiamiento.</p></div>`;
  }
  function evaluador(){
    return `<div class="split"><section class="panel"><h2>Supuestos del proyecto</h2><div class="fields">${inputs.map(([k,n,min,max,step])=>`<label><span class="row">${n}<output id="out-${k}" for="range-${k}" class="num">${formatParam(k,db.scenarios[k])}</output></span><input id="range-${k}" data-range="${k}" type="range" min="${min}" max="${max}" step="${step}" value="${db.scenarios[k]}"></label>`).join('')}</div><div class="section">${button('scenarioReset','Restaurar supuestos')}</div></section><section id="scenarioResults">${scenarioResults()}</section></div>`;
  }
  function nexo(){
    const saved=db.radar.filter(r=>r.star), view=onlySaved?saved:db.radar;
    return metrics(stat('Terrenos',db.radar.length,'Oportunidades de ejemplo'),stat('Selección',saved.length,'En comparación'),stat('Superficie',num(saved.reduce((s,r)=>s+r.ha,0))+' ha','En la selección'))
    +`<div class="toolbar"><h2>Oportunidades</h2><button class="tab" data-action="savedFilter" aria-pressed="${onlySaved}">${onlySaved?'Ver todos':'Ver solo seleccionados'}</button></div>`
    +table(['Terreno','Región','Superficie','Precio / ha','Comparación'],view.map(r=>`<tr><td><strong>${html(r.name)}</strong><small>${html(r.access)}</small></td><td>${html(r.region)}</td><td>${num(r.ha)} ha</td><td class="num">${money(r.ask/r.ha)}</td><td>${button('star',r.star?'Quitar':'Comparar',r.id)}</td></tr>`))
    +`<div class="section"><h2>Costo por hectárea</h2></div><div class="panel">${saved.length?saved.slice().sort((a,b)=>a.ask/a.ha-b.ask/b.ha).map(r=>`<div class="record"><div class="row"><strong>${html(r.name)}</strong><span class="num">${money(r.ask/r.ha)}/ha</span></div>${meter((r.ask/r.ha)/Math.max(...saved.map(s=>s.ask/s.ha))*100)}<small>Precio total ${money(r.ask)} · ${num(r.ha)} ha</small></div>`).join(''):empty('Selecciona dos terrenos para comparar su costo por hectárea.')}</div>`;
  }
  function proyectos(){
    return `<div class="cards">${db.projects.map(p=>`<article class="panel"><span class="label">${html(p.stage)}</span><div class="section"><h2>${html(p.name)}</h2></div>${meter(p.done/p.milestones.length*100)}<small>${p.done} de ${p.milestones.length} hitos completados</small><div class="record"><strong>Próximo hito</strong><p>${html(p.milestones[p.done]||'Etapa completada')}</p></div><div class="record"><strong>Última nota</strong><p>${html(p.note)}</p></div>${button('project','Actualizar seguimiento',p.id)}</article>`).join('')}</div>`;
  }
  function tareas(){
    return `<div class="toolbar"><h2>Compromisos del equipo</h2>${button('newTask','+ Nueva tarea','',true)}</div><div class="columns">${Terreno.bands.map((s,i)=>{const list=db.tasks.filter(t=>t.state===i);return `<section class="column"><h3>${s}<span class="muted">${list.length}</span></h3>${list.map(t=>`<article class="task">${badge(t.owner)}<strong>${html(t.title)}</strong><small>Compromiso · ${dateLabel(t.due)}</small><div>${button('taskState',i===2?'Reabrir':i===1?'Completar':'Iniciar',t.id)}</div></article>`).join('')||empty('Sin tareas en esta etapa.')}</section>`}).join('')}</div>`;
  }
  function sala(){
    const list=db.bookings.filter(b=>b.date===date).sort((a,b)=>a.start-b.start);
    return `<div class="toolbar"><label>Día de la agenda<input id="agendaDate" type="date" value="${date}"></label>${button('booking','+ Reservar sala','',true)}</div>`
    +metrics(stat('Reservas',list.length,dateLabel(date)),stat('Tiempo reservado',num(list.reduce((s,b)=>s+b.duration,0)/60)+' h','Jornada de 08:00 a 20:00'),stat('Bloques libres',24-list.reduce((s,b)=>s+b.duration/30,0),'Bloques de 30 minutos'))
    +`<section class="panel"><h2>Agenda del día</h2>${list.map(b=>`<div class="slot"><time>${time(b.start)}<br>${time(b.start+b.duration)}</time><span><strong>${html(b.title)}</strong><br><small>${b.duration} minutos</small></span>${button('cancel','Liberar',b.id)}</div>`).join('')||empty('La sala está disponible durante toda la jornada.')}</section>`;
  }
  function oficina(){
    return metrics(stat('Inventario',db.assets.length,'Recursos compartidos'),stat('Disponibles',db.assets.filter(a=>!a.holder).length,'Listos para prestar'),stat('En préstamo',db.assets.filter(a=>a.holder).length,'Asignados a un equipo'))
    +table(['Recurso','Categoría','Estado','Custodia','Acción'],db.assets.map(a=>`<tr><td><strong>${html(a.name)}</strong></td><td>${html(a.kind)}</td><td>${badge(a.holder?'En préstamo':'Disponible',a.holder?'gold':'')}</td><td>${html(a.holder||'Oficina')}</td><td>${button('asset',a.holder?'Devolver':'Prestar',a.id)}</td></tr>`));
  }
  const pages={inicio:home,cartera,evaluador,nexo,proyectos,tareas,sala,oficina};
  function render(){
    const route=location.hash.slice(1);
    module=Object.hasOwn(pages,route)?route:'inicio';
    const item=nav.find(n=>n[0]===module);
    $('crumb').textContent=item[1];document.title=item[1]+' · Terreno Ops';
    $('nav').innerHTML=nav.map(([id,n,s])=>`<a class="navlink" href="#${id}" ${id===module?'aria-current="page"':''}><span class="symbol" aria-hidden="true">${s}</span>${n}</a>`).join('');
    main.innerHTML=(module==='inicio'?'':`<div class="head"><span class="label">Terreno Ops · Aplicaciones</span><h1>${item[1]}</h1><p>${item[3]}</p></div>`)+pages[module]();
    if(module==='inicio')terrain();
  }
  const byId=(list,id)=>list.find(item=>item.id===id);
  const operations={
    lot(id){
      const l=byId(db.lots,id),balance=l.price-l.paid;
      const info=`<div class="context">Superficie ${num(l.area)} m² · ${html(l.status)}<br>Precio ${money(l.price)} · Pagado ${money(l.paid)}</div>`;
      if(l.status==='Disponible'||balance===0){
        modal(l.project+' · '+l.id,info,'Cerrar',()=> 'Ficha consultada');return;
      }
      modal(l.project+' · '+l.id,info+field('amount','Abono en CLP · saldo '+money(balance),'number','',`min="1" max="${balance}" step="1"`),'Registrar abono',v=>{Terreno.pay(l,Number(v.amount));return 'Abono registrado en la cartera demo.'});
    },
    scenarioReset(){Object.assign(db.scenarios,Terreno.seed().scenarios);persist();render();notify('Supuestos iniciales restaurados.')},
    savedFilter(){onlySaved=!onlySaved;render()},
    star(id){const r=byId(db.radar,id);r.star=!r.star;persist();render();notify(r.star?'Terreno añadido a la comparación.':'Terreno retirado de la comparación.')},
    project(id){
      const p=byId(db.projects,id);
      const options=p.milestones.map((name,i)=>`<option value="${i+1}" ${i+1===p.done?'selected':''}>${i+1} · ${html(name)}</option>`).join('');
      modal(p.name,`<label>Último hito completado<select name="done"><option value="0">Sin hitos completados</option>${options}</select></label>`+field('note','Nota de seguimiento','text',p.note,'maxlength="160"'),'Guardar avance',v=>{p.done=Number(v.done);p.note=v.note;return 'Seguimiento actualizado.'});
    },
    newTask(){
      modal('Nueva tarea',field('title','Tarea','text','','maxlength="90"')+field('owner','Equipo responsable','text','','maxlength="45"')+field('due','Fecha de compromiso','date',Terreno.day(1)),'Crear tarea',v=>{db.tasks.push({...v,id:uid(),state:0});return 'Tarea creada en Por hacer.'});
    },
    taskState(id){const t=byId(db.tasks,id);t.state=(t.state+1)%3;persist();render();notify('Tarea en '+Terreno.bands[t.state]+'.')},
    booking(){
      const slots=Array.from({length:24},(_,i)=>[480+30*i,time(480+30*i)]),durations=Array.from({length:6},(_,i)=>[30*(i+1),30*(i+1)+' minutos']);
      modal('Reservar sala',field('title','Nombre de la reunión','text','','maxlength="90"')+field('date','Fecha','date',date)+select('start','Hora de inicio',slots)+select('duration','Duración',durations),'Confirmar reserva',v=>{Terreno.reserve(db.bookings,{...v,id:uid(),start:Number(v.start),duration:Number(v.duration)});date=v.date;return 'Sala reservada.'});
    },
    cancel(id){
      const booking=byId(db.bookings,id);
      modal('Liberar sala',`<p class="context">${html(booking.title)} · ${dateLabel(booking.date)}, ${time(booking.start)}–${time(booking.start+booking.duration)}.</p>`,'Liberar horario',()=>{db.bookings.splice(db.bookings.indexOf(booking),1);return 'Horario liberado.'});
    },
    asset(id){
      const a=byId(db.assets,id);
      if(a.holder)modal('Devolver '+a.name,`<p class="context">Actualmente asignado a ${html(a.holder)}.</p>`,'Confirmar devolución',()=>{a.holder='';return 'Equipo disponible en oficina.'});
      else modal('Prestar '+a.name,field('holder','Equipo que recibe','text','','maxlength="60"'),'Registrar préstamo',v=>{a.holder=v.holder;return 'Préstamo registrado.'});
    }
  };
  main.addEventListener('click',evt=>{const b=evt.target.closest('[data-action]');if(b&&Object.hasOwn(operations,b.dataset.action))operations[b.dataset.action](b.dataset.id)});
  main.addEventListener('input',evt=>{
    const input=evt.target;
    if(input.id==='lotSearch'){search=input.value;$('lotsTable').innerHTML=lotTable()}
    if(input.dataset.range){const k=input.dataset.range;db.scenarios[k]=Number(input.value);$('out-'+k).textContent=formatParam(k,db.scenarios[k]);$('scenarioResults').innerHTML=scenarioResults();persist()}
  });
  main.addEventListener('change',evt=>{
    if(evt.target.id==='agendaDate'&&evt.target.value){date=evt.target.value;render()}
    if(evt.target.id==='lotFilter'){filter=evt.target.value;$('lotsTable').innerHTML=lotTable()}
  });
  window.addEventListener('resize',()=>{clearTimeout(resized);resized=setTimeout(terrain,90)});
  window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});window.scrollTo(0,0)});
  window.addEventListener('storage',event=>{if(event.key===Terreno.key&&!dialog.open){Object.assign(db,Terreno.read());render()}});
  render();
})();

