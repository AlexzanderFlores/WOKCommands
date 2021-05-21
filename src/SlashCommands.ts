import {
  APIMessage,
  Message,
  Channel,
  Client,
  Guild,
  GuildMember,
  MessageEmbed,
  Snowflake
} from "discord.js";
import WOKCommands from ".";
import {Interaction,
  InteractionApplicationCommandCallbackData,
  ApplicationCommandInteractionData,
  ApplicationCommandInteractionDataOption,
  InteractionResponse,InteractionCallbackType,
  EditWebhookMessage,
  ExecuteWebhook,
  ApplicationCommand,
  ApplicationCommandOptionType_value,
  ApplicationCommandSend,
  GuildApplicationCommandPermissions,
  ApplicationCommandPermissions,
  ApplicationCommandInteractionDataResolved,
  WholeStorage
} from "./types/Interaction";
class SlashCommands {
  private _client: Client;
  private _instance: WOKCommands;
  private _whole:WholeStorage= {};
  constructor(instance: WOKCommands, listen = true) {
    this._instance = instance;
    this._client = instance.client;

    if (listen) {
      // @ts-ignore
      this._client.ws.on("INTERACTION_CREATE", async (interaction:Interaction) => {
        const { member, data, guild_id, channel_id,type,user } = interaction;
        //type === 1 is the ping request from discord, I don't know if discord ever makes one, but if so, we respond automatically
        if(type===1){
          await this.createInteractionResponse(interaction,1)
          return;
        }
        // if type !== 1 data is always present!!
        const Appdata:ApplicationCommandInteractionData=data!!;
        const { name, options ,resolved} = Appdata;
        //console.log(Appdata)
        const guild = guild_id?this._client.guilds.cache.get(guild_id):undefined;
        const args = this.getArrayFromOptions(guild,name,options,resolved);
        const channel = channel_id?guild?.channels.cache.get(channel_id):undefined;
        interaction.channel_type=user?"DM":"GUILD";
        this.invokeCommand(interaction, name, args, member, guild, channel,Appdata);
      });
    }
  }

