import fs, { Dirent } from 'fs'

const getAllFiles = (dir: string) => {
  const files: Dirent[] = fs.readdirSync(dir, {
    withFileTypes: true,
  })
  let jsFiles: string[] = []

  for (const file of files) {
    if (file.isDirectory()) {
      jsFiles = [...jsFiles, ...getAllFiles(`${dir}/${file.name}`)]
    } else {
      jsFiles.push(`${dir}/${file.name}`)
    }
  }

  return jsFiles
}

export = getAllFiles
