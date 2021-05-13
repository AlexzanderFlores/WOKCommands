import { Snowflake,User,MessageMentionOptions,MessageEmbed ,GuildMember,Role,Channel,MessageAttachment,FileOptions,Message} from "discord.js";
//Discord.js doesn't support these types, so they had to be added, note not all types are fully tested
export type ApplicationCommandInteractionData = {
    id:Snowflake;
    name:string;
    resolved?:ApplicationCommandInteractionDataResolved;
    options?:[ApplicationCommandInteractionDataOption];

}

export type ApplicationCommandInteractionDataResolved = {
    users?:{ID:number,User:User};
    members?:{ID:number,Member:GuildMember}; //Partial Member objects are missing user, deaf and mute fields
    roles?:{ID:number,Role:Role};
    channels?:{ID:number,Channel:Channel}; // Partial Channel objects only have id, name, type and permissions fields
}



export type ApplicationCommandOptionType_value = 1 | 2 | 3 | 4 | 5 |6 | 7 | 8 | 9;
export type ApplicationCommandOptionType = {
    name: ("SUB_COMMAND" | 
    "SUB_COMMAND_GROUP" | 
    "STRING" | 
    "INTEGER" | 
    "BOOLEAN" | 
    "USER_BANNED" | 
    "CHANNEL" | 
    "ROLE" | 
    "MENTIONABLE");
    value:ApplicationCommandOptionType_value
}

export type ApplicationCommandInteractionDataOption = {
name:string;
type:ApplicationCommandOptionType_value;
value?:string;
options?:[ApplicationCommandInteractionDataOption];
}

export type InteractionType = 1 | 2;  //1 = Ping, 2 = ApplicationCommand


export type ChannelType =  "DM" | "GUILD";

export type Interaction = {
    id: Snowflake;
    application_id: Snowflake;
    type: 	InteractionType;
    data?:	ApplicationCommandInteractionData;
    guild_id?:Snowflake;
    channel_id?:Snowflake;
    member?:GuildMember;
    user?:User;
    token:string;
    version:number;
    //custom properties
    channel_type:ChannelType;
    status:{
        loaded?:boolean;
        send?:boolean;
        deletet?:boolean;
    };
    reply?(data:InteractionApplicationCommandCallbackData| string): Promise<Message>;
    loading?(): Promise<Message>;
    edit?(data:InteractionApplicationCommandCallbackData| string): Promise<Message>;
    delete?():Promise<Buffer>;
    followUpMessages?:{
        create(interaction: Interaction, data:ExecuteWebhook,ephemeral?:boolean):Promise<Message>;
        delete(interaction: Interaction, message:Message):Promise<Buffer>;
        edit(interaction: Interaction, data: EditWebhookMessage, message:Message):Promise<Message>;
    }
}  

export type InteractionApplicationCommandCallbackData = {
    tts?:boolean;
    content?:string;
    embeds?:[MessageEmbed]; //max 10 !!!
    allowed_mentions?:MessageMentionOptions;
    flags?:number;


}

export type InteractionCallbackType = 1 | 4 | 5; // 1  Pong, 4 = ChannelMessageWithSource, 5  =  DeferredChannelMessageWithSource;
export type InteractionResponse = {
    type:InteractionCallbackType;
    data?:InteractionApplicationCommandCallbackData;
}


export type EditWebhookMessage = {
    content?:string;
    embeds?:[MessageEmbed]; //max 10 !!!
    file?:(MessageAttachment | FileOptions | string);
    payload_json?:string;
    allowed_mentions?:MessageMentionOptions;
    attachments?:[MessageAttachment];
}


export type ExecuteWebhook = {
    content?:string;
    username?:string;
    avatar_url?:string;
    tts?:boolean;
    embeds?:[MessageEmbed]; //max 10 !!!
    file?:(MessageAttachment | FileOptions | string);
    payload_json?:string;
    allowed_mentions?:MessageMentionOptions;
    flags?:number;
}