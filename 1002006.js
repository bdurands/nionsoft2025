var status = 0;
var QUEST_ID = 9002;
var LOCK_PRESET_AFTER_PROGRESS = true;
var COOLDOWN_HOURS = 24; // Hours before quest can be repeated

// ================= PRESETS =================
var PRESETS = [

// LEVEL 20
  { pid:101, name:"Horny Mushroom", min:20, max:30,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1200, default:1200 },
    mesos:500000,  exp:20000,  item:2000019, qty:10,  mobs:[2110200]
  },

// LEVEL 31
  { pid:201, name:"Panda Teddy",    min:31, max:40,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1200, default:1800 },
    mesos:1000000, exp:50000,  item:2000019, qty:50,  mobs:[3210203]
  },
  { pid:202, name:"Dark Sand Dwarf",min:31, max:40,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1200, default:1500 },
    mesos:1000000, exp:50000,  item:2000019, qty:50,  mobs:[3110301]
  },

// LEVEL 41
  { pid:301, name:"Skeledog",       min:41, max:50,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:1500000, exp:80000,  item:2000019, qty:70,  mobs:[4230125]
  },
  { pid:302, name:"Master Robo",    min:41, max:50,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:1500000, exp:80000,  item:2000019, qty:70,  mobs:[4230112]
  },

// LEVEL 51
  { pid:401, name:"Stone Golem",    min:51, max:60,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:200000, item:2000019, qty:90,  mobs:[5130101]
  },
  { pid:402, name:"Skeleton soldier",min:51,max:60,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:200000, item:2000019, qty:90,  mobs:[5150001]
  },
  { pid:403, name:"Grizly",         min:51, max:60,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:200000, item:2000019, qty:90,  mobs:[5120500]
  },

// LEVEL 61
  { pid:501, name:"Kru",            min:61, max:70,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:400000, item:2000019, qty:100,  mobs:[6130208]
  },
  { pid:502, name:"Mr.Alli",        min:61, max:70,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:400000, item:2000019, qty:100,  mobs:[6130204]
  },
  { pid:503, name:"Jester Scarlion",min:61,max:70,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2000000, exp:400000, item:2000019, qty:100,  mobs:[9420535]
  },

// LEVEL 71
  { pid:601, name:"Dark Klok",      min:71, max:90,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2500000, exp:600000, item:2000019, qty:100,  mobs:[8140300]
  },
  { pid:602, name:"Death Teddy",    min:71, max:90,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:2500000, exp:600000, item:2000019, qty:100,  mobs:[7130010]
  },

// LEVEL 91
  { pid:701, name:"Bone Fish",      min:91, max:110,
    targetByJob: { warrior:700, thief:700, pirate:700, bowman:1000, mage:1500, default:800 },
    mesos:3000000, exp:1500000, item:2000019, qty:100,  mobs:[8140600]
  },
  { pid:702, name:"Risell Squid",   min:91, max:110,
    targetByJob: { warrior:700, thief:700, pirate:700, bowman:1000, mage:1500, default:800 },
    mesos:3000000, exp:1500000, item:2000019, qty:100,  mobs:[8142100]
  },
  { pid:703, name:"Green Cornian",  min:91, max:110,
    targetByJob: { warrior:700, thief:700, pirate:700, bowman:1000, mage:1500, default:800 },
    mesos:3000000, exp:1500000, item:2000019, qty:100,  mobs:[8150200]
  },

// LEVEL 111
  { pid:801, name:"Dark Wyvern",    min:111,max:140,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:4000000, exp:4000000, item:2000019, qty:500,  mobs:[8150302]
  },
  { pid:802, name:"Nest Golem",    min:111,max:140,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:4000000, exp:4000000, item:2000019, qty:500,  mobs:[8190002]
  },

// LEVEL 141
  { pid:901, name:"Chief Memory Guardian", min:141,max:170,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:5000000, exp:8000000, item:2000019, qty:500, mobs:[8200004]
  },
  { pid:902, name:"Oblivion Guardian", min:141,max:170,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:5000000, exp:8000000, item:2000019, qty:500, mobs:[8200011]
  },

// LEVEL 171
  { pid:1001, name:"Chief Oblivion Guardian", min:171,max:200,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:5000000, exp:20000000, item:2000019, qty:500, mobs:[8200012]
  },
  { pid:1002, name:"Qualm Guardian", min:171,max:200,
    targetByJob: { warrior:1200, thief:1200, pirate:1200, bowman:1200, mage:1500, default:1200 },
    mesos:5000000, exp:20000000, item:2000019, qty:500, mobs:[8200007]
  }
];

