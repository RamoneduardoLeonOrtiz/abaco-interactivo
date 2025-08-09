// Script.js

document.addEventListener('DOMContentLoaded', () => {
  const paleta = [
    '#FFDC00', '#FF851B', '#FF4136', '#2ECC40', '#0074D9',
    '#B10DC9', '#FF69B4', '#3D9970', '#DC143C', '#AAAAAA'
  ];

  // Cargar efectos de sonido (rutas actualizadas)
  const soundSelectRod     = new Audio('abaco-interactivo/Sonidos/beeps-bonks-boinks%2019.mp3');
  const soundSelectNumber  = new Audio('abaco-interactivo/Sonidos/beeps-bonks-boinks%2021.mp3');
  const soundDeshacer      = new Audio('abaco-interactivo/Sonidos/beep%2001.mp3');
  const soundResetVarilla  = new Audio('abaco-interactivo/Sonidos/beeps-bonks-boinks%207.mp3');
  const soundResetTodo     = new Audio('abaco-interactivo/Sonidos/beeps-bonks-boinks%2016.mp3');
  const soundCarry         = new Audio('abaco-interactivo/Sonidos/beeps-bonks-boinks%2020.mp3');

  // Control de volumen
  const allSounds = [
    soundSelectRod,
    soundSelectNumber,
    soundDeshacer,
    soundResetVarilla,
    soundResetTodo,
    soundCarry
  ];
  const volumeLevels = [1, 0.75, 0.5, 0.25, 0];
  let currentVolumeIndex = 0;

  // Crear e insertar el botón de volumen (con icono y ruta actualizada)
  const panel     = document.getElementById('panel-numeros');
  const volumeBtn = document.createElement('button');
  volumeBtn.id    = 'volume-btn';
  volumeBtn.innerHTML = `
    <img src="abaco-interactivo/imágenes/audio.jpg" alt="Audio" class="icon">
    <span class="volume-text">Volumen 100%</span>
  `;
  panel.parentNode.insertBefore(volumeBtn, panel);

  volumeBtn.addEventListener('click', () => {
    currentVolumeIndex = (currentVolumeIndex + 1) % volumeLevels.length;
    const v = volumeLevels[currentVolumeIndex];
    allSounds.forEach(s => s.volume = v);
    volumeBtn.innerHTML = `
      <img src="abaco-interactivo/imágenes/audio.jpg" alt="Audio" class="icon">
      <span class="volume-text">Volumen ${Math.round(v * 100)}%</span>
    `;
  });

  // Referencias al DOM
  const abaco            = document.getElementById('abaco');
  const baseInferior     = abaco.querySelector('.base-inferior');
  const deshacerBtn      = document.getElementById('deshacer-btn');
  const resetVarillaBtn  = document.getElementById('reset-varilla-btn');
  const resetearBtn      = document.getElementById('resetear-btn');
  const btnAtras         = document.getElementById('atras-btn');
  const btnAdelante      = document.getElementById('adelante-btn');

  // Estado interno
  const numVarillas = parseInt(abaco.dataset.varillas, 10);
  const beadSize    = 25;
  const gap         = 0;
  let selectedRod   = null;
  const rodillas    = [];

  // Pilas globales de Undo/Redo
  const undoStack = [];
  const redoStack = [];

  function recordState() {
    const snapshot = rodillas.map(r => r.grupos.map(g => ({ ...g })));
    undoStack.push(snapshot);
    redoStack.length = 0;
  }

  // Crear panel de números 0–9
  paleta.forEach((color, i) => {
    const btn = document.createElement('button');
    btn.className        = 'numero-btn';
    btn.textContent      = i;
    btn.dataset.valor    = i;
    btn.style.background = color;
    panel.appendChild(btn);
  });

  // Generar varillas
  for (let i = 0; i < numVarillas; i++) {
    const rod = document.createElement('div');
    rod.className        = 'varilla';
    rod.dataset.rodIndex = i;

    const resultado = document.createElement('div');
    resultado.className   = 'resultado';
    resultado.textContent = '0';
    rod.appendChild(resultado);

    const pushBtn = document.createElement('button');
    pushBtn.className   = 'push-btn';
    pushBtn.textContent = '←';
    rod.appendChild(pushBtn);

    rod.addEventListener('click', () => {
      soundSelectRod.play();
      if (selectedRod !== null) {
        rodillas[selectedRod].div.classList.remove('selected');
      }
      selectedRod = i;
      rod.classList.add('selected');
    });

    pushBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (i === 0) {
        alert('Esta es la primera columna. No se puede llevar.');
        return;
      }
      recordState();
      soundCarry.play();

      const actualRod = rodillas[i];
      let total = actualRod.grupos.reduce((s, g) => s + g.tamaño, 0);

      if (total < 10) {
        alert('No hay suficientes cuentas (mínimo 10) para llevar.');
        return;
      }

      let toRemove = 10;
      while (toRemove > 0 && actualRod.grupos.length) {
        const last = actualRod.grupos[actualRod.grupos.length - 1];
        if (last.tamaño <= toRemove) {
          toRemove -= last.tamaño;
          actualRod.grupos.pop();
        } else {
          last.tamaño -= toRemove;
          toRemove = 0;
        }
      }
      renderRodilla(actualRod);

      const prevRod = rodillas[i - 1];
      prevRod.grupos.push({ tamaño: 1, color: paleta[1] });
      renderRodilla(prevRod);
    });

    abaco.insertBefore(rod, baseInferior);

    // Préstamo (borrow)
    if (i < numVarillas - 1) {
      const borrowBtn = document.createElement('button');
      borrowBtn.textContent = '→';
      Object.assign(borrowBtn.style, {
        position: 'absolute',
        top: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1.2rem'
      });

      borrowBtn.addEventListener('click', e => {
        e.stopPropagation();
        const origen = rodillas[i];
        const totalOrigen = origen.grupos.reduce((sum, g) => sum + g.tamaño, 0);
        if (totalOrigen < 1) {
          alert('No hay cuentas para prestar en esta columna.');
          return;
        }

        recordState();
        soundCarry.play();

        const lastGroup = origen.grupos[origen.grupos.length - 1];
        if (lastGroup.tamaño > 1) {
          lastGroup.tamaño--;
        } else {
          origen.grupos.pop();
        }
        renderRodilla(origen);

        const destino = rodillas[i + 1];
        destino.grupos.push({ tamaño: 10, color: paleta[1] });
        renderRodilla(destino);
      });

      rod.appendChild(borrowBtn);
    }

    rodillas.push({ div: rod, grupos: [], resultadoEl: resultado });
  }

  // Scroll interno
  const rodMargin    = 8;
  const visibleCount = Math.floor(abaco.clientWidth / (beadSize + rodMargin * 2));
  let startIndex     = 0;

  function updateVisibleRods() {
    rodillas.forEach((r, idx) => {
      r.div.style.display =
        idx >= startIndex && idx < startIndex + visibleCount ? '' : 'none';
    });
  }

  updateVisibleRods();

  // ← Undo global
  btnAtras.addEventListener('click', () => {
    soundDeshacer.play();
    if (undoStack.length === 0) {
      alert('No hay movimientos para deshacer.');
      return;
    }
    const current = rodillas.map(r => r.grupos.map(g => ({ ...g })));
    redoStack.push(current);
    const prev = undoStack.pop();
    rodillas.forEach((r, i) => {
      r.grupos = prev[i].map(g => ({ ...g }));
      renderRodilla(r);
    });
  });

  // → Redo global
  btnAdelante.addEventListener('click', () => {
    soundDeshacer.play();
    if (redoStack.length === 0) {
      alert('No hay movimientos para rehacer.');
      return;
    }
    const current = rodillas.map(r => r.grupos.map(g => ({ ...g })));
    undoStack.push(current);
    const next = redoStack.pop();
    rodillas.forEach((r, i) => {
      r.grupos = next[i].map(g => ({ ...g }));
      renderRodilla(r);
    });
  });

  // Deshacer local
  deshacerBtn.addEventListener('click', () => {
    soundDeshacer.play();
    if (selectedRod === null) {
      alert('Selecciona primero una columna.');
      return;
    }
    const r = rodillas[selectedRod];
    if (!r.grupos.length) {
      alert('No hay movimientos para deshacer.');
      return;
    }
    r.grupos.pop();
    renderRodilla(r);
  });

  // Reset varilla
  resetVarillaBtn.addEventListener('click', () => {
    if (selectedRod === null) {
      alert('Selecciona primero una columna.');
      return;
    }
    recordState();
    soundResetVarilla.play();
    const r = rodillas[selectedRod];
    r.grupos = [];
    renderRodilla(r);
  });

  // Reset total
  resetearBtn.addEventListener('click', () => {
    recordState();
    soundResetTodo.play();
    rodillas.forEach(r => {
      r.grupos = [];
      renderRodilla(r);
    });
    selectedRod = null;
    document.querySelectorAll('.varilla.selected')
      .forEach(el => el.classList.remove('selected'));
  });

  // Añadir cuentas
  panel.querySelectorAll('.numero-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (selectedRod === null) {
        alert('Selecciona primero una columna.');
        return;
      }
      recordState();
      soundSelectNumber.play();
      const val   = +btn.dataset.valor;
      const color = paleta[val];
      rodillas[selectedRod].grupos.push({ tamaño: val, color });
      renderRodilla(rodillas[selectedRod]);
    });
  });

  // Render de cada varilla
  function renderRodilla(rodObj) {
    const el = rodObj.div;
    el.querySelectorAll('.cuenta').forEach(n => n.remove());
    let y = el.clientHeight - beadSize;

    rodObj.grupos.forEach(grupo => {
      for (let k = 0; k < grupo.tamaño; k++) {
        const bead = document.createElement('div');
        bead.className = 'cuenta';
        Object.assign(bead.style, {
          position:     'absolute',
          width:        `${beadSize}px`,
          height:       `${beadSize}px`,
          borderRadius: '50%',
          background:   grupo.color,
          left:         '0',
          top:          `${y}px`
        });
        el.appendChild(bead);
        y -= (beadSize + gap);
      }
    });

    const total = rodObj.grupos.reduce((s, g) => s + g.tamaño, 0);
    rodObj.resultadoEl.textContent = total;
  }
});
