/*
 * Gachapon Triple (Mesos / NX / Donor) – con Pity Gate en Mesos y NX
 * - Mesos cuesta 1,000,000
 * - NX usa 5220000
 * - Donor usa 5220010
 * Pity Mesos/NX: Earrings y EleStaff103 SOLO pueden salir en la tirada #100. Luego se resetea.
 */

var status = 0;
var modeSelect = -1;

var MESOS_COST = 1000000;
var NX_TICKET  = 5220000;
var DON_TICKET = 5220010;

/* ===================== PITY (Mesos) ===================== */
var MESOS_PITY_QID = 9008;           // QuestRecord para contador
var MESOS_PITY_KEY = "mesosCount";   // clave dentro de customData
function getMesosCount() {
    var qr = cm.getQuestRecord(MESOS_PITY_QID);
    var raw = qr.getCustomData();
    if (!raw || raw.indexOf(MESOS_PITY_KEY + "=") === -1) return 0;
    var parts = raw.split(";");
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split("=");
        if (kv.length == 2 && kv[0] == MESOS_PITY_KEY) return parseInt(kv[1], 10) || 0;
    }
    return 0;
}
function setMesosCount(n) {
    var qr = cm.getQuestRecord(MESOS_PITY_QID);
    qr.setCustomData(MESOS_PITY_KEY + "=" + n);
}
function incMesosCount() { setMesosCount(getMesosCount() + 1); }

/* ===================== PITY (NX) ===================== */
var NX_PITY_QID = 9009;           // QuestRecord para contador NX
var NX_PITY_KEY = "nxCount";      // clave dentro de customData
function getNxCount() {
    var qr = cm.getQuestRecord(NX_PITY_QID);
    var raw = qr.getCustomData();
    if (!raw || raw.indexOf(NX_PITY_KEY + "=") === -1) return 0;
    var parts = raw.split(";");
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split("=");
        if (kv.length == 2 && kv[0] == NX_PITY_KEY) return parseInt(kv[1], 10) || 0;
    }
    return 0;
}
function setNxCount(n) {
    var qr = cm.getQuestRecord(NX_PITY_QID);
    qr.setCustomData(NX_PITY_KEY + "=" + n);
}
function incNxCount() { setNxCount(getNxCount() + 1); }

/* ======================================================== */

/* Pools
 * Nota: en MESOS y NX separo los "comunes" y los "bloqueados por pity".
 * Para NX he replicado exactamente tus valores de Mesos (igual-igual).
 */
