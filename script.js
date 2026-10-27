// Animación: cómo funciona un Java Debugger.
// Cada "paso" es una foto: qué línea se mira, qué valen las variables,
// qué dice la JVM y qué texto explica el momento.

const STEPS = [
  { line:0, i:"—", total:"—", out:"—", run:false, pause:false,
    text:"El debugger es una lupa. Deja que mires tu programa mientras corre, despacio." },

  { line:3, i:"—", total:"—", out:"—", run:false, pause:false, bp:true,
    text:"Pones un breakpoint (punto rojo) en la línea 3. Dices: «para aquí»." },

  { line:3, i:"—", total:"0", out:"—", run:false, pause:true, bp:true,
    text:"La JVM llega al breakpoint y SE PARA. Ya hiciste total = 0." },

  { line:4, i:"1", total:"0", out:"—", run:false, pause:true, bp:true,
    text:"Empieza el bucle. i vale 1. Aún no sumamos." },

  { line:5, i:"1", total:"1", flash:["total"], out:"—", run:false, pause:true, bp:true,
    text:"Das un «paso» (Step Over). total = 0 + 1 = 1. Ves el cambio al instante." },

  { line:5, i:"2", total:"3", flash:["total","i"], out:"—", run:false, pause:true, bp:true,
    text:"Vuelta 2: i = 2. total = 1 + 2 = 3. El debugger te enseña cada vuelta." },

  { line:5, i:"3", total:"6", flash:["total","i"], out:"—", run:false, pause:true, bp:true,
    text:"Vuelta 3: i = 3. total = 3 + 3 = 6. Ahora sabes que la suma funciona bien." },

  { line:7, i:"3", total:"6", out:"—", run:false, pause:true, bp:true,
    text:"Pulsas Continuar. La JVM sale del bucle y llega a println." },

  { line:7, i:"3", total:"6", out:"6", flash:["out"], run:true, pause:false, bp:true,
    text:"Imprime 6 en pantalla. El programa termina. ¡Vimos cómo pensaba por dentro!" }
];

const els = {
  code: document.getElementById("code"),
  varI: document.getElementById("varI"),
  varTotal: document.getElementById("varTotal"),
  output: document.getElementById("output"),
  chipRun: document.getElementById("chipRun"),
  chipPause: document.getElementById("chipPause"),
  badge: document.getElementById("badge"),
  explainText: document.getElementById("explainText"),
  prev: document.getElementById("prevBtn"),
  next: document.getElementById("nextBtn"),
  play: document.getElementById("playBtn"),
  reset: document.getElementById("resetBtn")
};

const lines = Array.from(document.querySelectorAll(".line"));
let idx = 0;
let timer = null;

function render(prevIdx){
  const s = STEPS[idx];

  // Línea activa + breakpoint
  lines.forEach(l=>l.classList.remove("active"));
  if (s.line > 0){
    const el = lines.find(l => +l.dataset.line === s.line);
    if (el) el.classList.add("active");
  }
  if (s.bp){
    const bpEl = lines.find(l => +l.dataset.line === 3);
    if (bpEl) bpEl.classList.add("breakpoint");
  } else {
    lines.forEach(l=>l.classList.remove("breakpoint"));
  }

  // Variables
  els.varI.textContent = s.i;
  els.varTotal.textContent = s.total;
  els.output.textContent = s.out;

  // Flash de lo que cambió (solo si avanzamos)
  const goingForward = prevIdx === undefined || idx > prevIdx;
  if (goingForward && s.flash){
    s.flash.forEach(k=>{
      const map = { total: els.varTotal, i: els.varI, out: els.output };
      const node = map[k];
      if (node){ node.classList.remove("flash"); void node.offsetWidth; node.classList.add("flash"); }
    });
  }

  // JVM
  els.chipRun.classList.toggle("on", s.run);
  els.chipPause.classList.toggle("on", s.pause);

  // Texto
  els.badge.textContent = "Paso " + idx;
  els.explainText.textContent = s.text;

  // Botones
  els.prev.disabled = idx === 0;
  els.next.disabled = idx === STEPS.length - 1;
}

function go(n){
  const prev = idx;
  idx = Math.max(0, Math.min(STEPS.length - 1, n));
  render(prev);
}

function stopPlay(){
  if (timer){ clearInterval(timer); timer = null; els.play.textContent = "▶ Reproducir"; }
}

els.next.onclick = () => { stopPlay(); go(idx + 1); };
els.prev.onclick = () => { stopPlay(); go(idx - 1); };
els.reset.onclick = () => { stopPlay(); go(0); };

els.play.onclick = () => {
  if (timer){ stopPlay(); return; }
  if (idx === STEPS.length - 1) go(0);
  els.play.textContent = "⏸ Pausa";
  timer = setInterval(()=>{
    if (idx >= STEPS.length - 1){ stopPlay(); return; }
    go(idx + 1);
  }, 2200);
};

// Teclas: flechas para navegar
document.addEventListener("keydown", e=>{
  if (e.key === "ArrowRight") els.next.click();
  if (e.key === "ArrowLeft") els.prev.click();
});

render();
