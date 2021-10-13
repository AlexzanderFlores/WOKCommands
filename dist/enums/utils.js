"use strict";
const isEnumName = (str, _enum) => str in _enum;
const enumFromName = (name, _enum) => {
    if (!isEnumName(name, _enum))
        throw Error(); // here fail fast as an example
    return _enum[name];
};
