var status = 0;
var category = -1;
var subcategory = -1;
var selection = -1;

var awaitingConfirm = false;
var chosen = null; // { id, nombre, cost }

var categorias = {
    "Pets": [
        [5000047, "Black Kitty", 1500],
        [5000098, "Shark", 3000],
        [5000130, "Metus", 4000],
        [5000131, "Mors", 4000],
        [5000132, "Invidia", 4000],
        [5000136, "Ice Night", 3000],
        [5000170, "PSY", 3000],
        [5000217, "BlackHeart", 3000],
        [5000306, "Devil Imos", 2500],
        [5000307, "Devil Gaz", 2500],
        [5000308, "Devil Tose", 2500],
        [5000479, "Lil Zakum", 5000]
    ],
    "Ropa NX": {
        "Capa": [
            [1102184, "Aurora Happy Wings", 1000],
            [1102252, "Phoenix Wings", 1000],
            [1102292, "Twinkling Rainbow", 500],
            [1102385, "Lux Cherubim", 1500],
            [1102386, "Nox Cherubim", 1500],
            [1102450, "Heavenly Aura", 1500],
            [1102451, "Void Aura", 1500],
            [1102452, "Fairy Aura", 1500],
            [1102453, "Dryad", 1500],
            [1102466, "Flying Noblitas", 2000],
            [1102487, "Luminous Cherubin", 2000],
            [1102511, "Angel Cherub", 2000],
            [1102546, "Blue Bird Dream Wings", 2000],
            [1102547, "Amethyst Dream Wings", 1500],
            [1102548, "Leafy Dream Wings", 1500],
            [1102550, "Lime Green Wings", 1500],
            [1102551, "Sapphire Wings", 1500],
            [1102555, "Angelic White wings", 2000],
            [1102609, "Psyche Flora", 1800],
            [1102610, "Psyche Mystic", 1800],
            [1102611, "Psyche Melody", 1800]
        ],
		"Capa 2": [
            [1102699, "Magma Wings", 2000],
			[1102630, "Romantic wing Cherubim", 2000],
			[1102841, "Iris Pearl", 2000],
            [1102611, "Psyche Melody", 1800]
        ],
        "Hat": [
            [1004875, "Gato Calabaza", 2000]
        ],
        "Glasses": [
            [5000054, "EN CONSTRUCCION", 250000000]
        ],
        "Weapons": [
            [5000054, "EN CONSTRUCCION", 250000000]
        ]
    },
    "Opcion 3": [
        [5000054, "EN CONSTRUCCION", 250000000]
    ],
    "Opcion 4": [
        [5000054, "EN CONSTRUCCION", 250000000]
    ]
};

function start() {
    status = 0;
    awaitingConfirm = false;
    chosen = null;
    action(1, 0, 0);
}

function action(mode, type, sel) {
    // cerrar si el jugador termina el chat de entrada
    if (mode === -1 || (mode === 0 && status === 0)) { cm.dispose(); return; }

    // si estábamos confirmando y el jugador dijo "No"
    if (awaitingConfirm && mode !== 1) {
        awaitingConfirm = false;
        chosen = null;
        cm.sendOk("Operación cancelada.");
        cm.dispose();
        return;
    }

    // si presiona "No" en cualquier otro paso, cerrar limpio
    if (mode === 0) { cm.dispose(); return; }

    if (mode === 1) status++;

    if (status === 1) {
        var text = "Bienvenido al NPC de Canje por Donor Points#k\r\n";
        text += " Tienes: #r" + cm.getPlayer().getRewardPoints() + "#k Donor Points\r\n\r\n";
        var i = 0;
        for (var key in categorias) { text += "#L" + i + "#" + key + "#l\r\n"; i++; }
        cm.sendSimple(text);

    } else if (status === 2) {
        var keys = Object.keys(categorias);
        if (sel < 0 || sel >= keys.length) { cm.dispose(); return; }

        category = keys[sel];
        if (category === "Ropa NX") {
            var subkeys = Object.keys(categorias["Ropa NX"]);
            var text = " #bRopa NX - Elige una categoría:#k\r\n";
            for (var i = 0; i < subkeys.length; i++) { text += "#L" + i + "#" + subkeys[i] + "#l\r\n"; }
            cm.sendSimple(text);
        } else {
            showItems(categorias[category]);
        }

    } else if (status === 3 && category === "Ropa NX") {
        var subkeys = Object.keys(categorias["Ropa NX"]);
        if (sel < 0 || sel >= subkeys.length) { cm.dispose(); return; }

        subcategory = subkeys[sel];
        showItems(categorias["Ropa NX"][subcategory]);

    } else if (status === 3 || (status === 4 && category === "Ropa NX")) {
        var lista = (category === "Ropa NX") ? categorias["Ropa NX"][subcategory] : categorias[category];
        if (sel < 0 || sel >= lista.length) { cm.dispose(); return; }

        var itemData = lista[sel];
        var itemId = itemData[0], nombre = itemData[1], cost = itemData[2];
        var currentRP = cm.getPlayer().getRewardPoints();
        var remaining = currentRP - cost;

        chosen = { id: itemId, nombre: nombre, cost: cost };
        awaitingConfirm = true;

        var conf = "Vas a canjear #v" + itemId + "# #b" + nombre + "#k por #r" + cost + "#k Donor Points.\r\n";
        conf += "Tienes: #b" + currentRP + "#k → Te quedarán: #r" + Math.max(0, remaining) + "#k.\r\n\r\n";
        conf += "¿Confirmas la compra?";
        cm.sendYesNo(conf);

    } else if ((status === 4 && category !== "Ropa NX") || (status === 5 && category === "Ropa NX")) {
        // Confirmado: procesar compra
        awaitingConfirm = false;

        var itemId = chosen.id, nombre = chosen.nombre, cost = chosen.cost;
        var currentRP = cm.getPlayer().getRewardPoints();

        if (currentRP < cost) { cm.sendOk(" No tienes suficientes Donor Points.\r\nRequieres: " + cost + " Donor Points."); cm.dispose(); return; }
        if (!cm.canHold(itemId)) { cm.sendOk(" Tu inventario está lleno."); cm.dispose(); return; }

        cm.getPlayer().setRewardPoints(currentRP - cost);

        if (itemId >= 5000000 && itemId <= 5001000) {
				// Pet vivo con expiración de 7 años
				cm.gainPetYears7(itemId);
				// opcional QoL: comida para que no “muera” por hambre
				// cm.gainItem(2120000, 50); // Pet Food
			} else {
				cm.gainItem(itemId, 1);
			}


        cm.sendOk(" ¡Has recibido 1x #b" + nombre + "#k!\r\nTe quedan: #r" + (currentRP - cost) + "#k Donor Points.");
        cm.dispose();
    }
}

function showItems(lista) {
    var text = "📦 ¿Qué deseas canjear?\r\n";
    for (var i = 0; i < lista.length; i++) {
        text += "#L" + i + "##v" + lista[i][0] + "# " + lista[i][1] + " - #r" + lista[i][2] + " Donor Points#k#l\r\n";
    }
    cm.sendSimple(text);
}
