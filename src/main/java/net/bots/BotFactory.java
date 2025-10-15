package net.bots;

import client.Client;
import client.Character;
import net.PacketProcessor;
import server.maps.MapleMap;
import tools.PacketCreator; // Esto sí debería existir en tu código
import java.awt.*;

public class BotFactory {

    public static Character createFakeBot(String name, int jobId, int x, int y, int channelId, MapleMap map) {
        // Crear cliente falso
        Client fakeClient = new Client(
                Client.Type.FAKE,
                System.currentTimeMillis(),
                "127.0.0.1",
                null,
                0,
                channelId
        );

        // Crear personaje bot
        Character bot = Character.createFake(fakeClient, jobId);
        bot.setName(name);
        bot.setLevel(10);
        bot.setPosition(new Point(x, y));
        bot.setMap(map);
        map.addPlayer(bot);

        // Mostrar bot en el mapa correctamente
        map.broadcastSpawnPlayerMapObjectMessage(bot, bot, false);

        return bot;
    }
}
