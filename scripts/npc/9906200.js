/*
 * NPC: Regalos únicos con recuperación por queststatus (sin InfoQuest)
 * Regalo A: 1005267                (QUEST_ID_BASE = 991001)
 * Regalo B: 1053093/1053094 género (QUEST_ID_GENDER = 991002)
 * Regalo C: 1702726                (QUEST_ID_EXTRA = 991003)  <-- NUEVO
 * Core: OdinMS / HeavenMS / Cosmic v83
 */

var status = 0;

// ---------------- CONFIG ----------------
var ITEM_BASE = 1005267;        // Regalo 1 (siempre)
var QUEST_ID_BASE = 88888;     // Quest para 1005267

// Regalo 2 (según género)
var ITEM_MALE   = 1053093;
var ITEM_FEMALE = 1053094;
var QUEST_ID_GENDER = 88889;   // Quest para sombrero por género

// Regalo 3 (nuevo)
var ITEM_EXTRA = 1702726;       // <-- NUEVO ÍTEM
var QUEST_ID_EXTRA = 88887;    // <-- NUEVO QUEST ID
// ----------------------------------------

// Textos (ASCII seguro)
var TXT_TITLE   = "Regalos especiales";
var TXT_INTRO   = "Puedo darte hasta 3 regalos unicos por personaje:\r\n" +
                  "1) #v"+ITEM_BASE+"# #t"+ITEM_BASE+"#\r\n" +
                  "2) Un sombrero segun tu genero (#v"+ITEM_MALE+"#/#v"+ITEM_FEMALE+"#)\r\n" +
                  "3) #v"+ITEM_EXTRA+"# #t"+ITEM_EXTRA+"#\r\n\r\n" +
                  "Todo es a prueba de desconexiones.";
var TXT_MENU    = "#L0#Reclamar ahora (intentara todos los regalos pendientes)#l\r\n#L1#Salir#l";
var TXT_DONE_ALL = "Ya reclamaste todos los regalos.";
var TXT_RECOVER  = "Detecte reclamos pendientes. Voy a finalizar la entrega ahora.";
var TXT_OK_SUMMARY= "Proceso completado.";

var TXT_SPACE  = function(list) {
  return "No tienes espacio suficiente en inventario de equipo para:\r\n" +
         list.join("\r\n") + "\r\n\r\nDeja espacio y vuelve. Quedara pendiente.";
};
// ----------------------------------------

function start() {
  status = -1;
  action(1,0,0);
}

function action(mode, type, selection) {
  if (mode !== 1) { cm.dispose(); return; }
  status++;

  if (status === 0) {
    var recoverNeeded =
      (cm.getQuestStatus(QUEST_ID_BASE)   === 1) ||
      (cm.getQuestStatus(QUEST_ID_GENDER) === 1) ||
      (cm.getQuestStatus(QUEST_ID_EXTRA)  === 1);

    if (cm.getQuestStatus(QUEST_ID_BASE)   === 2 &&
        cm.getQuestStatus(QUEST_ID_GENDER) === 2 &&
        cm.getQuestStatus(QUEST_ID_EXTRA)  === 2) {
      cm.sendOk(TXT_DONE_ALL);
      cm.dispose();
      return;
    }

    if (recoverNeeded) {
      cm.sendNext(TXT_RECOVER);
      status = 98; // saltamos a finalizar
      action(1,0,0);
      return;
    }

    var msg = "#b"+TXT_TITLE+"#k\r\n\r\n" + TXT_INTRO + "\r\n\r\n" + TXT_MENU;
    cm.sendSimple(msg);
  }
  else if (status === 1) {
    if (selection === 1) { cm.sendOk("Vuelve cuando quieras."); cm.dispose(); return; }

    // Marcar PENDIENTE los quests que falten
    ensurePending(QUEST_ID_BASE);
    ensurePending(QUEST_ID_GENDER);
    ensurePending(QUEST_ID_EXTRA);

    status = 98;
    action(1,0,0);
  }
  else if (status === 99) {
    // Finalizar entrega(s)
    var notEnoughSpace = [];

    // Regalo 1: 1005267
    if (cm.getQuestStatus(QUEST_ID_BASE) === 1) {
      var r1 = finalizeGift(QUEST_ID_BASE, ITEM_BASE);
      if (r1 === "NO_SPACE") notEnoughSpace.push("#v"+ITEM_BASE+"# #t"+ITEM_BASE+"#");
    }

    // Regalo 2: por género
    if (cm.getQuestStatus(QUEST_ID_GENDER) === 1) {
      var gender = 0;
      try { gender = cm.getPlayer().getGender(); } catch (e) { gender = 0; }
      var itemGender = (gender === 1) ? ITEM_FEMALE : ITEM_MALE;

      var r2 = finalizeGift(QUEST_ID_GENDER, itemGender);
      if (r2 === "NO_SPACE") notEnoughSpace.push("#v"+itemGender+"# #t"+itemGender+"#");
    }

    // Regalo 3: 1702726
    if (cm.getQuestStatus(QUEST_ID_EXTRA) === 1) {
      var r3 = finalizeGift(QUEST_ID_EXTRA, ITEM_EXTRA);
      if (r3 === "NO_SPACE") notEnoughSpace.push("#v"+ITEM_EXTRA+"# #t"+ITEM_EXTRA+"#");
    }

    if (notEnoughSpace.length > 0) {
      cm.sendOk(TXT_SPACE(notEnoughSpace));
      cm.dispose();
      return;
    }

    cm.sendOk(TXT_OK_SUMMARY);
    cm.dispose();
  }
}

// ---------- helpers ----------
function ensurePending(qid) {
  var qs = cm.getQuestStatus(qid); // 0,1,2
  if (qs === 0) {
    try { cm.forceStartQuest(qid); } catch (e) { cm.startQuest(qid); }
  }
}

// Retorna: "OK" | "NO_SPACE"
function finalizeGift(qid, itemId) {
  // Si ya lo tiene por algun motivo, solo completa
  if (cm.haveItem(itemId, 1)) {
    completeQuestSafe(qid);
    return "OK";
  }

  if (!cm.canHold(itemId)) {
    return "NO_SPACE"; // sigue pendiente
  }

  cm.gainItem(itemId, 1);
  completeQuestSafe(qid); // bloqueo permanente
  return "OK";
}

function completeQuestSafe(qid) {
  try { cm.forceCompleteQuest(qid); } catch (e) { cm.completeQuest(qid); }
}
