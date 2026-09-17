import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
function modules(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const path=join(directory,entry.name);
    return entry.isDirectory()?modules(path):entry.isFile()&&/\.(?:m?js)$/.test(entry.name)?[path]:[];
  }).sort();
}
const gameFiles=modules(join(root,'dist')),testFiles=modules(join(root,'scripts'));
const files=[...gameFiles,...testFiles];
if(!gameFiles.length)throw Error('No game modules found in dist.');
for(const path of files){
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
  if(result.error)throw result.error;
  if(result.status!==0){
    process.stderr.write(`Syntax check failed: ${relative(root,path)}\n${result.stderr||result.stdout}`);
    process.exit(result.status||1);
  }
}
console.log(`Syntax check passed: ${gameFiles.length} game modules and ${testFiles.length} development/test scripts.`);
