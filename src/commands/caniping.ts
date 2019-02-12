import { Command, commands } from "./command";
import { Message } from "discord.js";
import { db } from "../main";
import { Utils } from "../utils";

export let caniping: Command = {
    name : "caniping",
    aliases: ["cip"],
    description: "Allows you to check if (and if not, when) you can ping the next time.",
    usage: "",
    needsArgs: false,
    guildOnly: true,
    grantedOnly: false,
    globalCooldown: 0,
    individualCooldown: 1,
    hidden:false,
    channel: ["bot"],
    execute: function ping(message: Message, args: string[]): boolean{
        db.getUser(message.author.id, mu => {
            let timeLeft: number = Utils.getPingCooldown(Utils.getLevelFromXP(mu.experience)) - Date.now() + mu.lastPing;
            if(timeLeft < 0){
                message.reply("you can ping at your next session.");
            } else {
                message.reply(`you can ping again in ${Math.floor(timeLeft / (60 * 60 * 1000))} hours and ${Math.floor(timeLeft / (60 * 1000) % 60)} minutes.`);
            }
        });
        return true;
    }
}