(() => {
  const CONFIG = window.APP_CONFIG || {};
  const STORAGE_KEY = CONFIG.storageKey || "monitor-comedor-escenarios-v1";
  const PRELOADED_IDS = Array.from({ length: 749 }, (_, i) => String(100 + i));

  const FIELD_HELP = {
    "#ID": "Número de sticker del cliente. Solo números. Si escribes 001, se guardará como 1.",
    "#ID ": "Número de sticker del cliente. Solo números. Si escribes 001, se guardará como 1.",
    "# pers. en caja": "Coloca el número de personas delante del cliente en el momento que hace la cola en caja.",
    "Caja 1 o 2": "Coloca 1 o 2 solo cuando inicia la atención en caja.",
    "Pagó": "Selecciona el tipo de pago. Si el alumno se retira al ser atendido porque ya no hay menú/producto, marca Abandonó.",
    "# de caja": "Coloca 1 o 2 según la caja donde finaliza la atención.",
    "Reservó 1 o 0": "Si reservó, coloca 1. Si no reservó, coloca 0.",
    "# cola entrega": "Coloca el número de personas delante del cliente cuando está en la sección de bandejas/zona de entrega.",
    "Tipo pedido": "Selecciona el pedido realizado cuando entrega el ticket y empieza la atención de entradas.",
    "# trab. entregan": "Coloca el número de trabajadores sirviendo justo cuando el primer trabajador de entrada comunica el tipo de pedido.",
    "# A. ocupados perso": "Número de asientos ocupados por personas cuando el usuario se sentó.",
    "# A. libres": "Número de asientos libres observados cuando el usuario se sentó.",
    "# A. mochila o lonchera": "Número de asientos ocupados por mochila o lonchera cuando el usuario se sentó.",
    "Disp. mesas": "Selecciona la disponibilidad solo cuando el usuario se sentó en su mesa.",
    "Abandonó cola 1 o 0": "Si abandonó la cola, coloca 1. Si no abandonó, coloca 0.",
    "Motivo abandonó": "Pregunta por qué se fue y selecciona el motivo correspondiente.",
    "Incidencias": "Observaciones detectadas en caja o en cualquier zona del proceso."
  };

  const NUMERIC_FIELD_LABELS = new Set([
    "# pers. en caja",
    "# de caja",
    "# cola entrega",
    "# trab. entregan",
    "# A. ocupados perso",
    "# A. libres",
    "# A. mochila o lonchera"
  ]);

  const SCENARIOS = [
    {
      id: 1,
      sheet: "Hoja 1",
      title: "Llegada al comedor",
      description: "Se registra solo el ID del cliente y la hora automática de llegada al comedor al presionar Check.",
      previous: null,
      columns: ["#ID ", "T. llega al comedor"],
      fields: [],
      timeKey: "T. llega al comedor"
    },
    {
      id: 2,
      sheet: "Hoja 2",
      title: "Cola de caja",
      description: "No se crea un nuevo ID. Primero busca un ID registrado en Hoja 1 y luego registra la hora de cola de caja con Check.",
      previous: 1,
      columns: ["#ID ", "# pers. en caja", "T. cola caja"],
      fields: [
        { key: "personasCaja", label: "# pers. en caja", type: "number", min: 0, placeholder: "Ej. 5" }
      ],
      timeKey: "T. cola caja"
    },
    {
      id: 3,
      sheet: "Hoja 3A",
      title: "Inicio de atención en caja",
      description: "Busca el ID de Hoja 2, selecciona Caja 1 o 2 y presiona Check para registrar T. inicio caja. Si el ID ya fue registrado aquí, no se podrá actualizar ni duplicar.",
      previous: 2,
      columns: ["#ID ", "Caja 1 o 2", "T. inicio caja"],
      fields: [
        { key: "cajaInicio", label: "Caja 1 o 2", type: "select", options: ["1", "2"] }
      ],
      timeKey: "T. inicio caja"
    },
    {
      id: 9,
      sheet: "Hoja 3B",
      title: "Fin de atención en caja",
      description: "Busca el ID que ya completó Hoja 3A, selecciona Pagó y completa # de caja. Al presionar Check se registra T. fin caja. Si el ID ya fue registrado aquí, no se podrá actualizar ni duplicar.",
      previous: 3,
      columns: ["#ID ", "Pagó", "# de caja", "T. fin caja"],
      fields: [
        { key: "pago", label: "Pagó", type: "select", options: ["Yape/Plin", "Tarjeta", "Efectivo", "Abandonó"] },
        { key: "cajaFin", label: "# de caja", type: "select", options: ["1", "2"] }
      ],
      timeKey: "T. fin caja"
    },
    {
      id: 4,
      sheet: "Hoja 4",
      title: "Zona de entrega",
      description: "Si Reservó = 0, el ID debe venir de Hoja 3B y no debe haber abandonado. Si Reservó = 1, el ID debe existir previamente en Hoja 1, aunque no haya pasado por Hoja 3B.",
      previous: 9,
      columns: ["#ID ", "Reservó 1 o 0", "# cola entrega", "T. zona de entrega"],
      fields: [
        { key: "reservo", label: "Reservó 1 o 0", type: "select", options: ["1", "0"], special: "reservo" },
        { key: "colaEntrega", label: "# cola entrega", type: "number", min: 0, placeholder: "Ej. 3" }
      ],
      timeKey: "T. zona de entrega",
      allowNewIdWhenReserved: true
    },
    {
      id: 5,
      sheet: "Hoja 5",
      title: "Inicio de entrega",
      description: "Busca un ID registrado en Hoja 4, selecciona el tipo de pedido y registra la hora de inicio de entrega con Check.",
      previous: 4,
      columns: ["#ID ", "Tipo pedido", "T. inicio entrega"],
      fields: [
        { key: "tipoPedido", label: "Tipo pedido", type: "select", options: ["Economico", "Estudiantil 1 o 2", "Ejecutivo", "Saludable", "Bebida", "Snack, galleta", "Postre"] }
      ],
      timeKey: "T. inicio entrega"
    },
    {
      id: 6,
      sheet: "Hoja 6",
      title: "Preparación de plato",
      description: "Busca un ID registrado en Hoja 5, completa cuántos trabajadores entregan y registra la hora de preparación con Check.",
      previous: 5,
      columns: ["#ID ", "# trab. entregan", "T. prep. plato"],
      fields: [
        { key: "trabEntregan", label: "# trab. entregan", type: "number", min: 0, placeholder: "Ej. 2" }
      ],
      timeKey: "T. prep. plato"
    },
    {
      id: 7,
      sheet: "Hoja 7",
      title: "Fin de entrega",
      description: "Busca un ID registrado en Hoja 6 y presiona Check para registrar automáticamente la hora de fin de entrega. No se llena ningún campo adicional.",
      previous: 6,
      columns: ["#ID ", "T. fin entrega"],
      fields: [],
      timeKey: "T. fin entrega"
    },
    {
      id: 8,
      sheet: "Hoja 8",
      title: "Sentarse",
      description: "Busca un ID registrado en Hoja 7. Al completar los campos y presionar Check se registra T. sentarse.",
      previous: 7,
      columns: ["#ID ", "# A. ocupados perso", "T. sentarse", "# A. libres", "# A. mochila o lonchera"],
      fields: [
        { key: "asientosOcupados", label: "# A. ocupados perso", type: "number", min: 0, placeholder: "Ej. 20" },
        { key: "asientosLibres", label: "# A. libres", type: "number", min: 0, placeholder: "Ej. 5" },
        { key: "asientosMochila", label: "# A. mochila o lonchera", type: "number", min: 0, placeholder: "Ej. 1" }
      ],
      timeKey: "T. sentarse"
    },
    {
      id: 10,
      sheet: "Hoja 9",
      title: "Administración",
      description: "Zona protegida para borrar un ID de Firebase y de todas las hojas. Requiere contraseña.",
      previous: null,
      columns: ["#ID ", "Acción", "Fecha"],
      fields: [],
      isAdmin: true
    }
  ];

  let state = {
    version: 1,
    records: {},
    history: [],
    lastSavedAt: null
  };
  let activeScenarioId = 1;
  let adminUnlocked = false;

  const els = {
    nav: document.getElementById("scenarioNav"),
    dashboard: document.getElementById("dashboardCards"),
    form: document.getElementById("scenarioForm"),
    table: document.getElementById("recordsTable"),
    title: document.getElementById("scenarioTitle"),
    sheet: document.getElementById("sheetName"),
    description: document.getElementById("scenarioDescription"),
    notice: document.getElementById("notice"),
    operator: document.getElementById("operatorName"),
    storageMode: document.getElementById("storageMode"),
    lastSaved: document.getElementById("lastSaved"),
    exportScenario: document.getElementById("exportScenarioBtn"),
    exportAll: document.getElementById("exportAllBtn"),
    downloadJson: document.getElementById("downloadJsonBtn"),
    importJson: document.getElementById("importJsonInput"),
    refresh: document.getElementById("refreshBtn"),
    clearLocal: document.getElementById("clearLocalBtn"),
    menuToggle: document.getElementById("menuToggle"),
    menuClose: document.getElementById("menuClose"),
    sidebar: document.getElementById("sidebar"),
    navBackdrop: document.getElementById("navBackdrop")
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    els.operator.value = localStorage.getItem(`${STORAGE_KEY}-operator`) || "";
    els.operator.addEventListener("input", () => {
      localStorage.setItem(`${STORAGE_KEY}-operator`, els.operator.value.trim());
    });

    await loadState();
    renderAll();
    bindGlobalActions();
  }

  function bindGlobalActions() {
    els.exportScenario.addEventListener("click", () => exportScenarioCsv(activeScenarioId));
    els.exportAll.addEventListener("click", exportAllCsv);
    els.downloadJson.addEventListener("click", downloadJsonBackup);
    els.refresh.addEventListener("click", async () => {
      await loadState(true);
      renderAll();
      showNotice("Datos recargados desde Firebase.", "success");
    });
    if (els.importJson) els.importJson.addEventListener("change", importJsonBackup);
    if (els.clearLocal) {
      els.clearLocal.addEventListener("click", () => {
        if (!confirm("¿Seguro que deseas borrar los datos guardados en este navegador?")) return;
        localStorage.removeItem(STORAGE_KEY);
        state = { version: 1, records: {}, history: [], lastSavedAt: null };
        renderAll();
        showNotice("Datos locales borrados. Si usas Firebase, presiona Actualizar datos para volver a cargar la nube.", "success");
      });
    }
    if (els.menuToggle) els.menuToggle.addEventListener("click", openMobileMenu);
    if (els.menuClose) els.menuClose.addEventListener("click", closeMobileMenu);
    if (els.navBackdrop) els.navBackdrop.addEventListener("click", closeMobileMenu);
  }

  function getFirebaseConfig() {
    const fb = CONFIG.firebase || {};
    const enabled = Boolean(fb.enabled && fb.databaseURL && !fb.databaseURL.includes("TU-PROYECTO"));
    const databaseURL = String(fb.databaseURL || "").replace(/\/$/, "");
    const path = String(fb.path || "comedormonitor").replace(/^\//, "").replace(/\/$/, "");
    return { enabled, databaseURL, path };
  }

  async function loadState(forceRemote = false) {
    const fb = getFirebaseConfig();
    els.storageMode.textContent = fb.enabled ? "Modo Firebase" : "Modo local";

    if (fb.enabled) {
      try {
        const response = await fetch(`${fb.databaseURL}/${fb.path}.json?ts=${Date.now()}`);
        if (!response.ok) throw new Error(`Firebase respondió ${response.status}`);
        const remoteRaw = await response.json();
        const remote = restoreFromFirebase(remoteRaw);
        if (remoteRaw) {
          state = normalizeState(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          updateSaveLabel();
          return;
        }
        if (forceRemote) {
          state = { version: 1, records: {}, history: [], lastSavedAt: null };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          updateSaveLabel();
          return;
        }
        const local = readLocalState();
        state = normalizeState(local);
        await persistState();
        return;
      } catch (error) {
        console.warn(error);
        showNotice("No se pudo leer Firebase. Se usará la copia local del navegador.", "error");
      }
    }

    state = normalizeState(readLocalState());
    updateSaveLabel();
  }

  function readLocalState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || state;
    } catch (_) {
      return state;
    }
  }

  function normalizeState(raw) {
    const normalized = {
      version: raw?.version || 1,
      records: raw?.records || {},
      history: Array.isArray(raw?.history) ? raw.history : [],
      lastSavedAt: raw?.lastSavedAt || null
    };

    // Corrige IDs con ceros a la izquierda: 001, 01 y 1 se tratan como el mismo ID.
    normalized.records = normalizeRecordIds(normalized.records);
    normalized.history = normalizeHistoryIds(normalized.history);
    migrateScenario3Split(normalized);
    normalized.records = normalizeRecordIds(normalized.records);
    normalized.history = normalizeHistoryIds(normalized.history);
    return normalized;
  }

  function normalizeIdValue(value) {
    const text = String(value ?? "").trim();
    if (!/^\d+$/.test(text)) return text;
    return text.replace(/^0+/, "") || "0";
  }

  function normalizeRecordIds(records) {
    const output = {};
    Object.entries(records || {}).forEach(([key, record]) => {
      const canonicalId = normalizeIdValue(record?.id ?? key);
      if (!canonicalId) return;
      const cleanRecord = {
        ...(record || {}),
        id: canonicalId,
        stages: record?.stages || {}
      };

      if (!output[canonicalId]) {
        output[canonicalId] = cleanRecord;
        return;
      }

      // Si ya existía el mismo ID sin ceros, no se sobreescriben sus tiempos.
      const existing = output[canonicalId];
      existing.stages = existing.stages || {};
      Object.entries(cleanRecord.stages || {}).forEach(([stageId, stage]) => {
        existing.stages[stageId] = { ...(stage || {}), ...(existing.stages[stageId] || {}) };
      });
      existing.createdAt = existing.createdAt || cleanRecord.createdAt;
      existing.updatedAt = existing.updatedAt || cleanRecord.updatedAt;
    });
    return output;
  }

  function normalizeHistoryIds(history) {
    return (history || []).map(item => ({ ...item, id: normalizeIdValue(item?.id) }));
  }

  function migrateScenario3Split(data) {
    Object.values(data.records || {}).forEach(record => {
      if (!record.stages) record.stages = {};
      const oldStage3 = record.stages[3];
      if (!oldStage3) return;

      const hasFinishData = oldStage3["Pagó"] || oldStage3["# de caja"] || oldStage3["T. fin caja"];
      if (hasFinishData && !record.stages[9]) {
        record.stages[9] = {};
        ["Pagó", "# de caja", "T. fin caja"].forEach(key => {
          if (oldStage3[key] !== undefined) record.stages[9][key] = oldStage3[key];
        });
      }
    });
  }

  async function persistState(options = {}) {
    const mergeRemote = options.mergeRemote !== false;
    state.lastSavedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateSaveLabel();

    const fb = getFirebaseConfig();
    if (!fb.enabled) return;

    try {
      if (mergeRemote) {
        const remoteResponse = await fetch(`${fb.databaseURL}/${fb.path}.json?ts=${Date.now()}`);
        const remoteState = remoteResponse.ok ? restoreFromFirebase(await remoteResponse.json()) : null;
        state = mergeStates(normalizeState(remoteState || {}), state);
        state.lastSavedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        updateSaveLabel();
      }

      const response = await fetch(`${fb.databaseURL}/${fb.path}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepareForFirebase(state))
      });
      if (!response.ok) throw new Error(`Firebase respondió ${response.status}`);
      showNotice("Guardado en Firebase correctamente.", "success");
    } catch (error) {
      console.warn(error);
      showNotice("Se guardó localmente, pero no se pudo guardar en Firebase. Revisa config.js y las reglas de la base.", "error");
    }
  }



  async function syncBeforeWrite() {
    const fb = getFirebaseConfig();
    if (!fb.enabled) return;

    try {
      const response = await fetch(`${fb.databaseURL}/${fb.path}.json?ts=${Date.now()}`);
      if (!response.ok) throw new Error(`Firebase respondió ${response.status}`);
      const remote = normalizeState(restoreFromFirebase(await response.json()) || {});
      state = remote;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateSaveLabel();
    } catch (error) {
      console.warn(error);
      showNotice("No se pudo validar Firebase antes de guardar. Intenta presionar Actualizar y vuelve a probar.", "error");
      throw error;
    }
  }

  function prepareForFirebase(value) {
    return transformFirebaseKeys(value, encodeFirebaseKey);
  }

  function restoreFromFirebase(value) {
    return transformFirebaseKeys(value, decodeFirebaseKey);
  }

  function transformFirebaseKeys(value, keyTransform) {
    if (Array.isArray(value)) return value.map(item => transformFirebaseKeys(item, keyTransform));
    if (!value || typeof value !== "object") return value;
    const output = {};
    Object.entries(value).forEach(([key, childValue]) => {
      output[keyTransform(key)] = transformFirebaseKeys(childValue, keyTransform);
    });
    return output;
  }

  function encodeFirebaseKey(key) {
    return String(key)
      .replaceAll(".", "__dot__")
      .replaceAll("#", "__hash__")
      .replaceAll("$", "__dollar__")
      .replaceAll("/", "__slash__")
      .replaceAll("[", "__lb__")
      .replaceAll("]", "__rb__");
  }

  function decodeFirebaseKey(key) {
    return String(key)
      .replaceAll("__dot__", ".")
      .replaceAll("__hash__", "#")
      .replaceAll("__dollar__", "$")
      .replaceAll("__slash__", "/")
      .replaceAll("__lb__", "[")
      .replaceAll("__rb__", "]");
  }

  function mergeStates(remote, local) {
    const merged = {
      version: Math.max(remote.version || 1, local.version || 1),
      records: { ...(remote.records || {}) },
      history: [],
      lastSavedAt: local.lastSavedAt || remote.lastSavedAt || null
    };

    Object.entries(local.records || {}).forEach(([id, localRecord]) => {
      const remoteRecord = merged.records[id] || { id, stages: {} };
      const stages = { ...(remoteRecord.stages || {}) };
      Object.entries(localRecord.stages || {}).forEach(([stageId, localStage]) => {
        stages[stageId] = { ...(stages[stageId] || {}), ...(localStage || {}) };
      });
      merged.records[id] = { ...remoteRecord, ...localRecord, stages };
    });

    const seen = new Set();
    [...(remote.history || []), ...(local.history || [])].forEach(item => {
      const key = `${item.id}|${item.scenarioId}|${item.action}|${item.timestamp}|${item.monitor}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.history.push(item);
      }
    });
    return merged;
  }

  function updateSaveLabel() {
    els.lastSaved.textContent = state.lastSavedAt
      ? `Último guardado: ${formatDateTime(new Date(state.lastSavedAt))}`
      : "Sin guardado todavía";
  }

  function renderAll() {
    renderNav();
    renderDashboard();
    renderScenario();
    renderTable();
  }

  function openMobileMenu() {
    if (!els.sidebar || !els.navBackdrop) return;
    els.sidebar.classList.add("open");
    els.navBackdrop.classList.remove("hidden");
    document.body.classList.add("menu-open");
  }

  function closeMobileMenu() {
    if (!els.sidebar || !els.navBackdrop) return;
    els.sidebar.classList.remove("open");
    els.navBackdrop.classList.add("hidden");
    document.body.classList.remove("menu-open");
  }

  function renderNav() {
    els.nav.innerHTML = "";
    SCENARIOS.forEach((scenario) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = scenario.id === activeScenarioId ? "active" : "";
      const countLabel = scenario.isAdmin ? "Admin" : countCompleted(scenario.id);
      btn.innerHTML = `<span>${scenario.sheet}<br><small>${escapeHtml(scenario.title)}</small></span><span class="count">${countLabel}</span>`;
      btn.addEventListener("click", () => {
        activeScenarioId = scenario.id;
        clearNotice();
        closeMobileMenu();
        renderAll();
      });
      els.nav.appendChild(btn);
    });
  }

  function renderDashboard() {
    const cards = [
      ["Hoja 1", countCompleted(1), "llegaron"],
      ["Hoja 3B", countCompleted(9), "finalizaron caja"],
      ["Hoja 7", countCompleted(7), "finalizaron entrega"],
      ["Hoja 8", countCompleted(8), "se sentaron"]
    ];
    els.dashboard.innerHTML = cards.map(([title, value, caption]) => `
      <article class="card">
        <span>${title}</span>
        <strong>${value}</strong>
        <span>${caption}</span>
      </article>
    `).join("");
  }

  function renderScenario() {
    const scenario = getScenario(activeScenarioId);
    els.sheet.textContent = scenario.sheet;
    els.title.textContent = scenario.title;
    els.description.textContent = scenario.description;
    els.exportScenario.disabled = Boolean(scenario.isAdmin);
    els.form.innerHTML = "";

    if (scenario.isAdmin) {
      renderAdminForm();
    } else if (scenario.id === 4) {
      renderScenario4Form(scenario);
    } else {
      renderStandardForm(scenario);
    }
  }

  function renderStandardForm(scenario) {
    const idField = createIdField(scenario);
    els.form.appendChild(idField);
    scenario.fields.forEach(field => els.form.appendChild(createInputField(field)));
    els.form.appendChild(createActionsRow([
      { label: "Check", onClick: () => handleStandardCheck(scenario) }
    ]));
    attachIdAutofill(scenario);
    attachEnterSubmitForSingleIdScenario(scenario);
  }

  function renderScenario3Form(scenario) {
    els.form.appendChild(createIdField(scenario));
    scenario.startFields.forEach(field => els.form.appendChild(createInputField(field)));
    els.form.appendChild(createActionsRow([
      { label: "Siguiente", onClick: () => handleScenario3Start(scenario) }
    ]));

    scenario.finishFields.forEach(field => els.form.appendChild(createInputField(field)));
    els.form.appendChild(createActionsRow([
      { label: "Check", onClick: () => handleScenario3Finish(scenario), secondary: false }
    ]));
    attachIdAutofill(scenario);
  }

  function renderScenario4Form(scenario) {
    const reservoField = createInputField(scenario.fields[0]);
    els.form.appendChild(reservoField);
    els.form.appendChild(createIdField(scenario, { initiallyFree: false }));
    els.form.appendChild(createInputField(scenario.fields[1]));
    els.form.appendChild(createActionsRow([
      { label: "Check", onClick: () => handleScenario4Check(scenario) }
    ]));

    const reservoInput = document.getElementById("field-reservo");
    const idInput = document.getElementById("recordId");
    const help = document.getElementById("idHelp");
    const datalist = document.getElementById(`ids-s${scenario.id}`);
    const toggleMode = () => {
      if (reservoInput.value === "1") {
        idInput.placeholder = "Buscar ID registrado en Hoja 1";
        help.textContent = "Reservó = 1: el ID debe existir en Hoja 1, aunque no haya pasado por Hoja 3B.";
        if (datalist) datalist.innerHTML = getHoja1Ids().map(id => `<option value="${escapeHtml(id)}"></option>`).join("");
      } else {
        idInput.placeholder = "Buscar ID de Hoja 3B";
        help.textContent = "Reservó = 0: el ID debe existir en Hoja 3B y no debe haber abandonado.";
        if (datalist) datalist.innerHTML = getIdOptions(scenario).map(id => `<option value="${escapeHtml(id)}"></option>`).join("");
      }
    };
    reservoInput.addEventListener("change", toggleMode);
    toggleMode();
    attachIdAutofill(scenario);
  }

  function renderAdminForm() {
    els.form.innerHTML = "";
    const info = document.createElement("div");
    info.className = "form-row full admin-info";
    info.innerHTML = "<strong>Uso:</strong> esta hoja elimina el ID completo de todas las hojas y también lo guarda así en Firebase. Úsala solo para corregir registros de prueba o errores.";
    els.form.appendChild(info);

    if (!adminUnlocked) {
      const pass = document.createElement("div");
      pass.className = "form-row";
      pass.innerHTML = `<label for="adminPassword">Contraseña</label><input id="adminPassword" type="password" placeholder="Contraseña" autocomplete="off" />`;
      els.form.appendChild(pass);
      els.form.appendChild(createActionsRow([
        { label: "Ingresar", onClick: () => {
          const value = document.getElementById("adminPassword")?.value || "";
          if (value !== "santo") return showNotice("Contraseña incorrecta.", "error");
          adminUnlocked = true;
          showNotice("Acceso concedido.", "success");
          renderScenario();
        }}
      ]));
      return;
    }

    const row = document.createElement("div");
    row.className = "form-row";
    row.innerHTML = `<label for="deleteId">#ID a borrar</label><input id="deleteId" list="deleteIds" placeholder="Ej. 100" /><datalist id="deleteIds">${Object.keys(state.records).sort(naturalSort).map(id => `<option value="${escapeHtml(id)}"></option>`).join("")}</datalist><small>Se eliminará de todas las hojas. También puedes borrar IDs errados antiguos, por ejemplo con letras.</small>`;
    els.form.appendChild(row);
    els.form.appendChild(createActionsRow([
      { label: "Borrar ID", onClick: handleDeleteId }
    ]));
  }

  function createIdField(scenario) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-row";

    const datalistId = `ids-s${scenario.id}`;
    const previousSheet = scenario.previous ? (getScenario(scenario.previous)?.sheet || `Hoja ${scenario.previous}`) : "";
    wrapper.innerHTML = `
      ${createLabelHtml("recordId", "#ID")}
      <input id="recordId" list="${datalistId}" inputmode="numeric" pattern="[0-9]*" placeholder="${scenario.previous ? `Buscar ID de ${previousSheet}` : "Ej. 100"}" />
      <datalist id="${datalistId}">${getIdOptions(scenario).map(id => `<option value="${escapeHtml(id)}"></option>`).join("")}</datalist>
      <small id="idHelp">${scenario.previous ? `Solo aparecen IDs que ya completaron ${previousSheet}.` : "Puedes usar los IDs precargados de 100 a 848. Si escribes 001, se guardará como 1."}</small>
    `;
    setTimeout(() => attachNumericCleaner(document.getElementById("recordId"), { normalizeOnBlur: false }), 0);
    return wrapper;
  }

  function createInputField(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-row";
    const id = `field-${field.key}`;
    const min = field.min !== undefined ? `min="${field.min}"` : "";
    const isNumeric = field.type === "number" || NUMERIC_FIELD_LABELS.has(field.label);

    let inputHtml = "";
    if (field.type === "select") {
      inputHtml = `
        <select id="${id}" data-key="${field.key}" data-label="${escapeHtml(field.label)}">
          <option value="">Selecciona...</option>
          ${field.options.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
        </select>`;
    } else if (isNumeric) {
      inputHtml = `<input id="${id}" data-key="${field.key}" data-label="${escapeHtml(field.label)}" data-numeric="true" type="text" inputmode="numeric" pattern="[0-9]*" ${min} placeholder="${escapeHtml(field.placeholder || "")}" />`;
    } else {
      inputHtml = `<input id="${id}" data-key="${field.key}" data-label="${escapeHtml(field.label)}" type="${field.type || "text"}" ${min} placeholder="${escapeHtml(field.placeholder || "")}" />`;
    }

    wrapper.innerHTML = `${createLabelHtml(id, field.label)}${inputHtml}`;
    if (isNumeric) setTimeout(() => attachNumericCleaner(document.getElementById(id), { normalizeOnBlur: true }), 0);
    return wrapper;
  }


  function createLabelHtml(forId, label) {
    const definition = FIELD_HELP[label] || FIELD_HELP[label?.trim?.()] || "";
    const helpHtml = definition
      ? `<span class="help-wrap"><button class="help-icon" type="button" aria-label="Ayuda: ${escapeHtml(label)}" title="${escapeHtml(definition)}">?</button><span class="help-popover">${escapeHtml(definition)}</span></span>`
      : "";
    return `<label class="field-label" for="${forId}"><span>${escapeHtml(label)}</span>${helpHtml}</label>`;
  }

  function attachNumericCleaner(input, options = {}) {
    if (!input || input.dataset.numericCleaner === "1") return;
    input.dataset.numericCleaner = "1";
    input.addEventListener("input", () => {
      const cleaned = input.value.replace(/\D/g, "");
      if (input.value !== cleaned) input.value = cleaned;
    });
    if (options.normalizeOnBlur) {
      input.addEventListener("blur", () => {
        if (/^\d+$/.test(input.value)) input.value = normalizeIdValue(input.value);
      });
    }
  }

  function attachEnterSubmitForSingleIdScenario(scenario) {
    if (![1, 7].includes(Number(scenario.id)) || (scenario.fields || []).length > 0) return;
    const idInput = document.getElementById("recordId");
    if (!idInput) return;
    idInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      handleStandardCheck(scenario);
    });
  }

  function createActionsRow(actions) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-row full form-actions";
    actions.forEach(action => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = action.label;
      if (action.secondary) btn.className = "secondary";
      btn.addEventListener("click", action.onClick);
      wrapper.appendChild(btn);
    });
    return wrapper;
  }

  function attachIdAutofill(scenario) {
    const idInput = document.getElementById("recordId");
    if (!idInput) return;
    const normalizeAndFill = () => {
      const raw = idInput.value.trim();
      if (/^\d+$/.test(raw)) idInput.value = normalizeIdValue(raw);
      fillFormFromRecord(scenario, idInput.value.trim());
    };
    idInput.addEventListener("change", normalizeAndFill);
    idInput.addEventListener("blur", normalizeAndFill);
  }

  function fillFormFromRecord(scenario, id) {
    id = normalizeIdValue(id);
    const record = state.records[id];
    const stage = record?.stages?.[scenario.id];
    if (!stage) return;

    const fields = [...(scenario.fields || []), ...(scenario.startFields || []), ...(scenario.finishFields || [])];
    fields.forEach(field => {
      const input = document.getElementById(`field-${field.key}`);
      if (input && stage[field.label] !== undefined) input.value = stage[field.label];
    });
  }

  async function handleStandardCheck(scenario) {
    const id = getCleanId();
    if (!id) return showNotice("Ingresa un ID válido. Solo se permiten números, sin letras ni símbolos.", "error");

    const fieldValues = collectFields(scenario.fields || []);
    if (!fieldValues.ok) return showNotice(fieldValues.message, "error");

    try {
      await syncBeforeWrite();
    } catch (_) {
      return;
    }

    if (scenario.previous && !isEligibleForScenario(id, scenario.id)) {
      return showNotice(`Este ID todavía no completó la ${getScenario(scenario.previous)?.sheet || `Hoja ${scenario.previous}`}.`, "error");
    }

    if (isStageComplete(state.records[id], scenario.id)) {
      return showNotice(`Este ID ya fue registrado en ${scenario.sheet}. No se actualizó para evitar duplicados.`, "error");
    }

    const record = ensureRecord(id);
    record.stages[scenario.id] = record.stages[scenario.id] || {};
    Object.assign(record.stages[scenario.id], fieldValues.values);
    setTimeIfEmpty(record.stages[scenario.id], scenario.timeKey);
    record.updatedAt = new Date().toISOString();
    pushHistory(id, scenario.id, "check", record.stages[scenario.id]);

    await persistState();
    showNotice(`Registrado correctamente en ${scenario.sheet}.`, "success");
    resetFormKeepScenario();
    renderAll();
  }

  async function handleScenario3Start(scenario) {
    const id = getCleanId();
    if (!id) return showNotice("Busca o ingresa un ID válido. Solo se permiten números, sin letras ni símbolos.", "error");
    if (!isEligibleForScenario(id, scenario.id)) return showNotice("Este ID todavía no completó la Hoja 2.", "error");

    const fieldValues = collectFields(scenario.startFields);
    if (!fieldValues.ok) return showNotice(fieldValues.message, "error");

    const record = ensureRecord(id);
    record.stages[3] = record.stages[3] || {};
    Object.assign(record.stages[3], fieldValues.values);
    setTimeIfEmpty(record.stages[3], scenario.startTimeKey);
    record.updatedAt = new Date().toISOString();
    pushHistory(id, 3, "siguiente", record.stages[3]);

    await persistState();
    showNotice("T. inicio caja registrado. Ahora completa Pagó y # de caja y presiona Check.", "success");
    renderAll();
    document.getElementById("recordId").value = id;
    fillFormFromRecord(scenario, id);
  }

  async function handleScenario3Finish(scenario) {
    const id = getCleanId();
    if (!id) return showNotice("Busca o ingresa un ID válido. Solo se permiten números, sin letras ni símbolos.", "error");
    if (!isEligibleForScenario(id, scenario.id)) return showNotice("Este ID todavía no completó la Hoja 2.", "error");

    const record = state.records[id];
    if (!record?.stages?.[3]?.[scenario.startTimeKey]) {
      return showNotice("Primero presiona Siguiente para registrar T. inicio caja.", "error");
    }

    const fieldValues = collectFields(scenario.finishFields);
    if (!fieldValues.ok) return showNotice(fieldValues.message, "error");

    Object.assign(record.stages[3], fieldValues.values);
    setTimeIfEmpty(record.stages[3], scenario.finishTimeKey);
    record.updatedAt = new Date().toISOString();
    pushHistory(id, 3, "check", record.stages[3]);

    await persistState();
    showNotice("T. fin caja registrado correctamente.", "success");
    resetFormKeepScenario();
    renderAll();
  }

  async function handleScenario4Check(scenario) {
    const id = getCleanId();
    if (!id) return showNotice("Ingresa un ID válido. Solo se permiten números, sin letras ni símbolos.", "error");

    const reservo = document.getElementById("field-reservo")?.value;
    if (reservo !== "1" && reservo !== "0") return showNotice("Selecciona Reservó 1 o 0.", "error");

    const fieldValues = collectFields(scenario.fields || []);
    if (!fieldValues.ok) return showNotice(fieldValues.message, "error");

    try {
      await syncBeforeWrite();
    } catch (_) {
      return;
    }

    if (reservo === "0" && !isEligibleForScenario(id, scenario.id)) {
      return showNotice("Reservó = 0: el ID debe existir, haber completado Hoja 3B y no haber marcado Abandonó.", "error");
    }

    if (reservo === "1" && !isStageComplete(state.records[id], 1)) {
      return showNotice("Reservó = 1: este ID no existe en Hoja 1. Primero debe estar registrado al ingresar por la puerta.", "error");
    }

    if (isStageComplete(state.records[id], scenario.id)) {
      return showNotice(`Este ID ya fue registrado en ${scenario.sheet}. No se actualizó para evitar duplicados.`, "error");
    }

    const record = ensureRecord(id);
    record.stages[4] = record.stages[4] || {};
    Object.assign(record.stages[4], fieldValues.values);
    setTimeIfEmpty(record.stages[4], scenario.timeKey);
    record.updatedAt = new Date().toISOString();
    pushHistory(id, 4, "check", record.stages[4]);

    await persistState();
    showNotice(`Registrado correctamente en ${scenario.sheet}.`, "success");
    resetFormKeepScenario();
    renderAll();
  }

  async function handleDeleteId() {
    const rawId = getRawIdValue("deleteId");
    if (!rawId) return showNotice("Ingresa el ID que deseas borrar.", "error");
    const idToDelete = hasOnlyNumericId(rawId) ? normalizeIdValue(rawId) : rawId;

    try {
      await syncBeforeWrite();
    } catch (_) {
      return;
    }

    if (!state.records[idToDelete]) {
      renderScenario();
      return showNotice("Ese ID no existe en la base actual.", "error");
    }

    if (!confirm(`¿Seguro que quieres borrar el ID ${idToDelete} de todas las hojas? Esta acción se guardará en Firebase.`)) return;

    delete state.records[idToDelete];
    state.history = (state.history || []).filter(item => String(normalizeIdValue(item.id)) !== String(idToDelete));
    await persistState({ mergeRemote: false });
    renderAll();
    showNotice(`ID ${idToDelete} borrado de todas las hojas y de Firebase.`, "success");
  }

  function collectFields(fields) {
    const values = {};
    for (const field of fields) {
      const input = document.getElementById(`field-${field.key}`);
      const value = input?.value?.trim() ?? "";
      if (value === "") return { ok: false, message: `Completa el campo: ${field.label}` };
      if ((field.type === "number" || NUMERIC_FIELD_LABELS.has(field.label)) && !/^\d+$/.test(value)) {
        return { ok: false, message: `${field.label} solo permite números enteros, sin letras ni símbolos.` };
      }
      values[field.label] = (field.type === "number" || NUMERIC_FIELD_LABELS.has(field.label)) ? normalizeIdValue(value) : value;
    }
    return { ok: true, values };
  }

  function getCleanId() {
    const raw = String(document.getElementById("recordId")?.value || "").trim();
    if (!raw) return "";
    if (!/^\d+$/.test(raw)) return "";
    const normalized = normalizeIdValue(raw);
    const input = document.getElementById("recordId");
    if (input) input.value = normalized;
    return normalized;
  }

  function getRawIdValue(elementId = "recordId") {
    return String(document.getElementById(elementId)?.value || "").trim();
  }

  function hasOnlyNumericId(value) {
    return /^\d+$/.test(String(value || "").trim());
  }

  function ensureRecord(id) {
    if (!state.records[id]) {
      state.records[id] = {
        id,
        stages: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return state.records[id];
  }

  function setTimeIfEmpty(stage, key) {
    if (!stage[key]) stage[key] = formatDateTime(new Date());
  }

  function pushHistory(id, scenarioId, action, snapshot) {
    state.history.push({
      id,
      scenarioId,
      sheet: getScenario(scenarioId).sheet,
      action,
      monitor: els.operator.value.trim() || "Sin nombre",
      timestamp: formatDateTime(new Date()),
      data: { ...snapshot }
    });
  }

  function resetFormKeepScenario() {
    els.form.reset();
  }

  function getScenario(id) {
    return SCENARIOS.find(s => s.id === Number(id));
  }

  function isStageComplete(record, scenarioId) {
    if (!record?.stages?.[scenarioId]) return false;
    const scenario = getScenario(scenarioId);
    if (!scenario) return false;
    if (scenario.finishTimeKey) return Boolean(record.stages[scenarioId][scenario.finishTimeKey]);
    return Boolean(record.stages[scenarioId][scenario.timeKey]);
  }

  function isEligibleForScenario(id, scenarioId) {
    const scenario = getScenario(scenarioId);
    if (!scenario.previous) return true;
    const record = state.records[id];
    if (!isStageComplete(record, scenario.previous)) return false;
    if (Number(scenarioId) === 4 && record?.stages?.[9]?.["Pagó"] === "Abandonó") return false;
    return true;
  }

  function getHoja1Ids() {
    return Object.values(state.records)
      .filter(record => isStageComplete(record, 1))
      .map(record => record.id)
      .sort(naturalSort);
  }

  function getIdOptions(scenario) {
    if (!scenario.previous) return PRELOADED_IDS;
    return Object.values(state.records)
      .filter(record => isStageComplete(record, scenario.previous))
      .map(record => record.id)
      .sort(naturalSort);
  }

  function countCompleted(scenarioId) {
    const scenario = getScenario(scenarioId);
    if (scenario?.isAdmin) return 0;
    return Object.values(state.records).filter(record => isStageComplete(record, scenarioId)).length;
  }

  function renderTable() {
    const scenario = getScenario(activeScenarioId);
    if (scenario?.isAdmin) {
      const headers = ["#ID", "Hojas registradas"];
      const rows = Object.values(state.records).map(record => ({
        "#ID": record.id,
        "Hojas registradas": Object.keys(record.stages || {}).map(id => getScenario(id)?.sheet || id).join(", ")
      })).sort((a, b) => naturalSort(a["#ID"], b["#ID"]));
      els.table.innerHTML = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}">No hay IDs registrados.</td></tr>`}</tbody>`;
      return;
    }
    const rows = getRowsForScenario(scenario.id);
    const headers = [...scenario.columns, "Monitor último movimiento"];

    if (!rows.length) {
      els.table.innerHTML = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody><tr><td colspan="${headers.length}">Todavía no hay registros en esta hoja.</td></tr></tbody>`;
      return;
    }

    els.table.innerHTML = `
      <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>
        ${rows.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`).join("")}
      </tbody>
    `;
  }

  function getRowsForScenario(scenarioId) {
    const scenario = getScenario(scenarioId);
    return Object.values(state.records)
      .filter(record => record.stages?.[scenarioId])
      .map(record => {
        const stage = record.stages[scenarioId] || {};
        const row = { "#ID ": record.id };
        scenario.columns.slice(1).forEach(col => row[col] = stage[col] ?? "");
        const last = [...state.history].reverse().find(h => h.id === record.id && h.scenarioId === scenarioId);
        row["Monitor último movimiento"] = last ? `${last.monitor} - ${last.timestamp}` : "";
        return row;
      })
      .sort((a, b) => naturalSort(a["#ID "], b["#ID "]));
  }

  function exportScenarioCsv(scenarioId) {
    const scenario = getScenario(scenarioId);
    if (scenario?.isAdmin) return showNotice("La Hoja 9 es solo para administración. Usa Exportar todo CSV para descargar la data.", "error");
    const rows = getRowsForScenario(scenarioId);
    downloadText(`${scenario.sheet.replace(/\s+/g, "_")}.csv`, toCsv(rows, [...scenario.columns, "Monitor último movimiento"]), "text/csv;charset=utf-8");
  }

  function exportAllCsv() {
    const allRows = [];
    SCENARIOS.filter(scenario => !scenario.isAdmin).forEach(scenario => {
      getRowsForScenario(scenario.id).forEach(row => {
        allRows.push({ Hoja: scenario.sheet, Escenario: scenario.title, ...row });
      });
    });
    const headers = ["Hoja", "Escenario", "#ID ", "T. llega al comedor", "# pers. en caja", "T. cola caja", "Caja 1 o 2", "T. inicio caja", "Pagó", "# de caja", "T. fin caja", "Reservó 1 o 0", "# cola entrega", "T. zona de entrega", "Tipo pedido", "T. inicio entrega", "# trab. entregan", "T. prep. plato", "T. fin entrega", "# A. ocupados perso", "T. sentarse", "# A. libres", "# A. mochila o lonchera", "Monitor último movimiento"];
    downloadText("monitor_comedor_todo.csv", toCsv(allRows, headers), "text/csv;charset=utf-8");
  }

  function toCsv(rows, headers) {
    const cleanHeaders = headers.filter((h, index) => headers.indexOf(h) === index);
    const lines = [cleanHeaders.map(csvEscape).join(";")];
    rows.forEach(row => lines.push(cleanHeaders.map(h => csvEscape(row[h] ?? "")).join(";")));
    return "\ufeff" + lines.join("\n");
  }

  function csvEscape(value) {
    const text = String(value ?? "").replace(/\r?\n/g, " ");
    if (/[";]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function downloadJsonBackup() {
    downloadText("backup_monitor_comedor.json", JSON.stringify(state, null, 2), "application/json;charset=utf-8");
  }

  async function importJsonBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      state = normalizeState(parsed);
      await persistState();
      renderAll();
      showNotice("Backup importado correctamente.", "success");
    } catch (error) {
      console.warn(error);
      showNotice("No se pudo importar el JSON. Verifica que sea un backup válido.", "error");
    } finally {
      event.target.value = "";
    }
  }

  function downloadText(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function showNotice(message, type = "") {
    els.notice.textContent = message;
    els.notice.className = `notice ${type}`.trim();
  }

  function clearNotice() {
    els.notice.className = "notice hidden";
    els.notice.textContent = "";
  }

  function formatDateTime(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function naturalSort(a, b) {
    return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
