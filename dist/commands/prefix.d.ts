import ICommandArguments from '../interfaces/ICommandArguments';
declare const _default: {
    maxArgs: number;
    cooldown: string;
    expectedArgs: string;
    requiredPermissions: string[];
    description: string;
    category: string;
    callback: (options: ICommandArguments) => Promise<void>;
};
export = _default;