// ================ HELPERS ================
function mobNames(arr){
  if (!arr || !arr.length) return "(no asignados)";
  var out = [];
  for (var i = 0; i < arr.length; i++) out.push("#o" + arr[i] + "#");
  return out.join(", ");
}

function todayKey() {
  var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone("America/Lima"));
  var y = cal.get(java.util.Calendar.YEAR);
  var m = cal.get(java.util.Calendar.MONTH) + 1;
  var d = cal.get(java.util.Calendar.DAY_OF_MONTH);
  return ""+y+"-"+(m<10?"0"+m:m)+"-"+(d<10?"0"+d:d);
}

// DATABASE FUNCTIONS
function getDailyQuestProgress(characterId, questDate) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT * FROM daily_quest_progress WHERE character_id = ? AND quest_date = ? AND claimed = 0 ORDER BY last_updated DESC LIMIT 1"
    );
    ps.setInt(1, characterId);
    ps.setString(2, questDate);
    var rs = ps.executeQuery();

    var result = null;
    if (rs.next()) {
      result = {
        id: rs.getInt("id"),
        characterId: rs.getInt("character_id"),
        questDate: rs.getString("quest_date"),
        presetId: rs.getInt("preset_id"),
        killCount: rs.getInt("kill_count"),
        targetCount: rs.getInt("target_count"),
        claimed: rs.getBoolean("claimed"),
        completedPresets: rs.getString("completed_presets") || "",
        nextAvailable: rs.getTimestamp("next_available")
      };
    }

    rs.close();
    ps.close();
    con.close();
    return result;
  } catch (e) {
    cm.getPlayer().message("Database error: " + e.toString());
    return null;
  }
}

function getAllDailyQuestProgress(characterId, questDate) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT * FROM daily_quest_progress WHERE character_id = ? AND quest_date = ? AND claimed = 0 ORDER BY preset_id ASC"
    );
    ps.setInt(1, characterId);
    ps.setString(2, questDate);
    var rs = ps.executeQuery();

    var results = [];
    while (rs.next()) {
      results.push({
        id: rs.getInt("id"),
        characterId: rs.getInt("character_id"),
        questDate: rs.getString("quest_date"),
        presetId: rs.getInt("preset_id"),
        killCount: rs.getInt("kill_count"),
        targetCount: rs.getInt("target_count"),
        claimed: rs.getBoolean("claimed"),
        completedPresets: rs.getString("completed_presets") || "",
        nextAvailable: rs.getTimestamp("next_available")
      });
    }

    rs.close();
    ps.close();
    con.close();
    return results;
  } catch (e) {
    cm.getPlayer().message("Database error: " + e.toString());
    return [];
  }
}

function getCompletedPresetsToday(characterId, questDate) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT DISTINCT preset_id FROM daily_quest_progress WHERE character_id = ? AND quest_date = ? AND claimed = 1"
    );
    ps.setInt(1, characterId);
    ps.setString(2, questDate);
    var rs = ps.executeQuery();

    var completed = [];
    while (rs.next()) {
      completed.push(rs.getInt("preset_id"));
    }

    rs.close();
    ps.close();
    con.close();
    return completed;
  } catch (e) {
    return [];
  }
}

function getCompletedQuestNames(completedPids) {
  if (!completedPids || completedPids.length === 0) return "(none)";

  var names = [];
  for (var i = 0; i < completedPids.length; i++) {
    var pid = completedPids[i];
    for (var j = 0; j < PRESETS.length; j++) {
      if (PRESETS[j].pid === pid) {
        names.push(PRESETS[j].name + " (" + PRESETS[j].min + "-" + PRESETS[j].max + ")");
        break;
      }
    }
  }
  return names.length > 0 ? names.join(", ") : "(none)";
}

