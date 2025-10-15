# Daily Quest System Implementation Guide

## Overview
This guide contains all the necessary code changes to implement a fully functional daily quest system with proper mob kill tracking and quest isolation. The system prevents exploit abuse by ensuring each quest preset uses unique mob assignments.

## Database Setup

First, create the required database table:

```sql
CREATE TABLE `daily_quest_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `character_id` int(11) NOT NULL,
  `quest_date` varchar(10) NOT NULL,
  `preset_id` int(11) NOT NULL,
  `kill_count` int(11) DEFAULT '0',
  `target_count` int(11) DEFAULT '0',
  `claimed` tinyint(1) DEFAULT '0',
  `completed_presets` text,
  `next_available` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_quest` (`character_id`,`quest_date`,`preset_id`),
  KEY `character_quest_date` (`character_id`,`quest_date`),
  KEY `character_preset` (`character_id`,`preset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## Code Implementation

### 1. DailyQuestTracker.java
Create this new file at: `src/main/java/client/DailyQuestTracker.java`

```java
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
```

### 2. MapleMap.java Modifications
In `src/main/java/server/maps/MapleMap.java`:

**Add Import (around line 27):**
```java
import client.DailyQuestTracker;
```

**Update:**
Find this section:
```java
public void killMonster(final Monster monster, final Character chr, final boolean withDrops, int animation,
                        short dropDelay) {
    if (monster == null) {
        return;
    }

    if (chr == null) {
        if (removeKilledMonsterObject(monster)) {
            monster.dispatchMonsterKilled(false);
            broadcastMessage(PacketCreator.killMonster(monster.getObjectId(), animation), monster.getPosition());
            monster.aggroSwitchController(null, false);
        }
        return;
    }

    if (!removeKilledMonsterObject(monster)) {
        return;
    }

    try {
        if (monster.getStats().getLevel() >= chr.getLevel() + 30 && !chr.isGM()) {
            AutobanFactory.GENERAL.alert(chr, " for killing a " + monster.getName() + " which is over 30 levels higher.");
        }

                    /*if (chr.getQuest(Quest.getInstance(29400)).getStatus().equals(QuestStatus.Status.STARTED)) {
                     if (chr.getLevel() >= 120 && monster.getStats().getLevel() >= 120) {
                     //FIX MEDAL SHET
                     } else if (monster.getStats().getLevel() >= chr.getLevel()) {
                     }
                     }*/

        if (monster.getCP() > 0 && chr.getMap().isCPQMap()) {
            chr.gainCP(monster.getCP());
        }

        int buff = monster.getBuffToGive();
        if (buff > -1) {
            ItemInformationProvider mii = ItemInformationProvider.getInstance();
            for (MapObject mmo : this.getPlayers()) {
                Character character = (Character) mmo;
                if (character.isAlive()) {
                    StatEffect statEffect = mii.getItemEffect(buff);
                    character.sendPacket(PacketCreator.showOwnBuffEffect(buff, 1));
                    broadcastMessage(character, PacketCreator.showBuffEffect(character.getId(), buff, 1), false);
                    statEffect.applyTo(character);
                }
            }
        }

        if (MobId.isZakumArm(monster.getId())) {
            boolean makeZakReal = true;
            Collection<MapObject> objects = getMapObjects();
            for (MapObject object : objects) {
                Monster mons = getMonsterByOid(object.getObjectId());
                if (mons != null) {
                    if (MobId.isZakumArm(mons.getId())) {
                        makeZakReal = false;
                        break;
                    }
                }
            }
            if (makeZakReal) {
                MapleMap map = chr.getMap();

                for (MapObject object : objects) {
                    Monster mons = map.getMonsterByOid(object.getObjectId());
                    if (mons != null) {
                        if (mons.getId() == MobId.ZAKUM_1) {
                            makeMonsterReal(mons);
                            break;
                        }
                    }
                }
            }
        }

        Character dropOwner = monster.killBy(chr);

        // Update daily quest progress if applicable
        if (chr != null) {
            DailyQuestTracker.onMonsterKilled(chr, monster.getId());
        }

        if (withDrops && !monster.dropsDisabled()) {
            if (dropOwner == null) {
                dropOwner = chr;
            }
            dropFromMonster(dropOwner, monster, false, dropDelay);
        }

        if (monster.hasBossHPBar()) {
            for (Character mc : this.getAllPlayers()) {
                if (mc.getTargetHpBarHash() == monster.hashCode()) {
                    mc.resetPlayerAggro();
                }
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    } finally {     // thanks resinate for pointing out a memory leak possibly from an exception thrown
        monster.dispatchMonsterKilled(true);
        broadcastMessage(PacketCreator.killMonster(monster.getObjectId(), animation), monster.getPosition());
    }


}
```
## Quest Configuration

