package client.command.commands.gm6;

import client.Character;
import client.Client;
import client.command.Command;
import net.bots.BotManager;
import net.server.channel.Channel;
import server.maps.MapleMap;

import java.awt.Point;

public class SpawnBotCommand extends Command {

    {
        setDescription("Crea un jugador falso visible (bot). Uso: !spawnbot <nombre> <jobId> <mapId> <x> <y>");
    }

    @Override
    public void execute(Client c, String[] params) {
        Character player = c.getPlayer();

        if (params.length < 3) {
            player.message("Uso: !spawnbot <nombre> <jobId> <mapId> <x> <y>");
            return;
        }

        try {
            String name = params[0];
            int jobId = Integer.parseInt(params[1]);
            int mapId = Integer.parseInt(params[2]);

            Channel channel = c.getChannelServer();
            MapleMap map = channel.getMapFactory().getMap(mapId);

            if (map == null) {
                player.message("❌ Error: Mapa con ID " + mapId + " no encontrado.");
                return;
            }

            // Calcular coordenadas X e Y iniciales
            int x = (params.length >= 4) ? Integer.parseInt(params[3]) : player.getPosition().x;
            int rawY = (params.length >= 5) ? Integer.parseInt(params[4]) : 1000; // Y alto para forzar búsqueda de suelo

            // Buscar punto en el suelo desde esa X
            Point initial = new Point(x, rawY);
            Point groundPoint = map.getGroundPoint(initial);

            int y;
            if (groundPoint != null) {
                y = groundPoint.y;
            } else {
                y = player.getPosition().y; // fallback en caso de fallo
            }


            Point spawnPoint = map.getGroundPoint(new Point(x, 1000)); // Altura exagerada para caer al suelo
            if (spawnPoint == null) {
                spawnPoint = new Point(x, y); // fallback
            }

            BotManager.spawnBot(name, jobId, mapId, spawnPoint.x, spawnPoint.y, channel);
            player.yellowMessage("✅ Bot '" + name + "' creado en el mapa " + mapId + " sobre el suelo.");

        } catch (NumberFormatException e) {
            player.message("⚠️ Error: jobId, mapId, x, y deben ser números.");
        } catch (Exception e) {
            player.message("💥 Error inesperado al crear el bot.");
            e.printStackTrace();
        }
    }
}
