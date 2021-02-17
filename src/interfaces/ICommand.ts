interface BaseCommand {
  names: string[] | string
  category: string
  minArgs?: number
  maxArgs?: number
  syntaxError?: { [key: string]: string }
  expectedArgs?: string
  description?: string
  syntax?: string
  requiredPermissions?: string[]
  callback?: Function
  ownerOnly?: boolean
  hidden?: boolean
  guildOnly?: boolean
  testOnly?: boolean
}

interface BaseCommandWithCooldown extends BaseCommand {
  cooldown?: number
}

interface BaseCommandWithCooldown extends BaseCommand {
  globalCooldown?: number
}

type ICommand = BaseCommandWithCooldown | BaseCommandWithGlobalCooldown

export default ICommand 
