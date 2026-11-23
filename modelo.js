/* Datos inventados y reglas de las demostraciones. Todos los montos están en CLP. */
const Terreno = (() => {
  const key = 'terreno-ops-demo-v1';
  const bands = ['Por hacer', 'En curso', 'Listo'];
  function day(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function seed() {
    return {
      version: 1,
      lots: [{
        id: 'A-04',
        project: 'Loma Austral',
        area: 5200,
        price: 34000000,
        paid: 6800000,
        status: 'Promesado'
      }, {
        id: 'B-11',
        project: 'Umbral Verde',
        area: 6400,
        price: 42500000,
        paid: 8500000,
        status: 'Promesado'
      }, {
        id: 'A-09',
        project: 'Loma Austral',
        area: 5100,
        price: 32000000,
        paid: 0,
        status: 'Disponible'
      }, {
        id: 'C-02',
        project: 'Quebrada Clara',
        area: 5800,
        price: 37500000,
        paid: 37500000,
        status: 'Escriturado'
      }, {
        id: 'B-07',
        project: 'Umbral Verde',
        area: 6000,
        price: 39500000,
        paid: 0,
        status: 'Disponible'
      }, {
        id: 'C-06',
        project: 'Quebrada Clara',
        area: 5500,
        price: 36600000,
        paid: 7320000,
        status: 'Promesado'
      }],
      tasks: [{
        id: 't1',
        title: 'Revisar accesos del lote A-09',
        owner: 'Operaciones',
        due: day(1),
        state: 0
      }, {
        id: 't2',
        title: 'Actualizar cuadro de superficies',
        owner: 'Desarrollo',
        due: day(2),
        state: 1
      }, {
        id: 't3',
        title: 'Validar abonos de la semana',
        owner: 'Cartera',
        due: day(),
        state: 1
      }, {
        id: 't4',
        title: 'Publicar minuta de coordinación',
        owner: 'Oficina',
        due: day(-1),
        state: 2
      }],
      projects: [{
        id: 'p1',
        name: 'Loma Austral',
        stage: 'Habilitación',
        milestones: ['Plano preliminar', 'Revisión de acceso', 'Presupuesto de obras', 'Recepción interna'],
        done: 2,
        note: 'Contrastar presupuesto y accesos.'
      }, {
        id: 'p2',
        name: 'Umbral Verde',
        stage: 'Comercialización',
        milestones: ['Ficha de lotes', 'Lista de precios', 'Revisión comercial', 'Cierre de etapa'],
        done: 3,
        note: 'Revisar inventario disponible.'
      }, {
        id: 'p3',
        name: 'Quebrada Clara',
        stage: 'Evaluación',
        milestones: ['Visita de terreno', 'Estudio de cabida', 'Escenario de venta', 'Comité interno'],
        done: 1,
        note: 'Completar el estudio de cabida.'
      }],
      radar: [{
        id: 'r1',
        name: 'Meseta del Roble',
        region: 'Maule',
        ha: 24,
        ask: 176000000,
        access: 'Camino consolidado',
        star: true
      }, {
        id: 'r2',
        name: 'Fundo Mirador',
        region: 'Ñuble',
        ha: 32,
        ask: 208000000,
        access: 'Acceso por verificar',
        star: false
      }, {
        id: 'r3',
        name: 'Vega del Viento',
        region: 'Biobío',
        ha: 18,
        ask: 153000000,
        access: 'Camino interior',
        star: true
      }, {
        id: 'r4',
        name: 'Ladera Sur',
        region: 'Maule',
        ha: 41,
        ask: 235750000,
        access: 'Camino consolidado',
        star: false
      }],
      bookings: [{
        id: 'b1',
        date: day(),
        start: 570,
        duration: 60,
        title: 'Revisión de cartera'
      }, {
        id: 'b2',
        date: day(),
        start: 930,
        duration: 30,
        title: 'Mesa de proyectos'
      }],
      assets: [{
        id: 'o1',
        name: 'Proyector portátil',
        kind: 'Audiovisual',
        holder: ''
      }, {
        id: 'o2',
        name: 'Kit de videollamada',
        kind: 'Sala',
        holder: 'Equipo comercial'
      }, {
        id: 'o3',
        name: 'Notebook de visitas',
        kind: 'Terreno',
        holder: ''
      }],
      scenarios: {
        units: 24,
        price: 23000000,
        land: 220000000,
        works: 115000000,
        fee: 8
      }
    };
  }
  function scenario(s) {
    const sales = s.units * s.price,
      selling = sales * s.fee / 100,
      cost = s.land + s.works + selling;
    return {
      sales,
      selling,
      cost,
      profit: sales - cost,
      margin: sales ? (sales - cost) / sales * 100 : 0,
      breakEven: Math.ceil((s.land + s.works) / (s.price * (1 - s.fee / 100)))
    };
  }
  function pay(lot, amount) {
    if (!lot || lot.status === 'Disponible' || !Number.isSafeInteger(amount) || amount <= 0 || amount > lot.price - lot.paid) throw Error('Ingresa un abono mayor a cero y que no supere el saldo.');
    lot.paid += amount;
  }
  function reserve(items, item) {
    if (!item.title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isInteger(item.start) || !Number.isInteger(item.duration) || item.start < 480 || item.start % 30 || item.duration % 30 || item.duration < 30 || item.duration > 180 || item.start + item.duration > 1200) throw Error('Elige entre 30 minutos y 3 horas, dentro de 08:00–20:00.');
    if (items.some(b => b.date === item.date && item.start < b.start + b.duration && b.start < item.start + item.duration)) throw Error('La sala ya está reservada en ese horario. Elige otro bloque.');
    items.push(item);
  }
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value?.version === 1 && ['lots', 'tasks', 'projects', 'radar', 'bookings', 'assets'].every(k => Array.isArray(value[k])) && value.scenarios) return value;
    } catch {}
    return seed();
  }
  function save(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
  return {
    day,
    seed,
    bands,
    scenario,
    pay,
    reserve,
    read,
    save,
    key
  };
})();
