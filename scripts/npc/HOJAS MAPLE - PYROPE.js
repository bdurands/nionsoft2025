var status = 0;
var selection;
var mapleLeaf = 4001126;
var maxCanjes = 5;
var questID = 99998;

// Lista de ítems disponibles: [itemID, nombre, costo]
var items = [
    [1302142, "Maple Pyrope Sword", 300],
	[1402085, "Maple Pyrope Two Handed Sword", 300],
    [1312056, "Maple Pyrope Axe", 300],
    [1322084, "Maple Pyrope Hammer", 300],
    [1332114, "Maple Pyrope Halfmoon", 300],
    [1372071, "Maple Pyrope Wand", 300],
    [1382093, "Maple Pyrope Staff", 300],
    [1422057, "Maple Pyrope Maul", 300],
    [1432075, "Maple Pyrope Spear", 300],
    [1442104, "Maple Pyrope Hellslayer", 300],
    [1452100, "Maple Pyrope Bow", 300],
    [1462085, "Maple Pyrope Crow", 300],
    [1472111, "Maple Pyrope Skanda", 300],
    [1482073, "Maple Pyrope Knuckle", 300],
    [1492073, "Maple Pyrope Shooter", 300],
    [1052167, "Maple Pyrope Overall", 450] // nuevo ítem con costo diferente
];

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, sel) {
    if (mode == -1) {
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) {
        cm.sendOk("¡Vuelve cuando tengas suficientes Maple Leaf!");
        cm.dispose();
        return;
    }

    if (mode == 1) status++;

    if (status == 0) {
        var canjeos = cm.getQuestRecord(questID).getCustomData();
        if (canjeos == null || isNaN(parseInt(canjeos))) {
            cm.getQuestRecord(questID).setCustomData("0");
            canjeos = "0";
        }

        if (parseInt(canjeos) >= maxCanjes) {
            cm.sendOk("⛔ Ya has canjeado el máximo de 5 ítems.");
            cm.dispose();
            return;
        }

        var text = "🎁 #bCanjea tus Maple Leaf por armas Pyrope#k\r\n";
        text += "(Has canjeado: " + canjeos + "/5)\r\n\r\n";
        for (var i = 0; i < items.length; i++) {
            text += "#L" + i + "##v" + items[i][0] + "# " + items[i][1] + " - (" + items[i][2] + " Maple Leaf)#l\r\n";
        }
        cm.sendSimple(text);

    } else if (status == 1) {
        selection = sel;
        var itemId = items[selection][0];
        var nombre = items[selection][1];
        var cost = items[selection][2];
        var canjeos = parseInt(cm.getQuestRecord(questID).getCustomData());

        if (!cm.haveItem(mapleLeaf, cost)) {
            cm.sendOk("❌ Necesitas " + cost + " Maple Leaf para hacer el canje.");
            cm.dispose();
        } else if (!cm.canHold(itemId)) {
            cm.sendOk("❌ Tu inventario está lleno.");
            cm.dispose();
        } else {
            cm.gainItem(mapleLeaf, -cost);
            cm.gainItem(itemId, 1); // si deseas que sea untradeable, reemplazar por la versión extendida
            cm.getQuestRecord(questID).setCustomData((canjeos + 1).toString());

            cm.sendOk("✅ ¡Has recibido 1x " + nombre + "!\r\n(Te quedan " + (maxCanjes - canjeos - 1) + " canjes)");
            cm.dispose();
        }
    }
}
