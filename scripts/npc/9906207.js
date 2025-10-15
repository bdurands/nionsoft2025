/*
 * NPC: Evolving Rings – 24h cooldown, secuencial 1→10
 * v2 – Costo desde nivel 2: 400 x 4036468 y limpieza anti-abuso
 *
 * Reglas:
 *  - 1 canje cada 24h por personaje (cooldown estricto por último canje).
 *  - Secuencial: para N+1 debes entregar N.
 *  - Nivel 1: gratis. Nivel 2..10: requiere 400 x 4036468.
 *  - Tras obtener un anillo, se limpian automáticamente los inferiores y duplicados.
 */

var status = 0;

// ================= CONFIG =================
var COOLDOWN_HOURS = 24;
var TITLE = "Evolving Rings - Canje diario (24h)";

var RINGS = [
  1112692, // lvl 1
  1112693, // lvl 2
  1112694, // lvl 3
  1112695, // lvl 4
  1112696, // lvl 5
  1112697, // lvl 6
  1112698, // lvl 7
  1112699, // lvl 8
  1112700, // lvl 9
  1112701  // lvl 10
];

// COSTO desde NIVEL 2:
var COST_ITEM_ID = 4036468;
var COST_PER_UPGRADE = 400;

// Mensajes
var MSG_NO_SPACE   = "Asegurate de tener espacio en tu inventario de EQUIP.";
var MSG_LOCKED_OUT = function(h, m){ return "Aun no han pasado 24 horas desde tu último canje.\r\nTiempo restante: #r" + h + "h " + m + "m#k."; };
var MSG_DONE_ALL   = "Ya alcanzaste el nivel 10 del anillo! No hay mas niveles por canjear.";

// ================= UTILS =================
function nowMillis(){ return java.lang.System.currentTimeMillis(); }
function addHours(tsMillis, h){ return tsMillis + (h * 60 * 60 * 1000); }

function nameOf(itemId){ return "#t" + itemId + "#"; }

// Devuelve el nivel (1..10) del anillo más alto que posea el jugador. 0 si ninguno.
function highestRingOwned() {
  for (var i = RINGS.length - 1; i >= 0; i--) {
    if (cm.haveItem(RINGS[i], 1)) return (i + 1);
  }
  return 0;
}

// Limpia todos los anillos inferiores a keepLevel y duplicados del nivel keepLevel.
function cleanLowerAndDuplicates(keepLevel) {
  if (keepLevel < 1) return;
  // 1) Eliminar TODOS los niveles inferiores
  for (var lvl = 1; lvl < keepLevel; lvl++) {
    var id = RINGS[lvl - 1];
    // remover todas las copias si existieran
    while (cm.haveItem(id, 1)) {
      cm.gainItem(id, -1);
    }
  }
  // 2) Asegurar SOLO 1 del nivel actual
  var keepId = RINGS[keepLevel - 1];
  var count = cm.getItemQuantity(keepId); // algunos cores tienen este helper; si no, intentamos while
  if (typeof count === "number") {
    while (count > 1) {
      cm.gainItem(keepId, -1);
      count--;
    }
  } else {
    // Fallback: eliminar hasta dejar uno
    var safety = 30;
    var removed = 0;
    // Mantener uno: intenta quitar si hay más de uno. No tenemos API para contar exacto, así que
    // removemos y si nos quedamos sin, devolvemos uno luego.
    var hadAtLeastOne = cm.haveItem(keepId, 1);
    var keepOneGivenBack = false;

    // Quita todo
    while (cm.haveItem(keepId, 1) && safety-- > 0) {
      cm.gainItem(keepId, -1);
      removed++;
    }
    // Devuelve 1 si originalmente había
    if (hadAtLeastOne) {
      cm.gainItem(keepId, 1);
      keepOneGivenBack = true;
    }
  }
}

