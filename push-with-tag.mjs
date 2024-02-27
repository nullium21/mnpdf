import { execSync } from "child_process";
import { writeFile, readFile, rename } from "fs/promises";

const packagejson = JSON.parse(await readFile("package.json"));

let [rel, maj, min] = packagejson.version.split(".");

switch (process.argv[2]) {
case "rel": rel++; maj = min = 0; break;
case "maj": maj++; min = 0; break;
case "min": min++; break;
default:
    console.error(`usage: node push-with-tag.mjs <rel|maj|min> [push]`);
    process.exit(1);
}

const newver = `${rel}.${maj}.${min}`;
console.log(`new version: ${newver}`);

const changever = async filename => {
    await rename(filename, `${filename}.bak`);
    await writeFile(filename,
        (await readFile(`${filename}.bak`))
            .toString('utf8')
            .replace(`"version": "${packagejson.version}"`, `"version": "${newver}"`));
    console.log(`changed version in ${filename}; backup in ${filename}.bak`)
};

await changever("package.json");
await changever("manifest.json");

execSync(`git add package.json manifest.json`);
execSync(`git commit -m "Bump version to ${newver}"`);
execSync(`git tag -a ${newver} -m "${newver}"`);

if (process.argv[3] === "push") {
    execSync(`git push origin ${newver}`);
}

console.log('done!');