var pools = {
    /* ===== MESOS ===== */
    mesos_common: [
        [2002021,150,20], // Honster Elixir
        [2002023,150,20], // Ginger Ale
        [2002020,150,20], // Mana Bull
        [2050004, 20, 9.5], // All Cure (x100) -> qty 20
        [2022069,  5, 6],   // Red Cider (+34 WA)
        [2022068,  5, 6],   // Yellow Cider (+35 MA)
        [2022245, 15, 7],   // Heartstopper (+60 WA)

        // Otros
        [2070007,  1, 1],   // Hwabi (Lv.70 star)

        // Dark Scroll 30%
        [2044705,  1, 0.7], // Claw ATT 30%
        [2044305,  1, 0.7], // Spear ATT 30%
        [2044605,  1, 1],   // Crossbow ATT 30%
        [2043705,  1, 1],   // Wand Magic ATT 30%
        [2044405,  1, 1],   // Pole Arm ATT 30%
        [2044505,  1, 0.7], // Bow ATT 30%

        // Raros varios
        [1022088,  1, 1.5], // Lentes de Arqueólogo (intradeable)
        [2022179,  1, 1],   // Onyx Apple
        [2049100,  2, 0.9], // Chaos Scroll
        [2340000,  1, 0.001], // White Scroll

        // Equips – Elemental Wand Lv.70 (bajados)
        [1372035,  1, 0.3],
        [1372036,  1, 0.3],
        [1372037,  1, 0.3],
        [1372038,  1, 0.3],

        // Elemental Wand Lv.130 (ultra raro)
        [1372039,  1, 0.001],
        [1372040,  1, 0.001],
        [1372041,  1, 0.001],
        [1372042,  1, 0.001],

        // Elemental Staff Lv.163 (ultra raros en tu setting)
        [1382049,  1, 0.001],
        [1382050,  1, 0.001],
        [1382051,  1, 0.001],
        [1382052,  1, 0.001]
        // OJO: Earrings y Ele Staff 103 están en mesos_locked (pity 100).
    ],
    mesos_locked: [
        // Elemental Staff Lv.103
        [1382045, 1, 2],
        [1382046, 1, 2],
        [1382047, 1, 2],
        [1382048, 1, 2],
        // Rex Earrings
        [1032077, 1, 1.1],
        [1032078, 1, 1.1],
        [1032079, 1, 1.1]
    ],

    /* ===== NX (igual-igual a Mesos) ===== */
    nx_common: [
        [2002021,180,15], // Honster Elixir
        [2002023,200,25], // Ginger Ale
        [2002020,150,15], // Mana Bull
        [2050004, 20, 9.5], // All Cure (x100) -> qty 20
        [2022069,  5, 6],   // Red Cider (+34 WA)
        [2022068,  5, 6],   // Yellow Cider (+35 MA)
        [2022245, 15, 7],   // Heartstopper (+60 WA)

        // Otros
        [2070007,  1, 2],   // Hwabi (Lv.70 star)

        // Dark Scroll 30%
        [2044705,  1, 1.5], // Claw ATT 30%
        [2044305,  1, 1.5], // Spear ATT 30%
        [2044605,  1, 1.5],   // Crossbow ATT 30%
        [2043705,  1, 1.5],   // Wand Magic ATT 30%
        [2044405,  1, 1.5],   // Pole Arm ATT 30%
        [2044505,  1, 1.5], // Bow ATT 30%

        // Raros varios
        [1022088,  1, 3], // Lentes de Arqueólogo (intradeable)
        [2022179,  4, 2],   // Onyx Apple
        [2049100,  3, 2.15], // Chaos Scroll
        [2340000,  1, 1.2], // White Scroll

        // Equips – Elemental Wand Lv.70 (bajados)
        [1372035,  1, 0.275],
        [1372036,  1, 0.275],
        [1372037,  1, 0.275],
        [1372038,  1, 0.275],

        // Elemental Wand Lv.130 (ultra raro)
        [1372039,  1, 0.2],
        [1372040,  1, 0.2],
        [1372041,  1, 0.2],
        [1372042,  1, 0.2],

        // Elemental Staff Lv.163 (ultra raros en tu setting)
        [1382049,  1, 0.2],
        [1382050,  1, 0.2],
        [1382051,  1, 0.2],
        [1382052,  1, 0.2],
        // Rex Earrings
        [1032077, 1, 0.65],
        [1032078, 1, 0.65],
        [1032079, 1, 0.65]
    ],
    nx_locked: [
        // Elemental Staff Lv.103
        [1382045, 1, 2],
        [1382046, 1, 2],
        [1382047, 1, 2],
        [1382048, 1, 2],
        // Rex Earrings
        [1032077, 1, 1.1],
        [1032078, 1, 1.1],
        [1032079, 1, 1.1]
    ],

    /* ===== DONOR (sin cambios tuyos) ===== */
    donor: [
        [2002021,200,7],
        [2002023,200,7],
        [2002020,200,7],
        [2050004,50,7],
        [2022069,5,5],
        [2022068,5,5],
        [2022245,15,8],
        [2070007,1,2.5],
        [2044705,1,2.2],
        [2044305,1,2.2],
        [2044605,1,2.2],
        [2043705,1,2.2],
        [2044405,1,2.2],
        [2044505,1,2.2],
        [1022088,1,3],
        [2022179,5,10],
        [2049100,2,9],
        [2340000,1,2],
        [1372035,1,0.9],
        [1372036,1,0.9],[1372037,1,0.9],[1372038,1,0.9],
        [1372039,1,2.5],[1372040,1,2.5],[1372041,1,2.5],[1372042,1,2.5],
        [1382045,1,0.9],[1382046,1,0.9],[1382047,1,0.9],[1382048,1,0.9],
        [1382049,1,1.5],[1382050,1,1.5],[1382051,1,1.5],[1382052,1,1.5],
        [1032077,1,5],[1032078,1,5],[1032079,1,5]
    ]
};

