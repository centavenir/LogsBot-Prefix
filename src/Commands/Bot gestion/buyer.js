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
    // Vérification des permissions
    const buyerRoleId = client.config.clients.buyer;
    const isBuyer = message.member.roles.cache.has(buyerRoleId);
    const isOwner = await db.get('owners').includes(message.author.id);
    const buyers = await db.get('buyers') || [];

    if (!isBuyer && !isOwner && !buyers.includes(message.author.id)) {
        return message.channel.send("Vous devez être un buyer, un owner, ou un buyer enregistré pour utiliser cette commande.");
    }

    // Créez la catégorie "➔ Dex Logs" avec des permissions pour les administrateurs uniquement
    const category = await message.guild.channels.create('➔ Dex Logs', {
        type: 'GUILD_CATEGORY',
        permissionOverwrites: [
            {
                id: message.guild.id,
                deny: ['VIEW_CHANNEL'],  // Cache la catégorie pour tout le monde
            },
            {
                id: message.guild.roles.everyone.id,
                deny: ['VIEW_CHANNEL'],  // Cache la catégorie pour tout le monde
            },
            {
                id: message.guild.roles.cache.find(role => role.permissions.has('ADMINISTRATOR')).id,
                allow: ['VIEW_CHANNEL'],  // Donne accès à la catégorie pour les administrateurs
            }
        ],
    });

    // Créez les salons de logs sous la catégorie
    const channels = {
        'ζ͜͡D・logs-msg': 'msgLogsChannel',
        'ζ͜͡D・logs-voice': 'voiceLogsChannel',
        'ζ͜͡D・logs-role': 'roleLogsChannel',
        'ζ͜͡D・logs-boost': 'boostLogsChannel',
        'ζ͜͡D・logs-mod': 'modLogsChannel'
    };

    for (const [channelName, dbKey] of Object.entries(channels)) {
        const channel = await message.guild.channels.create(channelName, {
            type: 'GUILD_TEXT',
            parent: category.id,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL'],  // Cache les salons pour tout le monde par défaut
                },
                {
                    id: message.guild.roles.cache.find(role => role.permissions.has('ADMINISTRATOR')).id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],  // Donne accès aux administrateurs
                }
            ],
        });

        // Mettez l'ID du salon dans la base de données
        await db.set(dbKey, channel.id);
    }

    // Créez l'embed de confirmation
    const embed = new EmbedBuilder()
        .setTitle('Configuration des Logs Complète')
        .setDescription('La catégorie **➔ Dex Logs** et les salons de logs suivants ont été créés et configurés :')
        .addFields(
            { name: 'ζ͜͡D・logs-msg', value: `ID: ${channels['ζ͜͡D・logs-msg']}` },
            { name: 'ζ͜͡D・logs-voice', value: `ID: ${channels['ζ͜͡D・logs-voice']}` },
            { name: 'ζ͜͡D・logs-role', value: `ID: ${channels['ζ͜͡D・logs-role']}` },
            { name: 'ζ͜͡D・logs-boost', value: `ID: ${channels['ζ͜͡D・logs-boost']}` },
            { name: 'ζ͜͡D・logs-mod', value: `ID: ${channels['ζ͜͡D・logs-mod']}` }
        )
        .setColor(client.config.clients.embedColor)
        .setFooter({ text: `Demandé par ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
