/* 
 * NPC: Viaje por 5,000 mesos a 541020000
 * Compatible con OdinMS/HeavenMS (v83-like)
 */

var status = 0;
var cost = 5000;
var dest = 541020000; // Mapa destino

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) { // Cerró la ventana
        cm.dispose();
        return;
    }
    if (mode == 0 && status == 0) { // Dijo "No" en la primera pregunta
        cm.sendOk("Sin problema! Vuelve cuando estes listo.");
        cm.dispose();
        return;
    }

    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        cm.sendYesNo("Deseas viajar a #b#m" + dest + "##k por #r" + cost.toLocaleString() + " mesos#k?");
    } else if (status == 1) {
        if (cm.getMeso() < cost) {
            cm.sendOk("No tienes suficientes mesos. Necesitas #r" + cost.toLocaleString() + "#k mesos.");
            cm.dispose();
            return;
        }
        cm.gainMeso(-cost);
        // Usa el portal 0; si necesitas otro, cambia el segundo parámetro.
        cm.warp(dest, 0);
        cm.dispose();
    }
}
