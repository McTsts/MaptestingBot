import { Message, Guild, RichEmbed, User } from "discord.js";
import { Command, commands } from "./commands/command";
import * as Config from "./config.json";
import { Database } from "./database";
import { db } from "./main";
import { MongoClient } from "mongodb";

export class Utils {
    public static removeMessage(message: Message, delay: number = 0) {
        setTimeout(message.delete, delay);
    }

    public static findCommandWithAlias(alias: string): Command {
        if (commands.has(alias)) return commands.get(alias);
        for (let c of commands) {
            if (c[1].aliases.indexOf(alias) > -1) return c[1];
        }
        return null;
    }

    public static getLevelFromXP(xp: number): number {
        let level: number = 0;
        for (let i: number = 0; i < Config.xpSettings.levels.length; i++) {
            if (xp >= Config.xpSettings.levels[i].minXP) {
                level = i;
            }
        }

        return level;
    }

    public static getLevelColor(level: number): string {
        return Config.xpSettings.levels[level].color;
    }

    public static getLevelImage(level: number): string {
        return Config.xpSettings.levels[level].img;
    }

    public static SessionToListingEmbed(session: TestingSession, author: User, mu: MongoUser): RichEmbed {

        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(session.mapTitle)
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .addField("Description", session.mapDescription)
            .addField("Additional Info", session.additionalInfo)
            .addField(`Participants 0/${session.maxParticipants}`, `@${author.username}#${author.discriminator}`)
            .setThumbnail(Config.sessionCategories[session.category].img)
        return emb;


    }

    public static SessionToSessionEmbed(session: TestingSession, author: User, mu: MongoUser): RichEmbed {

        let emb: RichEmbed = new RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(session.mapTitle)
            .setColor(this.getLevelColor(this.getLevelFromXP(mu.experience)))
            .addField("💬 Description", session.mapDescription)
            .addField("ℹ️ Additional Info", session.additionalInfo)
            .addField("🌐 IP/Server", session.ip, true);
        if (session.resourcepack != "")
            emb.addField("🗃️ Resourcepack", `[Download here](${session.resourcepack})`, true);
        emb.setThumbnail(Config.sessionCategories[session.category].img)
        return emb;


    }
}

export interface MongoUser {
    discordID: string;
    experience: number;
    sessionsHosted: number;
    hostedSessionsDuration: number;
    sessionsJoined: number;
    joinedSessionsDuration: number;
    lastPing: number;
    muted: boolean;
    mcJavaIGN: string;
    mcBedrockIGN: string
}

export interface TestingSession {
    id: number;
    hostID: string;
    setupTimestamp: number;
    startTimestamp: number;
    endTimestamp: number;
    platform: "java" | "bedrock";
    version: string;
    maxParticipants: number;
    mapTitle: string;
    mapDescription: string;
    additionalInfo: string;
    resourcepack: string;
    ip: string;
    category: "stream" | "minigame" | "adventure" | "datapack" | "other";
    state: "preparing" | "running" | "ending";
    guild: Guild;
}

