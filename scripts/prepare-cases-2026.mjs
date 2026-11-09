import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {cases} from '../content/cases-2026.mjs';

const runtime=process.env.DKIP_ARTIFACT_NODE_MODULES;
if(!runtime)throw new Error('Укажите DKIP_ARTIFACT_NODE_MODULES — каталог с @oai/artifact-tool.');
const {Workbook,SpreadsheetFile}=createRequire(path.join(runtime,'_resolve.cjs'))('@oai/artifact-tool');
const out=process.argv[2]||'content/case-workbooks-2026';
await fs.mkdir(out,{recursive:true});
for(const c of cases){
  const workbook=Workbook.create();
  for(const [title,head,rows] of c.tabs){
    const sheet=workbook.worksheets.add(title);
    const last=String.fromCharCode(64+head.length);
    sheet.getRange(`A1:${last}${rows.length+1}`).values=[head,...rows];
    sheet.getRange(`A1:${last}1`).format={fill:'#143259',font:{bold:true,color:'#FFFFFF'},rowHeight:24};
    head.forEach((label,i)=>{
      const col=String.fromCharCode(65+i);
      sheet.getRange(`${col}:${col}`).format.columnWidth=Math.max(17,label.length+4,...rows.map(row=>String(row[i]).length+4));
    });
    sheet.freezePanes.freezeRows(1);
  }
  workbook.recalculate();
  const file=await SpreadsheetFile.exportXlsx(workbook);
  await file.save(path.join(out,c.id+'.xlsx'));
}
