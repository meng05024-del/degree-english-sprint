/* 学位英语 50 题冲刺站 v3：本地优先，不主动上传学习记录。 */
(() => {
  'use strict';

  const STATE_KEY = 'degree_english_50_quiz_v1'; // 沿用旧键，保护未完成记录
  const HISTORY_KEY = 'degree_english_50_quiz_history_v2';
  const MASTERY_KEY = 'degree_english_quiz_mastery_v3';
  const app = document.querySelector('#app');
  const bank = Array.isArray(globalThis.offlineQuestionBankV731) ? globalThis.offlineQuestionBankV731 : [];
  const wordRows = typeof groups === 'object' ? Object.values(groups).flat() : [];
  const wordMap = new Map(wordRows.map(row => [String(row[0]).toLowerCase(), {en:row[0],read:row[1],cn:row[2]}]));
  let timerHandle = 0;
  let speaking = false;

  const nowIso = () => new Date().toISOString();
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const shuffle = list => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const readState = () => readJson(STATE_KEY, null);
  const saveState = state => localStorage.setItem(STATE_KEY, JSON.stringify(state));
  const readHistory = () => readJson(HISTORY_KEY, []);
  const saveHistory = rows => localStorage.setItem(HISTORY_KEY, JSON.stringify(rows.slice(0, 10)));
  const readMastery = () => readJson(MASTERY_KEY, {});
  const saveMastery = rows => localStorage.setItem(MASTERY_KEY, JSON.stringify(rows));
  const nextSequence = () => Math.max(0, ...readHistory().map(row => Number(row.sequenceNo) || 0)) + 1;
  const find = id => bank.find(q => q.id === id);
  const stemKey = q => String(q?.q || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const stopAudio = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speaking = false;
  };
  const stopTimer = () => { if (timerHandle) clearInterval(timerHandle); timerHandle = 0; };
  const leaveQuiz = () => { stopTimer(); stopAudio(); };

  function migrateState(state) {
    if (!state || !Array.isArray(state.questionIds)) return null;
    state.version = 3;
    state.answers ||= {};
    state.unknowns ||= {};
    state.mode ||= 'exam';
    state.title ||= state.mode === 'reinforce' ? '错题强化' : '50题冲刺';
    state.index = Number.isInteger(state.index) ? state.index : 0;
    state.elapsedSec = Number.isFinite(state.elapsedSec) ? state.elapsedSec : 0;
    state.optionOrders ||= {};
    state.sequenceNo ||= nextSequence();
    state.questionIds.forEach((id, index) => {
      if (!Array.isArray(state.optionOrders[id])) state.optionOrders[id] = balancedOrder(find(id), index);
    });
    saveState(state);
    return state;
  }

  function balancedOrder(question, questionIndex) {
    const correct = Number(question?.answer ?? 0);
    const distractors = shuffle([0, 1, 2, 3].filter(i => i !== correct));
    const target = questionIndex % 4;
    distractors.splice(target, 0, correct);
    return distractors;
  }

  function chooseQuestions() {
    const targets = [
      ['be动词',4], ['have/has',3], ['疑问句',4], ['否定句',3], ['冠词',3],
      ['名词复数',3], ['指示代词',3], ['代词',3], ['介词',4], ['情态动词',3],
      ['完成对话',4], ['句子翻译',5], ['核心词汇',4], ['阅读理解',4]
    ];
    const picked = [];
    const ids = new Set();
    const stems = new Set();
    const add = q => {
      if (!q || ids.has(q.id) || stems.has(stemKey(q))) return false;
      ids.add(q.id); stems.add(stemKey(q)); picked.push(q.id); return true;
    };
    targets.forEach(([cat, count]) => {
      let added = 0;
      for (const q of shuffle(bank.filter(item => item.cat === cat))) {
        if (add(q) && ++added === count) break;
      }
    });
    for (const q of shuffle(bank)) {
      if (picked.length >= 50) break;
      add(q);
    }
    return shuffle(picked).slice(0, 50);
  }

  function masteryStatus(record) {
    if (!record) return '未学习';
    if (record.last === 'unknown') return '不会';
    if (record.last === 'wrong') return '错误';
    if (record.last === 'correct' && ((record.wrong || 0) > 0 || (record.unknown || 0) > 0)) return '易出错';
    if (record.last === 'correct') return '正确';
    return '未学习';
  }

  function masterySummary() {
    const summary = {'不会':0,'错误':0,'易出错':0,'正确':0,'未学习':0};
    const records = readMastery();
    bank.forEach(q => { summary[masteryStatus(records[q.id])] += 1; });
    return summary;
  }

  function updateMastery(state) {
    const records = readMastery();
    state.questionIds.forEach(id => {
      const q = find(id);
      const chosen = state.answers[id];
      const unknown = Boolean(state.unknowns?.[id]);
      const row = records[id] || {correct:0,wrong:0,unknown:0,last:'unlearned',lastAt:''};
      if (unknown) {
        row.unknown += 1;
        row.last = chosen === q?.answer ? 'correct' : 'unknown';
      } else if (chosen === q?.answer) {
        row.correct += 1;
        row.last = 'correct';
      } else {
        row.wrong += 1;
        row.last = 'wrong';
      }
      row.lastAt = nowIso();
      records[id] = row;
    });
    saveMastery(records);
  }

  function chooseReinforcement(state) {
    const wrong = resultItems(state).filter(item => !item.correct || state.unknowns?.[item.id]);
    const categories = [...new Set(wrong.map(item => item.q?.cat).filter(Boolean))].slice(0, 6);
    const records = readMastery();
    const severity = {'不会':0,'错误':1,'易出错':2,'正确':3,'未学习':4};
    const picked = [], ids = new Set(), stems = new Set();
    const add = q => {
      if (!q || ids.has(q.id) || stems.has(stemKey(q))) return false;
      ids.add(q.id); stems.add(stemKey(q)); picked.push(q.id); return true;
    };
    categories.forEach(cat => {
      const source = shuffle(bank.filter(q => q.cat === cat && !state.questionIds.includes(q.id)))
        .sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
      source.slice(0, 3).forEach(add);
    });
    for (const item of wrong) {
      if (picked.length >= 20) break;
      for (const q of shuffle(bank.filter(candidate => candidate.cat === item.q?.cat))) {
        if (add(q)) break;
      }
    }
    return picked.slice(0, 20);
  }

  function chooseReinforcementFromReport(reportText) {
    try {
      const report = JSON.parse(reportText);
      const categories = [...new Set((report.wrongItems || []).map(item => item.category).filter(Boolean))].slice(0, 6);
      const excluded = new Set((report.wrongItems || []).map(item => item.id));
      const records = readMastery();
      const severity = {'不会':0,'错误':1,'易出错':2,'正确':3,'未学习':4};
      const picked = [], stems = new Set();
      categories.forEach(cat => {
        const candidates = shuffle(bank.filter(q => q.cat === cat && !excluded.has(q.id)))
          .sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
        let added = 0;
        for (const q of candidates) {
          if (stems.has(stemKey(q))) continue;
          stems.add(stemKey(q)); picked.push(q.id);
          if (++added === 3 || picked.length === 20) break;
        }
      });
      return picked;
    } catch { return []; }
  }

  function exportArchive() {
    const payload = JSON.stringify({
      archive:'DEGREE-ENGLISH-WEB-V3',
      exportedAt:nowIso(),
      state:readState(),
      history:readHistory(),
      mastery:readMastery()
    });
    const url = URL.createObjectURL(new Blob([payload], {type:'application/json'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `学位英语学习档案-${new Date().toISOString().slice(0,10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importArchive(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        if (payload.archive !== 'DEGREE-ENGLISH-WEB-V3' || !Array.isArray(payload.history) || typeof payload.mastery !== 'object') throw new Error('格式不正确');
        if (!confirm('导入会用文件中的学习档案替换当前网页版记录，确定继续吗？')) return;
        if (payload.state) localStorage.setItem(STATE_KEY, JSON.stringify(payload.state));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload.history.slice(0,10)));
        localStorage.setItem(MASTERY_KEY, JSON.stringify(payload.mastery));
        alert('学习档案导入成功。');
        renderHome();
      } catch {
        alert('导入失败：请选择由本网站导出的学习档案文件。');
      }
    };
    reader.readAsText(file);
  }

  function startSession(questionIds, mode = 'exam') {
    leaveQuiz();
    const optionOrders = {};
    questionIds.forEach((id, index) => { optionOrders[id] = balancedOrder(find(id), index); });
    const state = {
      version: 3,
      sessionId: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sequenceNo: nextSequence(),
      mode,
      title: mode === 'reinforce' ? '错题强化' : '50题冲刺',
      startedAt: nowIso(),
      finishedAt: null,
      elapsedSec: 0,
      questionIds,
      optionOrders,
      answers: {},
      unknowns: {},
      index: 0
    };
    saveState(state);
    renderQuiz(state);
  }

  function startQuiz() {
    leaveQuiz();
    const questionIds = chooseQuestions();
    if (questionIds.length < 50) {
      alert(`当前可用的不重复题目只有 ${questionIds.length} 道，暂时不能生成完整试卷。`);
      return;
    }
    startSession(questionIds, 'exam');
  }

  function renderHome() {
    leaveQuiz();
    const state = migrateState(readState());
    const history = readHistory();
    const active = state && !state.finishedAt;
    const mastery = masterySummary();
    const latestWithWrong = history.find(row => {
      try { return row.status === '已交卷' && JSON.parse(row.report).wrongItems?.length; }
      catch { return false; }
    });
    const historyHtml = history.length ? `<section class="card history-card"><div class="section-head"><div><p class="eyebrow dark">LOCAL HISTORY</p><h2>最近成绩</h2></div><span>${history.length} 套</span></div><div class="history-list">${history.map(row => `<article><div><strong>第 ${row.sequenceNo} 套 · ${row.status === '未完成' ? '未完成' : `${row.score} 分`}</strong><small>${esc(new Date(row.finishedAt).toLocaleString('zh-CN', {hour12:false}))} · 用时 ${formatTime(row.elapsedSec)}</small></div><button data-copy-history="${esc(row.sessionId)}">复制报告</button></article>`).join('')}</div></section>` : '';
    app.innerHTML = `<section class="hero"><p class="eyebrow">ORIGINAL SIMULATION · LOCAL FIRST</p><h1>学位英语 50 题冲刺</h1><p>完整考试发现问题，错题强化负责把问题练会。题目属于原创仿真练习，不冒充历年真题。</p></section><section class="card"><h2>一次完整闭环</h2><div class="check"><div><b>1</b><span>完成 50 题，系统记录选择、不会标记、用时和答题位置。</span></div><div><b>2</b><span>错题后自动生成同知识点强化题，并持续更新掌握状态。</span></div><div><b>3</b><span>复制错题报告发给我，我继续讲规则并出针对题。</span></div></div>${active ? `<div class="warning">你有一套未完成的“${esc(state.title)}”：已答 ${Object.keys(state.answers).length}/${state.questionIds.length}，用时 ${formatTime(state.elapsedSec)}。</div><button class="primary" id="resume">继续第 ${state.index + 1} 题</button><button class="secondary" id="restart">保存旧进度并重新出题</button>` : `<button class="primary" id="start">开始一套 50 题</button>${latestWithWrong ? '<button class="secondary" id="reinforce-latest">根据最近错题强化</button>' : ''}`}<p class="save">记录默认只保存在当前浏览器；不会自动上传个人信息。</p></section><section class="card"><div class="section-head"><div><p class="eyebrow dark">MASTERY</p><h2>掌握情况</h2></div><span>774题</span></div><p class="hint">唯一状态，按“不会 → 错误 → 易出错 → 正确 → 未学习”统计。</p><div class="mastery-grid"><div><b>${mastery['不会']}</b><span>不会</span></div><div><b>${mastery['错误']}</b><span>错误</span></div><div><b>${mastery['易出错']}</b><span>易出错</span></div><div><b>${mastery['正确']}</b><span>正确</span></div><div><b>${mastery['未学习']}</b><span>未学习</span></div></div></section>${historyHtml}<section class="card"><p class="eyebrow dark">MOVE TO ANOTHER DEVICE</p><h2>学习档案</h2><p class="hint">换手机时先导出，再在新设备导入。无需账号，也不会上传到服务器。</p><button class="secondary" id="export-archive">导出学习档案</button><button class="secondary" id="import-archive">导入学习档案</button><input id="archive-file" type="file" accept="application/json,.json" hidden></section>`;
    document.querySelector('#start')?.addEventListener('click', startQuiz);
    document.querySelector('#resume')?.addEventListener('click', () => renderQuiz(migrateState(readState())));
    document.querySelector('#restart')?.addEventListener('click', () => {
      if (confirm('当前未完成记录仍会保留到本机历史摘要中。确定重新出题吗？')) {
        archiveAbandoned(state);
        startQuiz();
      }
    });
    document.querySelector('#reinforce-latest')?.addEventListener('click', () => {
      const ids = chooseReinforcementFromReport(latestWithWrong.report);
      if (ids.length) startSession(ids, 'reinforce');
      else alert('最近错题暂时无法生成新的同类题。');
    });
    document.querySelector('#export-archive').addEventListener('click', exportArchive);
    document.querySelector('#import-archive').addEventListener('click', () => document.querySelector('#archive-file').click());
    document.querySelector('#archive-file').addEventListener('change', event => { if (event.target.files?.[0]) importArchive(event.target.files[0]); });
    document.querySelectorAll('[data-copy-history]').forEach(button => button.addEventListener('click', () => {
      const row = readHistory().find(item => item.sessionId === button.dataset.copyHistory);
      if (row?.report) copyText(row.report, '历史报告已复制。');
    }));
  }

  function archiveAbandoned(state) {
    if (!state || state.finishedAt) return;
    const history = readHistory();
    history.unshift({
      sessionId: state.sessionId,
      sequenceNo: state.sequenceNo,
      finishedAt: nowIso(),
      elapsedSec: state.elapsedSec || 0,
      score: 0,
      status: '未完成',
      report: buildReport(state, true)
    });
    saveHistory(history);
  }

  function startTimer(state) {
    stopTimer();
    timerHandle = setInterval(() => {
      state.elapsedSec = (state.elapsedSec || 0) + 1;
      saveState(state);
      const timer = document.querySelector('#elapsed');
      if (timer) timer.textContent = formatTime(state.elapsedSec);
    }, 1000);
  }

  function speakQuestion(question, button) {
    if (!('speechSynthesis' in window)) {
      alert('当前浏览器没有可用的英文朗读功能。');
      return;
    }
    if (speaking) {
      stopAudio();
      button.textContent = '🔊 朗读英文';
      button.classList.remove('playing');
      return;
    }
    stopAudio();
    const english = (String(question.q).match(/[A-Za-z][A-Za-z\s’'.,?!:;\-\n]+/g) || []).join(' ').trim();
    if (!english) {
      alert('这道题没有可朗读的英文内容。');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(english);
    utterance.lang = 'en-US';
    utterance.rate = 0.78;
    speaking = true;
    button.textContent = '⏸ 停止朗读';
    button.classList.add('playing');
    const reset = () => {
      speaking = false;
      button.textContent = '🔊 朗读英文';
      button.classList.remove('playing');
    };
    utterance.onend = reset;
    utterance.onerror = reset;
    window.speechSynthesis.speak(utterance);
  }

  function questionWords(question) {
    const source = `${question?.q || ''} ${(question?.options || []).join(' ')}`;
    const found = [];
    for (const token of source.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []) {
      const lower = token.toLowerCase();
      const candidates = [lower, lower.endsWith('ies') ? `${lower.slice(0,-3)}y` : '', lower.endsWith('es') ? lower.slice(0,-2) : '', lower.endsWith('s') ? lower.slice(0,-1) : ''];
      const row = candidates.map(key => wordMap.get(key)).find(Boolean);
      if (row && !found.some(item => item.en.toLowerCase() === row.en.toLowerCase())) found.push(row);
    }
    return found.slice(0, 14);
  }

  function renderQuiz(inputState) {
    leaveQuiz();
    const state = migrateState(inputState);
    if (!state?.questionIds?.length) return renderHome();
    if (state.finishedAt) return renderFinish(state);
    state.index = Math.max(0, Math.min(state.index, state.questionIds.length - 1));
    const q = find(state.questionIds[state.index]);
    if (!q) {
      alert('该题目在题库中不存在。你的进度仍已保留，请返回后重新进入。');
      return renderHome();
    }
    saveState(state);
    const total = state.questionIds.length;
    const chosenOriginalIndex = state.answers[q.id];
    const order = state.optionOrders[q.id];
    const options = order.map((originalIndex, displayedIndex) => `<button class="option ${chosenOriginalIndex === originalIndex ? 'selected' : ''}" data-original-index="${originalIndex}"><b>${'ABCD'[displayedIndex]}</b><span>${esc(q.options[originalIndex])}</span></button>`).join('');
    const done = state.questionIds.filter(id => state.answers[id] !== undefined || state.unknowns[id]).length;
    const dots = state.questionIds.map((id, index) => `<button class="dot ${index === state.index ? 'active' : ''} ${state.unknowns[id] ? 'unknown' : state.answers[id] !== undefined ? 'done' : ''}" data-go="${index}">${index + 1}</button>`).join('');
    const words = questionWords(q);
    const wordHelp = words.length ? `<details class="word-panel"><summary>逐个单词解释（${words.length}个）</summary><div class="word-chips">${words.map(word => `<button data-word="${esc(word.en.toLowerCase())}">${esc(word.en)}</button>`).join('')}</div><div id="word-detail" class="word-detail">点击上面的单词，查看中文和辅助读法。</div></details>` : '';
    app.innerHTML = `<div class="top"><div><p class="eyebrow dark">${state.mode === 'reinforce' ? 'TARGETED REVIEW' : 'ORIGINAL SIMULATION'}</p><h1>${esc(state.title)} · ${state.index + 1}/${total}</h1></div><button id="home">暂存退出</button></div><section class="card"><div class="progress"><i style="width:${((state.index + 1) / total * 100).toFixed(1)}%"></i></div><div class="meta"><span>${esc(q.cat || '综合')} · ${esc(q.difficulty || '基础')}</span><span id="elapsed">${formatTime(state.elapsedSec)}</span></div><div class="question">${esc(q.q)}</div><div class="question-tools"><button id="speak">🔊 朗读英文</button>${q.translation ? `<details class="translation"><summary>中 查看中文与提示</summary><div>${esc(q.translation)}</div></details>` : ''}</div>${wordHelp}<button class="unknown-button ${state.unknowns[q.id] ? 'selected' : ''}" id="unknown">${state.unknowns[q.id] ? '✓ 已标记：这题不会' : '？这题不会，加入重点复习'}</button><div class="options">${options}</div><div class="nav"><button id="prev" ${state.index === 0 ? 'disabled' : ''}>上一题</button><button class="next" id="next">${state.index === total - 1 ? '检查并交卷' : '保存并到下一题'}</button></div><div class="grid">${dots}</div><p class="save">已自动保存 · 已完成 ${done}/${total} · 可随时退出后继续</p></section>`;
    startTimer(state);
    document.querySelector('#speak').addEventListener('click', event => speakQuestion(q, event.currentTarget));
    document.querySelectorAll('[data-original-index]').forEach(element => element.addEventListener('click', () => {
      state.answers[q.id] = Number(element.dataset.originalIndex);
      saveState(state);
      renderQuiz(state);
    }));
    document.querySelector('#unknown').addEventListener('click', () => {
      state.unknowns[q.id] = !state.unknowns[q.id];
      if (!state.unknowns[q.id]) delete state.unknowns[q.id];
      saveState(state); renderQuiz(state);
    });
    document.querySelectorAll('[data-word]').forEach(button => button.addEventListener('click', () => {
      const word = wordMap.get(button.dataset.word);
      const detail = document.querySelector('#word-detail');
      if (word && detail) detail.innerHTML = `<strong>${esc(word.en)}</strong><span>中文：${esc(word.cn)}</span><span>辅助读法：${esc(word.read)}</span>`;
    }));
    document.querySelector('#prev').addEventListener('click', () => { state.index -= 1; saveState(state); renderQuiz(state); });
    document.querySelector('#next').addEventListener('click', () => {
      if (state.index < total - 1) {
        state.index += 1; saveState(state); renderQuiz(state); return;
      }
      const unanswered = state.questionIds.filter(id => state.answers[id] === undefined && !state.unknowns[id]);
      if (unanswered.length) {
        const first = state.questionIds.indexOf(unanswered[0]);
        alert(`还有 ${unanswered.length} 题未作答，已为你跳到第一道未答题。`);
        state.index = first; saveState(state); renderQuiz(state); return;
      }
      if (confirm(`${total} 题已全部完成。交卷后不能修改答案，确定交卷吗？`)) finish(state);
    });
    document.querySelectorAll('[data-go]').forEach(element => element.addEventListener('click', () => {
      state.index = Number(element.dataset.go); saveState(state); renderQuiz(state);
    }));
    document.querySelector('#home').addEventListener('click', renderHome);
  }

  function resultItems(state) {
    return state.questionIds.map((id, index) => {
      const q = find(id);
      const selectedOriginal = state.answers[id];
      const order = state.optionOrders[id] || [0, 1, 2, 3];
      const selectedPosition = selectedOriginal === undefined ? -1 : order.indexOf(selectedOriginal);
      const correctPosition = order.indexOf(q?.answer);
      return {
        n: index + 1,
        id,
        q,
        selectedOriginal,
        selectedLetter: selectedPosition < 0 ? '未答' : 'ABCD'[selectedPosition],
        correctLetter: correctPosition < 0 ? '?' : 'ABCD'[correctPosition],
        unknown: Boolean(state.unknowns?.[id]),
        correct: selectedOriginal !== undefined && selectedOriginal === q?.answer && !state.unknowns?.[id]
      };
    });
  }

  function buildReport(state, abandoned = false) {
    const items = resultItems(state);
    const correct = items.filter(item => item.correct).length;
    const allItems = items.map(item => ({
      n: item.n,
      id: item.id,
      category: item.q?.cat || '',
      question: item.q?.q || '',
      options: (state.optionOrders[item.id] || [0,1,2,3]).map(i => item.q?.options?.[i] || ''),
      selected: item.selectedLetter,
      selectedText: item.selectedOriginal === undefined ? '未答' : item.q?.options?.[item.selectedOriginal] || '',
      markedUnknown: item.unknown,
      correct: item.correctLetter,
      correctText: item.q?.options?.[item.q?.answer] || '',
      isCorrect: item.correct,
      point: item.q?.point || '',
      translation: item.q?.translation || ''
    }));
    const wrongItems = allItems.filter(item => !item.isCorrect).map(item => {
      const source = find(item.id);
      return {...item, explanation: source?.explain || ''};
    });
    const categoryStats = {};
    items.forEach(item => {
      const cat = item.q?.cat || '综合';
      categoryStats[cat] ||= {correct:0,total:0};
      categoryStats[cat].total += 1;
      if (item.correct) categoryStats[cat].correct += 1;
    });
    return JSON.stringify({
      report: 'DEGREE-ENGLISH-WEB-V3.1',
      sessionId: state.sessionId,
      sequenceNo: state.sequenceNo,
      mode: state.mode,
      title: state.title,
      status: abandoned ? '未完成' : '已交卷',
      startedAt: state.startedAt,
      finishedAt: state.finishedAt || nowIso(),
      elapsedSeconds: state.elapsedSec || 0,
      total: state.questionIds.length,
      answered: items.filter(item => item.selectedOriginal !== undefined || item.unknown).length,
      correctCount: correct,
      score: Math.round(correct / state.questionIds.length * 100),
      categoryStats,
      allItems,
      wrongItems
    });
  }

  function finish(state) {
    leaveQuiz();
    state.finishedAt = nowIso();
    saveState(state);
    updateMastery(state);
    const report = buildReport(state);
    const items = resultItems(state);
    const correct = items.filter(item => item.correct).length;
    const history = readHistory().filter(row => row.sessionId !== state.sessionId);
    history.unshift({sessionId:state.sessionId,sequenceNo:state.sequenceNo,mode:state.mode,title:state.title,finishedAt:state.finishedAt,elapsedSec:state.elapsedSec,score:Math.round(correct/state.questionIds.length*100),status:'已交卷',report});
    saveHistory(history);
    renderFinish(state);
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => alert(successMessage)).catch(() => prompt('请长按复制以下报告：', text));
    } else {
      prompt('请长按复制以下报告：', text);
    }
  }

  function renderFinish(state) {
    leaveQuiz();
    const items = resultItems(state);
    const correct = items.filter(item => item.correct).length;
    const wrong = items.filter(item => !item.correct);
    const total = state.questionIds.length;
    const score = Math.round(correct / total * 100);
    const report = buildReport(state);
    const wrongHtml = wrong.length ? wrong.map(item => `<details class="wrong-item"><summary><span>第 ${item.n} 题 · ${esc(item.q?.cat || '综合')}</span><strong>${item.unknown ? '不会' : `${item.selectedLetter} → ${item.correctLetter}`}</strong></summary><div><p class="wrong-question">${esc(item.q?.q)}</p><p><b>你的答案：</b>${esc(item.selectedOriginal === undefined ? '未选择' : item.q.options[item.selectedOriginal])}${item.unknown ? '（标记不会）' : ''}</p><p><b>正确答案：</b>${esc(item.q?.options?.[item.q?.answer] || '')}</p><p><b>为什么：</b>${esc(item.q?.explain || item.q?.point || '请把报告发给我进一步讲解。')}</p></div></details>`).join('') : `<div class="success-box">${total} 题全部正确。仍建议把报告发给我检查是否存在蒙对题。</div>`;
    app.innerHTML = `<section class="hero"><p class="eyebrow">FINISHED · SET ${state.sequenceNo}</p><h1>${esc(state.title)}已完成</h1><p>本套全部题目、选项顺序、你的选择、不会标记和错题解析都已写入本机记录。</p></section><section class="card"><p class="eyebrow dark">YOUR RESULT</p><div class="score">${score}<small> / 100</small></div><p class="hint">正确 ${correct} · 需巩固 ${total - correct} · 用时 ${formatTime(state.elapsedSec || 0)}</p><button class="primary" id="copy">复制错题报告，发给我逐题讲</button><button class="secondary" id="download">下载完整答题报告</button>${wrong.length ? '<button class="secondary" id="reinforce">生成本套错题同类强化</button>' : ''}</section><section class="card"><div class="section-head"><div><p class="eyebrow dark">WRONG ANSWERS</p><h2>本套需巩固 ${wrong.length} 道</h2></div></div><p class="hint">默认折叠。先自己想一次，再展开看答案和基础解析。</p><div class="wrong-list">${wrongHtml}</div></section><section class="card"><button class="primary" id="new">开始下一套 50 题</button><button class="secondary" id="home">返回首页与历史成绩</button></section>`;
    document.querySelector('#copy').addEventListener('click', () => copyText(report, `第 ${state.sequenceNo} 套错题报告已复制。回到聊天直接粘贴即可。`));
    document.querySelector('#download').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([report], {type:'application/json'}));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `学位英语-${state.title}-第${state.sequenceNo}套-错题报告.json`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.querySelector('#new').addEventListener('click', startQuiz);
    document.querySelector('#reinforce')?.addEventListener('click', () => {
      const ids = chooseReinforcement(state);
      if (ids.length) startSession(ids, 'reinforce');
      else alert('暂时没有足够的新同类题，请先把报告发给我补充讲解。');
    });
    document.querySelector('#home').addEventListener('click', renderHome);
  }

  if (!bank.length) {
    app.innerHTML = '<section class="card"><h2>题库加载失败</h2><p class="hint">请确认 data 文件夹与 index.html 一起上传，然后刷新页面。</p></section>';
  } else {
    renderHome();
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
