import { Message } from "discord.js";
import { ping } from "./ping";
import { test } from "./test";
import { help } from "./help";
import { stats } from "./stats";
import { promote } from "./promote";
import { demote } from "./demote";
import { bobdosomething } from "./bobdosomething";
import { startsession } from "./startsession";
import { tip } from "./tip";

type CommandHandler = (message: Message, args?: string[]) => boolean;

export class Command {
    //essentials
    name: string;
    aliases: string[];

    //infos
    description: string;
    usage: string;

    //options
    needsArgs: boolean;
    guildOnly: boolean;
    grantedOnly: boolean;
    globalCooldown: number;
    individualCooldown: number;
    hidden: boolean;
    channel: ("all"|"session"|"nonSession"|"bot")[];

    //the actual code to run when this command is called.
    execute: CommandHandler;
}

export let commands: Map<string, Command> = new Map(

);

//TODO: add all the commands