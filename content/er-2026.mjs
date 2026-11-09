import { buildErLayouts } from '../scripts/er-layout.mjs';

const labels = {
  counterparty:'Контрагенты', item:'Номенклатура', price:'Цены',
  specification:'Спецификация', specification_material:'Материалы спецификации',
  customer_order:'Заказ покупателя', customer_order_line:'Строки заказа',
  production_order:'Производственный заказ', production_product_line:'Выпуск продукции',
  production_material_line:'Материалы производства', cost_calculation:'Расчёт стоимости',
  cost_calculation_line:'Строки расчёта',
};
const clientFields = {id:'id',name:'name',inn:'inn',address:'addres',phone:'phone',is_salesman:'salesman',is_buyer:'buyer'};
const order = Object.keys(labels);
const tableName = value => value.replace(/^app\./,'').replaceAll('`','');

function schemaFromDump(sql) {
  const byTable = new Map();
  for(const [,rawName,body] of sql.matchAll(/^CREATE TABLE (\S+) \(\r?\n([\s\S]*?)^\)/gm)){
    const id=tableName(rawName);
    if(!order.includes(id))continue;
    const fields = body.split(/\r?\n/).map(line=>/^\s+`?(\w+)`?\s+(.+?)\s*,?\s*$/.exec(line))
      .filter(match=>match && !['CONSTRAINT','CHECK','PRIMARY','UNIQUE'].includes(match[1]))
      .map(([,field,definition])=>{
        const type=definition.split(/\s+(?:NOT NULL|DEFAULT|CHECK|COLLATE|CHARACTER SET)\b/i)[0];
        const origin=id==='counterparty' ? clientFields[field] : null;
        const defaultValue = definition.match(/\bDEFAULT\s+('[^']*'|[^\s,]+)/i)?.[1];
        return {id:field,title:field,type,nullable:!definition.includes('NOT NULL'),defaultValue,
          why:origin ? 'Поле '+origin+' из файла «Заказчики.json».' : 'Поле '+id+'.'+field+' в учебной структуре SQL.',
          file:origin?'Заказчики.json':undefined};
      });
    const checks=Array.from(body.matchAll(/^\s*(?:CONSTRAINT\s+\S+\s+)?CHECK\s*\((.*)\),?\s*$/gm),match=>match[1]);
    byTable.set(id,{id,title:labels[id],why:'Сущность «'+labels[id]+'» в учебной схеме базы.',fields,checks});
  }
  const links=[];
  for(const [,rawName,changes] of sql.matchAll(/^ALTER TABLE (?:ONLY )?(\S+)\s+([\s\S]*?);/gm)){
    const from=tableName(rawName);
    const source=byTable.get(from);
    if(!source)continue;
    for(const [,key,fields] of changes.matchAll(/\b(PRIMARY KEY|UNIQUE(?: KEY(?:\s+`\w+`)?)?)\s*\(([^)]+)\)/g)){
      const names=fields.split(',').map(value=>tableName(value.trim()));
      for(const field of source.fields.filter(field=>names.includes(field.id))){
        if(key==='PRIMARY KEY'){field.pk=true;field.nullable=false;}
        else if(names.length===1)field.unique=true;
      }
    }
    for(const [,name] of changes.matchAll(/\bMODIFY\s+`?(\w+)`?\s+[^,\n]*\bAUTO_INCREMENT\b/g)){
      const field=source.fields.find(item=>item.id===name);
      if(field)field.autoIncrement=true;
    }
    for(const [,rawField,rawTarget,rawColumn,rules] of changes.matchAll(/FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\S+?)\s*\(([^)]+)\)([^,\n]*)/g)){
      const field=tableName(rawField.trim()),to=tableName(rawTarget),target=tableName(rawColumn.trim());
      const column=source.fields.find(column=>column.id===field);
      if(!column || !byTable.get(to)?.fields.some(column=>column.id===target))throw new Error('Ошибка связи: '+from+'.'+field);
      column.fk=true;
      const onDelete=rules.match(/ON DELETE (CASCADE|SET NULL|NO ACTION|RESTRICT)/)?.[1]||'RESTRICT';
      const onUpdate=rules.match(/ON UPDATE (CASCADE|SET NULL|NO ACTION|RESTRICT)/)?.[1]||'RESTRICT';
      links.push({from,field,to,target,onDelete,onUpdate,cardinality:'1 : N',explanation:`${from}.${field} ссылается на ${to}.${target}.`});
    }
  }
  if(byTable.size!==order.length || links.length<10)throw new Error('Не удалось извлечь учебную ER-модель.');
  return {tables:order.map(id=>byTable.get(id)),links};
}

export async function er2026(data) {
  const stacks={};
  for(const stack of Object.keys(data.stages)){
    const sqlPath='examples/'+stack+'/SQL/dairy_demo.sql';
    const schema=schemaFromDump(data.code[sqlPath]);
    schema.layouts=await buildErLayouts({order,stacks:{postgresql:schema}});
    schema.sqlPath=stack==='mysql'
      ? 'materials/source/mysql/files/dairy_demo.sql' : 'materials/source/postgresql/assets/files/dairy_demo.sql';
    stacks[stack]=schema;
  }
  return {order,stacks,source:{code:data.official.code,files:data.documents.mysql[0].map(file=>file.name)},
    report:{file:'Расчет стоимости продукции.xlsx',location:'Исходный расчёт стоимости продукции',
      why:'Сопоставьте исходные нормы и цены с таблицами спецификаций и цен. Пример хранит отдельные документы расчёта в cost_calculation и cost_calculation_line.'}};
}