  public async getCommands(guildId?: string): Promise<ApplicationCommand[]> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands.get();
  }

  public async createCommand(
    data:ApplicationCommandSend,
    guildId?: string
  ): Promise<ApplicationCommand> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands.post({
      data
    });
  }

  public async deleteCommand(commandId: string, guildId?: string): Promise<Buffer> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }

    return await app.commands(commandId).delete();
  }

  public async getCommand(commandId: string,guildId?: string): Promise<ApplicationCommand> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }
    return await app.commands(commandId).get();
  }

  public async editCommand(commandId: string,data:ApplicationCommandSend,guildId?: string): Promise<ApplicationCommand> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }
    return await app.commands(commandId).patch({data});
  }
  public async editOrCreateCommand(data:ApplicationCommandSend,guildId?: string): Promise<ApplicationCommand> {
    const AllCommands = await this.getCommands(guildId)
    const isAlreadyThere = AllCommands.filter((command) => data.name==command.name);
  /*   if(this.isTheSame(isAlreadyThere[0],data)){
      return Promise.reject("Exactly same exists already");
    } */
    if(isAlreadyThere){
      return await this.editCommand(isAlreadyThere[0].id,data,guildId)
    }else{
      return await this.createCommand(data,guildId)
    }
  }

  private isTheSame(data:ApplicationCommand,data2:ApplicationCommandSend): boolean {
    let o=data.options;
    let o2=data2.options;
    let options= (o===o2 || (o&&o2 && o.length==o2.length && JSON.stringify(o)===JSON.stringify(o)))
    return (data.name===data2.name && data.description===data2.description && options)??false;
  }
  //TODO if needed: Bulk Overwrite Global/Guild Application Commands: PUT/applications/{application.id}/commands

  public async getCommandsPermissions(guildId: string): Promise<GuildApplicationCommandPermissions[]> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id).guilds(guildId);
    return await app.commands.permissions.get();
  }

  public async getCommandPermissions(commandId: string,guildId: string): Promise<GuildApplicationCommandPermissions> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id).guilds(guildId);
    return await app.commands(commandId).permissions.get();
  }

  public async editCommandPermissions(commandId: string,data:[ApplicationCommandPermissions],guildId: string): Promise<GuildApplicationCommandPermissions> {
    // @ts-ignore
    const app = this._client.api.applications(this._client.user.id);
    if (guildId) {
      app.guilds(guildId);
    }
    return await app.commands(commandId).put({data});
  }

  //TODO if necessary Batch Edit Application Command Permissions:  PUT/applications/{application.id}/guilds/{guild.id}/commands/permissions

  // Checks if string is a user id, if true, returns a Guild Member object
  private getMemberIfExists(value: string, guild: any) {
    if (
      value &&
      typeof value === "string" &&
      (value.startsWith("<@!") || value.startsWith("<@")) && 
      value.endsWith(">")
    ) {
      value = value.substring((value.substring(2,3)=="!"?3:2), value.length - 1);

      value = guild?.members.cache.get(value);
    }
    return value;
  }

  public setWhole(CommandName:string,ArgumentName:string){
    if(!(this._whole?.[CommandName])){
      this._whole[CommandName]=[]
    }
      this._whole[CommandName].push(ArgumentName)
  }

  private isWhole(CommandName:string,ArgumentName:string):boolean{
    if((this._whole?.[CommandName])){
      let isThere=this._whole[CommandName].find((element:string)=>{return element==ArgumentName})
      return !!isThere
    }
    return false;
  }

  private detectType(value: string|undefined, resolved: ApplicationCommandInteractionDataResolved | undefined):string|undefined {
      if(!value){
          return undefined;
      }else if(resolved?.users?.[value]){
        return "users"
      }else if(resolved?.channels?.[value]){
        return "channels"
      }else if(resolved?.roles?.[value]){
        return "roles"
      }
      return undefined;
  }

  private isMemberString(value: string):boolean{
    if (
      value &&
      typeof value === "string" &&
      (value.startsWith("<@!") || value.startsWith("<@")) && 
      value.endsWith(">")
    ) {
      return true;
    }
    return false;
  }

  public getObjectFromOptions(
    guild: { members: { cache: any } },
    options?: ApplicationCommandInteractionDataOption[]
  ): Object {
    const args: { [key: string]: any } = {};
    if (!options) {
      return args;
    }
    for (const { name, value } of options) {
      args[name] = this.getMemberIfExists(value!!, guild);
    }

    return args;
  }

  public getArrayFromOptions(
    guild: { members: { cache: any } ,channels: { cache: any },roles: { cache: any }} | undefined,
    CommandName:string,
    options?: ApplicationCommandInteractionDataOption[],
    resolved?:ApplicationCommandInteractionDataResolved,
  ): any[] {
    const args: any[] = [];
    if (!options) {
      return args;
    }
    options.forEach((option:ApplicationCommandInteractionDataOption,index:number)=>{
    const {name,type,value} = option;
    const isWhole:boolean = this.isWhole(CommandName,name)
    let result;
    switch(type) {
      case 1:
        //TODO just give it up
        result=""
        break;
      case 2:
        //TODO just give it up
        result=""
        break;
      case 3:
        if(this.isMemberString(value??"")){
          console.warn(
            `WOKCommands > Use the types option to get some better user experience with avaible dropdown of the users etc, using string for users is deprecated`
          );
        }
        result=value;
        break;
      case 4:
        result=value
        break; 
      case 5:
        result=value;
        break; 
      case 6:
        if(!isWhole&&value&&resolved?.users?.[value]){
          result=resolved.users[value];
        }else if(guild){
          let user=guild.members.cache.get(value);
          result=user??value;
        }
        break;
      case 7:
        if(!isWhole&&value&&resolved?.channels?.[value]){
          result=resolved.channels[value];
        }else if(guild){
          let channel=guild.channels.cache.get(value);
          result=channel??value;
        }
        break;  
      case 8:
        if(!isWhole&&value&&resolved?.roles?.[value]){
          result=resolved.roles[value];
        }else if(guild){
          let role=guild.roles.cache.get(value);
          result=role??value;
        }
        break;  
      case 9:
        let type=this.detectType(value,resolved)
        // @ts-ignore
        if(value&&type&&resolved?.[type]?.[value]){
          // @ts-ignore
          result=resolved[type][value];
        }else if(guild){
          // @ts-ignore
          let mentionable=guild[type].cache.get(value);
          result=mentionable??value;
        }
        break;              
      default:
        throw new Error(
          `WOKCommands > FATAL ERROR, this SHOULDN'T HAPPEN EVER AT ALL, RUN FOREST RUN!!!`
        );
    } 
    if(result){
      args.push(result);
    }
    });
    return args;
  }

  public async createAPIMessage(
    interaction: Interaction,
    content: any
  ):Promise<object> {
    const { data, files } = await APIMessage.create(
      // @ts-ignore
      this._client.channels.resolve(interaction.channel_id),
      content
    )
      .resolveData()
      .resolveFiles();

    return { ...data, files };
  }

  public async getInteractionResponseByToken(application_id: Snowflake,token:string): Promise<Message> {
    // @ts-ignore
    return await this.getInteractionResponse({token,application_id})
  }
  public async deleteInteractionResponseByToken(application_id: Snowflake,token:string): Promise<Buffer> {
    // @ts-ignore
    return await this.deleteInteractionResponse({token,application_id})
  }

  private async createInteractionResponse(interaction: Interaction, type: InteractionCallbackType,data?: InteractionApplicationCommandCallbackData,ephemeral?:boolean): Promise<Buffer> {
    let Send:InteractionResponse={type}
    if(data&&ephemeral){
      data.flags=64;
    }
    Send.data=data;
    // @ts-ignore
    return await this._client.api
    // @ts-ignore
    .interactions(interaction.id, interaction.token)
    .callback.post({data:Send});
  }
  private async getInteractionResponse(interaction: Interaction): Promise<Message> {
    // @ts-ignore
    return await this._client.api
    // @ts-ignore
    .webhooks(interaction.application_id, interaction.token)
    .messages["@original"].get();
  }
  private async editInteractionResponse(interaction: Interaction, data: EditWebhookMessage): Promise<Message> {
    // @ts-ignore
    return await  this._client.api
   // @ts-ignore
    .webhooks(interaction.application_id, interaction.token)
    .messages["@original"].patch({data});
  }
  //ATTENTION, if the message is ephemeral you can't delete it, only the user who got the message can see and delete it!!
  private async deleteInteractionResponse(interaction: Interaction): Promise<Buffer> {
    // @ts-ignore
    return await this._client.api
    // @ts-ignore
    .webhooks(interaction.application_id, interaction.token)
    .messages["@original"].delete();
  }
  private async createFollowupMessage(interaction: Interaction, data:ExecuteWebhook,ephemeral?:boolean): Promise<Message> {
    if(data&&ephemeral){
      data.flags=64;
    }
    // @ts-ignore
    return await this._client.api
    // @ts-ignore
    .webhooks(interaction.application_id,interaction.token)
    .post({data});
  }
  private async editFollowupMessage(interaction: Interaction, data: EditWebhookMessage, message:Message): Promise<Message> {
    // @ts-ignore
    return await  this._client.api
   // @ts-ignore
    .webhooks(interaction.application_id, interaction.token)
    .messages(message.id).patch({data});
  }
  //ATTENTION, if the message is ephemeral you can't delete it, only the user who got the message can see and delete it!!
  private async deleteFollowupMessage(interaction: Interaction, message:Message): Promise<Buffer> {
    // @ts-ignore
    return await this._client.api
    // @ts-ignore
    .webhooks(interaction.application_id, interaction.token)
    .messages(message.id).delete();
  }

  public async invokeCommand(
    interaction: Interaction,
    commandName: string,
    options: object, //parsed args
    member: GuildMember | undefined,
    guild: Guild | undefined,
    channel: Channel | undefined,
    rawArgs: ApplicationCommandInteractionData
  ): Promise<boolean> {
    const command = this._instance.commandHandler.getCommand(commandName);

    if (!command || !command.callback) {
      return false;
    }
    interaction.status={};
    interaction.delete = async ():Promise<Buffer>=>{
      let respond = await this.deleteInteractionResponse(interaction)
      interaction.status.deletet=true;
      return respond;
  }
    interaction.loading = async ():Promise<Message>=>{
        let respond = await this.createInteractionResponse(interaction,5)
        interaction.status.loaded=true;
        let respondMessage = await this.getInteractionResponse(interaction)
        return respondMessage;
    }
    interaction.reply=async(data:InteractionApplicationCommandCallbackData | string):Promise<Message>=>{
      if(interaction.status.loaded){
        let DataToSend:EditWebhookMessage ;
        //TODO enable support for also passing an embed as data
        if (typeof data === "string") {
          DataToSend={content:data}
        }else{
          DataToSend=data
        }
        let respond = await this.editInteractionResponse(interaction,DataToSend)
        interaction.status.send=true;
        return respond;
      }else if(!interaction.status.send){
        let DataToSend:InteractionApplicationCommandCallbackData ;
         //TODO enable support for also passing an embed as data
        if (typeof data === "string") {
          DataToSend={content:data}
        }else{
          DataToSend=data
        }
        let respond = await this.createInteractionResponse(interaction,4,DataToSend)
        interaction.status.send=true;
        let respondMessage = await this.getInteractionResponse(interaction)
        return respondMessage;
      }else{
        console.error(
          `WOKCommands > Interaction "${interaction.id}" loaded and send the message already`
        );
        return Promise.reject(`WOKCommands > Interaction "${interaction.id}" loaded and send the message already`);
      }
    }
      interaction.edit=async(data:InteractionApplicationCommandCallbackData | string):Promise<Message>=>{
          let DataToSend:EditWebhookMessage ;
          //TODO enable support for also passing an embed as data
          if (typeof data === "string") {
            DataToSend={content:data}
          }else{
            DataToSend=data
          }
          let respond = await this.editInteractionResponse(interaction,DataToSend)
          interaction.status.send=true;
          return respond;
      }
      
    interaction.followUpMessages={create:this.createFollowupMessage,delete:this.deleteFollowupMessage,edit:this.editFollowupMessage};

    let result = await command.callback({
      member,
      guild,
      channel,
      args: options,
      slash:true,
      rawArgs,
      client: this._client,
      instance: this._instance,
      interaction,
    });

    if(interaction.status.send){
      return true;
    }
    if(interaction.status.loaded){
      console.error(
        `WOKCommands > Command "${commandName}" used loading, but not send, thats a mi of old and new methods, switch fully to the new ones to fix this`
      );
      return false;
    }

    if (!result&&!interaction.status.send) {
      /* console.error(
        `WOKCommands > Command "${commandName}" didn't send anything, and didn't return a value as fallback action`
      ); */
      return false;
    }

    if(interaction.status.deletet&&result){
      console.error(
        `WOKCommands > Command "${commandName}" the interaction response was already deletet`
      );
      return false;
    }

    if (result) {
      console.warn(
        `WOKCommands > Command "${commandName}" returned something from the callback, this is deprecated and will be removed later on`
      );
    }

    let patch: InteractionApplicationCommandCallbackData = {}
    // Handle embeds
    if (typeof result === "object") {
      const embed = new MessageEmbed(result);
       // @ts-ignore
      patch.embeds = [(await this.createAPIMessage(interaction, embed))];
    }else{
      patch.content= result;
    }
    this.createInteractionResponse(interaction,4,patch)
    return true;
  }

  public getOptionFromName(name:string):ApplicationCommandOptionType_value{
    const _values = [1,2,3,4,5,6,7,8,9];
    let response=3;
    const _names =  ["SUB_COMMAND","SUB_COMMAND_GROUP", "STRING","INTEGER","BOOLEAN","USER","CHANNEL","ROLE" ,"MENTIONABLE"]
    _names.forEach((_name,i)=>{if(_name==name.toUpperCase()){response=_values[i];}})
    // @ts-ignore
    return response;
  }
}



export = SlashCommands;
