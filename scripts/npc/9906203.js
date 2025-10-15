/*
 * NPC: Regalos de Halloween (dos monedas de canje)
 * - Cada opción se canjea UNA sola vez por personaje.
 * - Monedas: 4036465 y 4031203 (Halloween Candies).
 * - Guarda en queststatus (status=2) y questinfo (claimed=1).
 */

var status = 0;
var choice = -1;
var curIdx = -1; // índice de moneda seleccionada

// ==================== TEXTOS ====================
var TITLE = "¡Bienvenido a #bMapleStory NionSoft#k!";
var INTRO  = "Elige el #etipo de canje#k y luego el premio. Cada opción se puede reclamar #run(a sola vez por personaje)#k.";
var ASK_CONFIRM = "¿Deseas canjear este regalo ahora?";
var MSG_ALREADY  = "Ya has recibido este regalo anteriormente.";
var MSG_NO_SPACE = "Asegurate de tener suficiente espacio en tu inventario.";
var MSG_BYE      = "Vuelve cuando estes listo!";
function msgNoCoin(cost, have, curId) {
    return "Te faltan #r" + (cost - have) + "#k de #t" + curId + "#.\r\nNecesitas #b" + cost + "#k y actualmente tienes #r" + have + "#k.";
}

// ==================== CONFIG ====================
// Definimos 2 secciones de canje, cada una con su propia moneda y opciones.
var SECTIONS = [
    {
        // Sección A: tu canje original con 4036465
        currencyId: 4036465,
        title: "Canjes con #v4036465# ",
        options: [
            { label: "#d1) Regalo 1 #k", questId: 999991, itemId: 5010173, qty: 1, cost: 100 },
            { label: "#d2) Regalo 2 #k", questId: 999992, itemId: 3010085, qty: 1, cost: 200 },
            { label: "#d3) Regalo 3 #k", questId: 999993, itemId: 1112920, qty: 1, cost: 300 }
        ]
    },
    {
        // Sección B: nuevo canje adicional con 4031203 (belts a 200)
        currencyId: 4031203,
        title: "Canjes con #v4031203# ",
        options: [
            { label: "#dB1) Cinturon#k", questId: 1000001, itemId: 1132014, qty: 1, cost: 200 },
            { label: "#dB2) Cinturon#k", questId: 1000002, itemId: 1132015, qty: 1, cost: 200 },
            { label: "#dB3) Cinturon#k", questId: 1000003, itemId: 1132016, qty: 1, cost: 200 }
        ]
    }
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

    // status === -2 -> elegir sección (moneda)
    if (status == -2) {
        var menu = "Elige el #etipo de canje#k:\r\n";
        for (var i = 0; i < SECTIONS.length; i++) {
            var cid = SECTIONS[i].currencyId;
            var have = getItemQty(cid);
            menu += "#L" + i + "#" + (i + 1) + ") " + SECTIONS[i].title
                 + "  | Tienes: #b" + have + "#k de #v" + cid + "##l\r\n";
        }
        cm.sendSimple(menu);
        return;
    }

    // status === -3 -> mostrar opciones de la sección elegida
    if (status == -3) {
        curIdx = selection;
        if (curIdx < 0 || curIdx >= SECTIONS.length) {
            cm.sendOk("Opción inválida.");
            cm.dispose();
            return;
        }
        var sec = SECTIONS[curIdx];
        var have = getItemQty(sec.currencyId);
        var menu2 = sec.title + "\r\nTienes #b" + have + "#k de #v" + sec.currencyId + "#.\r\n\r\nSelecciona un premio:\r\n";
        for (var j = 0; j < sec.options.length; j++) {
            var o = sec.options[j];
            menu2 += "#L" + j + "#" + o.label
                   + "  | Premio: #v" + o.itemId + "# x" + o.qty
                   + "  | Costo: #b" + o.cost + "#k #v" + sec.currencyId + "##l\r\n";
        }
        cm.sendSimple(menu2);
        return;
    }

    // status === -4 -> confirmar
    if (status == -4) {
        choice = selection;
        var sec2 = SECTIONS[curIdx];
        if (choice < 0 || choice >= sec2.options.length) {
            cm.sendOk("Opción inválida.");
            cm.dispose();
            return;
        }

        var opt = sec2.options[choice];
        if (hasClaimed(opt.questId)) {
            cm.sendOk(MSG_ALREADY);
            cm.dispose();
            return;
        }

        var txt = opt.label + "\r\n\r\n"
                + "Premio: #v" + opt.itemId + "# x" + opt.qty + "\r\n"
                + "Costo: #b" + opt.cost + "#k #v" + sec2.currencyId + "# (#t" + sec2.currencyId + "#)\r\n\r\n"
                + ASK_CONFIRM;
        cm.sendYesNo(txt);
        return;
    }

    // status === -5 -> procesar canje
    if (status == -5) {
        var sec3 = SECTIONS[curIdx];
        var opt2 = sec3.options[choice];

        if (hasClaimed(opt2.questId)) {
            cm.sendOk(MSG_ALREADY);
            cm.dispose();
            return;
        }

        var have = getItemQty(sec3.currencyId);
        if (have < opt2.cost) {
            cm.sendOk(msgNoCoin(opt2.cost, have, sec3.currencyId));
            cm.dispose();
            return;
        }

        if (!cm.canHold(opt2.itemId, opt2.qty)) {
            cm.sendOk(MSG_NO_SPACE);
            cm.dispose();
            return;
        }

        // Cobrar (cantidad negativa para retirar)
        cm.gainItem(sec3.currencyId, -opt2.cost);

        // Entregar premio
        cm.gainItem(opt2.itemId, opt2.qty);

        // Guardar UNA VEZ por personaje
        try { cm.forceStartQuest(opt2.questId); } catch (e) {}
        try { cm.forceCompleteQuest(opt2.questId); } catch (e) {}
        try { cm.updateInfoQuest(opt2.questId, "claimed=1"); } catch (e) {}

        cm.sendOk("Canje exitoso!\r\nHas recibido #b" + opt2.qty + "#k de #v" + opt2.itemId + "#.\r\n"
                + "Se descontaron #r" + opt2.cost + "#k #v" + sec3.currencyId + "# (#t" + sec3.currencyId + "#).");
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

// Cantidad exacta del ítem en inventario (compatibles v83 comunes)
function getItemQty(itemId) {
    try {
        if (typeof cm.getPlayer === "function" && cm.getPlayer() && typeof cm.getPlayer().getItemQuantity === "function") {
            return cm.getPlayer().getItemQuantity(itemId, false); // false = no check equips
        }
    } catch (e) {}
    // Fallback mínimo si tu source no expone cantidad exacta:
    return cm.haveItem(itemId, 1) ? 1 : 0;
}
