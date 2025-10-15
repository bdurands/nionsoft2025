package net.bots;

import client.Character;
import client.Client;
import client.Job;
import client.inventory.Inventory;
import client.inventory.InventoryType;
import net.server.channel.Channel;
import server.maps.MapleMap;

import java.awt.*;
import java.util.ArrayList;
import java.util.List;

public class BotManager {
    private static final List<Character> bots = new ArrayList<>();

    public static void addBot(Character bot) {
        bots.add(bot);
    }

    public static List<Character> getBots() {
        return bots;
    }



    public static void spawnBot(String name, int jobId, int mapId, int x, int y, Channel channel) {
        System.out.println("[BOT] Iniciando spawn del bot...");

        try {
            // Crear cliente fake
            Client fakeClient = new Client(
                    Client.Type.FAKE,
                    -System.currentTimeMillis(),
                    "127.0.0.1",
                    null,
                    0,
                    channel.getId()
            );
            System.out.println("[BOT] Cliente fake creado.");

            // Obtener mapa destino
            MapleMap map = channel.getMapFactory().getMap(mapId);
            if (map == null) {
                System.out.println("[ERROR] Mapa ID " + mapId + " no encontrado.");
                return;
            }

            // Verificar que el mapa tenga footholds
            if (map.getFootholds() == null || map.getFootholds().getAllFootholds().isEmpty()) {
                System.out.println("[BOT WARNING] ⚠️ El mapa no tiene footholds cargados. El bot podría aparecer en el aire.");
            }

            // Crear bot
            Character bot = Character.createFake(fakeClient, jobId);
            bot.setName(name != null ? name : "Bot_" + System.currentTimeMillis());
            bot.setLevel(10);
            bot.setJob(Job.getById(jobId));
            bot.setClient(fakeClient);
            fakeClient.setPlayer(bot);
            bot.setMap(map);

            // Calcular posición en el suelo (o fallback)
            Point desired = new Point(x, y); // punto deseado desde donde buscar hacia abajo
            Point ground = map.getGroundPoint(desired);
            System.out.println("🧪 DEBUG Foothold debajo: " + map.getFootholds().findBelow(desired));

            if (ground != null && ground.y < y + 100) { // protección: no muy lejos
                bot.setPosition(ground);
                System.out.println("✅ Posición en el suelo asignada: " + ground);
            } else {
                bot.setPosition(new Point(x, y));
                System.out.println("⚠️ No se detectó suelo, se usó fallback: " + new Point(x, y));
            }


            // Inventarios por seguridad
            for (InventoryType type : InventoryType.values()) {
                bot.setInventory(type, new Inventory(bot, type, (byte) 100));
            }

            bot.setGuildId(0);
            bot.setTeam((byte) 0);

            // Agregar al mapa
            System.out.println("[BOT] Agregando al mapa...");
            map.addPlayer(bot);

            // Enviar al resto
            System.out.println("[BOT] Broadcast del spawn...");
            map.broadcastSpawnPlayerMapObjectMessage(bot, bot, false);

            System.out.println("[BOT] ✅ Bot creado exitosamente.");
        } catch (Exception e) {
            System.out.println("[BOT ERROR] ❌ Error durante creación o spawn del bot:");
            e.printStackTrace();
        }
    }


}

