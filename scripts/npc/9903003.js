/* NPC: Boost x2 EXP (10 min)
 * File: scripts/npc/9105000_exp2x.js
 * Requiere el hook Java de abajo para aplicar el multiplicador.
 */
var status = 0;

// ==================== CONFIG ====================
var QUEST_ID = 991234;            // Quest “virtual” para guardar datos
var KEY_UNTIL = "until";          // clave en questinfo
var DURATION_MIN = 10;            // minutos de buff
var MULTIPLIER = 2;               // x2 EXP
// ===============================================

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode !== 1) {
        cm.dispose();
        return;
    }
    status++;

    if (status === 0) {
        var now = java.lang.System.currentTimeMillis();
        var untilStr = cm.getQuestCustomData(QUEST_ID);
        var until = 0;
        if (untilStr != null && untilStr.indexOf(KEY_UNTIL + "=") === 0) {
            try {
                until = java.lang.Long.parseLong(untilStr.split("=")[1]);
            } catch (e) { until = 0; }
        }

        if (until > now) {
            var msLeft = until - now;
            var mins = Math.floor(msLeft / 60000);
            var secs = Math.floor((msLeft % 60000) / 1000);
            cm.sendOk(
                "#bBuff x" + MULTIPLIER + " EXP#k ya está activo.\r\n" +
                "Tiempo restante: #r" + (mins < 10 ? "0" + mins : mins) +
                ":" + (secs < 10 ? "0" + secs : secs) + "#k."
            );
            cm.dispose();
            return;
        }

        cm.sendYesNo(
            "¿Deseas activar #bEXP x" + MULTIPLIER + "#k por #r" + DURATION_MIN +
            " minutos#k?\r\n\r\n" +
            "- Se guarda en tu personaje y #bpersistirá si te desconectas#k.\r\n" +
            "- No acumulable; si ya estaba activo, se sobreescribe con 10 min."
        );
    } else if (status === 1) {
        var now = java.lang.System.currentTimeMillis();
        var until = now + (DURATION_MIN * 60 * 1000);

        // Guardar en questinfo como "until=<epochMillis>"
        cm.setQuestCustomData(QUEST_ID, KEY_UNTIL + "=" + until);

        // Notificar al jugador
        cm.playerMessage(5, "[EXP x" + MULTIPLIER + "] Activado por " + DURATION_MIN + " minutos.");
        cm.sendOk("¡Listo! Disfruta tu #bEXP x" + MULTIPLIER + "#k por #r" + DURATION_MIN + " minutos#k.");
        cm.dispose();
    }
}
