import fs, { Dirent } from 'fs'

const getAllFiles = (dir: string) => {
  const files: Dirent[] = fs.readdirSync(dir, {
    withFileTypes: true,
  })
  let jsFiles: [string, string][] = []

  for (const file of files) {
    if (file.isDirectory()) {
      jsFiles = [...jsFiles, ...getAllFiles(`${dir}/${file.name}`)]
    } else if (file.name.endsWith('.js')) {
      let fileName: string | string[] = file.name.replace(/\\/g, '/').split('/')
      fileName = fileName[fileName.length - 1]
      fileName = fileName.split('.')[0].toLowerCase()

      jsFiles.push([`${dir}/${file.name}`, fileName])
    }
  }

  return jsFiles
}

export = getAllFiles