// Lee el último log (stage y fecha)
function getLastExchange(characterId) {
  try {
    var con = Packages.tools.DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT stage, exchanged_at FROM evolving_ring_log WHERE character_id = ? ORDER BY exchanged_at DESC LIMIT 1"
    );
    ps.setInt(1, characterId);
    var rs = ps.executeQuery();

    var out = null;
    if (rs.next()) {
      out = {
        stage: rs.getInt("stage"),
        exchangedAt: rs.getTimestamp("exchanged_at")
      };
    }
    rs.close(); ps.close(); con.close();
    return out;
  } catch (e) {
    return null;
  }
}

// Inserta registro del canje
function logExchange(characterId, stage) {
  try {
    var con = Packages.tools.DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "INSERT INTO evolving_ring_log (character_id, stage, exchanged_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
    );
    ps.setInt(1, characterId);
    ps.setInt(2, stage);
    ps.executeUpdate();
    ps.close(); con.close();
    return true;
  } catch (e) {
    cm.getPlayer().message("DB error: " + e.toString());
    return false;
  }
}

// Calcula cooldown restante desde el último canje
function cooldownLeft(lastTs) {
  if (!lastTs) return { left: 0, h: 0, m: 0 };
  var lastMillis = lastTs.getTime();
  var unlockAt = addHours(lastMillis, COOLDOWN_HOURS);
  var diff = unlockAt - nowMillis();
  if (diff <= 0) return { left: 0, h: 0, m: 0 };
  var h = Math.floor(diff / (1000 * 60 * 60));
  var m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { left: diff, h: h, m: m };
}

// Opcional: intentar bloquear item (si el core lo soporta)
function tryLockUntradeableById(itemId) {
  try {
    var ItemFlag = Packages.client.inventory.ItemFlag;
    if (ItemFlag && ItemFlag.UNTRADEABLE) {
      // Dependiendo del core, puede existir:
      if (cm.lockItemById) cm.lockItemById(itemId);
    }
  } catch (e) {}
}

// ================= FLOW =================
function start(){ status = -1; action(1, 0, 0); }

