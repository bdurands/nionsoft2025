/*
 * Este archivo es parte del servidor OdinMS Maple Story
 * Modificado por Bruno & ChatGPT
 * NPC: Tory
 */

var status = 0;
var em = null;

function start() {
    status = -1;
    action(1, 0, 0);
}

function action(mode, type, selection) {
    if (mode == -1) {
        cm.dispose();
    } else {
        if (mode == 0 && status == 0) {
            cm.dispose();
            return;
        }
        if (mode == 1) {
            status++;
        } else {
            status--;
        }

        if (cm.getMapId() == 100000200) {
            if (status == 0) {
                em = cm.getEventManager("HenesysPQ");
                if (em == null) {
                    cm.sendOk("La misión de grupo de Henesys ha encontrado un error.");
                    cm.dispose();
                    return;
                } else if (cm.isUsingOldPqNpcStyle()) {
                    action(1, 0, 0);
                    return;
                }

                cm.sendSimple(
                    "#e#b<Misión de Grupo: Colina Primaveral>\r\n#k#n" + em.getProperty("party") + "\r\n\r\n" +
                    "Soy Tory. Dentro de aquí hay una hermosa colina donde florece la prímula. Hay un tigre que vive en la colina, Growlie, y parece estar buscando algo para comer. ¿Te gustaría ir a la colina de las prímulas y unir fuerzas con tu grupo para ayudar a Growlie?#b\r\n" +
                    "#L0#Quiero participar en la misión de grupo.\r\n" +
                    "#L1#" + (cm.getPlayer().isRecvPartySearchInviteEnabled() ? "Desactivar" : "Activar") + " búsqueda de grupo.\r\n" +
                    "#L2#Quiero saber más detalles.\r\n" +
                    "#L3#Canjear sombrero de instancia.\r\n" +
                    "#L4#Reclamar Recompensas Especiales (20 #t4001158#).\r\n"
                );

            } else if (status == 1) {
                if (selection == 0) {
                    if (cm.getParty() == null) {
                        cm.sendOk("¡Hola! Soy Tory. Este lugar está cubierto por un aura misteriosa y nadie puede entrar solo.");
                        cm.dispose();
                    } else if (!cm.isLeader()) {
                        cm.sendOk("Si deseas ingresar, el líder del grupo debe hablar conmigo.");
                        cm.dispose();
                    } else {
                        var eli = em.getEligibleParty(cm.getParty());
                        if (eli.size() > 0) {
                            if (!em.startInstance(cm.getParty(), cm.getPlayer().getMap(), 1)) {
                                cm.sendOk("Ya hay un grupo dentro. Espera o cambia de canal.");
                            }
                        } else {
                            cm.sendOk("Tu grupo no cumple los requisitos. Usa búsqueda de grupo si necesitas ayuda.");
                        }
                        cm.dispose();
                    }

                } else if (selection == 1) {
                    var psState = cm.getPlayer().toggleRecvPartySearchInvite();
                    cm.sendOk("Tu estado de búsqueda de grupo ahora está: #b" + (psState ? "Activado" : "Desactivado") + "#k.");
                    cm.dispose();

                } else if (selection == 2) {
                    cm.sendOk("#e#b<Misión de Grupo: Colina Primaveral>#k#n\r\n" +
                        "Recolecta semillas de prímula y colócalas en las plataformas. Las semillas deben coincidir por color. Luego protege al Conejo Lunar mientras prepara tortas de arroz para Growlie. Cuando esté satisfecho, ¡misión cumplida!");
                    cm.dispose();

                } else if (selection == 3) {
					var hatID = 1002798;
					var featherID = 4001158;
					var questHat = 99997;

					if (cm.getQuestStatus(questHat) == 2) {
						cm.sendOk("Ya has canjeado este sombrero anteriormente. Solo se permite una vez por personaje.");
						cm.dispose();
					} else if (!cm.haveItem(featherID, 20)) {
						cm.sendOk("Necesitas al menos 20 #t" + featherID + "# para canjear el sombrero.");
						cm.dispose();
					} else if (!cm.canHold(hatID)) {
						cm.sendOk("No tienes suficiente espacio en tu inventario.");
						cm.dispose();
					} else {
						cm.gainItem(featherID, -20);
						cm.gainItem(hatID, 1);
						cm.forceCompleteQuest(questHat);
						cm.sendOk("¡Felicidades! Has recibido el sombrero de instancia. Solo se entrega una vez.");
						cm.dispose();
					}
				

                } else if (selection == 4) {
                    var hatID = 1002798;
                    var paletteID = 1012420;
                    var featherID = 4001158;
                    var questHat = 99997;
                    var questPalette = 99998;

                    if (cm.getPlayer().getLevel() >= 200) {
                        cm.sendOk("Solo los aventureros menores a nivel 40 pueden reclamar estas recompensas.");
                        cm.dispose();
                    } else if (!cm.haveItem(featherID, 20)) {
                        cm.sendOk("Necesitas al menos 20 #t" + featherID + "# para realizar un canje.");
                        cm.dispose();
                    } else if (!cm.canHold(hatID) || !cm.canHold(paletteID)) {
                        cm.sendOk("No tienes suficiente espacio en tu inventario.");
                        cm.dispose();
                    } else if (cm.getQuestStatus(questHat) != 2) {
                        cm.gainItem(featherID, -20);
                        cm.gainItem(hatID, 1);
                        cm.forceCompleteQuest(questHat);
                        cm.sendOk("¡Felicidades! Has recibido el sombrero especial.\r\nVuelve con otras 20 plumas para obtener la paleta.");
                        cm.dispose();
                    } else if (cm.getQuestStatus(questPalette) != 2) {
                        cm.gainItem(featherID, -20);
                        cm.gainItem(paletteID, 1);
                        cm.forceCompleteQuest(questPalette);
                        cm.sendOk("¡Felicidades! Has recibido tu Helado Paleta.");
                        cm.dispose();
                    } else {
                        cm.sendOk("Ya has recibido ambas recompensas. ¡Gracias por participar!");
                        cm.dispose();
                    }
                }

            } else {
                if (cm.haveItem(4001158, 20)) {
                    if (cm.canHold(1012420)) {
                        cm.gainItem(4001158, -20);
                        cm.gainItem(1012420, 1);
                        cm.sendOk("¡Aquí tienes tu sombrero! Disfrútalo.");
                    } else {
                        cm.sendOk("No tienes suficiente espacio en tu inventario.");
                    }
                } else {
                    cm.sendOk("Aún no tienes suficientes #t4001158# para canjear.");
                }
                cm.dispose();
            }

        } else if (cm.getMapId() == 910010100) {
            if (status == 0) {
                cm.sendYesNo("¿Deseas regresar a Henesys ahora?");
            } else if (status == 1) {
                if (cm.getEventInstance().giveEventReward(cm.getPlayer())) {
                    cm.warp(100000200);
                } else {
                    cm.sendOk("Verifica tu espacio de inventario para recibir la recompensa.");
                }
                cm.dispose();
            }

        } else if (cm.getMapId() == 910010400) {
            if (status == 0) {
                cm.sendYesNo("¿Deseas regresar a Henesys ahora?");
            } else if (status == 1) {
                if (cm.getEventInstance() == null) {
                    cm.warp(100000200);
                } else if (cm.getEventInstance().giveEventReward(cm.getPlayer())) {
                    cm.warp(100000200);
                } else {
                    cm.sendOk("Verifica tu espacio de inventario para recibir la recompensa.");
                }
                cm.dispose();
            }
        }
    }
}
