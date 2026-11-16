import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseFragment, serialize } from 'parse5';
import { renderMarkdown } from './markdown.mjs';
import { cases } from './cases-2026.mjs';
import { archiveEntries, archiveEntry } from './archive.mjs';
import { lessonFoundation } from './help-2026.mjs';
import { offlineConfig, offlinePackages } from './nuget-2026.mjs';
import { packageSetup, preparation, preparationLinks } from './preparation-2026.mjs';
import { publishExample } from './publish-example.mjs';

const source = path.resolve(process.env.COURSE_SOURCE || 'course-source');
const docs = path.join(source, 'docs');
const exampleAssets = new URL('../course-source/examples/', import.meta.url);
const model = JSON.parse(fs.readFileSync(path.join(source, 'content/course.json'), 'utf8'));
const stacks = Object.keys(model.stacks);
const names = {
  mysql: 'Windows Forms + MySQL / MariaDB',
  postgresql: 'Windows Forms + PostgreSQL',
};
const parts = {
  M1: ['29', 20, 'Спроектируйте ER-диаграмму по документам заказчика. Покажите таблицы, атрибуты, PK, FK и связи. Соблюдайте 3НФ и сохраните схему в PDF.', ['В PDF читаются сущности, атрибуты и ключи.', 'На схеме показаны связи.']],
  M2: ['29–30', 30, 'Создайте базу по ER-диаграмме. Настройте таблицы, атрибуты, связи и ограничения. Импортируйте Заказчики.json.', ['Импортированы шесть записей.', 'ИНН, телефоны и адреса совпадают с исходником.', 'Внешние ключи и ограничения действуют.']],
  M3: ['30', 20, 'Рассчитайте полную стоимость заказа покупателя с учётом количества продукции, стоимости материалов и норм расхода.', ['Учтены нормы и количество продукции.', 'Контрольная калькуляция совпадает с ручным расчётом.', 'В заказе сохранены все позиции.']],
  M4: ['30–31', 60, 'Реализуйте авторизацию по логину и паролю, роли Администратор и Пользователь и капчу-пазл. Три подряд неверных попытки блокируют запись. Администратор добавляет, редактирует и разблокирует пользователей, а приложение отклоняет повторный логин.', ['Проверены обе роли, неверный пароль и пазл.', 'Запись блокируется и может быть разблокирована администратором.', 'Повторный логин отклонён.']],
  M5: ['31', 20, 'Разработайте проектную документацию по реализованному функционалу. Опишите назначение системы, применяемые методы и их параметры.', ['Документы описывают работающую систему выбранного стека.', 'Для методов указаны назначение и параметры.']],
};
const attachments = Object.fromEntries(fs.readdirSync(path.join(docs, 'postgresql/assets/files'))
  .filter(name => /-М[124]\.rar$/u.test(name))
  .map(name => ['M' + name.match(/-М([124])/u)[1], name]));
const publicSource = file => 'materials/source/' + file;
const pg = 'postgresql/assets/files/';
const xlsxPreviews = JSON.parse(fs.readFileSync(new URL('./xlsx-2026.json', import.meta.url),'utf8'));
const originalArchive = id => path.join(docs,pg+attachments[id]);
const officialInputs = new Map(archiveEntries(originalArchive('M1'))
  .filter(name=>/\.(xlsx|json)$/.test(name))
  .map(name=>[pg+path.basename(name),archiveEntry(originalArchive('M1'),name)]));
const customersFile = pg+'Заказчики.json';
const secondCustomers = archiveEntries(originalArchive('M2')).find(name=>name.endsWith('/Заказчики.json'));
if(!secondCustomers || !officialInputs.get(customersFile)?.equals(archiveEntry(originalArchive('M2'),secondCustomers))){
  throw new Error('Приложения М1 и М2 содержат разные файлы заказчиков.');
}
const makeDocument = file => {
  const name=path.basename(file);
  return {name, path:url(file), ...(xlsxPreviews[name]?{sheets:xlsxPreviews[name]}:{}) ,
    ...(/\.(json|csv)$/.test(file)?{text:officialInputs.get(file)?.toString('utf8') ?? read(file)}:{})};
};
const puzzleNames=['1.png','2.png','3.png','4.png'];
const puzzleFiles=puzzleNames.map(name=>({name,path:'materials/puzzle/'+name}));
const designRequirements={name:'Требования к разработке.pdf',path:'materials/design-requirements-2026.pdf'};
const official = { year: 2026, code: model.exam.code, minutes: 150, points: model.exam.max_points,
  pdf: 'materials/kim-2026.pdf', samplePage: 29, criteriaPage: 12 };