/* ================= Core ================= */

function start(){ status=-1; action(1,0,0); }

function action(mode, type, selection){
    if (mode == -1) { cm.dispose(); return; }
    if (mode == 0 && status == 0) { cm.dispose(); return; }
    if (mode == 0) status--; else status++;

    if (status == 0) {
        cm.sendSimple(
            "#eGachapon Nionsoft#n\r\n\r\n" +
            "#L0#Gachapon de #bMesos#k (cuesta #r1,000,000#k mesos)#l\r\n" +
            "#L1#Gachapon de #dNX#k (usa #i" + NX_TICKET + "##z" + NX_TICKET + "#)#l\r\n" +
            "#L2#Gachapon #rDONOR#k (usa #i" + DON_TICKET + "##z" + DON_TICKET + "#)#l\r\n" +
            "#L3#Ver lista de posibles items#l"
        );
    }
    else if (status == 1) {
        if (selection == 3) {
            // Lista general (unificada) sin porcentajes
            cm.sendOk(buildUnifiedItemList());
            cm.dispose();
            return;
        }

        if (selection == 0 || selection == 1 || selection == 2) modeSelect = selection;
        var txt = (modeSelect==0)
            ? "¿Tirar #bMesos#k por #r1,000,000#k?"
            : (modeSelect==1)
                ? "¿Tirar #dNX#k usando #i"+NX_TICKET+"##z"+NX_TICKET+"#?"
                : "¿Tirar #rDONOR#k usando #i"+DON_TICKET+"##z"+DON_TICKET+"#?";
        cm.sendYesNo(txt);
    }
    else if (status == 2) {
        // Cobro y (en Mesos/NX) incremento contador antes de tirar
        if (!chargeOnce(modeSelect)) { status = 0; return; }
        if (modeSelect == 0) incMesosCount();
        if (modeSelect == 1) incNxCount();

        var reward = roll(modeSelect); // incluye lógica de pity para Mesos y NX
        var itemId = reward[0], qty = reward[1];

        if (!cm.canHold(itemId, qty)) {
            cm.sendOk("Tu inventario está lleno. Vuelve con espacio.");
            refund(modeSelect);
            // Revertir contador si falló
            if (modeSelect == 0) setMesosCount(Math.max(getMesosCount()-1,0));
            else if (modeSelect == 1) setNxCount(Math.max(getNxCount()-1,0));
            cm.dispose();
            return;
        }

        cm.gainItem(itemId, qty);

        // Reseteos de pity tras la #100
        if (modeSelect == 0 && getMesosCount() >= 100) setMesosCount(0);
        if (modeSelect == 1 && getNxCount() >= 100) setNxCount(0);

        var msg = (isRare(itemId) ? "✨ #e¡INSÓLITO!#n ✨ " : "¡Buen intento! ") +
                  "Has obtenido #b#i"+itemId+"##z"+itemId+"##k x"+qty+".\r\n";

        // 👉 Bloquear tiradas consecutivas: cerrar siempre después del premio
        cm.sendOk(msg + "\r\n#kVuelve a hablar con el NPC para tirar de nuevo.");
        cm.dispose();
        return;
    }
}

/* ================= Helpers ================= */

