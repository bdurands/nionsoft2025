package client;

import tools.DatabaseConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

/**
 * Tracks daily quest progress for players
 */
public class DailyQuestTracker {
    private static final int DAILY_QUEST_ID = 9002;
    private static final int[] DAILY_QUEST_MOBS = {
            2110200, 3210203, 3110301, 4230125, 4230112, 5130101, 5150001, 5120500,
            6130208, 6130204, 9420535, 8140300, 7130010, 8140600, 8142100, 8150200,
            8150302, 8190002, 8200004, 8200011, 8200012, 8200007
    };

    // Map preset IDs to their specific mob IDs (matches the NPC script PRESETS)
    private static final Map<Integer, int[]> PRESET_MOBS = new HashMap<Integer, int[]>() {{
        put(101, new int[]{2110200}); // Horny Mushroom
        put(201, new int[]{3210203}); // Panda Teddy
        put(202, new int[]{3110301}); // Dark Sand Dwarf
        put(301, new int[]{4230125}); // Skeledog
        put(302, new int[]{4230112}); // Master Robo
        put(401, new int[]{5130101}); // Stone Golem
        put(402, new int[]{5150001}); // Skeleton soldier
        put(403, new int[]{5120500}); // Grizly
        put(501, new int[]{6130208}); // Kru
        put(502, new int[]{6130204}); // Mr.Alli
        put(503, new int[]{9420535}); // Jester Scarlion
        put(601, new int[]{8140300}); // Dark Klok
        put(602, new int[]{7130010}); // Death Teddy
        put(701, new int[]{8140600}); // Bone Fish
        put(702, new int[]{8142100}); // Risell Squid
        put(703, new int[]{8150200}); // Green Cornian
        put(801, new int[]{8150302}); // Dark Wyvern
        put(802, new int[]{8190002}); // Nest Golem
        put(901, new int[]{8200004}); // Chief Memory Guardian
        put(902, new int[]{8200011}); // Oblivion Guardian
        put(1001, new int[]{8200012}); // Chief Oblivion Guardian
        put(1002, new int[]{8200007}); // Qualm Guardian
    }};

    public static void onMonsterKilled(Character player, int mobId) {
        if (!isValidMobForDailyQuest(mobId)) return;
        if (player.getQuestStatus(DAILY_QUEST_ID) != 1) return;

        try {
            String questDate = getTodayKey();
            java.util.List<DailyQuestProgress> allProgress = getAllDailyQuestProgress(player.getId(), questDate);

            if (allProgress.isEmpty()) return;

            String mobName = getMobName(mobId);
            boolean anyQuestUpdated = false;

            // Check all active quests and update those that match this mob
            for (DailyQuestProgress progress : allProgress) {
                if (progress.claimed) continue;
                if (!isValidMobForActiveQuest(progress.presetId, mobId)) continue;

                int newKillCount = progress.killCount + 1;
                updateKillCount(player.getId(), questDate, progress.presetId, newKillCount);
                anyQuestUpdated = true;

                // Send progress update to player for this quest
                if (newKillCount >= progress.targetCount) {
                    player.sendPacket(tools.PacketCreator.sendYellowTip("Daily Quest Completed! Visit the NPC to claim your reward."));
                    player.message("Daily quest completed! Visit the NPC to claim your reward.");
                } else {
                    // Show progress every 10 kills, or on special intervals
                    if (newKillCount % 10 == 0 || newKillCount % 100 == 0 ||
                            newKillCount <= 5 || (progress.targetCount - newKillCount) <= 5) {
                        player.sendPacket(tools.PacketCreator.sendYellowTip("You killed " + mobName + " " + newKillCount + "/" + progress.targetCount));
                    }
                }
            }

            // Update quest UI if any quest was updated
            if (anyQuestUpdated) {
                try {
                    player.sendPacket(tools.PacketCreator.updateQuestInfo((short) DAILY_QUEST_ID, 0));
                } catch (Exception e) {
                    // Ignore packet errors
                }
            }

        } catch (Exception e) {
            // Log error but don't interrupt gameplay
            System.err.println("Error updating daily quest progress for player " + player.getId() + ": " + e.toString());
        }
    }

    private static boolean isValidMobForDailyQuest(int mobId) {
        for (int validMobId : DAILY_QUEST_MOBS) {
            if (validMobId == mobId) return true;
        }
        return false;
    }

