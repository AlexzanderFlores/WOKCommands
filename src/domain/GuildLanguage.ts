export class GuildLanguage {
  private readonly _value: string;
  constructor({ value }: { value: string }) {
    this._value = value;
  }

  public get value(): string { return this._value }
}
