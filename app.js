/* 学位英语考前冲刺站 v4.6：本地优先，不主动上传学习记录。 */
(() => {
  'use strict';

  const STATE_KEY = 'degree_english_50_quiz_v1'; // 沿用旧键，保护未完成记录
  const HISTORY_KEY = 'degree_english_50_quiz_history_v2';
  const MASTERY_KEY = 'degree_english_quiz_mastery_v3';
  const SETTINGS_KEY = 'degree_english_sprint_settings_v4';
  const NOTE_KEY = 'degree_english_notebook_v1';
  const app = document.querySelector('#app');
  const bank = Array.isArray(globalThis.offlineQuestionBankV731) ? globalThis.offlineQuestionBankV731 : [];
  const extraWordRows = [
    ['about','额鲍特','关于；大约'],['at','艾特','在（具体时刻或地点）'],['be','比','是；成为（原形）'],['by','拜','通过；乘坐；在旁边'],
    ['clock','克洛克','钟'],['cook','库克','做饭；厨师'],['daily','得伊利','每日的；日常的'],['drive','拽夫','驾驶'],
    ['egg','艾格','鸡蛋'],['eight','艾特','八'],['else','艾尔斯','其他'],['every','艾弗瑞','每一个'],
    ['fine','发因','好的；健康的'],['finish','菲尼许','完成'],['foot','富特','脚；步行'],['football','富特博尔','足球'],
    ['for','佛尔','为了；给；持续'],['four','佛尔','四'],['from','弗若姆','从；来自'],['game','盖姆','游戏；比赛'],
    ['hard','哈德','努力地；困难的'],['here','希尔','这里'],['him','希姆','他（宾格）'],['how','好','怎样；如何'],
    ['in','因','在……里面；在较长时间范围'],['information','因佛梅申','信息'],['life','赖夫','生活；生命'],['limit','利米特','限制'],
    ['many','梅尼','许多（修饰可数名词）'],['me','米','我（宾格）'],['meet','米特','见面；遇见'],['much','马吃','许多（修饰不可数名词）'],
    ['must','马斯特','必须'],['next','奈克斯特','下一个；接下来的'],['no','讷欧','不；没有'],['noon','努恩','中午'],
    ['on','昂','在……上面；在具体某一天'],['one','万','一；一个'],['our','奥尔','我们的'],['passage','帕西吉','文章；段落'],
    ['play','普雷','玩；参加比赛'],['please','普利兹','请'],['review','瑞维优','复习；回顾'],['say','塞伊','说'],
    ['should','舒德','应该'],['six','西克斯','六'],['sleep','斯利普','睡觉'],['stay','斯得伊','停留；保持'],
    ['talk','托克','谈话'],['thank','三克','感谢'],['the','泽/子','这个；那个（定冠词）'],['their','泽尔','他们的'],
    ['there','泽尔','那里；用于There be句型'],['three','斯里','三'],['to','特/图','向；到；不定式标志'],['together','特盖泽','一起'],
    ['tomorrow','特猫肉','明天'],['too','图','也；太'],['university','优尼沃斯提','大学'],['up','阿普','向上'],
    ['us','阿斯','我们（宾格）'],['useful','优斯佛','有用的'],['wait','韦特','等待'],['what','沃特','什么'],
    ['where','韦尔','哪里'],['why','外','为什么'],['will','威尔','将；会'],['with','威兹','和；带有；用'],['yes','耶斯','是；对'],
    ['all','奥尔','全部；所有'],['arrive','额赖夫','到达'],['bag','拜格','包'],['bed','贝德','床'],['borrow','包柔','借入'],
    ['bring','布令','带来'],['cancel','坎瑟尔','取消'],['classroom','克拉斯如姆','教室'],['close','克洛兹','关闭'],['coffee','考非','咖啡'],
    ['David','得伊维德','戴维（人名）'],['drink','准克','喝；饮料'],['early','额利','早；早的'],['eat','伊特','吃'],['enough','伊纳夫','足够的'],
    ['fifteen','菲夫听','十五'],['film','菲尔姆','电影'],['grammar','格拉默','语法'],['history','黑斯特瑞','历史'],['infer','因佛','推断'],
    ['into','因图','进入……里面'],['later','雷特尔','稍后；后来'],['library','赖布瑞瑞','图书馆'],['math','麦斯','数学'],['may','梅伊','可以；可能'],
    ['miss','米斯','错过；想念'],['near','尼尔','在……附近'],['nine','耐因','九'],['only','欧恩利','只；仅仅'],['plan','普兰','计划'],
    ['practise','普拉克提斯','练习'],['prepare','普瑞佩尔','准备'],['reader','瑞德尔','读者'],['statement','斯得伊特门特','陈述；说法'],['ten','滕','十'],
    ['than','赞（舌尖轻咬）','比'],['them','泽姆（舌尖轻咬）','他们；她们；它们（宾格）'],['thirty','瑟提','三十'],['told','偷欧德','告诉（tell的过去式）'],['took','吐克','拿；乘坐（take的过去式）'],
    ['true','出如','正确的；真实的'],['visit','维兹特','参观；拜访'],['walk','沃克','步行'],['Wang','汪','王（人名）'],['watch','沃吃','观看'],
    ['which','威吃','哪一个'],['who','胡','谁'],['would','乌德','将会；愿意（较委婉）']
  ];
  const wordRows = typeof groups === 'object' ? [...Object.values(groups).flat(), ...extraWordRows] : extraWordRows;
  const wordMap = new Map(wordRows.map(row => [String(row[0]).toLowerCase(), {en:row[0],read:row[1],cn:row[2]}]));
  let timerHandle = 0;
  let speaking = false;
  let activeSpeechButton = null;
  const ANALYSIS_PAGE_SIZE = 20;
  const analysisView = {query:'', category:'全部', status:'全部', page:0, scrollY:0};

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
  const localDate = date => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };
  const readSettings = () => {
    const saved = readJson(SETTINGS_KEY, {});
    if (!saved.examDate) {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      saved.examDate = localDate(date);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    }
    return saved;
  };
  const saveSettings = settings => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  const nextSequence = () => Math.max(0, ...readHistory().map(row => Number(row.sequenceNo) || 0)) + 1;
  const find = id => bank.find(q => q.id === id);
  const stemKey = q => `${q?.type === 'listening' ? `听音:${q?.audioText || ''}:` : ''}${String(q?.q || '')}`.replace(/\s+/g, ' ').trim().toLowerCase();
  const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const stopAudio = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (activeSpeechButton) {
      activeSpeechButton.textContent = activeSpeechButton.dataset.idleLabel || '🔊 朗读英文';
      activeSpeechButton.classList.remove('playing');
    }
    activeSpeechButton = null;
    speaking = false;
  };
  const stopTimer = () => { if (timerHandle) clearInterval(timerHandle); timerHandle = 0; };
  const leaveQuiz = () => { stopTimer(); stopAudio(); };

  function migrateState(state) {
    if (!state || !Array.isArray(state.questionIds)) return null;
    state.version = 4;
    state.answers ||= {};
    state.unknowns ||= {};
    if (!state.mode || state.mode === 'exam') state.mode = 'simulation';
    state.title ||= state.mode === 'reinforce' ? '错题强化' : state.mode === 'practice' ? '冲刺练习' : state.mode === 'retest' ? '重点复测' : '模拟测评';
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

  function chooseBlueprintQuestions() {
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

  function chooseAdaptiveQuestions() {
    const records = readMastery();
    const picked = [], ids = new Set(), stems = new Set();
    const severity = {'不会':0,'错误':1,'易出错':2,'未学习':3,'正确':4};
    const add = q => {
      if (!q || ids.has(q.id) || stems.has(stemKey(q))) return false;
      ids.add(q.id); stems.add(stemKey(q)); picked.push(q.id); return true;
    };
    const addMany = (source, count) => {
      let added = 0;
      const ranked = shuffle(source).sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
      for (const q of ranked) {
        if (add(q) && ++added >= count) break;
      }
    };
    const targets = [
      ['核心词汇',5],['词汇听读',5],['句子翻译',5],['阅读理解',6],['完成对话',4],
      ['be动词',3],['have/has',2],['疑问句',3],['否定句',2],['冠词',3],
      ['名词复数',2],['指示代词',2],['代词',2],['介词',3],['情态动词',3]
    ];
    targets.forEach(([cat,count]) => addMany(bank.filter(q => q.cat === cat), count));
    addMany(bank, 50 - picked.length);
    return shuffle(picked).slice(0, 50);
  }

  function masteryStatus(record) {
    if (!record) return '未学习';
    if (record.last === 'unknown') return '不会';
    if (record.last === 'wrong') return '错误';
    if (record.last === 'mastered' || (record.correctStreak || 0) >= 2) return '正确';
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

  function analysisStatusSort(a, b, records, bankIndex) {
    const order = {'不会':0,'错误':1,'易出错':2,'正确':3,'未学习':4};
    const ar = records[a.id], br = records[b.id];
    const as = masteryStatus(ar), bs = masteryStatus(br);
    if (order[as] !== order[bs]) return order[as] - order[bs];
    if (as === '不会') return (Number(br?.unknown)||0) - (Number(ar?.unknown)||0) || (Number(br?.wrong)||0) - (Number(ar?.wrong)||0) || a.id.localeCompare(b.id);
    if (as === '错误' || as === '易出错') return (Number(br?.wrong)||0) - (Number(ar?.wrong)||0) || String(br?.lastAt||'').localeCompare(String(ar?.lastAt||'')) || a.id.localeCompare(b.id);
    if (as === '正确') return String(ar?.lastAt||'').localeCompare(String(br?.lastAt||'')) || a.id.localeCompare(b.id);
    return (bankIndex.get(a.id)||0) - (bankIndex.get(b.id)||0) || a.id.localeCompare(b.id);
  }

  function updateMastery(state) {
    const records = readMastery();
    state.questionIds.forEach(id => {
      const q = find(id);
      const chosen = state.answers[id];
      const unknown = Boolean(state.unknowns?.[id]);
      const row = records[id] || {correct:0,wrong:0,unknown:0,correctStreak:0,last:'unlearned',lastAt:''};
      row.correctStreak = Number(row.correctStreak) || 0;
      if (unknown) {
        row.unknown += 1;
        row.correctStreak = 0;
        row.last = 'unknown';
      } else if (chosen === q?.answer) {
        row.correct += 1;
        row.correctStreak += 1;
        row.last = row.correctStreak >= 2 ? 'mastered' : 'correct';
      } else {
        row.wrong += 1;
        row.correctStreak = 0;
        row.last = 'wrong';
      }
      row.lastAt = nowIso();
      records[id] = row;
    });
    saveMastery(records);
  }

  function chooseReinforcement(state) {
    const wrong = resultItems(state).filter(item => !item.correct || state.unknowns?.[item.id]);
    const records = readMastery();
    const severity = {'不会':0,'错误':1,'易出错':2,'正确':3,'未学习':4};
    const picked = [], ids = new Set(), stems = new Set();
    const add = q => {
      if (!q || ids.has(q.id) || stems.has(stemKey(q))) return false;
      ids.add(q.id); stems.add(stemKey(q)); picked.push(q.id); return true;
    };
    for (const item of wrong) {
      if (picked.length >= 20) break;
      const samePoint = shuffle(bank.filter(q => q.point === item.q?.point && !state.questionIds.includes(q.id)))
        .sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
      let added = 0;
      for (const q of samePoint) {
        if (add(q) && ++added === 4) break;
      }
    }
    for (const item of wrong) {
      if (picked.length >= 20) break;
      const sameCategory = shuffle(bank.filter(q => q.cat === item.q?.cat && !state.questionIds.includes(q.id)))
        .sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
      for (const q of sameCategory) if (add(q)) break;
    }
    return picked.slice(0, 20);
  }

  function chooseReinforcementFromReport(reportText) {
    try {
      const report = JSON.parse(reportText);
      const reviewItems = report.wrongItems || [];
      const excluded = new Set((report.wrongItems || []).map(item => item.id));
      const records = readMastery();
      const severity = {'不会':0,'错误':1,'易出错':2,'正确':3,'未学习':4};
      const picked = [], ids = new Set(), stems = new Set();
      const add = q => {
        if (!q || ids.has(q.id) || stems.has(stemKey(q))) return false;
        ids.add(q.id); stems.add(stemKey(q)); picked.push(q.id); return true;
      };
      reviewItems.forEach(item => {
        const candidates = shuffle(bank.filter(q => q.point === item.point && !excluded.has(q.id)))
          .sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
        let added = 0;
        for (const q of candidates) {
          if (add(q) && ++added === 4 || picked.length === 20) break;
        }
      });
      for (const item of reviewItems) {
        if (picked.length === 20) break;
        for (const q of shuffle(bank.filter(q => q.cat === item.category && !excluded.has(q.id)))) if (add(q)) break;
      }
      return picked;
    } catch { return []; }
  }

  function exportArchive() {
    const payload = JSON.stringify({
      archive:'DEGREE-ENGLISH-WEB-V4.5',
      exportedAt:nowIso(),
      state:readState(),
      history:readHistory(),
      mastery:readMastery(),
      settings:readSettings()
      ,notebook:readJson(NOTE_KEY,{})
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
        if (!['DEGREE-ENGLISH-WEB-V3','DEGREE-ENGLISH-WEB-V4','DEGREE-ENGLISH-WEB-V4.1','DEGREE-ENGLISH-WEB-V4.2','DEGREE-ENGLISH-WEB-V4.3','DEGREE-ENGLISH-WEB-V4.4','DEGREE-ENGLISH-WEB-V4.5'].includes(payload.archive) || !Array.isArray(payload.history) || typeof payload.mastery !== 'object') throw new Error('格式不正确');
        if (!confirm('导入会用文件中的学习档案替换当前网页版记录，确定继续吗？')) return;
        if (payload.state) localStorage.setItem(STATE_KEY, JSON.stringify(payload.state));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload.history.slice(0,10)));
        localStorage.setItem(MASTERY_KEY, JSON.stringify(payload.mastery));
        if (payload.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
        if (payload.notebook && typeof payload.notebook === 'object' && !Array.isArray(payload.notebook)) localStorage.setItem(NOTE_KEY, JSON.stringify(payload.notebook));
        if (!payload.state) localStorage.removeItem(STATE_KEY);
        alert('学习档案导入成功。');
        renderHome();
      } catch {
        alert('导入失败：请选择由本网站导出的学习档案文件。');
      }
    };
    reader.readAsText(file);
  }

  function startSession(questionIds, mode = 'simulation') {
    leaveQuiz();
    const optionOrders = {};
    questionIds.forEach((id, index) => { optionOrders[id] = balancedOrder(find(id), index); });
    const state = {
      version: 4,
      sessionId: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sequenceNo: nextSequence(),
      mode,
      title: mode === 'reinforce' ? '错题强化' : mode === 'practice' ? '冲刺练习' : mode === 'retest' ? '重点复测' : '模拟测评',
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
    const questionIds = chooseBlueprintQuestions();
    if (questionIds.length < 50) {
      alert(`当前可用的不重复题目只有 ${questionIds.length} 道，暂时不能生成完整试卷。`);
      return;
    }
    startSession(questionIds, 'simulation');
  }

  function startPractice() {
    leaveQuiz();
    const questionIds = chooseAdaptiveQuestions();
    if (questionIds.length < 50) {
      alert(`当前可用的不重复题目只有 ${questionIds.length} 道，暂时不能生成完整练习。`);
      return;
    }
    startSession(questionIds, 'practice');
  }

  function startQuickCheck() {
    const questionIds = chooseAdaptiveQuestions().slice(0, 10);
    if (questionIds.length < 10) {
      alert('当前题库暂时不能生成10题热身，请刷新后重试。');
      return;
    }
    startSession(questionIds, 'retest');
  }

  function chooseRetestFromReport(reportText) {
    try {
      const report = JSON.parse(reportText);
      const reviewItems = report.wrongItems || [];
      const weakPoints = reviewItems.map(item => item.point).filter(Boolean);
      const weak = reviewItems.map(item => item.category).filter(Boolean);
      const ranked = Object.entries(report.categoryStats || {}).sort((a,b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total)).map(([cat]) => cat);
      const categories = [...new Set([...weak, ...ranked])].slice(0, 4);
      const excluded = new Set((report.allItems || []).map(item => item.id));
      const picked = [], stems = new Set();
      const candidates = bank.filter(item => weakPoints.includes(item.point) && !excluded.has(item.id));
      for (const q of shuffle(candidates)) {
        if (stems.has(stemKey(q))) continue;
        stems.add(stemKey(q)); picked.push(q.id);
        if (picked.length === 10) break;
      }
      for (const q of shuffle(bank.filter(item => categories.includes(item.cat) && !excluded.has(item.id)))) {
        if (picked.length === 10) break;
        if (stems.has(stemKey(q))) continue;
        stems.add(stemKey(q)); picked.push(q.id);
      }
      for (const q of shuffle(bank)) {
        if (picked.length === 10) break;
        if (excluded.has(q.id) || stems.has(stemKey(q))) continue;
        stems.add(stemKey(q)); picked.push(q.id);
      }
      return picked;
    } catch { return []; }
  }

  function modeLabel(mode) {
    return mode === 'reinforce' ? '错题强化' : mode === 'practice' ? '冲刺练习' : mode === 'retest' ? '重点复测' : '模拟测评';
  }

  function examCountdown(examDate) {
    const today = new Date(`${localDate(new Date())}T00:00:00`);
    const target = new Date(`${examDate}T00:00:00`);
    const days = Number.isFinite(target.getTime()) ? Math.ceil((target - today) / 86400000) : 3;
    return {days, label:days > 0 ? `D-${days}` : days === 0 ? '考试当天' : `已过 ${Math.abs(days)} 天`};
  }

  function sprintPlan(days) {
    if (days <= 0) return [
      ['轻量热身','只做10题找手感，不再开新知识'],['高频回看','复习不会、错误和固定搭配'],['考场确认','检查时间、证件与答题顺序']
    ];
    if (days === 1) return [
      ['最后模拟','完成一套后停止追求新题'],['重点回炉','只补最弱的两个具体考点'],['考前确认','10题稳定手感，早点休息']
    ];
    if (days === 2) return [
      ['定时模拟','50题关闭提示，检查真实水平'],['集中补漏','针对错题生成同考点变式'],['易错复测','10题确认刚补内容']
    ];
    return [
      ['模拟摸底','50题关闭提示，先找到真正薄弱项'],['薄弱强化','针对错题生成同考点变式'],['重点复测','10题确认是否真正掌握']
    ];
  }

  function renderGoGuide(parent = 'home') {
    leaveQuiz();
    app.innerHTML = `<header class="guide-header"><button id="guide-back" aria-label="返回首页">←</button><div><p class="eyebrow dark">零基础语法急救 01</p><h1>go 和 goes 到底怎么选</h1><p>先认主语，再看时间和助动词</p></div></header>
      <section class="card guide-lead"><span class="guide-badge">先记这一句</span><h2>意思一样，使用的人不一样</h2><p><b>go</b> 和 <b>goes</b> 都表示“去”。<b>go</b> 是动词原形；<b>goes</b> 是一般现在时里，主语为 he、she、it 或一个人/一个事物时的形式。</p><div class="audio-pair"><button data-guide-speak="go">🔊 go /ɡəʊ/</button><button data-guide-speak="goes">🔊 goes /ɡəʊz/</button></div></section>
      <section class="card guide-card"><h2>第一步：看谁去</h2><div class="rule-split"><article><span>用 go</span><b>I / you / we / they</b><p>复数的人或事物也用 go。</p><em>I go to work every day.</em></article><article><span>用 goes</span><b>he / she / it</b><p>一个人名或一个单数事物也用 goes。</p><em>She goes to work every day.</em></article></div><div class="parse-line"><b>She</b><span>主语：谁</span><b>goes</b><span>谓语：做什么</span><b>to work</b><span>去哪里</span></div><p class="memory-line">口诀：我、你、我们、他们用 <b>go</b>；他、她、它、一个人用 <b>goes</b>。</p></section>
      <section class="card guide-card"><h2>第二步：看到 does，后面必须用 go</h2><div class="formula-list"><p><span>肯定句</span>She <b>goes</b> to work.</p><p><span>疑问句</span><b>Does</b> she <b>go</b> to work?</p><p><span>否定句</span>She <b>does not go</b> to work.</p></div><div class="warning">不能写 <s>Does she goes</s>。因为 <b>does</b> 已经承担了第三人称单数变化，后面的动词恢复原形 <b>go</b>。</div></section>
      <section class="card guide-card"><h2>第三步：先找时间词</h2><div class="form-table"><div><span>一般现在</span><b>go / goes</b><small>every day、usually、often</small></div><div><span>一般过去</span><b>went</b><small>yesterday、last、ago</small></div><div><span>将来或情态</span><b>will/can + go</b><small>tomorrow、will、can、must、should</small></div><div><span>正在发生</span><b>am/is/are going</b><small>now、look、listen</small></div></div><p class="hint">Did she <b>go</b>? 不能写 did she went；will、can、must、should 后面也都用原形 go。</p></section>
      <section class="card guide-card"><h2>考试常见固定搭配</h2><div class="phrase-list"><p><b>go to work</b><span>去上班</span></p><p><b>go to school</b><span>去上学</span></p><p><b>go home</b><span>回家；home 前通常不加 to</span></p><p><b>go by bus</b><span>乘公交出行</span></p><p><b>go shopping</b><span>去购物</span></p></div></section>
      <section class="card guide-card"><h2>马上自测5题</h2><ol class="mini-quiz"><li>I ___ to work every day.</li><li>She ___ to work every day.</li><li>Does Tom ___ to school?</li><li>Mary did not ___ there yesterday.</li><li>They will ___ home tomorrow.</li></ol><details class="answer-reveal"><summary>做完再看答案</summary><p><b>go、goes、go、go、go</b></p><p>第2题主语是 she，所以用 goes；第3题有 does、第4题有 did、第5题有 will，后面的动词全部恢复原形 go。</p></details></section>
      <section class="card guide-card"><h2>你只需要按这个顺序判断</h2><div class="decision-steps"><p><b>1</b><span>先找主语：是 he/she/it/一个人吗？</span></p><p><b>2</b><span>再找 did、does、will、can 等提示词。</span></p><p><b>3</b><span>最后找 yesterday、every day、tomorrow 等时间词。</span></p></div><button class="primary" id="guide-done">我看懂了，返回做题</button></section>`;
    const back = () => parent === 'analysis' ? renderAnalysisCenter(true) : renderHome();
    document.querySelector('#guide-back')?.addEventListener('click', back);
    document.querySelector('#guide-done')?.addEventListener('click', back);
    document.querySelectorAll('[data-guide-speak]').forEach(button => button.addEventListener('click', event => speakQuestion({q:button.dataset.guideSpeak,audioText:button.dataset.guideSpeak}, event.currentTarget)));
    window.scrollTo(0,0);
  }

  function analysisOrder(question) {
    const correct = Number(question?.answer || 0);
    const others = [0,1,2,3].filter(index => index !== correct);
    const target = Math.max(0, bank.findIndex(item => item.id === question.id)) % 4;
    others.splice(target, 0, correct);
    return others;
  }

  function analysisMatches(question, query) {
    if (!query) return true;
    const haystack = [question.q, ...(question.options || []), question.translation, question.point, question.explain, question.cat].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function renderAnalysisCenter(restoreScroll = false) {
    leaveQuiz();
    const records = readMastery();
    const bankIndex = new Map(bank.map((question,index) => [question.id,index]));
    const categories = [...new Set(bank.map(question => question.cat || '综合'))].sort((a,b) => a.localeCompare(b,'zh-CN'));
    const base = bank.filter(question => (analysisView.category === '全部' || question.cat === analysisView.category) && analysisMatches(question, analysisView.query));
    const filtered = base.filter(question => analysisView.status === '全部' || masteryStatus(records[question.id]) === analysisView.status).sort((a,b) => analysisStatusSort(a,b,records,bankIndex));
    const pageCount = Math.max(1, Math.ceil(filtered.length / ANALYSIS_PAGE_SIZE));
    analysisView.page = Math.max(0, Math.min(analysisView.page, pageCount - 1));
    const pageRows = filtered.slice(analysisView.page * ANALYSIS_PAGE_SIZE, (analysisView.page + 1) * ANALYSIS_PAGE_SIZE);
    const counts = {'不会':0,'错误':0,'易出错':0,'正确':0,'未学习':0};
    base.forEach(question => { counts[masteryStatus(records[question.id])] += 1; });
    const rowsHtml = pageRows.length ? pageRows.map((question,index) => {
      const status = masteryStatus(records[question.id]);
      const number = bankIndex.get(question.id) + 1;
      return `<button class="analysis-row" data-analysis-id="${esc(question.id)}"><span><small>第 ${number} 题 · ${esc(question.cat || '综合')}</small><b>${esc(String(question.q || '').replace(/\s+/g,' ').slice(0,92))}</b><em>${esc(question.point || '查看完整解析')}</em></span><strong class="status-${status}">${status}</strong><i>›</i></button>`;
    }).join('') : '<div class="analysis-empty"><b>没有找到符合条件的题目</b><p>请清空搜索词，或者切换分类和掌握状态。</p><button id="analysis-reset">清空筛选</button></div>';
    app.innerHTML = `<header class="guide-header analysis-header"><button id="analysis-home" aria-label="返回首页">←</button><div><p class="eyebrow dark">零基础全题解析</p><h1>791题解析中心</h1><p>每题均有逐词、发音、结构和四个选项原因</p></div></header><section class="card analysis-tools"><form id="analysis-search"><label>搜索题目、单词或考点<input id="analysis-query" type="search" value="${esc(analysisView.query)}" placeholder="例如：some、过去时、Do they"></label><button>搜索</button></form><div class="analysis-filters"><label>题型<select id="analysis-category"><option>全部</option>${categories.map(category => `<option ${analysisView.category === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}</select></label><label>掌握状态<select id="analysis-status">${['全部','不会','错误','易出错','正确','未学习'].map(status => `<option ${analysisView.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label></div><div class="status-summary">${Object.entries(counts).map(([status,count]) => `<span><b>${count}</b>${status}</span>`).join('')}</div><p class="hint compact">当前找到 ${filtered.length} 题 · 默认按“不会 → 错误 → 易出错 → 正确 → 未学习”排序</p><button class="secondary" id="analysis-go-guide">专项讲解：go 和 goes</button></section><section class="card analysis-list-card"><div class="section-head"><div><h2>${esc(analysisView.category === '全部' ? '全部题型' : analysisView.category)}</h2><p class="hint compact">第 ${analysisView.page + 1}/${pageCount} 页 · 本页 ${pageRows.length} 题</p></div><span>${filtered.length} 题</span></div><div class="analysis-list">${rowsHtml}</div>${filtered.length ? `<div class="analysis-pagination"><button id="analysis-prev" ${analysisView.page === 0 ? 'disabled' : ''}>上一页</button><span>${analysisView.page + 1} / ${pageCount}</span><button id="analysis-next" ${analysisView.page >= pageCount - 1 ? 'disabled' : ''}>下一页</button></div>` : ''}</section>`;
    document.querySelector('#analysis-home').addEventListener('click', renderHome);
    document.querySelector('#analysis-go-guide').addEventListener('click', () => renderGoGuide('analysis'));
    document.querySelector('#analysis-search').addEventListener('submit', event => { event.preventDefault(); analysisView.query = document.querySelector('#analysis-query').value.trim(); analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-category').addEventListener('change', event => { analysisView.category = event.target.value; analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-status').addEventListener('change', event => { analysisView.status = event.target.value; analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-reset')?.addEventListener('click', () => { analysisView.query=''; analysisView.category='全部'; analysisView.status='全部'; analysisView.page=0; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelector('#analysis-prev')?.addEventListener('click', () => { analysisView.page -= 1; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelector('#analysis-next')?.addEventListener('click', () => { analysisView.page += 1; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelectorAll('[data-analysis-id]').forEach(button => button.addEventListener('click', () => { analysisView.scrollY=window.scrollY; renderQuestionAnalysis(button.dataset.analysisId); }));
    requestAnimationFrame(() => window.scrollTo(0, restoreScroll ? analysisView.scrollY : 0));
  }

  function renderQuestionAnalysis(id, returnTo = null) {
    leaveQuiz();
    const question = find(id);
    if (!question) return renderAnalysisCenter(true);
    const records = readMastery();
    const status = masteryStatus(records[id]);
    const order = analysisOrder(question);
    const similar = similarExample(question,id);
    app.innerHTML = `<header class="guide-header"><button id="analysis-back" aria-label="返回题库解析中心">←</button><div><p class="eyebrow dark">第 ${bank.findIndex(item => item.id === id) + 1} / ${bank.length} 题 · ${esc(question.cat || '综合')}</p><h1>单题完整解析</h1><p>${status} · ${esc(question.difficulty || '基础')} · ${esc(question.sourceLabel || '原创仿真题')}</p></div></header><section class="card analysis-question-card"><div class="analysis-question-head"><span>${esc(question.point || question.cat || '综合')}</span><b class="status-${status}">${status}</b></div><div class="question">${esc(question.q)}</div><button class="secondary analysis-speak" id="analysis-speak">🔊 朗读题目英文</button>${question.translation ? `<div class="analysis-translation"><b>整句中文与提示</b><p>${esc(question.translation)}</p></div>` : ''}${wordHelpPanel(question,'本题全部单词')}${solutionPanel(question,order)}${similar ? `<div class="example-box"><b>同考点再看一题</b><p>${esc(similar.q)}</p><p><strong>答案：</strong>${esc(similar.options[similar.answer])}</p><p><strong>解析：</strong>${esc(similar.explain || similar.point)}</p></div>` : ''}</section><section class="card"><button class="primary" id="analysis-back-bottom">返回题库解析中心</button></section>`;
    const back = returnTo || (() => renderAnalysisCenter(true));
    document.querySelector('#analysis-back').addEventListener('click', back);
    document.querySelector('#analysis-back-bottom').addEventListener('click', back);
    document.querySelector('#analysis-speak').addEventListener('click', event => speakQuestion(question,event.currentTarget));
    attachStudyMarks(question);
    bindWordSpeech();
    window.scrollTo(0,0);
  }

  function renderHome() {
    leaveQuiz();
    const state = migrateState(readState());
    const history = readHistory();
    const active = state && !state.finishedAt;
    const mastery = masterySummary();
    const settings = readSettings();
    const countdown = examCountdown(settings.examDate);
    const plan = sprintPlan(countdown.days);
    const today = localDate(new Date());
    const finishedToday = history.filter(row => row.status === '已交卷' && row.finishedAt && localDate(new Date(row.finishedAt)) === today);
    const simulationDone = finishedToday.some(row => !row.mode || ['exam','simulation'].includes(row.mode));
    const latestTodaySimulation = finishedToday.find(row => !row.mode || ['exam','simulation'].includes(row.mode));
    let simulationReviewCount = 0;
    try { simulationReviewCount = JSON.parse(latestTodaySimulation?.report || '{}').wrongItems?.length || 0; } catch {}
    const reinforcementDone = finishedToday.some(row => row.mode === 'reinforce') || (simulationDone && simulationReviewCount === 0);
    const retestDone = finishedToday.some(row => row.mode === 'retest');
    const latestWithWrong = history.find(row => {
      try { return row.status === '已交卷' && JSON.parse(row.report).wrongItems?.length; }
      catch { return false; }
    });
    let todayAction = {id:'today-start', text:'开始今天的模拟测评', kind:'simulation'};
    if (simulationDone && latestWithWrong && !reinforcementDone) todayAction = {id:'today-reinforce', text:'强化刚才最弱知识点', kind:'reinforce'};
    else if (simulationDone && !retestDone) todayAction = {id:'today-retest', text:'开始 10 题重点复测', kind:'retest'};
    else if (simulationDone && reinforcementDone && retestDone) todayAction = {id:'today-practice', text:'今日任务已完成 · 轻量巩固', kind:'practice'};
    if (countdown.days <= 0 && !retestDone) todayAction = {id:'today-quick', text:'开始 10 题轻量热身', kind:'retest'};
    const doneCount = [simulationDone, reinforcementDone, retestDone].filter(Boolean).length;
    const historyHtml = history.length ? `<section class="card history-card"><div class="section-head"><div><h2>最近成绩</h2><p class="hint compact">每套完整答题记录仅保存在当前浏览器</p></div><span>${history.length} 套</span></div><div class="history-list">${history.map(row => `<article><div><strong>第 ${row.sequenceNo} 套 · ${modeLabel(row.mode)} · ${row.status === '未完成' ? '未完成' : `${row.score} 分`}</strong><small>${esc(new Date(row.finishedAt).toLocaleString('zh-CN', {hour12:false}))} · 用时 ${formatTime(row.elapsedSec)}</small></div><button data-copy-history="${esc(row.sessionId)}">复制报告</button></article>`).join('')}</div></section>` : '';
    app.innerHTML = `<section class="hero sprint-hero"><div><p class="eyebrow">考前冲刺计划</p><h1>${esc(countdown.label)} · 今天先完成一件事</h1><p>系统根据你的错题安排下一步。这里是原创仿真练习，不冒充官方真题。</p></div><label class="exam-date">考试日期<input id="exam-date" type="date" value="${esc(settings.examDate)}"></label></section><section class="card today-card"><div class="section-head"><div><h2>今日任务 ${doneCount}/3</h2><p class="hint compact">先测 → 补弱 → 再测；完成后就可以停</p></div><span>${active ? '进行中' : '约 30–45 分钟'}</span></div><div class="task-list"><div class="${simulationDone ? 'done' : ''}"><b>${simulationDone ? '✓' : '1'}</b><span><strong>模拟测评</strong><small>50 题，不显示中文和逐词提示</small></span></div><div class="${reinforcementDone ? 'done' : ''}"><b>${reinforcementDone ? '✓' : '2'}</b><span><strong>薄弱强化</strong><small>针对错题与不会的知识点</small></span></div><div class="${retestDone ? 'done' : ''}"><b>${retestDone ? '✓' : '3'}</b><span><strong>重点复测</strong><small>10 题确认是否真正掌握</small></span></div></div>${active ? `<div class="warning">你有一套未完成的“${esc(state.title)}”：已答 ${Object.keys(state.answers).length}/${state.questionIds.length}，用时 ${formatTime(state.elapsedSec)}。</div><button class="primary" id="resume">继续第 ${state.index + 1} 题</button><button class="secondary" id="restart">保存旧进度并重新出题</button>` : `<button class="primary" id="${todayAction.id}">${todayAction.text}</button>`}<p class="save">答案、题号和时间自动保存；“不会”不再扣考试分，只影响掌握度。</p></section>${active ? '<section class="card"><h2>先完成当前任务</h2><p class="hint">为避免覆盖未完成答案，其他训练入口会在本套交卷或保存旧进度后恢复。</p></section>' : `<section class="card mode-card"><h2>两种训练方式</h2><div class="mode-grid"><button id="start-practice"><strong>冲刺练习</strong><span>可看中文、逐词解释；第二套起优先抽薄弱项</span></button><button id="start"><strong>模拟测评</strong><span>关闭学习提示，只测当前真实答题水平</span></button></div>${latestWithWrong ? '<button class="secondary" id="reinforce-latest">继续最近错题强化</button>' : ''}</section>`}<section class="card"><div class="section-head"><div><h2>掌握情况</h2></div><span>${bank.length} 题</span></div><p class="hint">连续两次稳定答对后转为“正确”；标记不会或答错会重新进入重点复习。</p><div class="mastery-grid"><div><b>${mastery['不会']}</b><span>不会</span></div><div><b>${mastery['错误']}</b><span>错误</span></div><div><b>${mastery['易出错']}</b><span>易出错</span></div><div><b>${mastery['正确']}</b><span>正确</span></div><div><b>${mastery['未学习']}</b><span>未学习</span></div></div></section>${historyHtml}<details class="card archive-card"><summary>学习档案与换设备</summary><p class="hint">换手机时先导出，再在新设备导入。记录不会自动上传。</p><button class="secondary" id="export-archive">导出学习档案</button><button class="secondary" id="import-archive">导入学习档案</button><input id="archive-file" type="file" accept="application/json,.json" hidden></details>`;
    const masteryHint = document.querySelector('.mastery-grid')?.previousElementSibling;
    if (masteryHint) masteryHint.textContent = '曾经答错或标记不会的题，需要连续两次稳定答对才恢复为“正确”；再次答错会重新进入重点复习。';
    const masteryCard = document.querySelector('.mastery-grid')?.closest('.card');
    if (masteryCard) {
      const guideEntry = document.createElement('section');
      guideEntry.className = 'card guide-entry all-guide-entry';
      guideEntry.innerHTML = `<div><span>零基础全题解析</span><h2>${bank.length}题，全部可以查解析</h2><p>搜索或按题型查找；每题都有逐词、中文和发音、句子结构，以及 A–D 每项原因。</p></div><div class="guide-actions"><button id="open-analysis-center">打开${bank.length}题解析中心</button><button class="guide-minor" id="start-guided">开始解析练习</button></div>`;
      masteryCard.before(guideEntry);
      guideEntry.querySelector('#open-analysis-center')?.addEventListener('click', renderAnalysisCenter);
      guideEntry.querySelector('#start-guided')?.addEventListener('click', () => active ? renderQuiz(migrateState(readState())) : startPractice());
      if (active) guideEntry.querySelector('#start-guided').textContent = '继续未完成练习';
      const notebook = document.createElement('section'); notebook.className = 'card';
      const entries = Object.values(readJson(NOTE_KEY,{}));
      const due = entries.filter(row => row.kind !== 'favorite' && Number(row.due) <= Date.now()).length;
      notebook.innerHTML = `<h2>收藏与记忆复习</h2><p class="hint">${due} 项到期复习 · ${entries.filter(row => row.kind === 'favorite').length} 道收藏题</p><button id="open-notebook" class="primary">打开我的复习本</button>`;
      guideEntry.after(notebook);
      notebook.querySelector('#open-notebook').onclick = () => renderNotebook();
    }
    document.querySelectorAll('.task-list > div').forEach((row,index) => {
      const title = row.querySelector('strong');
      const detail = row.querySelector('small');
      if (title) title.textContent = plan[index][0];
      if (detail) detail.textContent = plan[index][1];
    });
    document.querySelector('#start')?.addEventListener('click', startQuiz);
    document.querySelector('#start-practice')?.addEventListener('click', startPractice);
    document.querySelector('#today-start')?.addEventListener('click', startQuiz);
    document.querySelector('#today-practice')?.addEventListener('click', startPractice);
    document.querySelector('#today-quick')?.addEventListener('click', startQuickCheck);
    document.querySelector('#today-reinforce')?.addEventListener('click', () => {
      const ids = chooseReinforcementFromReport(latestWithWrong?.report || '');
      if (ids.length) startSession(ids, 'reinforce'); else startPractice();
    });
    document.querySelector('#today-retest')?.addEventListener('click', () => {
      const source = latestWithWrong || history.find(row => row.status === '已交卷');
      const ids = chooseRetestFromReport(source?.report || '');
      if (ids.length) startSession(ids, 'retest'); else startPractice();
    });
    document.querySelector('#exam-date')?.addEventListener('change', event => {
      saveSettings({...settings, examDate:event.target.value || settings.examDate});
      renderHome();
    });
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
    document.querySelector('#export-archive')?.addEventListener('click', exportArchive);
    document.querySelector('#import-archive')?.addEventListener('click', () => document.querySelector('#archive-file')?.click());
    document.querySelector('#archive-file')?.addEventListener('change', event => { if (event.target.files?.[0]) importArchive(event.target.files[0]); });
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
      mode: state.mode,
      title: state.title,
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
    if (speaking && activeSpeechButton === button) {
      stopAudio();
      return;
    }
    stopAudio();
    const english = String(question.audioText || '').trim() || (String(question.q).match(/[A-Za-z][A-Za-z\s’'.,?!:;\-\n]+/g) || []).join(' ').trim();
    if (!english) {
      alert('这道题没有可朗读的英文内容。');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(english);
    utterance.lang = 'en-US';
    utterance.rate = 0.78;
    utterance.volume = 1;
    utterance.pitch = 1;
    speaking = true;
    button.dataset.idleLabel = button.textContent;
    activeSpeechButton = button;
    button.textContent = '⏸ 停止朗读';
    button.classList.add('playing');
    const reset = () => {
      if (activeSpeechButton !== button) return;
      speaking = false;
      button.textContent = button.dataset.idleLabel || '🔊 朗读英文';
      button.classList.remove('playing');
      activeSpeechButton = null;
    };
    utterance.onend = reset;
    utterance.onerror = () => {
      reset();
      alert('朗读失败。请确认手机媒体音量已打开，并在系统“文字转语音”设置中下载英语语音包。');
    };
    window.speechSynthesis.speak(utterance);
  }

  function questionWords(question) {
    const prompt = String(question?.q || '').replace(/(^|\n)[AB]:/g, '$1');
    const source = `${prompt} ${(question?.options || []).join(' ')}`;
    const found = [];
    for (const token of source.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []) {
      const lower = token.toLowerCase();
      const irregular = {went:'go',gone:'go',was:'be',were:'be',been:'be',did:'do',done:'do',had:'have',children:'child',men:'man',women:'woman',took:'take',told:'tell',lost:'lose'};
      const possessive = lower.endsWith("'s") ? lower.slice(0,-2) : '';
      const candidates = [lower, possessive, irregular[lower] || '', lower.endsWith('ies') ? `${lower.slice(0,-3)}y` : '', lower.endsWith('ing') ? lower.slice(0,-3) : '', lower.endsWith('ing') ? `${lower.slice(0,-3)}e` : '', lower.endsWith('ed') ? lower.slice(0,-2) : '', lower.endsWith('ed') ? `${lower.slice(0,-1)}` : '', lower.endsWith('es') ? lower.slice(0,-2) : '', lower.endsWith('s') ? lower.slice(0,-1) : ''];
      const row = candidates.map(key => wordMap.get(key)).find(Boolean);
      if (row && !found.some(item => item.surface.toLowerCase() === lower)) {
        let form = '';
        if (possessive && row.en.toLowerCase() === possessive) form = `${token} 表示“${row.cn.replace(/；.*/, '')}的”`;
        else if (lower !== row.en.toLowerCase()) form = `${token} 是 ${row.en} 的变化形式`;
        found.push({...row, surface:token, form});
      }
    }
    return found;
  }

  function questionCue(question) {
    const text = String(question?.q || '').replace(/^A:\s*/i,'').split('\n')[0];
    if (/^Do\s+they\b/i.test(text)) return '问句以 Do 开头，主语是 they，简短回答必须继续用 they，并用 do 或 do not。';
    if (/^Does\s+she\b/i.test(text)) return '问句以 Does 开头，主语是 she，简短回答用 she does 或 she does not。';
    if (/^Is\s+this\b/i.test(text)) return '问句以 Is this 开头，回答用 Yes, it is 或 No, it is not。';
    if (/^Are\s+those\b/i.test(text)) return '问句以 Are those 开头，回答用 they are 或 they are not。';
    if (/^Can\s+you\b/i.test(text)) return '问句以 Can you 开头，回答用 I can 或 I cannot。';
    if (/^What\s+is\s+your\s+name/i.test(text)) return '这是询问姓名，回答应说明 My name is...。';
    if (/^How\s+are\s+you/i.test(text)) return '这是问候，回答应说明自己的状态，如 I am fine。';
    if (/^Where\s+are\s+you\s+from/i.test(text)) return '这是询问来自哪里，回答应使用 I am from...。';
    if (/^What\s+time\s+is\s+it/i.test(text)) return '这是询问时间，回答应使用 It is + 时间。';
    return question?.point ? `本题考查“${question.point}”。` : '先看题目问什么，再选择语法和意思都能接上的答案。';
  }

  function answerUse(option) {
    const text = String(option || '');
    if (/my name is/i.test(text)) return '用来回答“你叫什么名字”';
    if (/i am fine/i.test(text)) return '用来回答“How are you”问候';
    if (/i am from/i.test(text)) return '用来回答“你来自哪里”';
    if (/it is eight|o.?clock/i.test(text)) return '用来回答“几点了”';
    if (/yes,?\s*she does/i.test(text)) return '用来回答“Does she...”';
    if (/no,?\s*they do not/i.test(text)) return '用来回答“Do they...”';
    if (/yes,?\s*it is/i.test(text)) return '用来回答“Is this...”';
    if (/no,?\s*they are not/i.test(text)) return '用来回答“Are those...”';
    if (/yes,?\s*i can/i.test(text)) return '用来回答“Can you...”';
    return '不能完整回应本题的问句结构或意思';
  }

  function categoryOptionHint(question, option) {
    const value = String(option);
    const cat = question?.cat || '';
    const chosen = String(question?.options?.[question.answer] || '');
    if (cat === '核心词汇' || cat === '词汇听读') {
      const meaning = wordMap.get(value.toLowerCase());
      return `${meaning ? `${value} 的意思是“${meaning.cn}”。` : ''}本题要求对应的是“${chosen}”。${question.explain || ''}`;
    }
    if (cat === '疑问句' && /have\b/.test(question.q)) {
      return `${question.q.replace(/___/g, chosen)}：have 在这里是“有”，一般现在时提问需要 do/does。${chosen === 'Does' ? '主语是一个人，使用 Does。' : '主语是复数，使用 Do。'}${value === 'Is' || value === 'Are' ? 'Is/Are 是 be 动词，不能直接这样放在主语前与 have 组成问句。' : `${value} 与这里的主语形式不匹配。`}`;
    }
    if (cat === 'be动词') return value === 'am' ? 'am 只跟 I 搭配。' : value === 'is' ? 'is 跟 he、she、it 或单数主语搭配。' : value === 'are' ? 'are 跟 you、we、they 或复数主语搭配。' : 'be 是原形，不能在这种一般现在时肯定句中直接代替 am/is/are。';
    if (cat === 'have/has') return value === 'has' ? 'has 用于 he、she、it 或单数主语。' : value === 'have' ? 'have 用于 I、you、we、they，并跟在 do/does 后。' : `${value} 不是本句表达“有”所需的形式。`;
    if (cat === '疑问句') return `${value} 必须同时匹配主语的单复数和句中谓语；再检查后面的动词是否恢复原形。`;
    if (cat === '否定句') return `${value} 要与主语匹配；do/does 后面的实义动词必须用原形。`;
    if (cat === '冠词') return `${value} 是否正确取决于后面单词开头的发音以及是否特指。`;
    if (cat === '名词复数') return `先看数量词；two、three、many 后通常需要可数名词复数。`;
    if (cat === '介词') return `时间和地点介词常按固定搭配判断，不能逐字套用中文“在”。`;
    if (cat === '情态动词') return `can、will、must、should 后直接接动词原形，不能加 s、ing 或 to。`;
    if (cat === '指示代词') return `this/that 配单数，these/those 配复数，还要结合远近。`;
    if (cat === '代词') return `看空格在句中的位置，区分主格、宾格和放在名词前的物主代词。`;
    if (cat === '核心词汇' || cat === '词汇听读') return `这个选项的词义或读音与题目要求不一致。`;
    if (cat === '句子翻译') return `这个选项与原句的主语、动作、时间或语序至少有一处不一致。`;
    if (cat === '阅读理解') return `这个选项没有被原文对应句支持；阅读题应回原文定位，而不是凭印象。`;
    return `这个选项不符合本题的语法规则、词义或上下文。`;
  }

  function solutionPanel(question, order) {
    const correctPosition = order.indexOf(question.answer);
    const rows = order.map((originalIndex, displayedIndex) => {
      const option = question.options[originalIndex];
      const isCorrect = originalIndex === question.answer;
      const reason = isCorrect ? `正确。${question.explain || question.point || ''}` : question.type === 'dialogue' ? `${answerUse(option)}，与本题问法不对应。` : categoryOptionHint(question, option);
      return `<li class="${isCorrect ? 'correct-reason' : ''}"><b>${'ABCD'[displayedIndex]} · ${esc(option)}</b><span>${esc(reason)}</span></li>`;
    }).join('');
    return `<details class="solution-panel"><summary>我还是不会：看逐步解题（会显示答案）</summary><div class="solve-steps"><p><b>① 先认题型：</b>${esc(questionCue(question))}</p><p><b>② 再抓考点：</b>${esc(question.point || question.cat || '句意与上下文')}</p><p class="correct-answer"><b>③ 所以选择 ${'ABCD'[correctPosition]}：</b>${esc(question.options[question.answer])}</p></div><ol class="option-reasons">${rows}</ol></details>`;
  }

  function wordHelpPanel(question, label = '逐个单词解释') {
    const words = questionWords(question);
    if (!words.length) return '';
    return `<details class="word-panel"><summary>${esc(label)}（${words.length}个，一次看全）</summary><p class="word-intro">辅助读法只帮助入门，以右侧英文播放为准。</p><div class="word-list">${words.map(word => `<div><span><b>${esc(word.surface)}</b>${word.surface.toLowerCase() !== word.en.toLowerCase() ? `<small>原形：${esc(word.en)}</small>` : ''}</span><span>${esc(word.cn)}${word.form ? `<small>${esc(word.form)}</small>` : ''}</span><span>${esc(word.read)}</span><button data-word-speak="${esc(word.surface)}" aria-label="朗读 ${esc(word.surface)}">🔊</button></div>`).join('')}</div></details>`;
  }

  function bindWordSpeech(root = document) {
    root.querySelectorAll('[data-word-speak]').forEach(button => {
      const mark = document.createElement('button');
      mark.type = 'button'; mark.className = 'word-memory';
      const key = 'word:' + button.dataset.wordSpeak.toLowerCase();
      const row = questionWords({q:button.dataset.wordSpeak}).find(Boolean);
      const refresh = () => { mark.textContent = readJson(NOTE_KEY,{})[key] ? '✓ 已记入复习' : '记不住'; };
      refresh();
      mark.addEventListener('click', () => { rememberItem(key,button.dataset.wordSpeak,row?.cn || '请结合原题查看词义','word'); refresh(); });
      button.after(mark);
    });
    root.querySelectorAll('[data-word-speak]').forEach(button => button.addEventListener('click', event => speakQuestion({q:button.dataset.wordSpeak,audioText:button.dataset.wordSpeak}, event.currentTarget)));
  }

  function rememberItem(key, title, answer, kind, questionId = '') {
    const notes = readJson(NOTE_KEY,{});
    notes[key] = {...notes[key], key, title, answer, kind, questionId, due:Date.now(), streak:0};
    localStorage.setItem(NOTE_KEY,JSON.stringify(notes));
  }

  function attachStudyMarks(question) {
    const target = document.querySelector('.analysis-question-card .question, .quiz-card .question');
    if (!target) return;
    const panel = document.createElement('div'); panel.className = 'study-marks';
    const key = 'favorite:' + question.id;
    panel.innerHTML = '<button class="favorite-toggle"></button><button class="point-memory">这个知识点记不住</button>';
    target.after(panel);
    const fav = panel.querySelector('.favorite-toggle');
    const refresh = () => { fav.textContent = readJson(NOTE_KEY,{})[key] ? '★ 已收藏（点击取消）' : '☆ 收藏本题'; };
    refresh();
    fav.addEventListener('click', () => {
      const notes = readJson(NOTE_KEY,{});
      if (notes[key]) delete notes[key];
      else notes[key] = {key,kind:'favorite',questionId:question.id,title:question.q,answer:question.explain,createdAt:Date.now()};
      localStorage.setItem(NOTE_KEY,JSON.stringify(notes)); refresh();
    });
    panel.querySelector('.point-memory').addEventListener('click', event => {
      rememberItem('point:'+question.id,question.point || question.q,question.explain,'point',question.id);
      event.currentTarget.textContent = '✓ 已加入待复习';
    });
  }

  function renderNotebook(mode = 'due') {
    leaveQuiz();
    const notes = readJson(NOTE_KEY,{});
    const all = Object.values(notes).filter(row => row && typeof row.title === 'string');
    const rows = all.filter(row => mode === 'favorites' ? row.kind === 'favorite' : row.kind !== 'favorite' && (mode === 'all' || Number(row.due) <= Date.now())).sort((a,b) => Number(a.due||0)-Number(b.due||0));
    app.innerHTML = `<div class="top"><h1>收藏与记忆复习</h1><button id="notes-home">返回首页</button></div><section class="card"><p class="hint">先回想，再展开答案；“记住了”是自评，不会修改考试得分或把题目自动算成掌握。</p><div class="study-marks"><button data-note-mode="due">今日待复习</button><button data-note-mode="all">全部记不住</button><button data-note-mode="favorites">收藏</button></div><p>${mode === 'favorites' ? '收藏' : mode === 'all' ? '全部记忆项' : '已到复习时间'}：${rows.length} 项</p></section><div class="notebook-list">${rows.map(row => `<section class="card"><h2>${esc(row.title)}</h2><details><summary>回想后查看解释</summary><p>${esc(row.answer)}</p></details>${row.kind !== 'favorite' ? `<div class="study-marks"><button data-note-result="again" data-note-key="${esc(row.key)}">还是记不住</button><button data-note-result="remembered" data-note-key="${esc(row.key)}">这次记住了</button></div>` : ''}${row.questionId ? `<button class="secondary" data-note-question="${esc(row.questionId)}">打开原题解析</button>` : `<button class="secondary" data-note-speak="${esc(row.title)}">🔊 听英文</button>`}<button class="secondary" data-note-remove="${esc(row.key)}">${row.kind === 'favorite' ? '取消收藏' : '移除记忆标记'}</button></section>`).join('') || '<section class="card"><p>这里暂时没有内容。可到题库收藏题目，或点击单词旁的“记不住”。</p></section>'}</div>`;
    document.querySelector('#notes-home').onclick = renderHome;
    document.querySelectorAll('[data-note-mode]').forEach(button => button.onclick = () => renderNotebook(button.dataset.noteMode));
    document.querySelectorAll('[data-note-result]').forEach(button => button.onclick = () => {
      const current = readJson(NOTE_KEY,{}), row = current[button.dataset.noteKey];
      if (!row) return;
      row.streak = button.dataset.noteResult === 'remembered' ? (Number(row.streak)||0)+1 : 0;
      row.due = Date.now() + (row.streak ? [1,3,7,14][Math.min(row.streak-1,3)] * 86400000 : 10 * 60000);
      localStorage.setItem(NOTE_KEY,JSON.stringify(current)); renderNotebook(mode);
    });
    document.querySelectorAll('[data-note-remove]').forEach(button => button.onclick = () => {
      const current = readJson(NOTE_KEY,{}); delete current[button.dataset.noteRemove]; localStorage.setItem(NOTE_KEY,JSON.stringify(current)); renderNotebook(mode);
    });
    document.querySelectorAll('[data-note-question]').forEach(button => button.onclick = () => renderQuestionAnalysis(button.dataset.noteQuestion, () => renderNotebook(mode)));
    document.querySelectorAll('[data-note-speak]').forEach(button => button.onclick = () => speakQuestion({audioText:button.dataset.noteSpeak},button));
    window.scrollTo(0,0);
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
    const showAids = state.mode !== 'simulation';
    const wordHelp = showAids ? wordHelpPanel(q) : '';
    const learningTools = showAids ? `<div class="question-tools"><button id="speak">🔊 朗读英文</button>${q.translation ? `<details class="translation"><summary>中 查看中文与提示</summary><div>${esc(q.translation)}</div></details>` : ''}</div>${wordHelp}${solutionPanel(q, order)}` : '<p class="simulation-note">模拟测评已关闭中文、逐词解释和朗读辅助，交卷后可查看解析。</p>';
    app.innerHTML = `<div class="top"><div><p class="eyebrow dark">${esc(modeLabel(state.mode))}</p><h1>${state.index + 1}/${total} · ${esc(q.cat || '综合')}</h1></div><button id="home">暂存退出</button></div><section class="card quiz-card"><div class="progress"><i style="width:${((state.index + 1) / total * 100).toFixed(1)}%"></i></div><div class="meta"><span>${esc(q.difficulty || '基础')} · ${state.mode === 'simulation' ? '真实作答' : '可用学习辅助'}</span><span id="elapsed">${formatTime(state.elapsedSec)}</span></div><div class="question">${esc(q.q)}</div>${learningTools}<button class="unknown-button ${state.unknowns[q.id] ? 'selected' : ''}" id="unknown">${state.unknowns[q.id] ? '✓ 已标记：不确定或不会' : '？不确定或不会，加入重点复习'}</button><div class="options">${options}</div><div class="nav"><button id="prev" ${state.index === 0 ? 'disabled' : ''}>上一题</button><button class="next" id="next">${state.index === total - 1 ? '检查并交卷' : '保存并到下一题'}</button></div><details class="answer-sheet"><summary>打开答题卡 · 已完成 ${done}/${total}</summary><div class="grid">${dots}</div></details><p class="save">答案与当前题号已自动保存，可随时退出后继续</p></section>`;
    startTimer(state);
    document.querySelector('#speak')?.addEventListener('click', event => speakQuestion(q, event.currentTarget));
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
    attachStudyMarks(q);
    bindWordSpeech();
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
        answerCorrect: selectedOriginal !== undefined && selectedOriginal === q?.answer,
        correct: selectedOriginal !== undefined && selectedOriginal === q?.answer,
        needsReview: selectedOriginal === undefined || selectedOriginal !== q?.answer || Boolean(state.unknowns?.[id])
      };
    });
  }

  function diagnosticSummary(items) {
    const rows = {};
    items.forEach(item => {
      const cat = item.q?.cat || '综合';
      rows[cat] ||= {category:cat, correct:0, stable:0, unknown:0, total:0};
      rows[cat].total += 1;
      if (item.answerCorrect) rows[cat].correct += 1;
      if (item.answerCorrect && !item.unknown) rows[cat].stable += 1;
      if (item.unknown) rows[cat].unknown += 1;
    });
    return Object.values(rows).map(row => ({...row, lost:row.total - row.correct, review:row.total - row.stable, accuracy:Math.round(row.correct / row.total * 100)}))
      .sort((a,b) => b.review - a.review || a.accuracy - b.accuracy || b.total - a.total || a.category.localeCompare(b.category, 'zh-CN'));
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
      needsReview: item.needsReview,
      point: item.q?.point || '',
      translation: item.q?.translation || ''
    }));
    const wrongItems = allItems.filter(item => item.needsReview).map(item => {
      const source = find(item.id);
      return {...item, explanation: source?.explain || ''};
    });
    const categoryStats = {};
    items.forEach(item => {
      const cat = item.q?.cat || '综合';
      categoryStats[cat] ||= {correct:0,total:0};
      categoryStats[cat].total += 1;
      if (item.answerCorrect) categoryStats[cat].correct += 1;
    });
    const stableCorrect = items.filter(item => item.answerCorrect && !item.unknown).length;
    const uncertainCorrect = items.filter(item => item.answerCorrect && item.unknown).length;
    return JSON.stringify({
      report: 'DEGREE-ENGLISH-WEB-V4.5',
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
      stableCorrect,
      uncertainCorrect,
      masteryRate: Math.round(stableCorrect / state.questionIds.length * 100),
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

  function similarExample(question, excludedId) {
    if (!question) return null;
    if (question.type === 'dialogue') return bank.find(item => item.id !== excludedId && item.type === 'dialogue' && questionCue(item) === questionCue(question)) || null;
    const exact = bank.find(item => item.id !== excludedId && item.point === question.point && stemKey(item) !== stemKey(question));
    return exact || bank.find(item => item.id !== excludedId && item.cat === question.cat && stemKey(item) !== stemKey(question)) || null;
  }

  function renderFinish(state) {
    leaveQuiz();
    const items = resultItems(state);
    const correct = items.filter(item => item.answerCorrect).length;
    const stableCorrect = items.filter(item => item.answerCorrect && !item.unknown).length;
    const uncertainCorrect = items.filter(item => item.answerCorrect && item.unknown).length;
    const wrong = items.filter(item => item.needsReview);
    const total = state.questionIds.length;
    const score = Math.round(correct / total * 100);
    const masteryRate = Math.round(stableCorrect / total * 100);
    const report = buildReport(state);
    const diagnostics = diagnosticSummary(items);
    const weakest = diagnostics.filter(row => row.review > 0).slice(0, 3);
    const weakHtml = weakest.map((row,index) => `<div><b>${index + 1}</b><span><strong>${esc(row.category)}</strong><small>正确 ${row.correct}/${row.total} · 需复习 ${row.review} 题</small></span><em>${row.accuracy}%</em></div>`).join('');
    const history = readHistory();
    const previous = history.find(row => row.sessionId !== state.sessionId && row.status === '已交卷' && modeLabel(row.mode) === modeLabel(state.mode));
    const delta = previous ? score - Number(previous.score || 0) : null;
    const wrongHtml = wrong.length ? wrong.map(item => {
      const example = similarExample(item.q, item.id);
      const exampleHtml = example ? `<div class="example-box"><b>同考点例题</b><p>${esc(example.q)}</p><p><strong>答案：</strong>${esc(example.options[example.answer])}</p><p><strong>解析：</strong>${esc(example.explain || example.point)}</p></div>` : '';
      return `<details class="wrong-item"><summary><span>第 ${item.n} 题 · ${esc(item.q?.cat || '综合')}</span><strong>${item.unknown && item.answerCorrect ? '答对但不确定' : item.unknown ? '不会' : `${item.selectedLetter} → ${item.correctLetter}`}</strong></summary><div><p class="wrong-question">${esc(item.q?.q)}</p><p><b>你的答案：</b>${esc(item.selectedOriginal === undefined ? '未选择' : item.q.options[item.selectedOriginal])}${item.unknown ? '（标记不确定或不会）' : ''}</p><p><b>正确答案：</b>${esc(item.q?.options?.[item.q?.answer] || '')}</p><p><b>具体考点：</b>${esc(item.q?.point || item.q?.cat || '综合')}</p><p><b>为什么：</b>${esc(item.q?.explain || item.q?.point || '请把报告发给我进一步讲解。')}</p><p><b>排除提示：</b>其余选项不符合上面的语法规则、词义或上下文；先找主语、时间词和固定搭配，再决定答案。</p>${exampleHtml}</div></details>`;
    }).join('') : `<div class="success-box">${total} 题全部稳定答对，可以进入下一轮抽查。</div>`;
    app.innerHTML = `<section class="hero result-hero"><p class="eyebrow">${esc(modeLabel(state.mode))}完成</p><h1>${score} 分${delta === null ? '' : ` · 比上次${delta >= 0 ? '高' : '低'} ${Math.abs(delta)} 分`}</h1><p>考试分只看答案；掌握度会另外识别“不确定但答对”的危险题。</p></section><section class="card result-card"><div class="result-metrics"><div><b>${score}</b><span>考试得分</span></div><div><b>${masteryRate}%</b><span>稳定掌握</span></div><div><b>${uncertainCorrect}</b><span>答对但不确定</span></div><div><b>${total - correct}</b><span>答错</span></div></div><p class="hint">确定答对 ${stableCorrect} · 用时 ${formatTime(state.elapsedSec || 0)}</p>${wrong.length ? '<button class="primary" id="reinforce">先把本次丢分点抢回来</button>' : ''}<button class="secondary" id="show-all-analysis">查看本套全部 ${total} 题详细解析</button><button class="secondary" id="copy">复制完整报告（需要时发给我）</button><button class="secondary" id="download">下载完整答题报告</button></section><section class="card all-analysis-card" id="all-analysis" hidden><div class="section-head"><div><h2>本套全部 ${total} 题解析</h2><p class="hint compact">答对和答错都能看；逐词、结构和每个选项原因均可展开。</p></div><span>${total} 题</span></div><div class="all-analysis-list"></div></section><section class="card"><div class="section-head"><div><h2>最需要先救的 ${weakest.length} 项</h2><p class="hint compact">按需复习题数和正确率排序</p></div></div><div class="weak-list">${weakHtml}</div></section><section class="card"><div class="section-head"><div><h2>本套需巩固 ${wrong.length} 道</h2></div></div><p class="hint">包含答错、未答及“答对但标记不确定”的题，默认折叠。</p><div class="wrong-list">${wrongHtml}</div></section><section class="card"><button class="secondary" id="new">再做一套模拟测评</button><button class="secondary" id="home">返回首页看今日任务</button></section>`;
    const reinforceButton = document.querySelector('#reinforce');
    if (reinforceButton) reinforceButton.textContent = total - correct > 0 ? '先把本次丢分点抢回来' : '先把本次不稳项练扎实';
    document.querySelector('#show-all-analysis').addEventListener('click', event => {
      const section = document.querySelector('#all-analysis');
      const list = section.querySelector('.all-analysis-list');
      if (!list.childElementCount) {
        list.innerHTML = items.map(item => {
          const order = state.optionOrders[item.id] || [0,1,2,3];
          const status = item.answerCorrect ? (item.unknown ? '答对但不确定' : '答对') : '答错';
          return `<details class="all-question ${item.answerCorrect ? 'is-correct' : 'is-wrong'}"><summary><span>第 ${item.n} 题 · ${esc(item.q?.cat || '综合')}</span><b>${status}</b></summary><div><p class="wrong-question">${esc(item.q?.q || '')}</p><p><strong>你的答案：</strong>${esc(item.selectedOriginal === undefined ? '未选择' : item.q.options[item.selectedOriginal])}</p>${wordHelpPanel(item.q, '本题全部单词')}${solutionPanel(item.q, order)}</div></details>`;
        }).join('');
        bindWordSpeech(list);
      }
      section.hidden = false;
      event.currentTarget.textContent = `已展开本套全部 ${total} 题解析`;
      event.currentTarget.disabled = true;
      section.scrollIntoView({behavior:'smooth',block:'start'});
    });
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
