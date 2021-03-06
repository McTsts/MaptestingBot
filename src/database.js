"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Mongo = require("mongodb");
const SConfig = require("./secretconfig.json");
class Database {
    constructor(callback) {
        this.starting = false;
        this.started = false;
        this.databaseURL = `mongodb+srv://${SConfig.dbuser}:${SConfig.dbpass}@maptestingserver.a8x7m.mongodb.net/maptestingserver?retryWrites=true&w=majorit`;
        // this.databaseURL = `mongodb://${SConfig.dbuser}:${SConfig.dbpass}@ds127115.mlab.com:27115/maptestingserver`;
        this.databaseName = "maptestingserver";
        console.debug("[DATABASE] starting");
        this.connect(callback);
    }
    connect(callback) {
        if (!this.starting) {
            this.starting = true;
            console.debug("[DATABASE] Connecting....");
            Mongo.MongoClient.connect(this.databaseURL, (_e, _db) => {
                if (_e) {
                    console.log("[DATABASE] Unable to connect, error: ", _e);
                    this.starting = false;
                }
                else {
                    console.info("[DATABASE] connected");
                    this.db = _db.db(this.databaseName);
                    this.users = this.db.collection("users");
                    this.reports = this.db.collection("reports");
                    this.kicks = this.db.collection("kicks");
                    this.started = true;
                    callback();
                }
            });
        }
    }
    insertUser(_doc) {
        // try insertion then activate callback "handleInsert"
        this.users.findOne({ "discordID": _doc.discordID }).then(result => {
            //found object, so we need to update it.
            if (result) {
                this.users.findOneAndUpdate(result, { $set: _doc }).catch((reason) => console.log(reason));
            }
            //haven't found object, so we need to create a new one.
            else {
                this.users.insertOne(_doc);
            }
        });
    }
    getUser(userID, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.users.find({ "discordID": userID }); //.limit(1).next((_err, result) => {
            let resultArray = yield result.limit(1).toArray();
            if (resultArray.length > 0) {
                let mu = resultArray[0];
                if (!mu.discordName) {
                    mu.discordName = userName;
                    this.insertUser(mu);
                }
                mu.discordName = userName;
                return mu;
            }
            else {
                let mu = {
                    discordName: userName,
                    discordID: userID,
                    experience: 0,
                    hostedSessionsDuration: 0,
                    joinedSessionsDuration: 0,
                    lastPing: Infinity,
                    mcBedrockIGN: null,
                    mcJavaIGN: null,
                    muted: 0,
                    sessionsHosted: 0,
                    sessionsJoined: 0
                };
                this.insertUser(mu);
                return mu;
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.users.find();
            let resultArray = yield result.toArray();
            return resultArray;
        });
    }
    kick(reporter, user, reason) {
        console.log(`[DATABASE] ${reporter.tag} kicked ${user.tag} for ${reason}`);
        this.kicks.find({ "uID": user.id }).limit(1).next((_err, result) => {
            let r;
            if (result) {
                r = result;
                r.reasons.push({ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) });
                this.kicks.findOneAndUpdate({ "uID": user.id }, { $set: r }).catch((reason) => console.log(reason));
            }
            else {
                r = {
                    uID: user.id,
                    username: user.tag,
                    reasons: [{ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) }]
                };
                this.kicks.insertOne(r);
            }
        });
    }
    report(reporter, user, reason) {
        console.log(`[DATABASE] ${reporter.tag} reported ${user.tag} for ${reason}`);
        this.reports.find({ "uID": user.id }).limit(1).next((_err, result) => {
            let r;
            if (result) {
                r = result;
                r.reasons.push({ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) });
                this.reports.findOneAndUpdate({ "uID": user.id }, { $set: r }).catch((reason) => console.log(reason));
            }
            else {
                r = {
                    uID: user.id,
                    username: user.tag,
                    reasons: [{ reporter: reporter.tag, reason: reason, date: new Date(Date.now()) }]
                };
                this.reports.insertOne(r);
            }
        });
    }
    getReports(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let reportArray = [];
            if (user) {
                reportArray = yield this.reports.find({ "uID": user.id }).limit(1).toArray();
            }
            else {
                reportArray = yield this.reports.find().toArray();
            }
            return reportArray;
        });
    }
}
exports.Database = Database;
function handleInsert(_e) {
    // console.log("Database insertion returned -> " + _e);
}
