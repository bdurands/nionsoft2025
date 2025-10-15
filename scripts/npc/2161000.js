/*  
 * Lion Castle Entrance NPC
 * Transporte a 211060000 (Entrada al Lion King’s Castle)
 * Requiere nivel 100+
 * Mensaje épico y de advertencia para los valientes
 */

var status = 0;
var DEST_MAP = 211060000; // Entrada al Lion King Castle
var REQ_LVL  = 100;

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
        cm.sendOk("El castillo aguarda... regresa cuando reúnas el coraje suficiente.");
        cm.dispose();
        return;
    }
    if (mode == 1) status++;
    else status--;

    if (status == 0) {
        var lvl = cm.getPlayer().getLevel ? cm.getPlayer().getLevel() : cm.getLevel();
        if (lvl < REQ_LVL) {
            cm.sendOk("El #rLion King’s Castle#k no es un lugar para cualquiera.\r\n\r\n"
                    + "Solo los héroes de #bNivel " + REQ_LVL + "+#k pueden cruzar sus puertas.\r\n"
                    + "Vuelve cuando tu espíritu y tu fuerza estén listos para soportar su oscuridad. ⚔️");
            cm.dispose();
            return;
        }
        cm.sendYesNo("#eBienvenido al Lion King’s Castle#n \r\n\r\n"
                   + "Este es el camino que conduce hacia el temible #rVon Leon#k.\r\n"
                   + "Muchos valientes han caído tratando de conquistar estas murallas, y pocos han regresado a contar la historia.\r\n\r\n"
                   + "Estas preparado para adentrarte en la oscuridad y probar tu valor?\r\n");
    } else if (status == 1) {
        cm.warp(DEST_MAP, 0);
        cm.sendOk("Mantente alerta... el rugido del Leon aún resuena en estas paredes. Buena suerte, heroe.");
        cm.dispose();
    }
}
