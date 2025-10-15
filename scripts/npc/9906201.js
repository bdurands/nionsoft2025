/*
 * @Name:        NimaKIN
 * @Author:      Signalize
 * @Modified by: MainlandHero + ChatGPT (Reward Points fix)
 * @NPC:         9900000
 * @Purpose:     Cambiador de estilo usando Reward Points
 * @Map:         180000000
 */

var status = 0;
var beauty = 0;
var price = 1000;

var skin = [0, 1, 2, 3, 4, 5, 9, 10];
var fhair = [31360, 31450, 31490, 31520, 31680, 34050, 34150, 34160, 34210, 34340, 34420, 34610, 34840, 34940, 34810, 34770, 34970];
var hair = [30320, 30330, 30340, 30350, 30360, 30800, 32390, 32432, 32450, 33000, 33150, 33220, 33250, 33510, 33530];
var face = [20000, 20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020, 20021, 20022, 20023, 20024, 20025, 20026, 20027, 20028, 20029, 20031, 20032];
var fface = [21000, 21001, 21002, 21003, 21004, 21005, 21006, 21007, 21008, 21009, 21010, 21011, 21012, 21013, 21014, 21016, 21017, 21018, 21019, 21020, 21021, 21022, 21023, 21024, 21025, 21026, 21027, 21029, 21030];

var hairnew = [];
var haircolor = [];
var facenew = [];
var colors = [];

function pushIfItemExists(array, itemid) {
    if ((itemid = cm.getCosmeticItem(itemid)) != -1 && !cm.isCosmeticEquipped(itemid)) {
        array.push(itemid);
    }
}

function start() {
    var puntos = cm.getPlayer().getRewardPoints();

    if (puntos < price) {
        cm.sendOk("Este NPC solo está disponible si tienes al menos " + price + " Donor Points.\r\nActualmente tienes: " + puntos + " puntos.");
        cm.dispose();
        return;
    }

    var mensaje = "Hola, puedes cambiar tu look por " + price + " Donor Points.\r\n";
    mensaje += "Tienes actualmente: " + puntos + " puntos.\r\n";

    if (cm.getPlayer().isMale()) {
        mensaje += "Que deseas cambiar?\r\n#L0#Piel#l\r\n#L1#Cabello masculino#l\r\n#L2#Color de cabello#l\r\n#L3#Ojos masculinos#l\r\n#L4#Color de ojos#l";
    } else {
        mensaje += "Que deseas cambiar?\r\n#L0#Piel#l\r\n#L5#Cabello femenino#l\r\n#L2#Color de cabello#l\r\n#L6#Ojos femeninos#l\r\n#L4#Color de ojos#l";
    }

    cm.sendSimple(mensaje);
}

function action(mode, type, selection) {
    status++;
    if (mode != 1) {
        cm.dispose();
        return;
    }

    if (status == 1) {
        beauty = selection + 1;

        if (cm.getPlayer().getRewardPoints() < price) {
            cm.sendNext("No tienes suficientes Donor Points. Necesitas " + price + " puntos para cambiar tu apariencia.");
            cm.dispose();
            return;
        }

        if (selection == 0) {
            cm.sendStyle("Elige tu tono de piel:", skin);
        } else if (selection == 1 || selection == 5) {
            var list = (selection == 1 ? hair : fhair);
            hairnew = [];
            for (var i = 0; i < list.length; i++) {
                pushIfItemExists(hairnew, list[i]);
            }
            cm.sendStyle("Elige tu nuevo peinado:", hairnew);
        } else if (selection == 2) {
            var baseHair = parseInt(cm.getPlayer().getHair() / 10) * 10;
            haircolor = [];
            for (var i = 0; i < 8; i++) {
                pushIfItemExists(haircolor, baseHair + i);
            }
            cm.sendStyle("Elige un color de cabello:", haircolor);
        } else if (selection == 3 || selection == 6) {
            var list = (selection == 3 ? face : fface);
            facenew = [];
            for (var i = 0; i < list.length; i++) {
                pushIfItemExists(facenew, list[i]);
            }
            cm.sendStyle("Elige tu nuevo rostro:", facenew);
        } else if (selection == 4) {
            var baseFace = parseInt(cm.getPlayer().getFace() / 1000) * 1000 + parseInt(cm.getPlayer().getFace() % 100);
            colors = [];
            for (var i = 0; i < 9; i++) {
                pushIfItemExists(colors, baseFace + (i * 100));
            }
            cm.sendStyle("Elige un color de ojos:", colors);
        }
    } else if (status == 2) {
        if (beauty == 1) {
            cm.setSkin(skin[selection]);
        } else if (beauty == 2 || beauty == 6) {
            cm.setHair(hairnew[selection]);
        } else if (beauty == 3) {
            cm.setHair(haircolor[selection]);
        } else if (beauty == 4 || beauty == 7) {
            cm.setFace(facenew[selection]);
        } else if (beauty == 5) {
            cm.setFace(colors[selection]);
        }

        var nuevosPuntos = cm.getPlayer().getRewardPoints() - price;
        cm.getPlayer().setRewardPoints(nuevosPuntos);
        cm.getPlayer().saveToDB(false, true);

        cm.sendOk("¡Tu nuevo look ha sido aplicado!\r\nPuntos restantes: " + nuevosPuntos);
        cm.dispose();
    }
}
