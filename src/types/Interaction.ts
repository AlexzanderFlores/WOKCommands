import { Snowflake,User,MessageMentionOptions,MessageEmbed ,GuildMember,Role,Channel,MessageAttachment,FileOptions,Message} from "discord.js";
//Discord.js doesn't support these types, so they had to be added, note not all types are fully tested
export type ApplicationCommandInteractionData = {
    id:Snowflake;
    name:string;
    resolved?:ApplicationCommandInteractionDataResolved;
    options?:ApplicationCommandInteractionDataOption[];

}

export type ApplicationCommandInteractionDataResolved = {
    users?:{[ID:string]:User};
    members?:{[ID:string]:GuildMember}; //Partial Member objects are missing user, deaf and mute fields
    roles?:{[ID:string]:Role};
    channels?:{[ID:string]:Channel}; // Partial Channel objects only have id, name, type and permissions fields
}



export type ApplicationCommandOptionType_value = 1 | 2 | 3 | 4 | 5 |6 | 7 | 8 | 9;
export type ApplicationCommandOptionType_name = ("SUB_COMMAND" | 
    "SUB_COMMAND_GROUP" | 
    "STRING" | 
    "INTEGER" | 
    "BOOLEAN" | 
    "USER" | 
    "CHANNEL" | 
    "ROLE" | 
    "MENTIONABLE");  ///ATTENTION FOR DOCUMENTATION, SUB_COMMAND AND SUB_COMMAND_GROUP ARE COMPLEX AND NOT MUCH USED; IF YOU USE IT YOU LIKELY GET SOME DISCORD API ERRORS, THUS AVOID IT IF NOT ABSOLUTELY NECESSARY

export type ApplicationCommandOptionType = {
    name: ApplicationCommandOptionType_name,
    value:ApplicationCommandOptionType_value
}

export type ApplicationCommandInteractionDataOption = {
name:string;
type:ApplicationCommandOptionType_value;
value?:string;
options?:ApplicationCommandInteractionDataOption[]; //its a recursive loop, that results in a mess, but its only set with SUB_COMMAND  /-_GROUP
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
    embeds?:MessageEmbed[]; //max 10 !!!
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
    embeds?:MessageEmbed[]; //max 10 !!!
    file?:(MessageAttachment | FileOptions | string);
    payload_json?:string;
    allowed_mentions?:MessageMentionOptions;
    attachments?:MessageAttachment[];
}


export type ExecuteWebhook = {
    content?:string;
    username?:string;
    avatar_url?:string;
    tts?:boolean;
    embeds?:MessageEmbed[]; //max 10 !!!
    file?:(MessageAttachment | FileOptions | string);
    payload_json?:string;
    allowed_mentions?:MessageMentionOptions;
    flags?:number;
}


export type ApplicationCommand = {
    id: Snowflake,
    application_id: Snowflake,
    name:string, //1-32 lowercase character name matching ^[\w-]{1,32}$
    description: string,
    options?:ApplicationCommandOption[], //max Length = 25
    default_permission?: boolean
}

export type ApplicationCommandSend = {
    name:string,
    description: string,
    options?:ApplicationCommandOption[], //max Length = 25
    default_permission?: boolean
}



export type ApplicationCommandOption = {
    type:ApplicationCommandOptionType_value;
    name:string,
    description:string,
    required?:boolean,
    choices?:ApplicationCommandOptionChoice[], // max 25
    options?:ApplicationCommandOption[]
}

export type ApplicationCommandOptionChoice = {
    name:string, //max length = 100
    value:string | number // if string 100 = max Length
}

export type GuildApplicationCommandPermissions = {
    id:Snowflake,
    application_id:Snowflake,
    guild_id:Snowflake,
    permissions:ApplicationCommandPermissions[]
}

export type ApplicationCommandPermissions = {
    id:Snowflake,
    type:ApplicationCommandPermissionType,
    permission:boolean //hasPermission (true has it, or false does not have it)
}

export type ApplicationCommandPermissionType = {
    name:"ROLE" | "USER",
    value:1 |2
}

export type MessageInteraction = {
    id:Snowflake,
    type:InteractionType,
    name:string,
    user:GuildMember

}


export type InternalSlashCommandOptions = {
    type?:ApplicationCommandOptionType_value|ApplicationCommandOptionType_name|string, //lowercase is also parsed, if its invalid its going to be a string
    choices?:ApplicationCommandOptionChoice[],
    whole?:boolean
}

export type WholeStorage = {
  [CommandName:string]:string[];
}