function updateDailyQuestProgress(characterId, questDate, presetId, killCount, targetCount, claimed, completedPresets) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();

    var nextAvailable = new java.sql.Timestamp(java.lang.System.currentTimeMillis() + (COOLDOWN_HOURS * 60 * 60 * 1000));
    var completedPresetsStr = completedPresets ? completedPresets.join(",") : "";

    var ps = con.prepareStatement(
      "INSERT INTO daily_quest_progress (character_id, quest_date, preset_id, kill_count, target_count, claimed, completed_presets, next_available) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE " +
      "kill_count = VALUES(kill_count), claimed = VALUES(claimed), completed_presets = VALUES(completed_presets), " +
      "next_available = VALUES(next_available), last_updated = CURRENT_TIMESTAMP"
    );

    ps.setInt(1, characterId);
    ps.setString(2, questDate);
    ps.setInt(3, presetId);
    ps.setInt(4, killCount);
    ps.setInt(5, targetCount);
    ps.setBoolean(6, claimed);
    ps.setString(7, completedPresetsStr);
    ps.setTimestamp(8, nextAvailable);

    ps.executeUpdate();
    ps.close();
    con.close();
    return true;
  } catch (e) {
    cm.getPlayer().message("Database error: " + e.toString());
    return false;
  }
}

function canDoQuest(characterId, presetId) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT next_available FROM daily_quest_progress WHERE character_id = ? AND preset_id = ? AND claimed = 1 " +
      "ORDER BY last_updated DESC LIMIT 1"
    );
    ps.setInt(1, characterId);
    ps.setInt(2, presetId);
    var rs = ps.executeQuery();

    var canDo = true;
    if (rs.next()) {
      var nextAvailable = rs.getTimestamp("next_available");
      var now = new java.sql.Timestamp(java.lang.System.currentTimeMillis());
      canDo = now.after(nextAvailable);
    }

    rs.close();
    ps.close();
    con.close();
    return canDo;
  } catch (e) {
    return true; // Default to allowing if there's an error
  }
}

function getTimeUntilAvailable(characterId, presetId) {
  try {
    var DatabaseConnection = Packages.tools.DatabaseConnection;
    var con = DatabaseConnection.getConnection();
    var ps = con.prepareStatement(
      "SELECT next_available FROM daily_quest_progress WHERE character_id = ? AND preset_id = ? AND claimed = 1 " +
      "ORDER BY last_updated DESC LIMIT 1"
    );
    ps.setInt(1, characterId);
    ps.setInt(2, presetId);
    var rs = ps.executeQuery();

    var timeLeft = "";
    if (rs.next()) {
      var nextAvailable = rs.getTimestamp("next_available").getTime();
      var now = java.lang.System.currentTimeMillis();
      var diff = nextAvailable - now;

      if (diff > 0) {
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timeLeft = hours + "h " + minutes + "m";
      }
    }

    rs.close();
    ps.close();
    con.close();
    return timeLeft;
  } catch (e) {
    return "";
  }
}

// Agrupar job
function getJobGroup(jobId) {
  if (jobId >= 100 && jobId < 200) return 'warrior';
  if (jobId >= 200 && jobId < 300) return 'mage';
  if (jobId >= 300 && jobId < 400) return 'bowman';
  if (jobId >= 400 && jobId < 500) return 'thief';
  if (jobId >= 500 && jobId < 600) return 'pirate';
  return 'default';
}

function resolveTargetForPlayer(preset) {
  if (preset.targetByJob) {
    var g = getJobGroup(cm.getJob());
    if (preset.targetByJob[g] != null) return preset.targetByJob[g];
    if (preset.targetByJob['default'] != null) return preset.targetByJob['default'];
  }
  return preset.target;
}

function ensureStarted(){
  if (cm.getQuestStatus(QUEST_ID) != 1) {
    cm.startQuest(QUEST_ID);
  }
}

function presetsForLevel(lv){
  var out=[];
  for(var i=0;i<PRESETS.length;i++){
    var p=PRESETS[i];
    if(lv>=p.min && lv<=p.max) out.push(p);
  }
  return out;
}

function contains(arr, val){
  if(!arr) return false;
  for(var i=0;i<arr.length;i++){
    if(arr[i]==val) return true;
  }
  return false;
}

function pushHelper(){
  try{
    var shortId = Packages.java.lang.Short.valueOf(QUEST_ID);
    cm.getPlayer().sendPacket(Packages.tools.packet.PacketCreator.updateQuestInfo(shortId, 0));
  }catch(e){}
}

// ================= FLOW =================
function start() {
  status = -1;
  action(1, 0, 0);
}

