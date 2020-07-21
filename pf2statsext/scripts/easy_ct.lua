function onInit()
    --Check and increment session number
    if User.isHost() then
        Comm.registerSlashHandler("resetinit", processResetInit);
        Comm.registerSlashHandler("restovernight", processRestOvernight);
        Comm.registerSlashHandler("resteteffects", processResetEffects);
    end
end

function processResetInit(sCommand, sParams)
    if User.isHost() then
        CombatManager.resetInit();
    end
end

function processResetEffects(sCommand, sParams)
    if User.isHost() then
        CombatManager2.clearExpiringEffects();
    end
end

function processRestOvernight(sCommand, sParams)
    if User.isHost() then
        ChatManager.Message(Interface.getString("ct_message_restovernight"), true);
        CombatManager2.rest();
    end
end