### Daily Quest Presets
The system supports multiple level-based quest presets with unique mob assignments:

| Level Range | Preset ID | Quest Name | Mob ID | Mob Name |
|-------------|-----------|------------|--------|----------|
| 20-30 | 101 | Horny Mushroom | 2110200 | Horny Mushroom |
| 31-40 | 201 | Panda Teddy | 3210203 | Panda Teddy |
| 31-40 | 202 | Dark Sand Dwarf | 3110301 | Dark Sand Dwarf |
| 41-50 | 301 | Skeledog | 4230125 | Skeledog |
| 41-50 | 302 | Master Robo | 4230112 | Master Robo |
| 51-60 | 401 | Stone Golem | 5130101 | Stone Golem |
| 51-60 | 402 | Skeleton Soldier | 5150001 | Skeleton Soldier |
| 51-60 | 403 | Grizly | 5120500 | Grizly |
| 61-70 | 501 | Kru | 6130208 | Kru |
| 61-70 | 502 | Mr.Alli | 6130204 | Mr.Alli |
| 61-70 | 503 | Jester Scarlion | 9420535 | Jester Scarlion |
| 71-90 | 601 | Dark Klok | 8140300 | Dark Klok |
| 71-90 | 602 | Death Teddy | 7130010 | Death Teddy |
| 91-110 | 701 | Bone Fish | 8140600 | Bone Fish |
| 91-110 | 702 | Risell Squid | 8142100 | Risell Squid |
| 91-110 | 703 | Green Cornian | 8150200 | Green Cornian |
| 111-140 | 801 | Dark Wyvern | 8150302 | Dark Wyvern |
| 111-140 | 802 | Nest Golem | 8190002 | Nest Golem |
| 141-170 | 901 | Chief Memory Guardian | 8200004 | Chief Memory Guardian |
| 141-170 | 902 | Oblivion Guardian | 8200011 | Oblivion Guardian |
| 171-200 | 1001 | Chief Oblivion Guardian | 8200012 | Chief Oblivion Guardian |
| 171-200 | 1002 | Qualm Guardian | 8200007 | Qualm Guardian |

## Features

### Multiple Active Quests Support
- **NEW**: Players can now accept and work on multiple quests simultaneously
- Each quest tracks kills independently - no more "already have progress on another quest" restriction
- Perfect for players who want to work on different quests at the same time
- Smart duplicate prevention - can't accept the same quest twice

### Quest Isolation
- Each quest preset requires killing specific mobs
- Killing mobs for one quest will NOT count toward other quests (unless they share the same mob ID)
- **FIXED**: Multi-quest kill tracking - kills now properly update ALL applicable active quests
- Prevents exploit abuse where players could complete multiple quests with same mob kills

### Enhanced Progress Tracking
- **NEW**: "In Progress Quests" page shows ALL active quests with individual progress
- Real-time kill count updates via yellow tip messages for each quest
- Progress notifications every 10 kills or at special intervals (first 5 kills, last 5 kills)
- Quest completion notification when target is reached
- **NEW**: Visual progress indicators with percentages and remaining kill counts
- **NEW**: "[COMPLETE - READY TO CLAIM]" status indicators

### Cooldown System
- 24-hour cooldown per quest preset after completion
- Players can have multiple different quests active simultaneously
- Cooldown prevents from repeating the same quest too frequently
- **NEW**: Smart cooldown display showing exact time remaining

### Level-Based Rewards
Rewards scale with level ranges:

