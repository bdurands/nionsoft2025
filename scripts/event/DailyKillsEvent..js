// scripts/event/DailyKillsEvent.js
var QUEST_ID = 11021;
var TZ = "America/Lima";
function log(s){ try{ java.lang.System.out.println("[DailyKillsEvent] "+s);}catch(e){} }

function todayKey() {
  var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone(TZ));
  var y = cal.get(java.util.Calendar.YEAR), m = cal.get(java.util.Calendar.MONTH)+1, d = cal.get(java.util.Calendar.DAY_OF_MONTH);
  return ""+y+(m<10?"0"+m:m)+(d<10?"0"+d:d);
}

// === I/O al mismo campo "data" del quest ===
function getRawData(p){
  var MapleQuest = Packages.server.quest.MapleQuest, qr = p.getQuestNAdd(MapleQuest.getInstance(QUEST_ID));
  var s=""; try{s=qr.getCustomData();}catch(e){}
  try{var b=p.getOneInfo(QUEST_ID,"data"); if(b&&b.length) return b;}catch(e){}
  return s||"";
}
function setRawData(p,v){
  var MapleQuest = Packages.server.quest.MapleQuest, qr = p.getQuestNAdd(MapleQuest.getInstance(QUEST_ID));
  try{qr.setCustomData(v);}catch(e){} try{p.updateOneInfo(QUEST_ID,"data",""+v);}catch(e){}
}
function parseCSVIntList(s){ var out=[]; if(!s) return out; var a=s.split(","); for (var i=0;i<a.length;i++){ var t=a[i].trim(); if(/^\d+$/.test(t)) out.push(parseInt(t)); } return out; }
function joinCSVIntList(a){ if(!a||!a.length) return ""; var b=[]; for (var i=0;i<a.length;i++) b.push(a[i]); return b.join(","); }
function parseData(p){
  var s=getRawData(p), o={day:"00000000",count:0,claimed:0,target:0,mobs:[],mesos:0,exp:0,item:0,qty:0,name:"",pid:0,done:[]};
  if(!s) return o;
  try{
    var parts=s.split(";");
    for(var i=0;i<parts.length;i++){
      var kv=parts[i].split("="); if(kv.length!=2) continue;
      var k=kv[0], v=kv[1];
      if(k=="day") o.day=v; else if(k=="count") o.count=parseInt(v); else if(k=="claimed") o.claimed=parseInt(v);
      else if(k=="target") o.target=parseInt(v);
      else if(k=="mobs"){ o.mobs=[]; if(v){ var ids=v.split(","); for(var j=0;j<ids.length;j++){ var t=(""+ids[j]).trim(); if(t.length&&/^\d+$/.test(t)) o.mobs.push(parseInt(t)); } } }
      else if(k=="mesos") o.mesos=parseInt(v); else if(k=="exp") o.exp=parseInt(v);
      else if(k=="item") o.item=parseInt(v); else if(k=="qty") o.qty=parseInt(v);
      else if(k=="name") o.name=v.replace(/%3B/g,";"); else if(k=="pid") o.pid=parseInt(v);
      else if(k=="done") o.done = parseCSVIntList(v);
    }
  }catch(e){}
  return o;
}
function setData(p,o){
  var day=o.day||"00000000", count=o.count|0, claimed=o.claimed?1:0, target=o.target|0;
  var mobsCsv=(o.mobs&&o.mobs.length>0)?o.mobs.join(","):"";
  var mesos=o.mesos|0, exp=o.exp|0, item=o.item|0, qty=o.qty|0, pid=o.pid|0, name=(o.name||"").replace(/;/g,"%3B");
  var doneCsv=joinCSVIntList(o.done||[]);
  setRawData(p, "day="+day+";count="+count+";claimed="+claimed+";target="+target+";mobs="+mobsCsv
               +";mesos="+mesos+";exp="+exp+";item="+item+";qty="+qty+";name="+name
               +";pid="+pid+";done="+doneCsv);
}

// ============ Ciclo del EVENTO ============
function init(){ log("init"); }
function setup(eim, leaderid){ log("setup"); return eim; }
function afterSetup(eim){ log("afterSetup"); }

// Este es el callback de TU template:
function monsterKilled(mob, eim) {
  try {
    var killer = mob.getHighestDamageChar(); // muchos forks lo tienen
    if (!killer) return;
    var mobId = mob.getId();

    var o = parseData(killer);
    if (o.target<=0 || o.claimed==1) return;
    if (o.day != todayKey()) return;

    var ok=false; for (var i=0;i<o.mobs.length;i++) if (o.mobs[i]==mobId){ ok=true; break; }
    if (!ok) return;

    o.count = (o.count|0) + 1;
    if (o.count > o.target) o.count = o.target;
    setData(killer, o);

    if ((o.count % 10) == 0) killer.dropMessage(5, "[Diarias] Progreso: "+o.count+"/"+o.target);
  } catch (e) { log("monsterKilled err: "+e); }
}
