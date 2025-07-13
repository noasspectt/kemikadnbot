const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require('old-wio.db');

module.exports = {
    config: {
        name: "unban",
        category: 'mod',
        description: "Unban a user from the guild!",
        usage: "[name | tag | mention | ID] <reason> (optional)",
        aliases: ["ub", "unbanish"],
    },
    run: async (bot, message, args) => {

        // Yetki kontrolü: Kullanıcı "BAN_MEMBERS" yetkisine sahip mi?
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send("**You don't have the permissions to unban someone! - [BAN_MEMBERS]**");
        }

        // Kullanıcı girdi kontrolü
        if (!args[0]) {
            return message.channel.send("**Please enter a username, tag, or ID!**");
        }

        // Yasaklanmış kullanıcı bilgilerini al
        let bannedMemberInfo = await message.guild.bans.fetch();

        let bannedMember = bannedMemberInfo.find(b => 
            b.user.username.toLowerCase() === args[0].toLowerCase() || 
            b.user.tag.toLowerCase() === args[0].toLowerCase() || 
            b.user.id === args[0]
        );

        if (!bannedMember) {
            return message.channel.send("**Please provide a valid username, tag, or ID, or the user is not banned!**");
        }

        // Sebep kontrolü
        let reason = args.slice(1).join(" ") || "No reason provided";

        // Botun yetkisi kontrolü
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send("**I don't have permissions to unban someone! - [BAN_MEMBERS]**");
        }

        try {
            // Kullanıcıyı yasaklamadan çıkar
            await message.guild.members.unban(bannedMember.user.id, reason);

            // Başarı mesajı
            const successEmbed = new EmbedBuilder()
                .setColor("GREEN")
                .setDescription(`**${bannedMember.user.tag} has been unbanned. Reason: ${reason}**`);
            message.channel.send({ embeds: [successEmbed] });
        } catch (error) {
            console.error("Unban işlemi sırasında bir hata oluştu:", error);
            return message.channel.send("**An error occurred while trying to unban the user. Please check my permissions or try again later.**");
        }

        // Modlog kanalı kontrolü
        let channel = db.fetch(`modlog_${message.guild.id}`);
        if (!channel) return;

        let logChannel = message.guild.channels.cache.get(channel);
        if (!logChannel) return;

        // Modlog mesajı
        const logEmbed = new EmbedBuilder()
            .setColor("#ff0000")
            .setThumbnail(bannedMember.user.displayAvatarURL({ dynamic: true }))
            .setAuthor({ name: `${message.guild.name} Modlogs`, iconURL: message.guild.iconURL() })
            .addFields(
                { name: "**Action**", value: "Unban" },
                { name: "**Unbanned User**", value: `${bannedMember.user.tag}` },
                { name: "**User ID**", value: `${bannedMember.user.id}` },
                { name: "**Moderator**", value: `${message.author.tag}` },
                { name: "**Reason**", value: reason },
                { name: "**Date**", value: message.createdAt.toLocaleString() }
            )
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
            .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
    }
};