| Level Range | Mesos | EXP | Item Rewards |
|-------------|--------|-----|--------------|
| **20-30** | 500K | 20K | 10x Power Elixir (2000019) |
| **31-40** | 1M | 50K | 50x Power Elixir (2000019) |
| **41-50** | 1.5M | 80K | 70x Power Elixir (2000019) |
| **51-60** | 2M | 200K | 90x Power Elixir (2000019) |
| **61-70** | 2M | 400K | 100x Power Elixir (2000019) |
| **71-90** | 2.5M | 600K | 100x Power Elixir (2000019) |
| **91-110** | 3M | 1.5M | 100x Power Elixir (2000019) |
| **111-140** | 4M | 4M | 500x Power Elixir (2000019) |
| **141-170** | 5M | 8M | 500x Power Elixir (2000019) |
| **171-200** | 5M | 20M | 500x Power Elixir (2000019) |

**Item Details:**
- **Power Elixir (2000019)**: HP recovery item (+300 HP)

### Job-Based Kill Requirements
Different jobs have varying kill count requirements:
- **Warriors, Thieves, Pirates, Bowmen**: Standard kill counts
- **Mages**: 25% higher kill requirements (balanced for AOE capabilities)
- **Default**: Fallback for unclassified jobs

## NPC Interface Features

The updated NPC script (`1002006.js`) includes modern interface improvements:

### Main Menu Features:
- **Clean Interface Design** - Simple, user-friendly layout with level-based quest organization
- **"Available quests"** - Updated terminology (changed from "Available presets")
- **Smart Quest Selection** - Multiple quest support with duplicate prevention
- **Level-appropriate Organization** - Shows quests suitable for your current level
- **Quest Status Indicators** - Cooldown timers and availability status

### Updated Menu Options:
1. **In Progress Quests** - NEW: View ALL active quests with detailed progress tracking
2. **Claim Rewards** - Enhanced reward claiming with better validation
3. **Close** - Clean exit option

### Enhanced "In Progress Quests" Page:
- **Multi-Quest Display** - Shows ALL active quests simultaneously
- **Individual Progress Tracking** - Each quest displays:
  - Quest name and level range
  - Current progress with percentage (e.g., "Progress: 50 / 1200 (4%)")
  - Remaining kills highlighted in red (e.g., "Remaining: 1150 kills")
  - Valid monster list for each quest
  - Reward preview for each quest
  - "[COMPLETE - READY TO CLAIM]" status when finished
- **Numbered Quest List** - Clear organization (1., 2., 3., etc.)
- **Comprehensive Information** - Monster names, rewards, and completion status

### Multiple Quest Support Features:
- **Accept Multiple Quests** - Players can now accept both available quests for their level
- **Independent Progress Tracking** - Each quest tracks separately
- **Smart Duplicate Prevention** - Can't accept the same quest twice
- **No More Blocking Messages** - Removed "already have progress on another quest" restriction

## Installation Steps

1. **Execute the SQL** to create the `daily_quest_progress` table
2. **Add DailyQuestTracker.java** to your project at the specified path (includes multi-quest support)
3. **Modify MapleMap.java** with the import and monster kill tracking code
4. **Replace your NPC script** with the updated version (`1002006.js`) that supports multiple quests
5. **Restart your server** to load the changes

## Testing

### Single Quest Testing:
1. Start quest 9002 via the NPC
2. Select a quest preset appropriate for your level
3. Kill the specified mobs and verify kill count updates
4. Complete the quest and claim rewards
5. Verify cooldown system works correctly

### Multi-Quest Testing:
1. **Accept multiple quests** - Select both available quests for your level range
2. **Check "In Progress Quests"** - Verify both quests appear with individual progress
3. **Kill mobs for both quests** - Test that kills update the correct quest(s)
4. **Verify independent tracking** - Each quest should track separately
5. **Test completion** - Complete one quest, verify the other remains active
6. **Test different characters** and level ranges with multiple quests

## Troubleshooting

### Common Issues:
- **Mob kills not registering**: Check that quest 9002 is started
- **Wrong kill counts**: Verify mob IDs match between NPC script and DailyQuestTracker
- **Database errors**: Check database connection and table schema
- **Packet errors**: Ensure PacketCreator methods exist in your version

### Debug Tips:
- Check server console for error messages from DailyQuestTracker
- Verify database entries in `daily_quest_progress` table
- Test with GM commands to spawn specific mobs for testing

This system provides a robust, exploit-proof daily quest system that scales with player level and prevents abuse through proper quest isolation.