export default interface ICmdConfig {
  names: string[] | string
  minArgs?: number
  maxArgs?: number
  expectedArgs?: string
  description?: string
  callback: Function
}
