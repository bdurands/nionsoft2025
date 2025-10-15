/*
 * NPC: Regalos de Halloween (canje por candies)
 * - Cada opción se canjea UNA sola vez por personaje.
 * - Requiere pagar con 4031203 (Halloween Candies).
 * - Guarda en queststatus (status=2) y questinfo (claimed=1).
 */

var status = 0;
var choice = -1;

// ==================== CONFIG ====================
var TITLE = "¡Bienvenido a #bMapleStory NionSoft#k!";
var INTRO  = "Elige un regalo y canjéalo con tus #v4031203# (#t4031203#). Cada opción se puede reclamar #run(a sola vez por personaje)#k.";
var ASK_CONFIRM = "¿Deseas canjear este regalo ahora?";
var MSG_ALREADY  = "Ya has recibido este regalo anteriormente.";
var MSG_NO_SPACE = "Asegúrate de tener suficiente espacio en tu inventario.";
var MSG_BYE      = "¡Vuelve cuando estés listo!";
var MSG_NO_COIN  = function(cost, have) {
    return "Te faltan #r" + (cost - have) + "#k #t4031203#.\r\nNecesitas #b" + cost + "#k y actualmente tienes #r" + have + "#k.";
};

// Moneda de canje
var CURRENCY_ID = 4036465; // Halloween Candies

// Opciones de canje
// label: texto menú
// questId: único por opción
// itemId/qty: premio
// cost: candies requeridos
var OPTIONS = [
    { label: "#d1) Regalo 1 #k", questId: 999991, itemId: 5010173, qty: 1,   cost: 100 }, // Ej: efecto/usable
    { label: "#d2) Regalo 2 #k", questId: 999992, itemId: 3010085, qty: 1,   cost: 200 }, // Silla
    { label: "#d3) Regalo 3 #k", questId: 999993, itemId: 1112920, qty: 1,  cost: 300 }  // Hi-Potion
];
// =================================================


function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { cm.dispose(); return; }

    if (mode == 0 && status <= 0) {
        cm.sendOk(MSG_BYE);
        cm.dispose();
        return;
    }
    if (mode == 1) status--;
    else status++;

    // status === -1 -> intro
    if (status == -1) {
        cm.sendNext(TITLE + "\r\n" + INTRO);
        return;
    }

    // status === -2 -> menú
    if (status == -2) {
        var have = getItemQty(CURRENCY_ID);
        var menu = "Tienes #b" + have + "#k de #v" + CURRENCY_ID + "# (#t" + CURRENCY_ID + "#).\r\n\r\nSelecciona una opción:\r\n";
        for (var i = 0; i < OPTIONS.length; i++) {
            var o = OPTIONS[i];
            menu += "#L" + i + "#" + o.label
                 + "  | Premio: #v" + o.itemId + "# x" + o.qty
                 + "  | Costo: #b" + o.cost + "#k #v" + CURRENCY_ID + "##l\r\n";
        }
        cm.sendSimple(menu);
        return;
    }

    // status === -3 -> confirmar
    if (status == -3) {
        choice = selection;
        if (choice < 0 || choice >= OPTIONS.length) {
            cm.sendOk("Opción inválida.");
            cm.dispose();
            return;
        }

        var opt = OPTIONS[choice];

        if (hasClaimed(opt.questId)) {
            cm.sendOk(MSG_ALREADY);
            cm.dispose();
            return;
        }

        var txt = opt.label + "\r\n\r\n"
                + "Premio: #v" + opt.itemId + "# x" + opt.qty + "\r\n"
                + "Costo: #b" + opt.cost + "#k #v" + CURRENCY_ID + "# (#t" + CURRENCY_ID + "#)\r\n\r\n"
                + ASK_CONFIRM;
        cm.sendYesNo(txt);
        return;
    }

    // status === -4 -> procesar canje
    if (status == -4) {
        var opt2 = OPTIONS[choice];

        // Rechequeos
        if (hasClaimed(opt2.questId)) {
            cm.sendOk(MSG_ALREADY);
            cm.dispose();
            return;
        }

        var have = getItemQty(CURRENCY_ID);
        if (have < opt2.cost) {
            cm.sendOk(MSG_NO_COIN(opt2.cost, have));
            cm.dispose();
            return;
        }

        if (!cm.canHold(opt2.itemId, opt2.qty)) {
            cm.sendOk(MSG_NO_SPACE);
            cm.dispose();
            return;
        }

        // Cobrar candies (cantidad negativa para retirar)
        cm.gainItem(CURRENCY_ID, -opt2.cost);

        // Entregar premio
        cm.gainItem(opt2.itemId, opt2.qty);

        // Guardar UNA VEZ por personaje
        try { cm.forceStartQuest(opt2.questId); } catch (e) {}
        try { cm.forceCompleteQuest(opt2.questId); } catch (e) {}
        try { cm.updateInfoQuest(opt2.questId, "claimed=1"); } catch (e) {}

        cm.sendOk("¡Canje exitoso!\r\nHas recibido #b" + opt2.qty + "#k de #v" + opt2.itemId + "#.\r\n"
                + "Se descontaron #r" + opt2.cost + "#k #v" + CURRENCY_ID + "# (#t" + CURRENCY_ID + "#).");
        cm.dispose();
        return;
    }

    cm.dispose();
}

/** Helpers **/

// ¿Ya fue reclamado?
function hasClaimed(qid) {
    try {
        var st = cm.getQuestStatus(qid); // 0,1,2
        if (st == 2) return true;
    } catch (e) {}

    try {
        var iq = cm.getInfoQuest(qid);
        if (iq != null && iq.indexOf("claimed=1") >= 0) return true;
    } catch (e) {}

    return false;
}

// Cantidad del ítem en inventario (compatibles v83 comunes)
function getItemQty(itemId) {
    try {
        // Muchos sources soportan haveItem(id, qty) pero no devuelven cantidad exacta.
        // Cuando no hay API directa, usa cm.getPlayer().getItemQuantity si existe.
        if (typeof cm.getPlayer === "function" && cm.getPlayer() && typeof cm.getPlayer().getItemQuantity === "function") {
            return cm.getPlayer().getItemQuantity(itemId, false); // false = no check equips
        }
    } catch (e) {}
    // Fallback: al menos 1/0 (no exacto). Si tu source no tiene getItemQuantity,
    // puedes cambiar esto por bucle de inventario.
    return cm.haveItem(itemId, 1) ? 1 : 0;
}
