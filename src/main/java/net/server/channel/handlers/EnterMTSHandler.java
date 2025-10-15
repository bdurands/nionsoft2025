package net.server.channel.handlers;

import client.Character;
import client.Client;
import config.YamlConfig;
import net.AbstractPacketHandler;
import net.packet.InPacket;
import server.maps.FieldLimit;
import server.maps.MiniDungeonInfo;
import server.maps.MapleMap;
import tools.PacketCreator;

public final class EnterMTSHandler extends AbstractPacketHandler {

    private static final int FREE_MARKET_MAP_ID = 910000000;

    @Override
    public void handlePacket(InPacket p, Client c) {
        Character chr = c.getPlayer();

        if (!YamlConfig.config.server.USE_MTS) {
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        // ⛔ Ya está en Free Market: no volver a procesar
        if (chr.getMapId() == FREE_MARKET_MAP_ID) {
            c.sendPacket(PacketCreator.serverNotice(5, "Ya estás en el Free Market."));
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (chr.getEventInstance() != null) {
            c.sendPacket(PacketCreator.serverNotice(5, "No puedes entrar al Free Market mientras estás en un evento."));
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (MiniDungeonInfo.isDungeonMap(chr.getMapId())) {
            c.sendPacket(PacketCreator.serverNotice(5, "No puedes entrar al Free Market desde una Mini-Dungeon."));
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (FieldLimit.CANNOTMIGRATE.check(chr.getMap().getFieldLimit())) {
            chr.dropMessage(1, "No puedes hacer esto en este mapa.");
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (!chr.isAlive()) {
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        if (chr.getLevel() < 10) {
            c.sendPacket(PacketCreator.blockedMessage2(5));
            c.sendPacket(PacketCreator.enableActions());
            return;
        }

        // ✅ Guardar ubicación y mover a FM
        chr.saveLocation("FREE_MARKET");
        MapleMap freeMarket = c.getChannelServer().getMapFactory().getMap(FREE_MARKET_MAP_ID);
        chr.changeMap(freeMarket);
    }
}
