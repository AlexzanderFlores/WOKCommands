import { IChannelEntity } from "./ChannelEntity";
import { IRoleEntity } from "./RoleEntity";

export enum ChannelEntityType {
  CHANNEL = 'CHANNEL',
  GUILD = 'GUILD'
}
// todo: should this be IGuildCommandEntity?
export interface ICommandEntity {
  create(input: {
    command: string,
    type: ChannelEntityType,
    requiredRoles: IRoleEntity[],
    channels?: IChannelEntity[]
  }): () => void
  command: string
  isEnabled: boolean
  requiredRoles: IRoleEntity[]
}

// export class CommandEntity implements ICommandEntity<string> {
//   constructor() {
//   }
//   create(input: { command: string; type: ChannelEntityType; requiredRoles: IRoleEntity[]; channels?: IChannelEntity[] | undefined; }): () => void {
//     throw new Error("Method not implemented.");
//   }
//   id: string;
//   command: string;
//   isEnabled: boolean;
//   requiredRoles: IRoleEntity[];
// }
