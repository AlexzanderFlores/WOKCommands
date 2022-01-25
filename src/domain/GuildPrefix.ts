export class GuildPrefix {
  private readonly _value: string;
  constructor({ value }: { value: string }) {
    // TODO: should we throw an error here if an empty string is provided?
    this._value = value;
  }

  public get value(): string { return this._value }
}
