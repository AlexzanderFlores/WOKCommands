export class Channel {
  private readonly _channelId: string;
  constructor({ channelId }: { channelId: string }) {
    this._channelId = channelId
  }

  public get channelId(): string { return this._channelId }
}
