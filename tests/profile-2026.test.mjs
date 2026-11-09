import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { parseFragment } from 'parse5';
import '../site/core.js';
import '../site/content.js';
import '../site/er-data.js';
import '../site/deck-data.js';

const { COURSE: course, ER_GUIDE: er, TEACHER_DECK: deck, ExamCore: core } = globalThis;
test('локальная копия использует только базовые задания 2026', () => {
  assert.equal(course.official.code, '09.02.07-5-2026');
  assert.equal(course.official.minutes, 150);
  assert.equal(course.criteria.reduce((sum, [, n]) => sum + n, 0), 50);
  assert.deepEqual(course.tasks.map(task=>task.id), ['M1','M2','M3','M4','M5']);
  assert.equal(deck.slides[0].title,'Демонстрационный экзамен 2026');
  const clock=core.freshTimer(course.official.minutes*60,'mock');
  assert.equal(core.format(core.timerView(clock).left),'02:30:00');
});

test('два стека содержат свои шаги, связи и доступные вложения', () => {
  function check(node) {
    for(const {name,value} of node.attrs ?? []){
      if(!['href','src'].includes(name) || !value.startsWith('materials/'))continue;
      assert.ok(fs.existsSync(path.join('site',decodeURIComponent(value.split(/[?#]/)[0]))),value);
    }
    for(const child of node.childNodes ?? []) check(child);
  }
  for(const [id, stages] of Object.entries(course.stages)){
    assert.match(course.stackNames[id], /^Windows Forms/);
    assert.equal(stages.length,6);
    assert.ok(stages[1].steps.some(step=>step.erWorkspace));
    assert.ok(stages[2].steps.some(step=>step.tableGuide));
    assert.match(JSON.stringify(stages[2].steps),id==='mysql'?/phpMyAdmin/:/pgAdmin/);
    for(const stage of stages)for(const article of [stage.condition,...stage.steps.map(step=>step.article)].filter(Boolean)){
      assert.doesNotMatch(article,/09\.02\.07-5-2027|2027-dkip-demo|\bWPF\b|\bPostman\b|TransferSimulator|Модуль 6|Задание 6/i);
      check(parseFragment(article));
    }
    const {tables,links,layouts}=er.stacks[id];
    assert.equal(tables.length,12);
    assert.ok(links.length>=16);
    assert.ok(Object.keys(layouts).length>70);
    const phone=tables.find(t=>t.id==='counterparty').fields.find(f=>f.id==='phone');
    assert.match(phone.type,id==='mysql'?/^varchar/i:/^text$/i);
    const example=course.exampleLaunch[id];
    assert.ok(fs.statSync('site/'+example.download).size>10_000);
  }
});

test('официальные файлы 2026 отделены от файлов 30 учебных вариантов', () => {
  assert.equal(course.previews.filter(file=>file.sheets).length,5);
  assert.equal(course.previews.filter(file=>file.name.endsWith('.png')).length,4);
  assert.ok(course.kimAssignments.M4.paragraphs.some(text=>text.includes('три раза подряд')));
  assert.equal(course.variants.length,30);
  const ids=course.variants.map(item=>item.id);
  assert.equal(new Set(ids).size,30);
  assert.equal(new Set(course.variants.map(item=>item.targetOrder)).size,30);
  const entries = zip=>execFileSync('bsdtar',['-tf',zip],{encoding:'utf8'}).trim().split('\n');
  assert.deepEqual(entries('site/downloads/exam-30-variants.zip'),ids.map(id=>id+'.zip'));
  for(const {id,tasks,targetOrder} of course.variants){
    assert.equal(tasks.length,5);
    assert.ok(tasks[2].text.includes(targetOrder));
    const {byTask,puzzle}=course.variantFiles[id];
    assert.equal(byTask[0].find(file=>file.sheets).sheets.length,6);
    const json=JSON.parse(byTask[1][0].text);
    assert.equal(json.length,6);
    assert.equal(new Set(json.map(item=>item.id)).size,6);
    const archive='site/downloads/exam-'+id+'.zip';
    assert.deepEqual(new Set(entries(archive)),new Set(['Условие.md','Исходные данные.xlsx','Заказчики.json','Требования к разработке.pdf',...puzzle.map(file=>'Капча/'+file.name)]));
  }
  for(const example of Object.values(course.exampleLaunch)){
    const names=entries('site/'+example.download);
    for(const n of [1,2,3,4])assert.ok(names.includes('DairyDemo.Auth/Assets/captcha/'+n+'.png'));
  }
});