function action(mode, type, selection) {
  if (mode != 1 && status == 0) { cm.dispose(); return; }
  if (mode == -1) { cm.dispose(); return; }
  if (mode == 1) status++; else status--;

  if (status == 0) {
    var chId = cm.getPlayer().getId();
    var last = getLastExchange(chId);
    var ownedLv = highestRingOwned();            // 0 si no tiene
    var nextLv  = (ownedLv == 0 ? 1 : ownedLv + 1);

    var txt = "#e" + TITLE + "#n\r\n\r\n";
    txt += "Tu progreso: ";
    if (ownedLv == 0) txt += "#rninguno#k";
    else txt += "#b" + nameOf(RINGS[ownedLv - 1]) + " (Nivel " + ownedLv + ")#k";
    txt += "\r\n";

    if (ownedLv >= 10) {
      cm.sendOk(txt + "\r\n" + MSG_DONE_ALL);
      cm.dispose(); return;
    }

    var left = cooldownLeft(last ? last.exchangedAt : null);
    var canExchangeNow = !(last && left.left > 0);

    txt += "\r\nOpciones:\r\n";
    if (ownedLv == 0) {
      txt += "#L1#Reclamar #b" + nameOf(RINGS[0]) + "#k (Nivel 1) – #gGRATIS#k#l\r\n";
    } else {
      var prevId = RINGS[ownedLv - 1];
      var nextId = RINGS[nextLv - 1];

      txt += "#L2#Canjear " + nameOf(prevId) + " → " + nameOf(nextId) +
             " (Nivel " + nextLv + ") – Costo: #b" + COST_PER_UPGRADE + " x #t" + COST_ITEM_ID + "##k#l\r\n";
    }
    txt += "#L3#Normalizar anillos (conservar solo el mas alto y quitar duplicados/inferiores).#l\r\n";

    if (!canExchangeNow) {
      txt += "\r\n#dCooldown activo:#k " + MSG_LOCKED_OUT(left.h, left.m);
    } else {
      txt += "\r\n#gNo tienes cooldown activo. Puedes canjear hoy.#k";
    }

    cm.sendSimple(txt);

  } else if (status == 1) {
    var chId = cm.getPlayer().getId();
    var last = getLastExchange(chId);
    var left = cooldownLeft(last ? last.exchangedAt : null);
    var ownedLv = highestRingOwned();
    var nextLv  = (ownedLv == 0 ? 1 : ownedLv + 1);

    if (selection == 3) {
      // Normalizar: conserva el más alto actual (ownedLv) y elimina inferiores + duplicados
      if (ownedLv <= 0) {
        cm.sendOk("No tienes anillos evolutivos para normalizar.");
        cm.dispose(); return;
      }
      cleanLowerAndDuplicates(ownedLv);
      cm.sendOk("Listo. Se conservara solo #b" + nameOf(RINGS[ownedLv - 1]) + " (Nivel " + ownedLv + ")#k y se eliminaron inferiores/duplicados.");
      cm.dispose(); return;
    }

    // Para canje (1 o 2) respetamos cooldown
    if (last && left.left > 0) {
      cm.sendOk(MSG_LOCKED_OUT(left.h, left.m));
      cm.dispose(); return;
    }

    if (ownedLv >= 10) {
      cm.sendOk(MSG_DONE_ALL);
      cm.dispose(); return;
    }

    if (ownedLv == 0) {
      // Reclamar nivel 1 (gratis)
      if (selection != 1) { cm.sendOk("Opción inválida."); cm.dispose(); return; }
      if (!cm.canHold(RINGS[0], 1)) { cm.sendOk(MSG_NO_SPACE); cm.dispose(); return; }

      cm.gainItem(RINGS[0], 1);
      tryLockUntradeableById(RINGS[0]);

      // Limpieza (por si acaso tenía inferiores “raros”; aquí no hay, pero dejamos consistente)
      cleanLowerAndDuplicates(1);

      if (!logExchange(chId, 1)) {
        cm.sendOk("Ocurrio un error registrando tu canje, contacta a un GM.");
        cm.dispose(); return;
      }

      cm.sendOk("Listo! Recibiste #b" + nameOf(RINGS[0]) + "#k.\r\nPodras volver a canjear en " + COOLDOWN_HOURS + " horas.");
      cm.dispose(); return;

    } else {
      // Canje N → N+1 con costo 400 x 4036468
      if (selection != 2) { cm.sendOk("Opción inválida."); cm.dispose(); return; }

      var prevId = RINGS[ownedLv - 1];
      var nextId = RINGS[nextLv - 1];

      if (!cm.haveItem(prevId, 1)) {
        cm.sendOk("No encuentro tu " + nameOf(prevId) + ". Asegurate de tenerlo en el inventario (no equipado).");
        cm.dispose(); return;
      }

      if (!cm.canHold(nextId, 1)) { cm.sendOk(MSG_NO_SPACE); cm.dispose(); return; }

      // Verificar costo
      if (!cm.haveItem(COST_ITEM_ID, COST_PER_UPGRADE)) {
        cm.sendOk("Necesitas #r" + COST_PER_UPGRADE + "#k x #b#t" + COST_ITEM_ID + "##k para canjear al siguiente nivel.");
        cm.dispose(); return;
      }

      // Cobrar costo y consumir anillo previo
      cm.gainItem(COST_ITEM_ID, -COST_PER_UPGRADE);
      cm.gainItem(prevId, -1);

      // Entregar nuevo
      cm.gainItem(nextId, 1);
      tryLockUntradeableById(nextId);

      // Limpieza automática: conservar solo el nivel nextLv
      cleanLowerAndDuplicates(nextLv);

      if (!logExchange(chId, nextLv)) {
        cm.sendOk("Ocurrio un error registrando tu canje, contacta a un GM.");
        cm.dispose(); return;
      }

      cm.sendOk("Perfecto! Cambiaste " + nameOf(prevId) + " por " + nameOf(nextId) + ".\r\n" +
                "Se consumieron #b" + COST_PER_UPGRADE + " x #t" + COST_ITEM_ID + "##k.\r\n" +
                "Vuelve en " + COOLDOWN_HOURS + " horas para el siguiente nivel.");
      cm.dispose(); return;
    }
  }
}
