var ticket = [4031047, 4031074, 4031331, 4031576];
var cost =   [   5000,   6000,   30000,   6000];
var mapNames  = ["Ellinia of Victoria Island", "Ludibrium", "Leafre", "Ariant"];
var mapName2  = ["Ellinia of Victoria Island", "Ludibrium", "Leafre of Minar Forest", "Nihal Desert"];

var status = 0;
var select = -1;

var EREVE_OPTION_ID = 999;         // id especial para Ereve
var EREVE_MAP_ID    = 130000210;   // Ereve

function start() {
    var where = "Hola, compra tickets para las siguientes ubicaciones o ve instantaneamente a Ereve";
    for (var i = 0; i < ticket.length; i++) {
        where += "\r\n#L" + i + "##b" + mapNames[i] + "#k#l";
    }
    // opción extra: Ereve (teletransporte inmediato)
    where += "\r\n#L" + EREVE_OPTION_ID + "##bEreve (instant)#k#l";
    cm.sendSimple(where);
}

function action(mode, type, selection) {
    if (mode < 1) { cm.dispose(); return; }
    status++;

    if (status == 1) {
        select = selection;

        // Si eligió la opción de Ereve, teletransporta de inmediato (sin ticket)
        if (select == EREVE_OPTION_ID) {
            // Si quieres confirmación, descomenta estas dos líneas y maneja en status 2:
            // cm.sendYesNo("Teleport to #bEreve#k now?");
            // return;

            cm.warp(EREVE_MAP_ID);
            cm.dispose();
            return;
        }

        // Flujo normal de tickets
        cm.sendYesNo("The ride to " + mapName2[select] + " takes off every " + (select == 0 ? 15 : 10) + " minutes, beginning on the hour, and it'll cost you #b" + cost[select] + " mesos#k. Are you sure you want to purchase #b#t" + ticket[select] + "##k?");
    } else if (status == 2) {
        if (cm.getMeso() < cost[select] || !cm.canHold(ticket[select])) {
            cm.sendOk("Are you sure you have #b" + cost[select] + " mesos#k? If so, then I urge you to check your etc. inventory and see if it's full or not.");
        } else {
            cm.gainMeso(-cost[select]);
            cm.gainItem(ticket[select], 1);
        }
        cm.dispose();
    }
}