function action(mode, type, selection){
  if(mode!=1 && status==0){ cm.dispose(); return; }
  if(mode==-1){ cm.dispose(); return; }
  if(mode==1) status++; else status--;

  if(status==0){
    ensureStarted();
    var characterId = cm.getPlayer().getId();
    var questDate = todayKey();
    var progress = getDailyQuestProgress(characterId, questDate);
    var completedToday = getCompletedPresetsToday(characterId, questDate);

    var lv = cm.getPlayer().getLevel();
    var opts = presetsForLevel(lv);

    var killCount = progress ? progress.killCount : 0;
    var targetCount = progress ? progress.targetCount : 0;
    var activeQuestName = "";

    if (progress && progress.presetId > 0) {
      for (var i = 0; i < PRESETS.length; i++) {
        if (PRESETS[i].pid === progress.presetId) {
          activeQuestName = PRESETS[i].name;
          break;
        }
      }
    }

    var header="#eDaily Kill Quests#n (level: #b"+lv+"#k)\r\n\r\n";
    var body="";

    if(opts.length==0){
      body+="#rNo presets available for your level.#k\r\n";
    } else {
      body+="Available quests:\r\n";
      for(var i=0;i<opts.length;i++){
        var p=opts[i];
        var req = resolveTargetForPlayer(p);
        var isCompleted = contains(completedToday, p.pid);
        var canDo = canDoQuest(characterId, p.pid);
        var timeLeft = getTimeUntilAvailable(characterId, p.pid);

        var tag = "";
        if (isCompleted && !canDo) {
          tag = " #r(cooldown: " + timeLeft + ")#k";
        } else if (isCompleted) {
          tag = " #g(disponible otra vez)#k";
        }

        body+="#L"+(100+i)+"##b["+p.min+"-"+p.max+"]#k "+p.name
            +"  (Target: #b"+req+"#k, Mobs: #b"+p.mobs.length+"#k)"+tag+"\r\n";
      }
    }
    var tail="\r\n#L1#In Progress Quest#l\r\n#L2#Claim reward (if goal reached)#l\r\n#L3#Close#l";
    cm.sendSimple(header+body+tail);

  } else if (status==1){
    var characterId = cm.getPlayer().getId();
    var questDate = todayKey();

    if(selection==1){
      var allProgress = getAllDailyQuestProgress(characterId, questDate);
      var completedToday = getCompletedPresetsToday(characterId, questDate);
      var completedList = getCompletedQuestNames(completedToday);

      var msg="#eIn Progress Quests#n\r\n\r\n";

      if (allProgress.length === 0) {
        msg += "#rNo active quests today.#k\r\n\r\n";
        msg += "Choose quest presets from the main menu to get started!";
      } else {
        msg += "#bActive Quests:#k\r\n\r\n";

        for (var i = 0; i < allProgress.length; i++) {
          var progress = allProgress[i];
          var activePreset = null;

          // Find the preset for this progress
          for (var j = 0; j < PRESETS.length; j++) {
            if (PRESETS[j].pid === progress.presetId) {
              activePreset = PRESETS[j];
              break;
            }
          }

          if (activePreset) {
            var remainingKills = progress.targetCount - progress.killCount;
            var progressPercent = Math.floor((progress.killCount / progress.targetCount) * 100);
            var isComplete = progress.killCount >= progress.targetCount;

            msg += "#b" + (i+1) + ". " + activePreset.name + "#k (Level " + activePreset.min + "-" + activePreset.max + ")\r\n";
            msg += "Progress: " + progress.killCount + " / " + progress.targetCount + " (" + progressPercent + "%)";

            if (isComplete) {
              msg += " #g[COMPLETE - READY TO CLAIM]#k\r\n";
            } else {
              msg += "\r\nRemaining: #r" + remainingKills + " kills#k\r\n";
            }

            msg += "Monsters: " + mobNames(activePreset.mobs) + "\r\n";
            msg += "Reward: " + activePreset.mesos + " mesos";
            if (activePreset.exp > 0) msg += ", " + activePreset.exp + " EXP";
            if (activePreset.item > 0) msg += ", " + activePreset.qty + " x #t" + activePreset.item + "#";
            msg += "\r\n\r\n";
          }
        }

        if (completedList !== "(none)") {
          msg += "#bCompleted Today:#k " + completedList;
        }
      }

      pushHelper();
      cm.sendOk(msg);
      cm.dispose();
      return;

    } else if (selection==2){
      var progress = getDailyQuestProgress(characterId, questDate);

      if(!progress || progress.targetCount<=0){
        cm.sendOk("You don't have an active quest today. Choose a preset for your level range.");
        cm.dispose();
        return;
      }

      if(progress.claimed){
        cm.sendOk("You already claimed this quest today. Choose a different one if you want to continue!");
        cm.dispose();
        return;
      }

      if(progress.killCount < progress.targetCount){
        cm.sendOk("You need more kills: #b"+progress.killCount+" / "+progress.targetCount+"#k.");
        cm.dispose();
        return;
      }

      var activePreset = null;
      for (var i = 0; i < PRESETS.length; i++) {
        if (PRESETS[i].pid === progress.presetId) {
          activePreset = PRESETS[i];
          break;
        }
      }

      if (!activePreset) {
        cm.sendOk("Error: Could not find information for the active preset.");
        cm.dispose();
        return;
      }

      if(activePreset.item>0 && activePreset.qty>0 && !cm.canHold(activePreset.item, activePreset.qty)){
        cm.sendOk("You don't have space for the reward item.");
        cm.dispose();
        return;
      }

      if(cm.getMeso() + activePreset.mesos > 2147483647){
        cm.sendOk("You would exceed the mesos limit. Spend some and try again.");
        cm.dispose();
        return;
      }

      if(activePreset.mesos>0) cm.gainMeso(activePreset.mesos);
      if(activePreset.item>0 && activePreset.qty>0) cm.gainItem(activePreset.item, activePreset.qty);
      if(activePreset.exp>0) cm.gainExp(activePreset.exp);

      var completedToday = getCompletedPresetsToday(characterId, questDate);
      if (!contains(completedToday, progress.presetId)) {
        completedToday.push(progress.presetId);
      }

      updateDailyQuestProgress(characterId, questDate, progress.presetId, progress.killCount, progress.targetCount, true, completedToday);
      pushHelper();

      cm.sendOk("Completed! You received: #b"+activePreset.mesos+" mesos#k"
        +(activePreset.exp>0?(", #b"+activePreset.exp+" EXP#k"):"")
        +(activePreset.item>0?(", #b"+activePreset.qty+" x #t"+activePreset.item+"##k"):"")
        +"\r\nYou can choose a DIFFERENT preset after the "+COOLDOWN_HOURS+" hour cooldown.");
      cm.dispose();
      return;

    } else if (selection==3){
      cm.sendOk("Good luck!");
      cm.dispose();
      return;

    } else if (selection>=100){
      var lv = cm.getPlayer().getLevel();
      var opts = presetsForLevel(lv);
      var idx = selection - 100;

      if (idx < 0 || idx >= opts.length) {
        cm.sendOk("Invalid selection.");
        cm.dispose();
        return;
      }

      var p = opts[idx];
      var progress = getDailyQuestProgress(characterId, questDate);
      var completedToday = getCompletedPresetsToday(characterId, questDate);

      if (!canDoQuest(characterId, p.pid)) {
        var timeLeft = getTimeUntilAvailable(characterId, p.pid);
        cm.sendOk("That quest (#b"+p.name+"#k) is on cooldown. Time remaining: #r"+timeLeft+"#k.");
        cm.dispose();
        return;
      }

      // Check if this specific quest is already active
      var allProgress = getAllDailyQuestProgress(characterId, questDate);
      var isAlreadyActive = false;
      for (var k = 0; k < allProgress.length; k++) {
        if (allProgress[k].presetId === p.pid) {
          isAlreadyActive = true;
          break;
        }
      }

      if (isAlreadyActive) {
        pushHelper();
        cm.sendOk("This quest is already active. Check your progress in the 'In Progress Quests' page.");
        cm.dispose();
        return;
      }


      ensureStarted();
      var req = resolveTargetForPlayer(p);

      updateDailyQuestProgress(characterId, questDate, p.pid, 0, req, false, completedToday);
      pushHelper();

      cm.sendOk("Today's quest:\r\n- #b"+p.name+"#k (range: "+p.min+"-"+p.max+")\r\n"
        +"- Goal: #b"+req+"#k kills\r\n"
        +"- Mobs: #b"+mobNames(p.mobs)+"#k\r\n"
        +"- Reward: #b"+p.mesos+" mesos#k"
        +(p.exp>0?(", #b"+p.exp+" EXP#k"):"")
        +(p.item>0?(", #b"+p.qty+" x #t"+p.item+"##k"):"")
        +"\r\n#dRemember:#k this quest will have a "+COOLDOWN_HOURS+" hour cooldown after completion.");
      cm.dispose();
      return;

    } else {
      cm.sendOk("Invalid option.");
      cm.dispose();
      return;
    }
  }
}