const subject = 'Информационная система молочного предприятия';
const tasks = model.modules.map(module => {
  const id = 'M' + module.id;
  const [pages, minutes, text, checks] = parts[id];
  return { id, title: module.title, pages, minutes, text, checks };
});
const criteria = fs.readFileSync(path.join(docs,'index.md'), 'utf8').split(/\r?\n/)
  .map(line => /^\| (.*?) \| (\d+) \|$/.exec(line))
  .filter(match => match && !match[1].includes('Итого'))
  .map(([, title, points]) => [title, Number(points)]);
if (criteria.reduce((sum, [, points]) => sum + points, 0) !== official.points ||
    tasks.reduce((sum, task) => sum + task.minutes, 0) !== official.minutes) throw new Error('Параметры КОД не совпадают с данными курса.');

function read(file) { return fs.readFileSync(path.join(docs,file), 'utf8'); }
export function teacherCostQuery(stack) {
  const section = read(`${stack}/module3/example_solution.md`).split(/^## Итог по заказу\s*$/m)[1];
  const query = section?.match(/```sql\s*([\s\S]*?)```/)?.[1].trim();
  if (!query) throw new Error('Не найден итоговый запрос задания 3.');
  return query;
}
function url(file) { return publicSource(file).split('/').map(encodeURIComponent).join('/'); }
const documents = Object.fromEntries(stacks.map(stack => [stack, tasks.map((task,index) => {
  const table = [
    ['Заказ покупателя.xlsx','Спецификация.xlsx','Цены.xlsx','Производство.xlsx','Расчет стоимости продукции.xlsx','Заказчики.json'].map(name => pg + name),
    [pg + 'Заказчики.json'],
    [],
    [],
    [],
  ];
  return [...table[index].map(makeDocument), ...(task.id==='M4'?[designRequirements,...puzzleFiles]:[])];
})]));
const officialConditions = {
  M1: [
    'На основании документов, представленных заказчиком, необходимо спроектировать ER-диаграмму для информационной системы. Предприятие производит продукцию согласно установленным спецификациям и реализует готовую продукцию заказчикам. Каждая продукция имеет свою цену, зависящую от стоимости материалов.',
    'Обязательна 3 нормальная форма с обеспечением ссылочной целостности. При разработке диаграммы обратите внимание на согласованную осмысленную схему именования, создайте необходимые первичные и внешние ключи. ER-диаграмма должна быть представлена в формате PDF и содержать таблицы, связи между ними, атрибуты и ключи (типами данных на данном этапе можно пренебречь).',
  ],
  M2: ['Создайте базу данных на основании разработанной ER-диаграммы, используя предпочтительную платформу, на сервере баз данных, который вам предоставлен. Создайте таблицы основных сущностей, атрибуты, отношения и необходимые ограничения. После создания базы данных требуется импортировать данные из файла «Заказчики.json».'],
  M3: ['Создайте запрос, позволяющий вычислить полную стоимость заказа покупателя с учётом следующей информации:', '- количество продукции в заказе;', '- стоимость всех материалов, использованных для производства данной продукции (учитывая норму расхода).'],
  M4: [
    'Для выполнения задания рекомендуется создать в базе данных таблицу «Пользователи». Если такая таблица уже существует, необходимо внести некоторые изменения для реализации дальнейшего функционала приложения.',
    'Разработайте форму для авторизации зарегистрированных пользователей с ролями «Администратор» и «Пользователь». На форме должны быть обязательные текстовые поля «Логин», «Пароль» и кнопка «Войти». При неверно введённых данных пользователь должен получить сообщение «Вы ввели неверный логин или пароль. Пожалуйста проверьте ещё раз введенные данные». После успешной авторизации — «Вы успешно авторизовались».',
    'При аутентификации связка «логин/пароль» должна совпадать с одной из записей в таблице «Пользователи».',
    'На страницу авторизации добавьте интерактивную капчу, в которой пользователю необходимо собрать исходное изображение из фрагментов. Метод сборки изображения может быть произвольным. Система проверяет правильность расположения фрагментов. Если пазл собран верно, пользователь проходит проверку и может авторизоваться.',
    'Если три раза подряд пазл собран неверно или неверно введён пароль, учётная запись блокируется. При повторной авторизации должно появляться сообщение «Вы заблокированы. Обратитесь к администратору».',
    'Для администратора предусмотрите добавление и редактирование пользователей, включая снятие блокировки. При добавлении проверьте логин в базе и сообщите, если пользователь с таким логином уже существует.',
    'Графический интерфейс необходимо разработать в соответствии с требованиями к разработке.',
  ],
  M5: ['Разработайте проектную документацию на разработанный функционал. Включите описание функционального назначения, используемые методы с указанием параметров.'],
};
const kimAssignments = Object.fromEntries(tasks.map(task => [task.id,{
  title:task.title, paragraphs:officialConditions[task.id], attachment:attachments[task.id],
}]));
const resultFiles = {
  documents: [['Исходные данные', 'приложения к образцу КОД']],
  M1:[['ER-диаграмма.pdf','таблицы, атрибуты, ключи и связи']],
  M2:[['dairy_demo.sql','выгрузка учебной базы']],
  M3:[['Запрос стоимости.sql','запрос и контрольный результат']],
  M4:[['DairyDemo.Auth.csproj','проект Windows Forms'],['Результаты проверок','вход, блокировка, роли и дубликаты']],
  M5:[['Пояснительная записка','назначение и методы'],['Техническое задание','требования к системе'],['Руководство пользователя','порядок работы']],
};
const parseSections = text => {
  const result = [{ title:'Подготовка', body:[] }];
  let fence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    const heading = !fence && /^##\s+(.+)$/.exec(line);
    if (heading) result.push({title:heading[1],body:[]});
    else if (!/^\s*#\s+/.test(line) || fence) result.at(-1).body.push(line);
  }
  return result.map(({ title, body })=>({ title, body:body.join('\n').trim() })).filter(section=>section.body);
};
const lessonPaths = new Map();
const stages = Object.fromEntries(stacks.map(stack=>[stack,[
  {id:'documents',title:'Подготовка к работе',module:'Этап 0',goal:preparation(stack).required,
    installers:preparationLinks(stack),
    output:'Сохраните исходные файлы и локальные пакеты. Проверьте, что СУБД открывается и проект собирается без интернета.',steps:[
    {title:'Установите и настройте программы',file:'index.md',markdown:preparation(stack).install},
    {title:'Подготовьте библиотеки NuGet для работы без интернета',file:'index.md',markdown:preparation(stack).packages},
    {title:'Откройте официальный образец',actions:['Откройте PDF на странице 29. Найдите пять модулей базового уровня.','Скачайте приложения и распакуйте их в отдельную рабочую папку.'],check:'В папке есть исходные документы и приложения к модулям 1, 2 и 4.',why:'Эти файлы используются при разработке модели, импорте и проверке интерфейса.',resources:['kim','archive']},
    {title:'ЧаВО по демонстрационному экзамену',article:renderMarkdown(preparation(stack).faq).html},
  ]},
  ...tasks.map(task=>{
    const number = task.id.slice(1);
    const lessons = Object.entries(model.stacks[stack].lessons[number]);
    const alternatives = model.stacks[stack].alternatives?.[number] ?? [];
    const steps = [];
    lessonPaths.set(`${stack}/module${number}/index.md`, {stack, id:task.id, view:'brief'});
    for (const [role, lesson] of lessons) {
      const file = `${stack}/module${number}/${lesson.file}`;
      lessonPaths.set(file, {stack,id:task.id,view:'steps',step:steps.length});
      for (const section of parseSections(read(file))) {
        steps.push({title:section.title.replace(/[*`]/g,''), markdown:section.body, file,
          group:lesson.title,alternative:alternatives.includes(role)?lesson.title:undefined});
      }
    }
    if(task.id==='M1')steps.push({title:'Сверьте свою ER-диаграмму',group:'Интерактивная схема',
      erWorkspace:true,why:'Справочная схема показывает таблицы, поля и внешние ключи для выбранной СУБД.',
      actions:['Откройте полную схему. Сверьте таблицы, первичные ключи и связи.', 'В режиме построения выберите поле и проверьте, на что оно ссылается.']});
    if(task.id==='M2')steps.push({title:'Сверьте таблицы и ограничения',group:'Интерактивный справочник',
      tableGuide:'review',actions:['Выберите таблицу. Сверьте типы полей, первичный ключ и ограничения.','Сопоставьте внешние ключи с таблицами из ER-диаграммы.'],
      check:'Названия, ключи, типы полей и ограничения совпадают с моделью выбранного стека.',
      why:'Ссылки между таблицами должны работать до импорта данных.'});
    return {id:task.id,title:task.title,module:`Задание ${number} · ${task.minutes} мин`,
      goal:task.text,output:model.modules[Number(number)-1].result,steps};
  })
]]));
function lessonUrl(page) {
  return '?' + new URLSearchParams({mode:'learn',stack:page.stack,module:page.id,view:page.view,
    ...(page.step===undefined?{}:{step:page.step})});
}
function article(markdown, file) {
  const fragment = parseFragment(renderMarkdown(markdown).html);
  function visit(node) {
    for(const attr of node.attrs ?? []) {
      if (!['src','href'].includes(attr.name) || /^(?:#|\/|[a-z][a-z\d+.-]*:)/i.test(attr.value)) continue;
      const link = new URL(attr.value, 'https://local.invalid/' + file);
      const target = decodeURIComponent(link.pathname.slice(1));
      const lesson = lessonPaths.get(target.replace(/\.html$/i,'.md'));
      if (/^downloads\/nuget-(?:mysql|postgresql)\.zip$/.test(target)) attr.value = target;
      else if (readyExampleArchives[target]) attr.value = readyExampleArchives[target];
      else if (lesson) attr.value = lessonUrl(lesson);
      else {
        if (!fs.existsSync(path.join(docs,target))) throw new Error(`Ссылка ${file}: ${target} не найдена`);
        attr.value = url(target) + link.search + link.hash;
      }
    }
    if(node.tagName==='img'){
      const src = node.attrs.find(attr=>attr.name==='src');
      if(src) node.attrs.push({name:'data-image',value:src.value},{name:'role',value:'button'},
        {name:'tabindex',value:'0'},{name:'aria-haspopup',value:'dialog'},
        {name:'aria-label',value:'Увеличить: '+(node.attrs.find(attr=>attr.name==='alt')?.value||'снимок шага')});
    }
    for(const child of node.childNodes ?? []) visit(child);
  }
  visit(fragment);
  return serialize(fragment);
}
const readyExampleArchives = {
  'mysql/files/DairyDemo.Auth.zip': 'downloads/dkip2026-mysql.zip',
  [pg + 'main.zip']: 'downloads/dkip2026-postgresql.zip',
};
for (const stack of stacks) for (const stage of stages[stack]) {
  for(const step of stage.steps){
    if(!step.markdown)continue;
    step.article=article(step.markdown,step.file);
    delete step.markdown;
    delete step.file;
  }
  const task=tasks.find(item=>item.id===stage.id);
  if(task){
    const file=`${stack}/module${task.id.slice(1)}/index.md`;
    stage.condition=article(read(file),file);
  }
  stage.foundation=lessonFoundation(stage.id,stack);
}

export async function build2026(out, zip) {
  const copy = (from,to) => {fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);};
  for(const folder of ['assets/images','mysql/files','postgresql/assets/images','postgresql/assets/files']) {
    for (const entry of fs.readdirSync(path.join(docs,folder), {recursive:true,withFileTypes:true})) {
      if (!entry.isFile() || /(?:\.gitkeep$|module6|М6|TransferSimulator|ClientValidationApp|api_info|эмулятора|ТестКейс)/iu.test(entry.name)) continue;
      const file=path.join(entry.parentPath,entry.name);
      copy(file,path.join(out,publicSource(path.relative(docs,file))));
    }
  }
  // The contents of this complete archive include the profile-only module.
  fs.rmSync(path.join(out,publicSource(pg+'Прил_ОЗ_КОД 09.02.07-5-2026.zip')),{force:true});
  for(const file of Object.keys(readyExampleArchives))fs.rmSync(path.join(out,publicSource(file)),{force:true});
  copy(path.join(docs,model.exam.source),path.join(out,official.pdf));
  copy('node_modules/mermaid/dist/mermaid.min.js',path.join(out,'mermaid.min.js'));
  for(const [file,bytes] of officialInputs)fs.writeFileSync(path.join(out,publicSource(file)),bytes);
  const archive4=originalArchive('M4');
  const entries=archiveEntries(archive4);
  for(const file of [...puzzleFiles,designRequirements]){
    const entry=entries.find(item=>item.endsWith('/'+file.name));
    if(!entry)throw new Error('Нет файла в приложении М4: '+file.name);
    const destination=path.join(out,file.path);
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,archiveEntry(archive4,entry));
  }
  const previews = 'materials/kim-preview';
  fs.mkdirSync(path.join(out,previews),{recursive:true});
  const pdfRender = spawnSync('pdftoppm',['-scale-to','1080','-png',path.join(out,official.pdf),path.join(out,previews,'page')]);
  const kimPreviewPages = pdfRender.status===0 ? fs.readdirSync(path.join(out,previews))
    .filter(file=>/^page-\d+\.png$/.test(file)).sort((a,b)=>a.localeCompare(b,'en',{numeric:true})).map(file=>previews+'/'+file) : [];
  const downloads = path.join(out,'downloads');
  fs.mkdirSync(downloads,{recursive:true});
  fs.writeFileSync(path.join(downloads,'basic-inputs.zip'),zip(Object.fromEntries(Object.values(attachments)
    .map(file=>[file,fs.readFileSync(path.join(docs,pg+file))]))));
  const allCases={}, variantFiles={};
  const variants=cases.map(({tabs,customers,targetOrder,...variant})=>{
    const {id}=variant;
    const workbookName='Исходные данные.xlsx',customerName='Заказчики.json';
    const workbook=fs.readFileSync(new URL('./case-workbooks-2026/'+id+'.xlsx',import.meta.url));
    const customerText=JSON.stringify(customers,null,2)+'\n';
    const base='materials/practice-2026/'+id+'/';
    const bookFile=base+workbookName, customerFile=base+customerName;
    const sheets=tabs.map(([name,head,rows])=>({
      name,columns:head.map((label,col)=>Math.max(120,label.length*9+24,...rows.map(row=>String(row[col]).length*9+24))),
      rows:[head,...rows].map((row,r)=>row.map((value,col)=>({
        cell:String.fromCharCode(65+col)+(r+1),value:typeof value==='number'?String(value).replace('.',','):String(value),
        ...(r===0?{bold:true}:typeof value==='number'?{align:'right'}:{}),
      }))),
    }));
    fs.mkdirSync(path.join(out,base),{recursive:true});
    fs.writeFileSync(path.join(out,bookFile),workbook);
    fs.writeFileSync(path.join(out,customerFile),customerText);
    const book={name:workbookName,path:encodeURI(bookFile),sheets};
    const customer={name:customerName,path:encodeURI(customerFile),text:customerText};
    variantFiles[id]={byTask:[[book,customer],[customer],[book],[designRequirements],[]],puzzle:puzzleFiles};
    const exercise=[
      'Спроектируйте ER-диаграмму по исходным данным этого предприятия. Соблюдайте 3НФ, покажите связи, атрибуты, PK и FK. Сохраните схему в PDF.',
      'Создайте БД на основании своей ER-диаграммы. Настройте таблицы и ограничения и импортируйте шесть контрагентов из «Заказчики.json». Загрузите позиции и нормы для проверки запроса.',
      'Напишите запрос для расчёта полной стоимости заказа '+targetOrder+'. Для каждой позиции учтите количество продукции, норму расхода и цену каждого материала. Округлите итог до копеек после суммирования.',
      'Создайте в Windows Forms форму входа с интерактивным пазлом и ролями «Пользователь» и «Администратор». После трёх ошибок подряд блокируйте учётную запись. Администратор должен добавлять, редактировать и разблокировать пользователей; повторный логин запрещён. Сообщения и оформление сверяйте с требованиями КОД.',
      'Подготовьте проектную документацию к своей системе. Опишите назначение, реализованные функции и методы с параметрами.',
    ];
    const instructions=[
      '# '+id+' · '+variant.domain+' · '+variant.brand,
      'Учебный вариант по образцу КОД 09.02.07-5-2026. 5 заданий · 150 минут · 50 баллов.',
      variant.common,variant.process,variant.rules,...exercise.map((item,index)=>'## Задание '+(index+1)+'\n'+item),
    ].join('\n\n')+'\n';
    const bundle={'Условие.md':instructions,[workbookName]:workbook,[customerName]:customerText,
      [designRequirements.name]:fs.readFileSync(path.join(out,designRequirements.path))};
    for(const file of puzzleFiles)bundle['Капча/'+file.name]=fs.readFileSync(path.join(out,file.path));
    fs.writeFileSync(path.join(downloads,'exam-'+id+'.zip'),zip(bundle));
    allCases[id+'.zip']=fs.readFileSync(path.join(downloads,'exam-'+id+'.zip'));
    return {...variant,tasks:exercise.map(text=>({text})),targetOrder};
  });
  fs.writeFileSync(path.join(downloads,'exam-30-variants.zip'),zip(allCases));
  const code={}, codeDescriptions={}, exampleLaunch={};
  const packages=await offlinePackages();
  for(const stack of stacks){
    fs.writeFileSync(path.join(downloads,'nuget-'+stack+'.zip'),zip({
      ...packages[stack],
      'NuGet.Config':offlineConfig,
    }));
    const mysql = stack==='mysql';
    const folder=mysql?'mysql/files/':pg;
    const archive=path.join(docs,folder+(mysql?'DairyDemo.Auth.zip':'main.zip'));
    const namesInZip=archiveEntries(archive).filter(Boolean);
    const pack={
      ...packages[stack],
      'NuGet.Config':offlineConfig,
      'DairyDemo.Auth.sln':fs.readFileSync(new URL('DairyDemo.Auth.sln',exampleAssets)),
    };
    const sharedOverrides={'Data/Db.cs':'Db.cs','Services/AuthService.cs':'AuthService.cs'};
    const overrides=mysql?sharedOverrides:{...sharedOverrides,
      'UI/Forms/LoginForm.cs':'LoginForm.cs',
      'UI/Controls/CaptchaPuzzleControl.cs':'CaptchaPuzzleControl.cs',
    };
    for(const entry of namesInZip.filter(name=>!name.endsWith('/'))){
      const file=entry.replace(/^.*?DairyDemo\.Auth\//,'');
      if(!file||file.split('/').includes('..'))throw new Error('Некорректное имя в ZIP');
      if(file.endsWith('.sln') || file==='users_table.sql')continue;
      const replacement=overrides[file];
      let bytes=replacement
        ? fs.readFileSync(new URL(stack+'/'+replacement,exampleAssets))
        : archiveEntry(archive,entry);
      if (file==='DairyDemo.Auth.csproj') {
        bytes=Buffer.from(bytes.toString('utf8')
          .replace(/<TargetFramework>[^<]+<\/TargetFramework>/,'<TargetFramework>net10.0-windows</TargetFramework>')
          .replace('</Project>',`  <ItemGroup>
    <Content Include="../Launch/db-connection.txt" Condition="Exists('../Launch/db-connection.txt')"
      Link="db-connection.txt" CopyToOutputDirectory="PreserveNewest" CopyToPublishDirectory="Never" />
  </ItemGroup>
</Project>`));
      }
      pack['DairyDemo.Auth/'+file]=bytes;
      if(/\.(cs|csproj|sln)$/.test(file)){
        const key='examples/'+stack+'/'+file;
        code[key]=bytes.toString('utf8');codeDescriptions[key]='Исходник приложения Windows Forms · '+names[stack]+'.';
      }
    }
    for(const file of puzzleFiles)pack['DairyDemo.Auth/Assets/captcha/'+file.name]=fs.readFileSync(path.join(out,file.path));
    const database=read(folder+'dairy_demo.sql')+'\n\n'+read(folder+'demo-users.sql');
    const scripts={'dairy_demo.sql':database,'module3_query.sql':teacherCostQuery(stack)+'\n'};
    for(const [name,sql] of Object.entries(scripts)){
      const file='SQL/'+name;
      pack[file]=sql;
      const key='examples/'+stack+'/'+file;
      code[key]=sql;
      codeDescriptions[key]=name==='dairy_demo.sql'?'Структура, данные КОД и две учебные записи для входа.':'Запрос расчёта стоимости заказа № 2.';
    }
    Object.assign(pack, publishExample(pack));
    for (const name of ['BCrypt.Net-Next','Microsoft',mysql?'MySqlConnector':'Npgsql']) {
      pack['Licenses/'+name+'.txt']=fs.readFileSync(new URL('licenses/'+name+'.txt',exampleAssets));
    }
    pack['Launch/db-connection.txt'] = mysql
      ? 'Server=localhost;Port=3306;Database=dairy_demo;Uid=root;Pwd=;SslMode=None;\n'
      : 'Host=localhost;Port=5432;Database=dairy_demo;Username=postgres;Password=;Search Path=app\n';
    const requirements = 'Пока есть интернет, установите на Windows x64 .NET Desktop Runtime 10 и '+(mysql?'XAMPP с Apache, MySQL, PHP и phpMyAdmin.':'PostgreSQL 17 или 18 с актуальными обновлениями и pgAdmin 4. Запомните порт и пароль пользователя postgres, заданные при установке.')+' Для запуска из исходников установите Visual Studio 2026 с нагрузкой «Разработка классических приложений .NET» и .NET 10 SDK. После установки и первого открытия Visual Studio можно отключить интернет. База, картинки пазла и пакеты NuGet для решения находятся в ZIP.';
    const sections = [
      {title:'Распакуйте ZIP',steps:[
        'Щёлкните ZIP правой кнопкой → «Извлечь всё». Выберите короткий локальный путь, например папку `DE` внутри своей папки пользователя и отдельную подпапку для стека. В распакованной папке рядом будут `Launch`, `DairyDemo.Auth.sln`, `DairyDemo.Auth`, `SQL`, `nuget-packages` и `NuGet.Config`.',
      ]},
      {title:'Импортируйте заполненную базу',steps:mysql?[
        'В XAMPP Control Panel нажмите «Start» в строках Apache и MySQL. После запуска MySQL запишите его порт из столбца «Port(s)», обычно 3306. Нажмите «Admin» в строке MySQL. В браузере откроется локальный phpMyAdmin.',
        'В phpMyAdmin выберите «Базы данных» → «Создать базу данных». Введите `dairy_demo`, выберите `utf8mb4_unicode_ci` и нажмите «Создать». Для первой проверки нужна пустая база. Если у вас уже есть база с этим именем, создайте другую пустую базу и укажите её название в файле подключения.',
        'Откройте созданную базу слева. На вкладке «Импорт» выберите `SQL/dairy_demo.sql` из распакованной папки. Оставьте формат SQL и кодировку UTF-8. Нажмите «Импорт» и дождитесь сообщения об успехе.',
        'Откройте `users` → «Обзор» и найдите `DemoUser` и `DemoAdmin`. В `counterparty` должно быть семь строк после добавления комбината, а в `customer_order_line` — три строки заказа № 2.',
      ]:[
        'В pgAdmin раскройте «Servers» и подключитесь к локальному PostgreSQL 17 или 18 с паролем пользователя `postgres`. Если сервера в списке нет, выберите «Servers → Register → Server». Задайте имя. На вкладке «Connection» укажите `127.0.0.1`, установленный порт, обычно 5432, и пользователя `postgres`. Сохраните соединение.',
        'Щёлкните правой кнопкой по «Databases» → «Create → Database…», введите `dairy_demo` и нажмите «Save». Если база с таким именем уже используется, создайте отдельную пустую базу с другим именем и укажите его в файле подключения.',
        'Щёлкните по новой базе правой кнопкой → «Restore…». В «Format» выберите «Plain», в «Filename» укажите `SQL/dairy_demo.sql` из распакованной папки и нажмите «Restore». Дождитесь «Process completed» и обновите дерево базы.',
        'В `Schemas → app → Tables` откройте `users` через «View/Edit Data → All Rows». Проверьте `DemoUser` и `DemoAdmin`. В `counterparty` должно быть семь строк, а в `customer_order_line` — три строки заказа № 2.',
      ]},
      {title:'Запустите готовое приложение',steps:[
        mysql ? 'Откройте `Launch/db-connection.txt` в Блокноте. Укажите `Server=127.0.0.1`, имя импортированной базы после `Database=` и порт MySQL из XAMPP. После `Uid=` и `Pwd=` впишите имя и пароль локальной учётной записи MySQL. Для установки XAMPP без пароля оставьте `Uid=root;Pwd=;`.'
          : 'Откройте `Launch/db-connection.txt` в Блокноте. Укажите `Host=127.0.0.1`, имя импортированной базы после `Database=` и оставьте `Search Path=app`. Сверьте `Port` и `Username` с pgAdmin. После `Password=` введите пароль пользователя PostgreSQL. Если пароль содержит точку с запятой, заключите его в двойные кавычки.',
        'Сохраните изменения в том же файле. Дважды щёлкните `Launch/DairyDemo.Auth.exe`. Должно открыться окно входа с пазлом. Если Windows запрашивает .NET, установите Desktop Runtime 10 по ссылке в начале README. При ошибке подключения проверьте, что СУБД запущена, база `dairy_demo` заполнена, порт и реквизиты совпадают.',
        {afterAccounts:'Введите логин и пароль приложения из списка выше. Чтобы поменять фрагменты пазла местами, щёлкните сначала по одному, затем по другому. Соберите картинку и нажмите «Войти».'+(mysql?' Закройте окно «Авторизация» кнопкой «ОК».':'')+'\nПроверьте обе роли. Для `DemoUser` должен открыться «Рабочий стол пользователя». Закройте окно, заново откройте EXE, соберите пазл и войдите как `DemoAdmin`. Откроется '+(mysql?'«Панель администратора — DemoAdmin»':'«Администратор: DemoAdmin»')+' со списком пользователей.'},
      ]},
      {title:'Запустите решение в Visual Studio через F5',steps:[
        'Закройте готовый EXE. В Visual Studio выберите «Открыть проект или решение» и укажите `DairyDemo.Auth.sln` из распакованной папки.',
        'Дождитесь загрузки проекта. Перед первым F5 в «Обозревателе решений» щёлкните правой кнопкой по решению → «Восстановить пакеты NuGet». Файл `NuGet.Config` задаёт локальную папку `nuget-packages`. В «Зависимости → Пакеты» должны появиться `BCrypt.Net-Next` и `'+(mysql?'MySqlConnector':'Npgsql')+'`.',
        'При `NU1101` или `NU1102` проверьте, что `nuget-packages` и `NuGet.Config` распакованы рядом с решением. При `NETSDK1004` сначала повторите восстановление. Если NuGet сообщает, что часть длинного пути не найдена, распакуйте архив в папку с более коротким именем и откройте решение оттуда.',
        'Нажмите F5. Visual Studio скопирует настройки из `Launch/db-connection.txt`. Соберите пазл, войдите под `DemoUser` и откройте рабочее окно пользователя. Закройте приложение целиком, снова нажмите F5 и войдите под `DemoAdmin`. Откройте таблицу учётных записей.',
      ]},
      {title:'Соберите исходники на .NET 9',steps:[
        'Готовый EXE в `Launch` собран для .NET 10. Для сборки на .NET 9 заранее установите SDK 9.0 x64. Для `net9.0-windows` Microsoft указывает Visual Studio 2022 версии 17.12 или новее. Для ветки SDK 9.0.3xx используйте Visual Studio 2022 17.14 или Visual Studio 2026. Для оригинального `net10.0-windows` используйте Visual Studio 2026 с .NET 10 SDK.',
        'Сделайте копию распакованной папки, чтобы сохранить оригинальную версию. В Visual Studio щёлкните по проекту → «Изменить файл проекта». В `DairyDemo.Auth/DairyDemo.Auth.csproj` замените `<TargetFramework>net10.0-windows</TargetFramework>` на `<TargetFramework>net9.0-windows</TargetFramework>` и сохраните.',
        'Для выбора SDK именно версии 9 создайте рядом с `DairyDemo.Auth.sln` файл `global.json` с содержимым `{"sdk":{"version":"9.0.100","rollForward":"latestFeature"}}`. Закройте и снова откройте решение. Отсутствующий SDK нужно установить до отключения интернета.',
        'Оставьте `NuGet.Config` и набор пакетов из ZIP. Восстановите пакеты и нажмите F5. Собранный EXE находится в `DairyDemo.Auth/bin/Debug/net9.0-windows/`. Для его запуска на другом компьютере нужен .NET Desktop Runtime 9. Для исходного EXE из `Launch` нужен Desktop Runtime 10.',
      ]},
    ];
    const accountText = 'Учебные записи\n\n- Пользователь · `DemoUser` / `DkipUser2026!`\n- Администратор · `DemoAdmin` / `DkipAdmin2026!`';
    const instructions = sections.map(({title,steps})=>`## ${title}\n\n`+steps.map((step,index)=>
      typeof step==='string' ? `${index+1}. ${step}` : `\n${accountText}\n\n${step.afterAccounts}`).join('\n')).join('\n\n');
    const installerLinks = [...preparationLinks(stack).slice(0, 4),
      ['Загрузки SDK и Desktop Runtime 9', 'https://dotnet.microsoft.com/en-us/download/dotnet/9.0'],
    ].map(([title, href])=>`[${title}](${href})`).join(' · ');
    const readme = `# ${names[stack]}\n\n${requirements}\n\n${installerLinks}\n\n${instructions}\n\n## NuGet для нового проекта\n\n${packageSetup(stack)}\n`;
    pack['README.md']=readme;
    fs.writeFileSync(path.join(downloads,`dkip2026-${stack}.zip`),zip(pack));
    exampleLaunch[stack]={name:names[stack],database:model.stacks[stack].name,desktop:'Windows Forms',readme,
      requirements, download:`downloads/dkip2026-${stack}.zip`, sections};
  }
  const shotPaths={
    mysql:{login:['assets/images/preparation/ready-mysql-login.png','Окно входа'], 'm4-student':['assets/images/preparation/ready-mysql-user.png','Окно пользователя'], 'm4-admin':['assets/images/preparation/ready-mysql-admin.png','Панель администратора']},
    postgresql:{login:['assets/images/preparation/ready-postgres-login.png','Окно входа'], 'm4-student':['assets/images/preparation/ready-postgres-user.png','Окно пользователя'], 'm4-admin':['assets/images/preparation/ready-postgres-admin.png','Панель администратора']}
  };
  const screens=Object.fromEntries(stacks.map(stack=>[stack,Object.fromEntries(Object.entries(shotPaths[stack]).map(([id,[file,caption]])=>[id,{file:url(file),caption}]))]));
  const data={official,subject,stages,tasks,criteria,variants,variantFiles,code,codeDescriptions,exampleLaunch,documents,resultFiles,
    previews:[...documents.mysql[0],designRequirements,...puzzleFiles],kimAssignments,kimPreviewPages,screens,
    stackNames:names,stackTools:Object.fromEntries(stacks.map(stack=>[stack,model.stacks[stack].tools])),
    exampleAccounts:{note:'Эти записи для входа в приложение уже добавлены в SQL/dairy_demo.sql.',
      headings:['Роль','Логин','Пароль'],rows:[['Пользователь','DemoUser','DkipUser2026!'],['Администратор','DemoAdmin','DkipAdmin2026!']]}};
  return data;
}
