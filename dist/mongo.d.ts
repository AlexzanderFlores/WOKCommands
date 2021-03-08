import { Connection } from 'mongoose';
import WOKCommands from '.';
declare const mongo: (mongoPath: string, instance: WOKCommands, dbOptions?: {}) => Promise<void>;
export declare const getMongoConnection: () => Connection;
export default mongo;
