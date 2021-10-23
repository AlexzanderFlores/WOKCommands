export class Role {
  private readonly _roleId: string;
  constructor({ roleId }: { roleId: string }) {
    this._roleId = roleId;
  }

  public get roleId(): string { return this._roleId }
}