function chargeOnce(mode) {
    if (mode == 0) {
        if (cm.getMeso() < MESOS_COST) { cm.sendOk("Te faltan mesos ("+MESOS_COST+")."); cm.dispose(); return false; }
        cm.gainMeso(-MESOS_COST); return true;
    } else if (mode == 1) {
        if (!cm.haveItem(NX_TICKET,1)) { cm.sendOk("Necesitas #i"+NX_TICKET+"##z"+NX_TICKET+"#."); cm.dispose(); return false; }
        cm.gainItem(NX_TICKET,-1); return true;
    } else {
        if (!cm.haveItem(DON_TICKET,1)) { cm.sendOk("Necesitas #i"+DON_TICKET+"##z"+DON_TICKET+"#."); cm.dispose(); return false; }
        cm.gainItem(DON_TICKET,-1); return true;
    }
}

function refund(mode) {
    if (mode == 0) cm.gainMeso(MESOS_COST);
    else if (mode == 1) cm.gainItem(NX_TICKET,1);
    else cm.gainItem(DON_TICKET,1);
}

function roll(mode) {
    if (mode == 0) {
        var count = getMesosCount(); // ya incrementado
        if (count >= 100) return weightedPick(pools.mesos_locked); // garantizado algo del locked
        return weightedPick(pools.mesos_common);
    } else if (mode == 1) {
        var nxCount = getNxCount(); // ya incrementado
        if (nxCount >= 100) return weightedPick(pools.nx_locked); // garantizado algo del locked
        return weightedPick(pools.nx_common);
    } else {
        return weightedPick(pools.donor);
    }
}

function weightedPick(pool) {
    var total = 0;
    for (var i=0;i<pool.length;i++) total += pool[i][2];
    var r = Math.random() * total, acc = 0;
    for (var j=0;j<pool.length;j++) {
        acc += pool[j][2];
        if (r <= acc) return [pool[j][0], pool[j][1]];
    }
    return [pool[0][0], pool[0][1]];
}

function isRare(itemId) {
    var rares = {
        2340000:true, 2049100:true,
        1372039:true,1372040:true,1372041:true,1372042:true,
        1382049:true,1382050:true,1382051:true,1382052:true,
        1382045:true,1382046:true,1382047:true,1382048:true, // 103s
        1032077:true,1032078:true,1032079:true
    };
    return rares[itemId] === true;
}

function buildUnifiedItemList() {
    var s = "#eLista general de posibles ítems#n\r\n";

    // Pools “comunes” de todos (Mesos/NX/Donor)
    var commonPools = [pools.mesos_common, pools.nx_common, pools.donor];
    // Pools bloqueados por pity (solo tirada 100 en Mesos/NX)
    var lockedPools = [pools.mesos_locked, pools.nx_locked];

    var seen = {};
    var isCommon = {};

    // 1) Listamos ítems comunes (sin duplicar)
    for (var p = 0; p < commonPools.length; p++) {
        var pool = commonPools[p];
        if (!pool) continue;
        for (var i = 0; i < pool.length; i++) {
            var id = pool[i][0];
            if (!seen[id]) {
                s += "#i" + id + "# #z" + id + "#\r\n";
                seen[id] = true;
                isCommon[id] = true;
            }
        }
    }

    // 2) Agregamos los que son SOLO de la tirada 100 (aparecen en locked y no en common)
    var anyLockedOnly = false;
    for (var lp = 0; lp < lockedPools.length; lp++) {
        var lpool = lockedPools[lp];
        if (!lpool) continue;
        for (var j = 0; j < lpool.length; j++) {
            var lid = lpool[j][0];
            if (isCommon[lid]) continue; // si ya está en comunes, no lo marcamos como 100
            if (!anyLockedOnly) {
                s += "\r\n#e[Disponibles solo en la tirada #b100#k]#n\r\n";
                anyLockedOnly = true;
            }
            if (!seen[lid]) {
                s += "#i" + lid + "# #z" + lid + "# #r[Tirada 100]#k\r\n";
                seen[lid] = true;
            }
        }
    }

    return s;
}
