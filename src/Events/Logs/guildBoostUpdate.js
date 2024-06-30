const { EmbedBuilder, AuditLogEvent } = require('discord.js'); // Assurez-vous d'importer AuditLogEvent
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'guildBoostUpdate',
    async execute(oldGuild, newGuild, client) {
        const logsid = await db.get('boostLogsChannel');
        if (!logsid) return;

        const salon = oldGuild.channels.cache.get(logsid) || newGuild.channels.cache.get(logsid);
        if (!salon) return;

        const delboost = oldGuild.premiumSubscriptionCount;
        const addboost = newGuild.premiumSubscriptionCount;

        if (addboost > delboost) {
            const embed = new EmbedBuilder()
                .setDescription(`<:boost:1256673778948247673> ${newGuild.premiumSubscribers.last()} vient de booster le serveur !`)
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            logChannel.send({ embeds: [embed] });
        } else if (addboost < delboost) {
            const embed = new EmbedBuilder()
                .setDescription(`<:unboost:1256673780470779985> ${newGuild.premiumSubscribers.last()} a cessé de booster le serveur.`)
                .setColor(client.config.clients.embedColor)
                .setTimestamp();
            salon.send({ embeds: [embed] });
        }
    }
};
