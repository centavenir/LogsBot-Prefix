const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'set-logs',
    aliases: [
        'preset-logs', 'presetlog', 'presetlogs', 'preset-log',
        'set-log', 'setlog', 'setlogs', 'autosetlog', 'autosetlogs',
        'autoset-log', 'autoset-logs'
    ],
    description: "Crée une catégorie et des salons pour les logs, et configure les canaux de logs dans la base de données.",
};

exports.run = async (client, message, args) => {
    const id = message.author.id;
    const buyerid = client.config.clients.buyer;

    const buyer = id === buyerid;
    const owners = await db.get('owners') || [];
    const buyers = await db.get('buyers') || [];
    const estowner = owners.includes(id);
    const buyer2 = buyers.includes(id);

    if (!buyer && !estowner && !buyer2) {
        return message.channel.send("Vous devez être le buyer du bot, un owner, ou un buyer enregistré pour utiliser cette commande.");
    }

    const categorie = await message.guild.channels.create({
        name: '➔ Dex Logs',
        type: 4, 
        permissionOverwrites: [
            {
                id: message.guild.id,
                deny: ['ViewChannel'],  
            },
            {
                id: message.guild.roles.everyone.id,
                deny: ['ViewChannel'],  
            },
            {
                id: message.guild.roles.cache.find(role => role.permissions.has('Administrator'))?.id || message.guild.id,
                allow: ['ViewChannel'],  
            }
        ],
    });

    const salon = {
        'ζ͜͡D・logs-msg': 'msgLogsChannel',
        'ζ͜͡D・logs-voice': 'voiceLogsChannel',
        'ζ͜͡D・logs-role': 'roleLogsChannel',
        'ζ͜͡D・logs-boost': 'boostLogsChannel',
        'ζ͜͡D・logs-mod': 'modLogsChannel'
    };

    let salonmention = {};
    for (const [nomsalon, dbKey] of Object.entries(salon)) {
        const salon2 = await message.guild.channels.create({
            name: nomsalon,
            type: 0, 
            parent: categorie.id,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['ViewChannel'],  
                },
                {
                    id: message.guild.roles.everyone.id,
                    deny: ['ViewChannel'],  
                },
                {
                    id: message.guild.roles.cache.find(role => role.permissions.has('Administrator'))?.id || message.guild.id,
                    allow: ['ViewChannel', 'SendMessages'],  
                }
            ],
        });

        await db.set(dbKey, salon2.id);

        salonmention[dbKey] = `<#${salon2.id}>`;
    }

    const embed = new EmbedBuilder()
        .setTitle('Auto Logs')
        .setDescription('La catégorie **➔ Dex Logs** & les salons de logs ont été créés :')
        .addFields(
            { name: 'ζ͜͡D・logs-msg', value: `↳ ${salonmention.msgLogsChannel}` },
            { name: 'ζ͜͡D・logs-voice', value: `↳ ${salonmention.voiceLogsChannel}` },
            { name: 'ζ͜͡D・logs-role', value: `↳ ${salonmention.roleLogsChannel}` },
            { name: 'ζ͜͡D・logs-boost', value: `↳ ${salonmention.boostLogsChannel}` },
            { name: 'ζ͜͡D・logs-mod', value: `↳ ${salonmention.modLogsChannel}` }
        )
        .setColor(client.config.clients.embedColor)
        .setFooter({ text: client.config.clients.name, iconURL: client.config.clients.logo })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
