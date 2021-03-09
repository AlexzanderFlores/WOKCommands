import { Dirent, readdirSync } from "fs";

const getAllFiles = (dir: string) => {
  let fileType: string;
  if (require.main!.filename.endsWith(".ts")) fileType = ".ts";
  else fileType = ".js";

  const files: Dirent[] = readdirSync(dir, {
    withFileTypes: true,
  });
  let wantedFiles: [string, string][] = [];

  for (const file of files) {
    if (file.isDirectory()) {
      wantedFiles = [...wantedFiles, ...getAllFiles(`${dir}/${file.name}`)];
    } else {
      if (file.name.endsWith(fileType) && !file.name.startsWith("!") && !file.name.endsWith(".d.ts")) {
        let fileName: string | string[] = file.name
          .replace(/\\/g, "/")
          .split("/");
        fileName = fileName[fileName.length - 1];
        fileName = fileName.split(".")[0].toLowerCase();

        wantedFiles.push([`${dir}/${file.name}`, fileName]);
      }
    }
  }

  return wantedFiles;
};

export = getAllFiles;
