function start() {
    cm.sendSimple("Estas seguro de ir a Temple of time ? tienes que ser muy Pro !#k...\r\n #L0##bSi soy muy PRO ! quiero ir a temple of time .#k#l");
}

function action(m, t, s) {
    if (m > 0) {
        //cm.useItem(2210016);
        cm.warp(270000100, 0);
    }
    cm.dispose();
}  