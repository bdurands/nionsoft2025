/*
    NPC: Regalo de Evento Único
    Entrega 100 sobres (5390001) una sola vez usando el quest ID 99999
*/

var status = 0;
var itemID = 5390001;
var cantidad = 100;
var questID = 99999; // Puedes cambiar este ID por otro libre si ya lo usas

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
        return;
    }

    if (mode == 0 && status == 0) {
        cm.sendOk("Vuelve cuando estés listo para tu regalo!");
        cm.dispose();
        return;
    }

    if (mode == 1) {
        status++;
    }

    if (status == 0) {
        cm.sendNext("Bienvenido a #bMapleStory NionSoft#k!\r\nQueremos darte un obsequio por ser parte de nosotros");
    } else if (status == 1) {
        if (cm.getQuestStatus(questID) == 2) {
            cm.sendOk("Ya has recibido este regalo anteriormente.");
        } else {
            if (cm.canHold(itemID, cantidad)) {
                cm.gainItem(itemID, cantidad);
                cm.forceCompleteQuest(questID); // Marca la quest como completada
                cm.sendOk("Has recibido #b" + cantidad + "#k unidades del item #v" + itemID + "#.\r\nDisfruta tu aventura!");
            } else {
                cm.sendOk("Por favor asegúrate de tener espacio en tu inventario.");
            }
        }
        cm.dispose();
    }
}