    private static String getMobName(int mobId) {
        // Map of mob IDs to their names for display
        switch (mobId) {
            case 2110200: return "Horny Mushroom";
            case 3210203: return "Panda Teddy";
            case 3110301: return "Dark Sand Dwarf";
            case 4230125: return "Skeledog";
            case 4230112: return "Master Robo";
            case 5130101: return "Stone Golem";
            case 5150001: return "Skeleton Soldier";
            case 5120500: return "Grizly";
            case 6130208: return "Kru";
            case 6130204: return "Mr.Alli";
            case 9420535: return "Jester Scarlion";
            case 8140300: return "Dark Klok";
            case 7130010: return "Death Teddy";
            case 8140600: return "Bone Fish";
            case 8142100: return "Risell Squid";
            case 8150200: return "Green Cornian";
            case 8150302: return "Dark Wyvern";
            case 8190002: return "Nest Golem";
            case 8200004: return "Chief Memory Guardian";
            case 8200011: return "Oblivion Guardian";
            case 8200012: return "Chief Oblivion Guardian";
            case 8200007: return "Qualm Guardian";
            default: return "Monster";
        }
    }

    private static boolean isValidMobForActiveQuest(int presetId, int mobId) {
        int[] validMobs = PRESET_MOBS.get(presetId);
        if (validMobs == null) return false;

        for (int validMobId : validMobs) {
            if (validMobId == mobId) return true;
        }
        return false;
    }

    private static String getTodayKey() {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("America/Lima"));
        int y = cal.get(Calendar.YEAR);
        int m = cal.get(Calendar.MONTH) + 1;
        int d = cal.get(Calendar.DAY_OF_MONTH);
        return String.format("%d-%02d-%02d", y, m, d);
    }

    private static DailyQuestProgress getDailyQuestProgress(int characterId, String questDate) {
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT * FROM daily_quest_progress WHERE character_id = ? AND quest_date = ? AND claimed = 0 ORDER BY last_updated DESC LIMIT 1"
             )) {

            ps.setInt(1, characterId);
            ps.setString(2, questDate);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new DailyQuestProgress(
                            rs.getInt("id"),
                            rs.getInt("character_id"),
                            rs.getString("quest_date"),
                            rs.getInt("preset_id"),
                            rs.getInt("kill_count"),
                            rs.getInt("target_count"),
                            rs.getBoolean("claimed")
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting daily quest progress: " + e.toString());
        }
        return null;
    }

    private static java.util.List<DailyQuestProgress> getAllDailyQuestProgress(int characterId, String questDate) {
        java.util.List<DailyQuestProgress> results = new java.util.ArrayList<>();
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "SELECT * FROM daily_quest_progress WHERE character_id = ? AND quest_date = ? AND claimed = 0 ORDER BY preset_id ASC"
             )) {

            ps.setInt(1, characterId);
            ps.setString(2, questDate);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(new DailyQuestProgress(
                            rs.getInt("id"),
                            rs.getInt("character_id"),
                            rs.getString("quest_date"),
                            rs.getInt("preset_id"),
                            rs.getInt("kill_count"),
                            rs.getInt("target_count"),
                            rs.getBoolean("claimed")
                    ));
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting all daily quest progress: " + e.toString());
        }
        return results;
    }

    private static void updateKillCount(int characterId, String questDate, int presetId, int newKillCount) {
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(
                     "UPDATE daily_quest_progress SET kill_count = ?, last_updated = CURRENT_TIMESTAMP " +
                             "WHERE character_id = ? AND quest_date = ? AND preset_id = ? AND claimed = 0"
             )) {

            ps.setInt(1, newKillCount);
            ps.setInt(2, characterId);
            ps.setString(3, questDate);
            ps.setInt(4, presetId);
            ps.executeUpdate();

        } catch (Exception e) {
            System.err.println("Error updating kill count: " + e.toString());
        }
    }

    private static class DailyQuestProgress {
        final int id;
        final int characterId;
        final String questDate;
        final int presetId;
        final int killCount;
        final int targetCount;
        final boolean claimed;

        DailyQuestProgress(int id, int characterId, String questDate, int presetId, int killCount, int targetCount, boolean claimed) {
            this.id = id;
            this.characterId = characterId;
            this.questDate = questDate;
            this.presetId = presetId;
            this.killCount = killCount;
            this.targetCount = targetCount;
            this.claimed = claimed;
        }
    }
}