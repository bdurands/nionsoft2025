/* Canje por “moneda” de evento con límite por personaje
 * - Moneda configurable (ID y nombre visible)
 * - Límite de canjes (maxCanjes)
 * - Usa QuestRecord.customData como contador persistente
 */

var status = 0;
var sel = -1;

// ====== CONFIG ======
var CURRENCY_ID   = 4032307;                   // ← cámbialo si tu moneda no es esta
var CURRENCY_NAME = "Blue Birthday Candle";    // ← texto visible
var maxCanjes     = 5;                         // límite por personaje
var questID       = 99998;                     // QuestRecord para contador

// [itemID, nombre, costo]
var items = [
    [1312119, "One Handed Axe", 300],
    [1322165, "One Handed Mace", 300],
    [1302230, "One Handed Sword", 300],
    [1332196, "Dagger", 300],
    [1382171, "Staff", 300],
    [1402154, "Two Handed Sword", 300],
    [1412107, "Two Handed Axe", 300],
    [1422110, "Two Handed Mace", 300],
    [1432141, "Spear", 300],
    [1442185, "Pole Arm", 300],
    [1452173, "Bow", 300],
    [1462162, "Crossbow", 300],
    [1472182, "Claw", 300],
    [1482143, "Knuckle", 300],
    [1492155, "Gun", 300],
    [1012377, "Pearl Maple Gum", 300]
];

// ====== HELPERS ======
function getQR() {
    return cm.getQuestRecord(questID);
}
function getCanjes() {
    var qr = getQR();
    if (!qr) return 0;
    var raw = qr.getCustomData();
    if (raw == null || raw === "" || isNaN(parseInt(raw))) {
        qr.setCustomData("0");
        return 0;
    }
    return parseInt(raw);
}
function setCanjes(v) {
    var qr = getQR();
    if (qr) qr.setCustomData(String(v));
}

// ====== FLOW ======
function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode === -1) { cm.dispose(); return; }

    if (mode === 0 && status === 0) {
        cm.sendOk("¡Vuelve cuando tengas suficientes " + CURRENCY_NAME + "!");
        cm.dispose();
        return;
    }

    if (mode === 1) status++;
    else status--;

    if (status === 0) {
        var canjeos = getCanjes();
        if (canjeos >= maxCanjes) {
            cm.sendOk("Ya alcanzaste el máximo de " + maxCanjes + " canjes. ¡Buen farmeo! 💪");
            cm.dispose();
            return;
        }

        var text = "#bCanjea tus #v" + CURRENCY_ID + "# " + CURRENCY_NAME + " por recompensas:#k\r\n";
        text += "(Has canjeado: " + canjeos + " / " + maxCanjes + ")\r\n\r\n";
        for (var i = 0; i < items.length; i++) {
            text += "#L" + i + "##v" + items[i][0] + "# " + items[i][1]
                 + "  #k- (#r" + items[i][2] + "#k " + CURRENCY_NAME + ")#l\r\n";
        }
        cm.sendSimple(text);

    } else if (status === 1) {
        sel = selection;
        if (sel < 0 || sel >= items.length) {
            cm.sendOk("Selección inválida. 🤔");
            cm.dispose();
            return;
        }

        var itemId = items[sel][0];
        var nombre = items[sel][1];
        var cost   = items[sel][2];

        // Verificaciones
        if (!cm.haveItem(CURRENCY_ID, cost)) {
            cm.sendOk("❌ Necesitas " + cost + "x #v" + CURRENCY_ID + "# " + CURRENCY_NAME + " para canjear " + nombre + ".");
            cm.dispose();
            return;
        }
        if (!cm.canHold(itemId)) {
            cm.sendOk("❌ Tu inventario está lleno. Libera espacio antes de canjear.");
            cm.dispose();
            return;
        }

        // Ejecutar canje
        cm.gainItem(CURRENCY_ID, -cost);
        // Si tu core soporta flags, puedes usar una variante para hacerlo untradeable (comentado):
        // cm.gainItem(itemId, 1, true);  // true = lock/untradeable en algunos cores
        cm.gainItem(itemId, 1);

        var nuevo = getCanjes() + 1;
        setCanjes(nuevo);

        cm.sendOk("✅ ¡Has recibido 1x #v" + itemId + "# " + nombre + "!\r\n"
                + "Te quedan #b" + Math.max(0, (maxCanjes - nuevo)) + "#k canjes.");
        cm.dispose();
    } else {
        cm.dispose();
    }
}
