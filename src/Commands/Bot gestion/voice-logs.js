const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.help = {
    name: 'voice',
    aliases: [],
    description: "Définit le canal pour les logs vocaux."
};

exports.run = async (client, message, args) => {
    const executant = message.author.id;
    const buyer = client.config.clients.buyer;

    let owners = await db.get('owners') || [];
    let buyers = await db.get('buyers') || [];

    if (!owners.includes(executant) && !buyers.includes(executant) && executant !== buyer) {
        return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.");
    }

    if (args.length === 0) {
        return message.channel.send("Veuillez spécifier 'log' ou 'logs' suivi d'un canal.");
    }

    const addsalon = args[0].toLowerCase();
    if (addsalon !== 'log' && addsalon !== 'logs') {
        return message.channel.send("Commande invalide. Veuillez spécifier 'log' ou 'logs'.");
    }

    const salondid = args[1] ? args[1].replace(/[\\<>@#&!]/g, '') : message.channel.id;

    await db.set('voiceLogsChannel', salondid);
    const channel = message.guild.channels.cache.get(salondid);
    message.channel.send(`Les logs vocaux seront désormais envoyés dans ${channel}`);
};
