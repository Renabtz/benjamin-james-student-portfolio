document.getElementById('yr').textContent = new Date().getFullYear();

// Mobile menu
const btn = document.getElementById('menu-btn'), list = document.getElementById('nav-list');
btn.addEventListener('click', () => {
  const open = list.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
});

// Safe storage helpers
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Projects page
const grid = document.getElementById('proj-grid');
if (grid) {
  const projects = [
    {t:'Portfolio website', d:'This responsive multi-page site.', type:'web', tags:['HTML','CSS','JS']},
    {t:'Weather dashboard', d:'Shows a 5-day forecast for any city.', type:'web', tags:['API','JS']},
    {t:'Exam score analysis', d:'Visualises class performance trends.', type:'data', tags:['Python','Charts']}
  ];
  const draw = f => grid.innerHTML = projects.filter(p => f==='all' || p.type===f).map(p =>
    `<article class="card"><h3>${p.t}</h3><p>${p.d}</p>${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}<p><a href="#">View on GitHub</a></p></article>`).join('');
  draw('all');
  document.getElementById('filters').addEventListener('click', e => {
    const f = e.target.dataset.f; if (!f) return;
    document.querySelectorAll('#filters .btn').forEach(b => b.classList.toggle('alt', b!==e.target));
    draw(f);
  });
}

// GPA calculator
const cbox = document.getElementById('courses');
if (cbox) {
  const pts = {A:5,B:4,C:3,D:2,E:1,F:0};
  let courses = store.get('courses', [{n:'',u:3,g:'A'}]);
  const calc = () => {
    const err = document.getElementById('gpa-err'); err.textContent = '';
    let U = 0, P = 0;
    for (const c of courses) { const u = Number(c.u); if (u > 0) { U += u; P += u * pts[c.g]; } }
    document.getElementById('gpa').textContent = U ? (P/U).toFixed(2) : '–';
    if (!U) err.textContent = 'Add at least one course with credit units above 0.';
    store.set('courses', courses);
  };
  const render = () => {
    cbox.innerHTML = courses.map((c,i) => `<div class="row">
      <input aria-label="Course name" placeholder="Course name" value="${esc(c.n)}" data-i="${i}" data-k="n">
      <input aria-label="Credit units" type="number" min="1" max="10" value="${esc(c.u)}" data-i="${i}" data-k="u">
      <select aria-label="Grade" data-i="${i}" data-k="g">${Object.keys(pts).map(g=>`<option${g===c.g?' selected':''}>${g}</option>`).join('')}</select>
      <button class="linkbtn" data-rm="${i}" type="button">Remove</button></div>`).join('');
    calc();
  };
  cbox.addEventListener('input', e => { const {i,k} = e.target.dataset; if (k) { courses[i][k] = e.target.value; calc(); } });
  cbox.addEventListener('click', e => { if (e.target.dataset.rm !== undefined) { courses.splice(e.target.dataset.rm,1); render(); } });
  document.getElementById('add-course').onclick = () => { courses.push({n:'',u:3,g:'A'}); render(); };
  render();
}

// Task manager
const tl = document.getElementById('task-list');
if (tl) {
  let tasks = store.get('tasks', []);
  const draw = () => {
    tl.innerHTML = tasks.length ? tasks.map((t,i) => `<li class="${t.done?'done':''}">
      <input type="checkbox" aria-label="Mark done" data-c="${i}" ${t.done?'checked':''}>
      <span>${esc(t.text)}${t.date?' (due '+esc(t.date)+')':''}</span>
      <button class="linkbtn" data-d="${i}" type="button">Delete</button></li>`).join('')
      : '<li>No tasks yet. Add your first deadline above.</li>';
    store.set('tasks', tasks);
  };
  document.getElementById('add-task').onclick = () => {
    const text = document.getElementById('t-text'), date = document.getElementById('t-date'), err = document.getElementById('t-err');
    if (!text.value.trim()) { err.textContent = 'Enter a task name.'; text.focus(); return; }
    err.textContent = '';
    tasks.push({text:text.value.trim(), date:date.value, done:false});
    text.value = ''; date.value = ''; draw();
  };
  tl.addEventListener('click', e => {
    if (e.target.dataset.d !== undefined) { tasks.splice(e.target.dataset.d,1); draw(); }
    if (e.target.dataset.c !== undefined) { tasks[e.target.dataset.c].done = e.target.checked; draw(); }
  });
  draw();
}

// Contact form validation
const cf = document.getElementById('cf');
if (cf) cf.addEventListener('submit', e => {
  e.preventDefault();
  const f = {n:'Enter your name.', e:'Enter a valid email address.', m:'Write a message of at least 10 characters.'};
  let ok = true;
  for (const id in f) {
    const el = document.getElementById(id), v = el.value.trim();
    const bad = !v || (id==='e' && !/^\S+@\S+\.\S+$/.test(v)) || (id==='m' && v.length<10);
    document.getElementById(id+'-e').textContent = bad ? f[id] : '';
    if (bad) ok = false;
  }
  document.getElementById('cf-ok').textContent = ok ? 'Message sent. Thank you! (Connect Formspree to deliver it.)' : '';
  if (ok) cf.reset();
});
