const discord = require('discord.js');
const client = new discord.Client;
const moment = require('moment');
const fs = require('fs');
const disbut = require('discord-buttons')(client);
const {MessageButton, MessageComponent, MessageActionRow} = require('discord-buttons');
const config = require('./config.json');



client.on('ready', async () => {
    console.log('[Logs] Ready!');
})

client.on("clickButton", async (button) => {
    if (button.id == "ticket_open") {
        const ticketembed = new discord.MessageEmbed()
        .setDescription('**__שלום, תודה שפתחת טיקט בשרת שלנו. צוות התמיכה יתפנה אליך במועד האפשרי.__**')
        var vtn = new MessageButton()
        .setID("ticket_close")
        .setLabel("🔒 Close")
        .setStyle("grey")

        var row = new MessageActionRow()
        .addComponent(vtn)

        var d = new Date,
        date = d.getHours() + ":" + d.getMinutes() + ", " +d.toDateString();

        button.guild.channels.create(`ticket-${button.clicker.user.username}`, {type: "text"}).then(ch => {
            ch.setParent(config["parent"]);
            ch.updateOverwrite(button.guild.roles.everyone, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
              })
            ch.updateOverwrite(config["membersrole"], { VIEW_CHANNEL: false, SEND_MESSAGES: false});
            ch.updateOverwrite(button.clicker.user.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true});
            ch.updateOverwrite(config["staff"], { VIEW_CHANNEL: true, SEND_MESSAGES: true});
            ch.send(`<@&${config["staff"]}>, <@${button.clicker.user.id}>`,{embed: ticketembed, components: [row]})
            button.reply.send("Ticket Opened, <@" + button.clicker.user + ">").then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 5000)
            })
            const logembed = new discord.MessageEmbed()
            .setTitle("[Tickets Log]")
            .setDescription("**Ticket Opened!** At " + date)
            .addField('Creator:', `${button.clicker.user}`, true)
            .addField('Room:', `${ch.name}`, true)
            .setColor(config["color"])
            client.channels.cache.get(config["logchannel"]).send(logembed)
        })
    } else if(button.id == "ticket_close") {
        var d = new Date;
        date = d.getHours() + ":" + d.getMinutes() + ", " +d.toDateString();
        const logembed1 = new discord.MessageEmbed()
        .setTitle("[Tickets Log]")
        .setDescription("**Ticket Closed!** At " + date)
        .addField('Closed By:', `${button.clicker.user}`, true)
        .addField('Room:', `${button.channel.name}`, true)
        .setColor(config["color"])
        button.reply.send(`Ticket Closed by ${button.clicker.user.username}`)
        client.channels.cache.get(config["logchannel"]).send(logembed1)
        {
            setTimeout(() => {
                button.channel.delete().catch();
            }, 5000)
        }
    
    }
})


client.on("message", async (message) => {
    if(message.content.startsWith("/add")){
        if (!message.member.roles.cache.has(config["staff"])) return message.reply('[Error], Staff Role Not Found!')
        if(message.channel.name.includes('ticket-')) {
          const member = message.mentions.members.first()
          if(!member) {
              message.reply('[Error], You Need To Mention User!')
          }
        message.channel.updateOverwrite(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true});
            const embed = new discord.MessageEmbed()
            .setTitle('[LegacyRP Tickets]')
            .setDescription(`${member} has been added to this ticket by ${message.author}`)
            .setColor(config["color"])
            message.channel.send(embed)
        }
    }
})

client.on("message", async (message) => {
    if(message.content.startsWith("/remove")){
        if (!message.member.roles.cache.has(config["staff"])) return message.reply('[Error], Staff Role Not Found!')
        if(message.channel.name.includes('ticket-')) {
          const member = message.mentions.members.first()
          if(!member) {
              message.reply('[Error], You Need To Mention User!')
          }
        message.channel.updateOverwrite(member.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false});
            const embed = new discord.MessageEmbed()
            .setTitle('[LegacyRP Tickets]')
            .setDescription(`${member} has been removed from this ticket by ${message.author}`)
            .setColor(config["color"])
            message.channel.send(embed)
        }
    }
})

client.on("message", async (message) => {
    if(message.content.startsWith("/setup")){
        if(message.author.id != config["developer"]) return message.reply(`[Error], Only <@${config["developer"]}> Can Use That!`)
                const embed = new discord.MessageEmbed()
                .setTitle('LegacyRP Tickets')
                .setColor(config["color"])
                .setDescription(`**__טיקטים__**

                בחדר הזה אפשר לפתוח טיקטים לעזרה.
                בטיקטים האלה אתם יכולים לדבר עם הצוות בפרטיות אם אתם צריכים עזרה.
                
                
                **אבל שימו לב - אם תיצרו טיקט סתם, זה יגמר בוורן/מיוט/קיק/באן.**
                
                כדי ליצור טיקט לחצו על 📩`)
            
                var button = new MessageButton()
                .setID("ticket_open")
                .setLabel("Open Ticket 📩")
                .setStyle("grey")
            
                var row = new MessageActionRow()
                .addComponent(button)
            
            
                message.channel.send({embed: embed, components: [row]})
            }
})



client.login(config["token"])