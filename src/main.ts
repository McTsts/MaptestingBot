import * as Discord from "discord.js";
import * as Config from "./config.json";
import { Command } from "./commands/command";
import { Utils } from "./utils.js";


const client = new Discord.Client();

let globalCooldowns: Discord.Collection<string, number> = new Discord.Collection();
let individualCooldowns: Discord.Collection<string, Discord.Collection<string, number>> = new Discord.Collection();

client.login(Config.token);

client.once('ready', () => {
    console.log('Ready!');
});

client.on("message", messageHandler);



function messageHandler(message: Discord.Message) {
    if (!message.content.startsWith(Config.prefix) || message.author.bot) return;
    let args: string[] = message.content.slice(Config.prefix.length).split(/ +/);
    let commandName: string = args.shift().toLowerCase();

    
    let command: Command = Utils.findCommandWithAlias (commandName);
    //does command exist?
    if (!command) {
        return message.reply(`the command you're trying to execute doesn't exist.`)
    };

    //is this able to be executed inside a direct message?
    if (command.guildOnly && message.channel.type != "text") {
        return message.reply("This command can't be run inside DMs.");
    }

    //are args needed & provided?
    if (command.needsArgs && args.length == 0) {
        return message.reply(`you didn't provide any arguments.\nusage: !${command.name} ${command.usage}`);
    }

    //is the command on global cooldown?
    if (globalCooldowns.has(command.name)) {
        if (globalCooldowns.get(command.name) < Date.now()) {
            globalCooldowns.delete(command.name);
        } else {
            return message.reply(`this command is on global cooldown. Please wait ${((globalCooldowns.get(command.name) - Date.now()) / 1000).toFixed(1)} seconds.`).then(
                (messageSent) => {
                    if (messageSent instanceof Discord.Message){
                        messageSent.delete(5000);
                    }
                }
            );
        }
    } else if (command.globalCooldown > 0) {
        globalCooldowns.set(command.name, Date.now() + command.globalCooldown * 1000);
    }

    //is the command on individual cooldown?
    if (!individualCooldowns.has(command.name)) {
        individualCooldowns.set(command.name, new Discord.Collection<string, number>());
    }

    let timestamps: Discord.Collection<string, number> = individualCooldowns.get(command.name);
    if (timestamps.has(message.author.id)) {

        if (timestamps.get(message.author.id) < Date.now()) {
            timestamps.delete(message.author.id);
        }
        else {
            return message.reply(`this command is on cooldown. Please wait ${((timestamps.get(message.author.id) - Date.now()) / 1000).toFixed(1)} seconds.`).then(
                (messageSent) => {
                    if (messageSent instanceof Discord.Message){
                        messageSent.delete(5000);
                    }
                }
            );
        }
    }
    else if (command.individualCooldown > 0) {
        timestamps.set(message.author.id, Date.now() + command.individualCooldown * 1000);
    }


    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
    }
}


