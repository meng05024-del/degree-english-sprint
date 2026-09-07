import { chromium } from 'file:///C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';

const baseUrl = process.env.QUIZ_URL || 'http://127.0.0.1:8765/web-50%E9%A2%98%E5%86%B2%E5%88%BA/';
const browser = await chromium.launch({headless:true, executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await page.addInitScript(() => {
  class TestUtterance { constructor(text){this.text=text;this.onend=null;this.onerror=null;} }
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:TestUtterance});
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){window.__cancelCount=(window.__cancelCount||0)+1;},speak(utterance){window.__spoken=utterance.text;window.__utterance=utterance;}}});
});

try {
  await page.goto(baseUrl, {waitUntil:'networkidle'});
  assert.match(await page.locator('body').innerText(), /考前冲刺计划/);
  const contentAudit = await page.evaluate(() => {
    const bank=globalThis.offlineQuestionBankV731;
    const stems=bank.map(q=>`${q.type==='listening'?`听音:${q.audioText||''}:`:''}${String(q.q||'')}`.replace(/\s+/g,' ').trim().toLowerCase());
    return {
      total:bank.length,
      duplicateIds:bank.length-new Set(bank.map(q=>q.id)).size,
      duplicateStems:bank.length-new Set(stems).size,
      blankQuestions:bank.filter(q=>!String(q.q||'').trim()).length,
      badOptions:bank.filter(q=>!Array.isArray(q.options)||q.options.length!==4||new Set(q.options.map(String)).size!==4).length,
      badAnswers:bank.filter(q=>!Number.isInteger(q.answer)||q.answer<0||q.answer>3).length,
      blankExplanations:bank.filter(q=>!String(q.explain||'').trim()).length,
      blankTranslations:bank.filter(q=>!String(q.translation||'').trim()).length,
      badListening:bank.filter(q=>q.type==='listening'&&(!q.audioText||/辅助读法“/.test(q.q))).length,
      malformedOptions:bank.filter(q=>q.options.some(x=>/\b(?:todaying|tomorrowing|englishing|harding|youing)\b/i.test(x))).length
    };
  });
  assert.equal(contentAudit.total,791);
  assert.equal(contentAudit.duplicateIds,0);
  assert.equal(contentAudit.blankQuestions,0);
  assert.equal(contentAudit.badOptions,0);
  assert.equal(contentAudit.badAnswers,0);
  assert.equal(contentAudit.blankExplanations,0);
  assert.equal(contentAudit.blankTranslations,0);
  assert.equal(contentAudit.badListening,0);
  assert.equal(contentAudit.malformedOptions,0);
  await page.screenshot({path:'test-output/home-mobile.png',fullPage:true});
  await page.locator('#start-practice').click();
  const practiceAudit = await page.evaluate(() => {
    const state=JSON.parse(localStorage.getItem('degree_english_50_quiz_v1'));
    const bank=globalThis.offlineQuestionBankV731;
    const cats={};
    for(const id of state.questionIds){const q=bank.find(item=>item.id===id);cats[q.cat]=(cats[q.cat]||0)+1;}
    const listening=state.questionIds.map(id=>bank.find(item=>item.id===id)).filter(q=>q.type==='listening');
    return {count:state.questionIds.length,cats,listening:listening.length,listeningReady:listening.every(q=>q.audioText&&!/辅助读法“/.test(q.q))};
  });
  assert.equal(practiceAudit.count,50);
  assert.ok(practiceAudit.cats['词汇听读']>=5&&practiceAudit.cats['词汇听读']<=7);
  assert.ok(practiceAudit.cats['阅读理解']>=6);
  assert.equal(practiceAudit.listeningReady,true);
  const minTapHeight = await page.evaluate(() => Math.min(...[...document.querySelectorAll('button,summary,input[type=date]')].filter(e=>e.offsetParent!==null).map(e=>e.getBoundingClientRect().height)));
  assert.ok(minTapHeight>=44);
  await page.evaluate(() => {
    const key='degree_english_50_quiz_v1';
    const state=JSON.parse(localStorage.getItem(key));
    state.index=state.questionIds.findIndex(id=>globalThis.offlineQuestionBankV731.find(q=>q.id===id)?.type==='listening');
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#resume').click();
  await page.locator('#speak').click();
  assert.match(await page.locator('#speak').innerText(),/停止朗读/);
  assert.ok((await page.evaluate(()=>window.__spoken||'')).length>0);
  await page.locator('#speak').click();
  assert.match(await page.locator('#speak').innerText(),/朗读英文/);
  await page.locator('.word-panel summary').click();
  await page.locator('[data-word]').first().click();
  await page.locator('#word-speak').click();
  assert.match(await page.locator('#word-speak').innerText(),/停止朗读/);
  await page.locator('#speak').click();
  assert.match(await page.locator('#speak').innerText(),/停止朗读/);
  assert.match(await page.locator('#word-speak').innerText(),/朗读英文/);
  await page.evaluate(() => localStorage.removeItem('degree_english_50_quiz_v1'));
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#start').click();
  assert.equal(await page.locator('.dot').count(), 50);
  assert.equal(await page.locator('.translation').count(), 0);
  assert.equal(await page.locator('.word-panel').count(), 0);
  assert.match(await page.locator('.simulation-note').innerText(), /关闭中文/);

  const audit = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('degree_english_50_quiz_v1'));
    const bank = globalThis.offlineQuestionBankV731;
    const positions = [0,0,0,0];
    const stems = new Set();
    for (const [index,id] of state.questionIds.entries()) {
      const q = bank.find(item => item.id === id);
      assertQuestion(q, id);
      positions[state.optionOrders[id].indexOf(q.answer)] += 1;
      stems.add(`${q.type==='listening'?`听音:${q.audioText||''}:`:''}${q.q}`.replace(/\s+/g,' ').trim().toLowerCase());
      if (state.optionOrders[id].length !== 4 || new Set(state.optionOrders[id]).size !== 4) throw new Error('bad option order '+id);
    }
    function assertQuestion(q,id){if(!q)throw new Error('missing '+id);}
    return {count:state.questionIds.length,uniqueIds:new Set(state.questionIds).size,uniqueStems:stems.size,positions};
  });
  assert.deepEqual(audit, {count:50,uniqueIds:50,uniqueStems:50,positions:[13,13,12,12]});

  await page.locator('.option').nth(1).click();
  await page.locator('#next').click();
  await page.reload({waitUntil:'networkidle'});
  assert.match(await page.locator('body').innerText(), /未完成的“模拟测评”/);
  await page.locator('#resume').click();
  assert.match(await page.locator('.top h1').innerText(), /2\/50/);

  await page.evaluate(() => {
    const key='degree_english_50_quiz_v1';
    const state=JSON.parse(localStorage.getItem(key));
    for(const id of state.questionIds){const q=globalThis.offlineQuestionBankV731.find(item=>item.id===id);state.answers[id]=q.answer;}
    state.unknowns[state.questionIds[0]]=true;
    state.index=49;
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#resume').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#next').click();
  await page.waitForSelector('.result-hero');
  assert.match(await page.locator('.result-hero h1').innerText(), /100 分/);
  assert.match(await page.locator('body').innerText(), /本套需巩固 1 道/);
  assert.match(await page.locator('body').innerText(), /答对但不确定/);
  await page.locator('.wrong-item').first().click();
  assert.equal(await page.locator('.example-box').count(),1);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('degree_english_50_quiz_history_v2')).length), 1);
  await page.screenshot({path:'test-output/result-mobile.png',fullPage:true});

  await page.locator('#new').click();
  await page.evaluate(() => {
    const key='degree_english_50_quiz_v1';
    const state=JSON.parse(localStorage.getItem(key));
    for(const id of state.questionIds){const q=globalThis.offlineQuestionBankV731.find(item=>item.id===id);state.answers[id]=(q.answer+1)%4;}
    state.index=49;
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#resume').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#next').click();
  await page.waitForSelector('.result-hero');
  assert.match(await page.locator('.result-hero h1').innerText(), /0 分/);
  assert.equal(await page.locator('.wrong-item').count(), 50);
  const wrongAudit=await page.evaluate(() => {
    const rows=JSON.parse(localStorage.getItem('degree_english_50_quiz_history_v2'));
    const report=JSON.parse(rows[0].report);
    const full=report.allItems || [];
    return {
      history:rows.length,
      wrong:report.wrongItems.length,
      all:full.length,
      version:report.report,
      complete:report.wrongItems.every(x=>x.question&&x.options.length===4&&x.selected&&x.correct&&x.correctText&&x.explanation),
      fullComplete:full.every(x=>x.question&&x.options.length===4&&x.selected&&x.correct&&x.correctText&&typeof x.isCorrect==='boolean'),
      bytes:new Blob([rows[0].report]).size
    };
  });
  assert.equal(wrongAudit.history,2);
  assert.equal(wrongAudit.wrong,50);
  assert.equal(wrongAudit.all,50);
  assert.equal(wrongAudit.version,'DEGREE-ENGLISH-WEB-V4.1');
  assert.equal(wrongAudit.complete,true);
  assert.equal(wrongAudit.fullComplete,true);
  assert.ok(wrongAudit.bytes<250000);

  assert.equal(await page.locator('#reinforce').count(),1);
  await page.locator('#reinforce').click();
  const reinforceAudit=await page.evaluate(() => {
    const state=JSON.parse(localStorage.getItem('degree_english_50_quiz_v1'));
    const bank=globalThis.offlineQuestionBankV731;
    const stems=state.questionIds.map(id=>{const q=bank.find(item=>item.id===id);return `${q.type==='listening'?`听音:${q.audioText||''}:`:''}${q.q}`.replace(/\s+/g,' ').trim().toLowerCase()});
    return {mode:state.mode,count:state.questionIds.length,uniqueIds:new Set(state.questionIds).size,uniqueStems:new Set(stems).size};
  });
  assert.equal(reinforceAudit.mode,'reinforce');
  assert.ok(reinforceAudit.count>=3&&reinforceAudit.count<=20);
  assert.equal(reinforceAudit.uniqueIds,reinforceAudit.count);
  assert.equal(reinforceAudit.uniqueStems,reinforceAudit.count);
  assert.match(await page.locator('.top').innerText(),/错题强化/);
  assert.equal(await page.locator('#unknown').count(),1);
  await page.locator('#unknown').click();
  assert.match(await page.locator('#unknown').innerText(),/已标记/);
  await page.screenshot({path:'test-output/reinforcement-mobile.png',fullPage:true});
  await page.locator('#home').click();
  assert.equal(await page.locator('#export-archive').count(),1);
  assert.equal(await page.locator('#import-archive').count(),1);
  const masteryAudit=await page.evaluate(() => {
    const rows=JSON.parse(localStorage.getItem('degree_english_quiz_mastery_v3'));
    return {records:Object.keys(rows).length,wrong:Object.values(rows).filter(x=>x.last==='wrong').length};
  });
  assert.ok(masteryAudit.records>=50);
  assert.equal(masteryAudit.wrong,50);

  console.log(JSON.stringify({status:'passed',contentAudit,practiceAudit,minTapHeight,audit,history:2,scoreChecks:[100,0],wrongReport:wrongAudit,reinforcement:reinforceAudit,mastery:masteryAudit}));
} finally {
  await browser.close();
}
