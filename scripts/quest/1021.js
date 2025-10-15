// scripts/quest/1021.js  — stub para no interferir con las diarias
var status = -1;
function start(mode, type, selection) {
    // Si alguien intenta “iniciar” 1021 por diálogo, simplemente lo marcamos iniciado.
    try { qm.forceStartQuest(); } catch (e) {}
    try { qm.dispose(); } catch (e) {}
}
function end(mode, type, selection) {
    try { qm.dispose(); } catch (e) {}
}
