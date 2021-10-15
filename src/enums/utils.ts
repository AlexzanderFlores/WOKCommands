const isEnumName = <T>(str: string, _enum: T): str is Extract<keyof T, string> =>
  str in _enum

const enumFromName = <T>(name: string, _enum: T) => {
  if (!isEnumName(name, _enum)) throw Error() // here fail fast as an example
  return _enum[name]
}
