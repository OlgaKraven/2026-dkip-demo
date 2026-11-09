import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import '../src/core.js';
import {er2026} from '../content/er-2026.mjs';
import {build2026,teacherCostFiles} from '../content/profile-2026.mjs';
import {deck2026} from '../content/deck-2026.mjs';
const out='site';fs.mkdirSync(out,{recursive:true});
for(const f of fs.readdirSync('src'))fs.copyFileSync('src/'+f,out+'/'+f);
const data=build2026(out,ExamCore.zip);
const er=await er2026(data);
fs.writeFileSync(out+'/er-data.js','globalThis.ER_GUIDE='+JSON.stringify(er)+';');
fs.writeFileSync(out+'/content.js','globalThis.COURSE='+JSON.stringify(data)+';');
const costFiles=teacherCostFiles(data);
const teacherAssets=path.join(out,'materials','teacher-2026');
fs.mkdirSync(teacherAssets,{recursive:true});
fs.writeFileSync(path.join(teacherAssets,'cost-inputs.sql'),costFiles.seed);
fs.writeFileSync(path.join(teacherAssets,'cost-total.sql'),costFiles.query);
const deck=deck2026(data,er.stacks.mysql,costFiles);
for(const slide of deck.slides){
 const resources=[...(slide.links??[]).map(([,href])=>href),slide.image?.file].filter(Boolean);
 for(const resource of resources){
  const file=decodeURIComponent(resource.split(/[?#]/,1)[0]);
  if(!fs.existsSync(path.join(out,file)))throw new Error(`Слайд «${slide.title}»: не найден файл ${file}`);
 }
}
fs.writeFileSync(out+'/deck-data.js','globalThis.TEACHER_DECK='+JSON.stringify(deck)+';');
fs.writeFileSync(out+'/.nojekyll','');
console.log('Built ДКИП 2026: '+Object.keys(data.stages).length+' routes, '+data.tasks.length+' tasks.');
// A browser may retain an earlier GitHub Pages asset after a new deployment.
for(const page of ['index.html','deck.html']){
 const index=fs.readFileSync(out+'/'+page,'utf8').replace(/\b(src|href)="([^"?]+\.(?:js|css))"/g,(_,attribute,file)=>`${attribute}="${file}?v=${createHash('sha256').update(fs.readFileSync(out+'/'+file)).digest('hex').slice(0,12)}"`);
 fs.writeFileSync(out+'/'+page,index);
}
