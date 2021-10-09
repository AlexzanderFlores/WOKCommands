"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const FeatureHandler_1 = __importDefault(require("./FeatureHandler"));
const mongo_1 = __importStar(require("./mongo"));
const prefixes_1 = __importDefault(require("./models/prefixes"));
const message_handler_1 = __importDefault(require("./message-handler"));
const SlashCommands_1 = __importDefault(require("./SlashCommands"));
const Events_1 = __importDefault(require("./enums/Events"));
const CommandHandler_1 = __importDefault(require("./CommandHandler"));
class WOKCommands extends events_1.EventEmitter {
    _client;
    _defaultPrefix = '!';
    _commandsDir = 'commands';
    _featuresDir = '';
    _mongoConnection = null;
    _displayName = '';
    _prefixes = {};
    _categories = new Map(); // <Category Name, Emoji Icon>
    _hiddenCategories = [];
    _color = null;
    _commandHandler = null;
    _featureHandler = null;
    _tagPeople = true;
    _showWarns = true;
    _delErrMsgCooldown = -1;
    _ignoreBots = true;
    _botOwner = [];
    _testServers = [];
    _defaultLanguage = 'english';
    _ephemeral = true;
    _debug = false;
    _messageHandler = null;
    _slashCommand = null;
    constructor(client, options) {
        super();
        this._client = client;
        this.setUp(client, options);
    }
    async setUp(client, options) {
        if (!client) {
            throw new Error('No Discord JS Client provided as first argument!');
        }
        let { commandsDir = '', commandDir = '', featuresDir = '', featureDir = '', messagesPath, mongoUri, showWarns = true, delErrMsgCooldown = -1, defaultLanguage = 'english', ignoreBots = true, dbOptions, testServers, botOwners, disabledDefaultCommands = [], typeScript = false, ephemeral = true, debug = false, } = options || {};
        if (mongoUri) {
            await mongo_1.default(mongoUri, this, dbOptions);
            this._mongoConnection = mongo_1.getMongoConnection();
            const results = await prefixes_1.default.find({});
            for (const result of results) {
                const { _id, prefix } = result;
                this._prefixes[_id] = prefix;
            }
        }
        else {
            if (showWarns) {
                console.warn('WOKCommands > No MongoDB connection URI provided. Some features might not work! See this for more details:\nhttps://docs.wornoffkeys.com/databases/mongodb');
            }
            this.emit(Events_1.default.DATABASE_CONNECTED, null, '');
        }
        this._commandsDir = commandsDir || commandDir || this._commandsDir;
        this._featuresDir = featuresDir || featureDir || this._featuresDir;
        this._ephemeral = ephemeral;
        this._debug = debug;
        if (this._commandsDir &&
            !(this._commandsDir.includes('/') || this._commandsDir.includes('\\'))) {
            throw new Error("WOKCommands > The 'commands' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object");
        }
        if (this._featuresDir &&
            !(this._featuresDir.includes('/') || this._featuresDir.includes('\\'))) {
            throw new Error("WOKCommands > The 'features' directory must be an absolute path. This can be done by using the 'path' module. More info: https://docs.wornoffkeys.com/setup-and-options-object");
        }
        if (testServers) {
            if (typeof testServers === 'string') {
                testServers = [testServers];
            }
            this._testServers = testServers;
        }
        if (botOwners) {
            if (typeof botOwners === 'string') {
                botOwners = [botOwners];
            }
            this._botOwner = botOwners;
        }
        this._showWarns = showWarns;
        this._delErrMsgCooldown = delErrMsgCooldown;
        this._defaultLanguage = defaultLanguage.toLowerCase();
        this._ignoreBots = ignoreBots;
        if (typeof disabledDefaultCommands === 'string') {
            disabledDefaultCommands = [disabledDefaultCommands];
        }
        this._commandHandler = new CommandHandler_1.default(this, client, this._commandsDir, disabledDefaultCommands, typeScript);
        this._slashCommand = new SlashCommands_1.default(this, true, typeScript);
        this._messageHandler = new message_handler_1.default(this, messagesPath || '');
        this.setCategorySettings([
            {
                name: 'Configuration',
                emoji: '⚙',
            },
            {
                name: 'Help',
                emoji: '❓',
            },
        ]);
        this._featureHandler = new FeatureHandler_1.default(client, this, this._featuresDir, typeScript);
        console.log('WOKCommands > Your bot is now running.');
    }
    setMongoPath(mongoPath) {
        console.warn('WOKCommands > .setMongoPath() no longer works as expected. Please pass in your mongo URI as a "mongoUri" property using the options object. For more information: https://docs.wornoffkeys.com/databases/mongodb');
        return this;
    }
    get client() {
        return this._client;
    }
    get displayName() {
        return this._displayName;
    }
    setDisplayName(displayName) {
        this._displayName = displayName;
        return this;
    }
    get prefixes() {
        return this._prefixes;
    }
    get defaultPrefix() {
        return this._defaultPrefix;
    }
    setDefaultPrefix(defaultPrefix) {
        this._defaultPrefix = defaultPrefix;
        return this;
    }
    getPrefix(guild) {
        return this._prefixes[guild ? guild.id : ''] || this._defaultPrefix;
    }
    setPrefix(guild, prefix) {
        if (guild) {
            this._prefixes[guild.id] = prefix;
        }
        return this;
    }
    get categories() {
        return this._categories;
    }
    get hiddenCategories() {
        return this._hiddenCategories;
    }
    get color() {
        return this._color;
    }
    setColor(color) {
        this._color = color;
        return this;
    }
    getEmoji(category) {
        const emoji = this._categories.get(category) || '';
        if (typeof emoji === 'object') {
            // @ts-ignore
            return `<:${emoji.name}:${emoji.id}>`;
        }
        return emoji;
    }
    getCategory(emoji) {
        let result = '';
        this._categories.forEach((value, key) => {
            // == is intended here
            if (emoji == value) {
                // @ts-ignore
                result = key;
                return false;
            }
        });
        return result;
    }
    setCategorySettings(category) {
        for (let { emoji, name, hidden, customEmoji } of category) {
            if (emoji.startsWith('<:') && emoji.endsWith('>')) {
                customEmoji = true;
                emoji = emoji.split(':')[2];
                emoji = emoji.substring(0, emoji.length - 1);
            }
            let targetEmoji = emoji;
            if (customEmoji) {
                targetEmoji = this._client.emojis.cache.get(emoji);
            }
            if (this.isEmojiUsed(targetEmoji)) {
                console.warn(`WOKCommands > The emoji "${targetEmoji}" for category "${name}" is already used.`);
            }
            this._categories.set(name, targetEmoji || this.categories.get(name) || '');
            if (hidden) {
                this._hiddenCategories.push(name);
            }
        }
        return this;
    }
    isEmojiUsed(emoji) {
        if (!emoji) {
            return false;
        }
        let isUsed = false;
        this._categories.forEach((value) => {
            if (value === emoji) {
                isUsed = true;
            }
        });
        return isUsed;
    }
    get commandHandler() {
        return this._commandHandler;
    }
    get mongoConnection() {
        return this._mongoConnection;
    }
    isDBConnected() {
        const connection = this.mongoConnection;
        return !!(connection && connection.readyState === 1);
    }
    setTagPeople(tagPeople) {
        this._tagPeople = tagPeople;
        return this;
    }
    get tagPeople() {
        return this._tagPeople;
    }
    get showWarns() {
        return this._showWarns;
    }
    get delErrMsgCooldown() {
        return this._delErrMsgCooldown;
    }
    get ignoreBots() {
        return this._ignoreBots;
    }
    get botOwner() {
        return this._botOwner;
    }
    setBotOwner(botOwner) {
        console.log('WOKCommands > setBotOwner() is deprecated. Please specify your bot owners in the object constructor instead. See https://docs.wornoffkeys.com/setup-and-options-object');
        if (typeof botOwner === 'string') {
            botOwner = [botOwner];
        }
        this._botOwner = botOwner;
        return this;
    }
    get testServers() {
        return this._testServers;
    }
    get defaultLanguage() {
        return this._defaultLanguage;
    }
    setDefaultLanguage(defaultLanguage) {
        this._defaultLanguage = defaultLanguage;
        return this;
    }
    get ephemeral() {
        return this._ephemeral;
    }
    get debug() {
        return this._debug;
    }
    get messageHandler() {
        return this._messageHandler;
    }
    get slashCommands() {
        return this._slashCommand;
    }
}
exports.default = WOKCommands;
module.exports = WOKCommands;
