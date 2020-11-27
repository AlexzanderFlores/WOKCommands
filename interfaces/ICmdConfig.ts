export default interface ICmdConfig {
  names: string[] | string
  category: string
  minArgs?: number
  maxArgs?: number
  syntaxError?: string
  expectedArgs?: string
  description?: string
  requiredPermissions?: string[]
  callback: Function
  cooldown: string
  globalCooldown: string
  ownerOnly: boolean
}
