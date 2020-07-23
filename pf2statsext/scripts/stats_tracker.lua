--GLOBALS
deathTable = {}
session = -1

function onInit()
    DB.addHandler("combattracker.list.*", "onDelete", onDeleteCombatantEvent)
    OOBManager.registerOOBMsgHandler("applydmg", onDamage);
    OOBManager.registerOOBMsgHandler("dierollpf2", onDieRoll);
    Comm.registerSlashHandler("resetstats", processResetStats);

    --Check and increment session number
    if User.isHost() then
        local node = DB.findNode("pf2stats_session");
        if node == nil then
            node = DB.createNode("pf2stats_session");
            DB.setValue(node, "session", "number", 100);
        end
        session = DB.getValue(node, "session");
        session = session + 1;
        DB.setValue(node, "session", "number", session);
    end
end

function processResetStats(sCommand, sParams)
    --Check and increment session number
    if User.isHost() then
        local node = DB.findNode("pf2stats_session");
        if node == nil then
            node = DB.createNode("pf2stats_session");
            DB.setValue(node, "session", "number", 100);
        end
        session = DB.getValue(node, "session");
        session = session + 1;
        DB.setValue(node, "session", "number", session);

        sMsg = "**Stats reset.  Session is now: %d";
        sMsg = string.format(sMsg, session);
        ChatManager.SystemMessage(sMsg);
    end
end

function onDeleteCombatantEvent(nodeCT)
    local sEvent = deathTable[DB.getPath(nodeCT)]
    if User.isHost() and sEvent ~= nil then
        nodeDebug = DB.createNode("pf2stats_event")
        DB.setValue(nodeDebug, "source", "string", sEvent.source)
        DB.setValue(nodeDebug, "target", "string", sEvent.target)
        DB.setValue(nodeDebug, "event", "string", sEvent.event)
        DB.setValue(nodeDebug, "damage", "string", sEvent.damage)
        DB.setValue(nodeDebug, "damage_total", "string", sEvent.damage_total)
        DB.setValue(nodeDebug, "session", "string", session)
        local fileName = string.format( os.getenv("FGBOT_LOG_DIR") + "log_%d.xml", os.time() )
        DB.export(fileName, nodeDebug)
        DB.deleteNode("pf2stats_event")
        deathTable[DB.getPath(nodeCT)] = nil
    end
    return false;
end

function onDamage(msgOOB)
	local rSource = ActorManager.getActor(msgOOB.sSourceType, msgOOB.sSourceNode);
	local rTarget = ActorManager.getActor(msgOOB.sTargetType, msgOOB.sTargetNode);
	if rTarget then
		rTarget.nOrder = msgOOB.nTargetOrder;
	end
	
	local nTotal = tonumber(msgOOB.nTotal) or 0;
	ActionDamage.applyDamage(rSource, rTarget, (tonumber(msgOOB.nSecret) == 1), msgOOB.sRollType, msgOOB.sDamage, nTotal);
    if User.isHost() then
    --We only care about which PC damaged the creature
        local sTargetType, nodeTarget = ActorManager.getTypeAndNode(rTarget);
        local nPercentWounded, nPercentNonlethal, sStatus = ActorManager2.getPercentWounded(sTargetType, nodeTarget);
        if msgOOB.sSourceType == "pc" and (sStatus == "Dying" or sStatus == "Destroyed" or sStatus == "Dead") then
            local sSourceType, nodeSource = ActorManager.getTypeAndNode(rSource);
            sSourceName = DB.getValue(nodeSource, "name", "");
            sTargetName = DB.getValue(nodeTarget, "name", "");
            deathTable[rTarget.sCTNode] = {}
            deathTable[rTarget.sCTNode].source = sSourceName
            deathTable[rTarget.sCTNode].target = sTargetName            
            deathTable[rTarget.sCTNode].event = "KILLED"
            deathTable[rTarget.sCTNode].damage = msgOOB.sDamage
            deathTable[rTarget.sCTNode].damage_total = msgOOB.nTotal
        end
    end
end

lastDice = nil

function onDiceLanded(draginfo)
    lastDice = draginfo.getDieList();
    return super.onDiceLanded(draginfo)
end

function convertDiceToString(dice)
    local s = ""
    for _,v in pairs(dice) do
        if v.result then
            s = s .. v.type .. "," .. v.result
        end
    end
    return s;
end

function onReceiveMessage(messagedata)
   if lastDice ~= nil then
    local msgOOB = {};
    msgOOB.type = "dierollpf2";
    msgOOB.sender = messagedata.sender;
    msgOOB.user = User.getUsername();
    msgOOB.dice = convertDiceToString(lastDice);
    Comm.deliverOOBMessage(msgOOB);
    lastDice = nil;
   end
end

function onDieRoll(msgOOB)
    if User.isHost() then
        nodeDebug = DB.createNode("pf2stats_event")
        DB.setValue(nodeDebug, "user", "string", msgOOB.user)
        DB.setValue(nodeDebug, "sender", "string", msgOOB.sender)
        DB.setValue(nodeDebug, "event", "string", "dierollpf2")
        DB.setValue(nodeDebug, "dice", "string", msgOOB.dice)
        DB.setValue(nodeDebug, "session", "string", session)
        local fileName = string.format( os.getenv("FGBOT_LOG_DIR") + "log_%d.xml", os.time() )
        DB.export(fileName, nodeDebug)
        DB.deleteNode("pf2stats_event")
    end
end