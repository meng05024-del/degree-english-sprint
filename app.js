/* 学位英语考前冲刺站 v4.9：零基础语法概念详解与页码直达；本地优先，不主动上传学习记录。 */
(() => {
  'use strict';

  const STATE_KEY = 'degree_english_50_quiz_v1'; // 沿用旧键，保护未完成记录
  const HISTORY_KEY = 'degree_english_50_quiz_history_v2';
  const MASTERY_KEY = 'degree_english_quiz_mastery_v3';
  const SETTINGS_KEY = 'degree_english_sprint_settings_v4';
  const NOTE_KEY = 'degree_english_notebook_v1';
  const COURSE_KEY = 'degree_english_topic_course_v1';
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
  const topicLessons = [
    {id:'sentence',order:1,title:'先看懂一句话的骨架',subtitle:'主语、谓语、宾语到底是什么',cats:['代词','句子翻译'],goal:'先找到“谁，做什么，对谁或什么做”，不要一上来就背术语。',plain:'英语句子像排队：通常先说谁，再说做什么，最后补充对象、地点和时间。',terms:[['主语','谁或什么，是句子的主角','She works. 里的 She'],['谓语','主角做什么或是什么','She works. 里的 works'],['宾语','动作落到谁或什么上','I like English. 里的 English'],['动词原形','词典里的基本样子','go、have、work']],formula:['谁 + 做什么','谁 + 做什么 + 对谁/什么','地点、时间通常放在主要骨架后面'],signals:'先圈人称或名词，再找表示动作或状态的词。',example:['She studies English at night.','She＝她（主语）','studies＝学习（谓语）','English＝英语（宾语）','at night＝在晚上（时间）'],answer:'整句：她晚上学习英语。'},
    {id:'be',order:2,title:'am / is / are 怎么选',subtitle:'be 动词不是三个毫无关系的词',cats:['be动词'],goal:'看到“是、在、处于某种状态”，先想到 be 动词。',plain:'am、is、are 都来自 be，意思常是“是、在、处于”。真正要选哪个，只看前面的主语。',terms:[['be动词','am、is、are 的总称','I am / he is / they are'],['单数','只有一个人或事物','he、she、Tom、the book'],['复数','两个或更多','we、they、the books']],formula:['I + am','he / she / it / 一个东西 + is','you / we / they / 多个东西 + are'],signals:'先把姓名或名词换成 he、she、it 或 they。',example:['Tom ___ a student.','Tom 是一个男生，可换成 he','he 后面用 is','所以填 is'],answer:'Tom is a student. 汤姆是一名学生。'},
    {id:'have',order:3,title:'have / has 与“有”',subtitle:'先看谁有，再看有没有助动词',cats:['have/has'],goal:'分清 have、has，并理解 does 后为什么必须用 have。',plain:'have 和 has 都表示“有”。一般现在时肯定句里，一个他/她/它用 has；其他主语用 have。',terms:[['实义动词','本身有具体意思的动作词','have 有；go 去'],['第三人称单数','不是我和你，而且只有一个','he、she、it、Tom'],['助动词','帮助提问或否定的词','do、does、did']],formula:['I / you / we / they + have','he / she / it + has','Does + he/she/it + have...?'],signals:'看到 does，后面的 has 立刻恢复成原形 have。',example:['Does she ___ a car?','Does 已经负责提问','she 虽是第三人称单数','但 does 后必须接原形','所以填 have'],answer:'Does she have a car? 她有汽车吗？'},
    {id:'question',order:4,title:'一般疑问句与简短回答',subtitle:'问句用什么开头，回答就用什么',cats:['疑问句','完成对话'],goal:'不靠翻译猜选项，先让问句和回答的主语、助动词对上。',plain:'能用“是/不是”回答的问题叫一般疑问句。Do 开头就用 do 回答，Is 开头就用 is，Can 开头就用 can。',terms:[['一般疑问句','通常可回答 Yes 或 No 的问题','Do they have books?'],['简短回答','不重复整句，只保留主语和关键动词','No, they do not.'],['人称对应','问 you 时回答者常说 I','Can you...? Yes, I can.']],formula:['Do they...? → Yes, they do. / No, they do not.','Is this...? → Yes, it is. / No, it is not.','Can you...? → Yes, I can. / No, I cannot.'],signals:'先看问句第一个词，再看主语；两个都要对应。',example:['A: Do they have books? B: ___','问句以 Do 开头','主语是 they','回答必须保留 they 和 do','所以选 No, they do not.'],answer:'No, they do not. 不，他们没有。'},
    {id:'negative',order:5,title:'肯定句怎样变否定句',subtitle:'not 放哪里，后面的动词怎么变',cats:['否定句'],goal:'分清 be 动词否定和普通动作否定。',plain:'句中已有 am/is/are/can 时，直接在后面加 not；普通动作要请 do/does/did 来帮忙。',terms:[['肯定句','表示事实成立','She works.'],['否定句','表示不、没有','She does not work.'],['助动词','替普通动作承担时态和提问/否定','does、did']],formula:['am / is / are + not','can / will / must + not','do / does / did + not + 动词原形'],signals:'看到 does not、did not，后面不能再用 works、went。',example:['She works here. → 否定句','works 是普通动作','主语 she，一般现在时用 does not','works 恢复原形 work'],answer:'She does not work here. 她不在这里工作。'},
    {id:'tense',order:6,title:'现在、过去、将来怎么判断',subtitle:'先找时间词，再决定动词形态',cats:['疑问句','否定句','句子翻译'],goal:'不死背“时态”两个字，先学会看动作发生在什么时候。',plain:'时态就是“动作发生的时间 + 动词对应的样子”。先圈时间词，再看主语和句型。',terms:[['一般现在时','经常、习惯或事实','every day、often'],['一般过去时','已经发生并结束','yesterday、last、ago'],['一般将来时','还没发生','tomorrow、will'],['现在进行时','此刻正在发生','now、look、listen']],formula:['经常：主语 + 动词原形/三单','过去：主语 + 动词过去式','将来：主语 + will + 动词原形','正在：am/is/are + 动词-ing'],signals:'yesterday/last/ago 看过去；tomorrow/will 看将来；now/look/listen 看正在。',example:['He ___ to school yesterday.','yesterday＝昨天，说明是过去','go 的过去式是 went','不是 goes，也不是 will go'],answer:'He went to school yesterday. 他昨天去上学了。'},
    {id:'article',order:7,title:'a / an / the 怎么选',subtitle:'一个、任意一个，还是双方都知道的那个',cats:['冠词'],goal:'先判断是否特指，再听后面单词开头的发音。',plain:'a/an 表示“一个”，第一次提到或不特指；the 表示说话双方都知道的特定对象。',terms:[['冠词','放在名词前帮助限定范围','a、an、the'],['特指','明确是哪一个','the book on the desk'],['元音音素','开头读音像元音，不只看字母','an apple、an hour']],formula:['a + 辅音音素开头','an + 元音音素开头','the + 特定或再次提到的对象'],signals:'先问“是不是特定那个”，不是再判断开头读音。',example:['This is ___ apple.','这里第一次说一个苹果','apple 开头读元音','所以用 an'],answer:'This is an apple. 这是一个苹果。'},
    {id:'plural',order:8,title:'名词单数和复数',subtitle:'数量词会直接告诉你名词要不要变',cats:['名词复数'],goal:'看到 two、many、some 后，知道可数名词通常要用复数。',plain:'能一个一个数的叫可数名词。数量超过一个，名词通常要变复数。',terms:[['名词','人、事物、地点或概念的名称','book、student、city'],['可数名词','能数一个、两个的名词','one book, two books'],['不可数名词','通常不直接一个个数','water、information']],formula:['one / a / an + 单数','two / many / several + 复数','some + 复数或不可数名词'],signals:'先圈数量词，再检查名词尾巴有没有 s/es 或不规则变化。',example:['There are three ___ .','three 表示三个','需要可数名词复数','child 的复数是不规则 children'],answer:'There are three children. 有三个孩子。'},
    {id:'pronoun',order:9,title:'I / me / my 为什么不一样',subtitle:'同一个“我”，位置不同样子不同',cats:['代词','指示代词'],goal:'根据空格位置区分主格、宾格和物主代词。',plain:'I、me、my 都和“我”有关，但分工不同：谁做事用 I，动作落到我用 me，表示我的东西用 my。',terms:[['主格','放在动作前面做主语','I、he、she、we、they'],['宾格','放在动词或介词后','me、him、her、us、them'],['物主代词/限定词','表示谁的，my/your 后接名词','my book']],formula:['I like him. 我喜欢他。','He likes me. 他喜欢我。','This is my book. 这是我的书。'],signals:'空格后紧跟名词常选 my/your/his/her；空格在句首常选主格。',example:['She helps ___ .','helps 是动作','动作落在“我”身上','动词后用宾格 me'],answer:'She helps me. 她帮助我。'},
    {id:'preposition',order:10,title:'in / on / at 与固定搭配',subtitle:'不要把所有“在”都翻成同一个词',cats:['介词'],goal:'掌握时间从大到小的基本规律，并记住地点搭配。',plain:'时间介词可先按范围判断：in 管大范围，on 管具体某天，at 管具体时刻；地点还要记常见搭配。',terms:[['介词','连接时间、地点、方式等关系','in、on、at、by'],['固定搭配','英语习惯一起出现的词','at night、by bus'],['时间词','告诉动作什么时候发生','Monday、May、eight']],formula:['in + 月/年/季节：in May','on + 星期/日期：on Monday','at + 时刻/小地点：at eight','by + 交通方式：by bus'],signals:'月和年用 in；某一天用 on；几点用 at。morning 前通常用 in，但 night 常用 at。',example:['We meet ___ eight ___ Monday.','eight 是具体时刻，用 at','Monday 是具体某天，用 on'],answer:'We meet at eight on Monday. 我们周一八点见。'},
    {id:'modal',order:11,title:'can / will / must / should',subtitle:'情态动词后面永远先找动词原形',cats:['情态动词'],goal:'看见情态动词，不再给后面的动词加 s、ed 或 to。',plain:'情态动词给动作增加“能、将、必须、应该”等语气。它后面的动作词使用原形。',terms:[['情态动词','表达能力、可能、意愿或义务','can、will、must、should'],['动词原形','没有 s/ed/ing 的基本形式','go、study、be']],formula:['can + 动词原形','will + 动词原形','must + 动词原形','should + 动词原形'],signals:'无论主语是不是 he/she/it，can 后都是 go，不是 goes。',example:['She can ___ English.','can 是情态动词','后面必须用动词原形','所以填 speak'],answer:'She can speak English. 她会说英语。'},
    {id:'reading',order:12,title:'翻译、对话和阅读怎么做',subtitle:'先定位证据，不要凭“看起来顺眼”选择',cats:['句子翻译','完成对话','阅读理解','核心词汇'],goal:'掌握三类综合题的固定答题顺序。',plain:'综合题不是每个词都会才可以做。先认主语、动作、否定、时间，再回原句找对应证据。',terms:[['关键词','决定句子核心信息的词','not、yesterday、because'],['定位','在原文中找到与题目对应的句子','人名、数字、时间'],['排除法','逐项找明显矛盾','主语、时间、肯否定不一致']],formula:['翻译：主语 → 动作 → 时间 → 肯否定','对话：问什么 → 用同类结构回答','阅读：题干关键词 → 原文定位 → 对照选项'],signals:'遇到生词先别停，判断它是否影响主语、动作、时间和答案方向。',example:['A: How are you? B: ___','How are you 是问候“你好吗”','回答要说自己的状态','My name is Tom 是回答姓名，不对应'],answer:'I am fine, thank you. 我很好，谢谢。'}
  ];

  const chapterNames = {sentence:'句子基础',be:'be 动词',have:'实义动词与助动词',question:'问句',negative:'否定句',tense:'时态',article:'冠词',plural:'名词',pronoun:'代词',preposition:'介词与搭配',modal:'情态动词',reading:'综合题型'};
  const addMicroLesson = (baseId,id,title,subtitle,plain,formula,example,answer,signals,cats) => {
    const base = topicLessons.find(item => item.id === baseId);
    topicLessons.push({...base,id,title,subtitle,goal:`学会${title}，遇到同类题能按固定步骤判断。`,plain,formula,example,answer,signals:signals || base.signals,cats:cats || base.cats,chapter:chapterNames[baseId]});
  };
  topicLessons.forEach(lesson => { lesson.chapter = chapterNames[lesson.id]; });
  Object.assign(topicLessons.find(item => item.id === 'tense'), {title:'一般现在时',subtitle:'经常发生、习惯和事实',goal:'看见 every day、often、usually 时，知道怎样选择动词。',plain:'一般现在时不是“现在这一秒”，而是经常做、习惯做或一直成立的事。',formula:['I/you/we/they + 动词原形','he/she/it + 动词-s/es','do/does + 动词原形'],signals:'every day、often、usually、always、sometimes 常提示一般现在时。',example:['She ___ to work every day.','every day 表示每天，是习惯','主语 she 是第三人称单数','go 要变成 goes'],answer:'She goes to work every day. 她每天去上班。'});
  Object.assign(topicLessons.find(item => item.id === 'article'), {title:'a 和 an 怎么选',subtitle:'看后面单词开头的读音',goal:'分清 a 与 an，不再只看首字母猜答案。',plain:'a 和 an 都表示“一个”。后面单词开头读元音时用 an，其他通常用 a。',formula:['a book、a university','an apple、an egg','判断读音，不只判断字母'],signals:'hour 的 h 不发音，所以是 an hour；university 开头读 /juː/，所以是 a university。',example:['This is ___ apple.','apple 开头读元音','表示一个且不特指','所以填 an'],answer:'This is an apple. 这是一个苹果。'});
  Object.assign(topicLessons.find(item => item.id === 'preposition'), {title:'时间介词 in / on / at',subtitle:'月、日期和几点分别怎么选'});
  Object.assign(topicLessons.find(item => item.id === 'reading'), {title:'句子翻译题',subtitle:'先对齐主语、动作、时间和肯否定',cats:['句子翻译'],goal:'翻译题不再逐字硬拼，而是先对齐句子骨架。',plain:'先找谁，再找做什么，然后检查时间、地点和肯定否定；四个位置都一致才可以选。',formula:['先对主语：谁','再对动作：做什么','最后对时间、地点和 not'],signals:'选项只要主语、时间或肯否定有一处冲突，就可以排除。',example:['“他们昨天没有去学校。”','他们＝they','昨天＝yesterday，使用过去','did not 后用动词原形 go'],answer:'They did not go to school yesterday.'});

  const addGrammarLesson = ({id,title,subtitle,goal,plain,terms,formula,signals,example,answer,confusions,moreExamples,memory}) => {
    const base = topicLessons.find(item => item.id === 'sentence');
    topicLessons.push({...base,id,title,subtitle,goal,plain,terms,formula,signals,example,answer,confusions,moreExamples,memory,chapter:chapterNames.sentence});
  };
  addGrammarLesson({
    id:'parts-vs-roles', title:'词性和句子成分不是一回事', subtitle:'动词是种类，谓语是工作岗位',
    goal:'先分清“一个词本来是什么”和“它进句子后负责什么”，以后听课不再被术语绕晕。',
    plain:'词性像一个人的职业类别：名词、动词、形容词、副词；句子成分像他今天在队伍里的岗位：主语、谓语、宾语、表语、定语、状语。同一个名词进入不同句子，可以当主语，也可以当宾语。',
    terms:[['词性','词本身属于哪一类，不进句子也能判断','book 是名词，go 是动词'],['句子成分','这个词或词组在当前句子里负责什么','Tom 在 Tom likes tea 中作主语'],['动词','一种词性，表示动作或状态','work、go、like、be'],['谓语','句子成分，说明主语做什么、是什么或怎么样','works；is tired；can swim']],
    formula:['先找句中真正说明“做什么/是什么/怎么样”的部分＝谓语','再问谓语前“谁/什么”＝主语','如果动作后还能问“谁/什么”＝宾语','名词、动词是词性；主语、谓语、宾语是句中岗位'],
    signals:'题目问“是什么词”时答词性；问“在句中作什么”时答句子成分。',
    example:['Tom likes English.','Tom 本身是名词，在这句中负责“谁”，所以作主语','likes 本身是动词，在这句中说明 Tom 做什么，所以作谓语','English 本身是名词，在这句中是喜欢的对象，所以作宾语'],
    answer:'Tom＝名词/主语；likes＝动词/谓语；English＝名词/宾语。',
    confusions:['“动词＝谓语”不完全对：动词是词性，谓语是岗位。简单句里动词常是谓语的核心。','She is tired 的完整谓语是 is tired；is 是谓语动词，tired 是表语。','一个词可以同时有“词性”和“句子成分”两张标签。'],
    moreExamples:[['Books help me.','Books：名词，作主语；help：动词，作谓语；me：代词，作宾语。'],['I read books.','I：代词，作主语；read：动词，作谓语；books：名词，作宾语。'],['She is happy.','She：主语；is happy：谓语；happy：形容词，作表语。']],
    memory:'词性回答“它是什么词”；句子成分回答“它在这句话里干什么”。'
  });
  addGrammarLesson({
    id:'subject', title:'主语是什么', subtitle:'先找这句话在说谁或什么',
    goal:'准确找到主语，并用主语决定 am/is/are、do/does、have/has 和动词是否加 s。',
    plain:'主语是句子要说明的对象，常回答“谁？”或“什么？”。它通常位于陈述句开头，但疑问句中可能跟在助动词或 be 动词后。',
    terms:[['主语','句子正在谈论的谁或什么','She works. 中的 She'],['人称代词主格','专门适合做主语的代词','I、you、he、she、it、we、they'],['名词主语','人名或事物名称也能做主语','Tom、my mother、the books'],['形式主语 there','There be 中 there 用来引出“有”','There are two books.']],
    formula:['陈述句：主语通常在谓语前——She works.','一般疑问句：先越过 Do/Does/Is/Are/Can，再找主语','一个人名通常可换成 he 或 she；一个物可换成 it','多个事物通常可换成 they'],
    signals:'选 am/is/are、do/does、have/has 之前，必须先圈出主语并判断单数还是复数。',
    example:['Does Tom work here?','Does 是帮助提问的助动词，不是主语','Tom 是这句话询问的对象，所以 Tom 是主语','Tom 可换成 he，因此使用 Does'],
    answer:'主语是 Tom；谓语核心是 work。',
    confusions:['主语不一定是句子第一个词：Does she work? 的主语是 she。','介词后面的名词通常不是主语：on the desk 中 desk 不是主语。','命令句 Open the door. 常省略主语 you。'],
    moreExamples:[['The boy plays football.','The boy 是主语，是“踢足球的人”。'],['My books are new.','My books 是主语，而且是复数，所以用 are。'],['Are they students?','Are 被提前，they 仍是主语。']],
    memory:'先问“谁/什么在做、是、处于某状态”，答案通常就是主语。'
  });
  addGrammarLesson({
    id:'predicate', title:'谓语是什么', subtitle:'一句话真正站得住的发动机',
    goal:'找到谓语，并理解为什么英语完整句子通常不能没有谓语动词。',
    plain:'谓语是用来说明主语“做什么、是什么、怎么样”的部分。谓语的核心一定与动词有关，它还负责表现时间、肯否定和语气。',
    terms:[['谓语','对主语进行说明的句子成分','She works. 中的 works'],['谓语动词','谓语里的核心动词，会随主语或时态变化','work→works；go→went'],['复合谓语','由助动词/情态动词加主要动词组成','does not work；can swim'],['系表结构','be 动词连接主语和表语','She is happy.']],
    formula:['动作句：主语 + 实义动词——She works.','状态句：主语 + be + 表语——She is tired.','否定句：主语 + 助动词 + not + 原形——She does not work.','情态句：主语 + can/will/must + 原形——She can swim.'],
    signals:'找谓语时，先找会随时间或主语改变的动词部分；不要把地点、时间误当谓语。',
    example:['She does not work here.','She 是主语','does not work 一起说明她“不工作”，是谓语','does 承担一般现在时和否定，work 恢复原形','here 只补充地点，是状语'],
    answer:'完整谓语是 does not work；谓语里的主要动作是 work。',
    confusions:['I happy 错，因为 happy 是形容词，不能独自充当谓语；要说 I am happy.','She can swims 错，can 已经是情态动词，后面用原形 swim。','谓语不一定只有一个单词：will go、is reading、does not like 都是谓语。'],
    moreExamples:[['He went home.','went 是谓语，过去式同时告诉我们动作发生在过去。'],['They are students.','are students 是谓语部分；are 是系动词，students 是表语。'],['I am reading.','am reading 是现在进行时谓语。']],
    memory:'一句话如果是机器，主语是主角，谓语就是让整句话运转起来的发动机。'
  });
  addGrammarLesson({
    id:'object', title:'宾语是什么', subtitle:'动作落到谁或什么身上',
    goal:'判断一个句子有没有宾语，并分清主语和宾语的人称形式。',
    plain:'宾语是动作涉及、作用或指向的人或事物。先找到实义动词，再问“做什么？”或“对谁做？”，能回答出来的部分常是宾语。并不是每个句子都有宾语。',
    terms:[['宾语','动作作用的对象','I like English. 中的 English'],['及物动词','后面可以直接带宾语的动词','like English、read books'],['不及物动词','通常不能直接带宾语','go、come、sleep'],['宾格','代词作宾语时使用的形式','me、him、her、us、them']],
    formula:['I like English. → like 什么？English','She helps me. → helps 谁？me','He sleeps. → sleep 后没有动作对象，所以没有宾语','介词后也用宾格：with me、for him'],
    signals:'先找动作，再向动作后面提问“谁/什么”；不要看到名词就一律叫宾语。',
    example:['She gives me a book.','She 是做动作的人，作主语','gives 是谓语动词','me 是接受东西的人，叫间接宾语','a book 是被给予的东西，叫直接宾语'],
    answer:'She＝主语；gives＝谓语；me 和 a book 都是宾语。',
    confusions:['She is happy 没有宾语；happy 是表语，因为 is 不是“把动作做到 happy 上”。','go home 中 home 表示方向，不能简单当作 go 的宾语。','I like he 错，he 作宾语时应变为 him。'],
    moreExamples:[['Tom reads books.','reads 什么？books，所以 books 是宾语。'],['They know her.','know 谁？her，所以 her 是宾语。'],['He arrived yesterday.','arrived 后没有动作对象；yesterday 是时间状语。']],
    memory:'先找动作，再问“动作碰到了谁或什么”；能回答的才可能是宾语。'
  });
  addGrammarLesson({
    id:'predicative', title:'表语是什么', subtitle:'放在 be 后说明主语身份或状态',
    goal:'分清表语和宾语，不再把 is 后面的所有词叫宾语。',
    plain:'表语跟在 be 等系动词后面，用来说明主语“是谁、是什么、怎么样、在哪里”。它不是动作承受者，而是在给主语补充身份、状态或特征。',
    terms:[['表语','说明主语身份、性质或状态','She is happy. 中的 happy'],['系动词','连接主语和表语的动词','am、is、are、was、were'],['名词表语','说明主语是什么身份','He is a teacher.'],['形容词表语','说明主语怎么样','The book is new.']],
    formula:['主语 + be + 名词：Tom is a student.','主语 + be + 形容词：Tom is busy.','主语 + be + 地点：Tom is at home.','be 像等号：Tom = a student；Tom = busy'],
    signals:'看见 am/is/are/was/were，先问后面是在说明主语吗；如果是，通常是表语部分。',
    example:['The books are new.','The books 是主语','are 是系动词','new 说明书怎么样','所以 new 是形容词作表语'],
    answer:'are new 构成系表谓语；new 是表语，不是宾语。',
    confusions:['I like English 中 English 是宾语，因为 like 是动作；I am Chinese 中 Chinese 是表语，因为 am 像等号。','表语可以是名词、形容词或地点短语，不只是一种词性。','be 动词有时表示“在”：The book is on the desk.'],
    moreExamples:[['She is a nurse.','a nurse 说明她的身份，是名词作表语。'],['They are tired.','tired 说明他们的状态，是形容词作表语。'],['My bag is on the desk.','on the desk 说明包在哪里，是地点表语。']],
    memory:'宾语是动作碰到的对象；表语是 be 后面给主语贴的“身份或状态标签”。'
  });
  addGrammarLesson({
    id:'modifiers', title:'定语、状语和补语', subtitle:'它们都在补充信息，但补充的对象不同',
    goal:'看到修饰成分时，知道它在说明名词、动作还是把意思补完整。',
    plain:'定语专门修饰名词；状语说明动作发生的时间、地点、方式、频率或原因；补语把主语或宾语的意思补充完整。考试最常考的是定语位置和时间、地点状语。',
    terms:[['定语','给名词加范围或特点','a new book 中的 new'],['状语','说明动作何时、何地、怎样、为什么发生','work at night 中的 at night'],['补语','补充说明主语或宾语，使意思完整','make me happy 中的 happy'],['修饰','给核心内容增加更具体的信息','my、new、quickly、yesterday']],
    formula:['定语 + 名词：a good student、my book','动作 + 方式状语：speak slowly','动作 + 地点/时间：work here at night','动词 + 宾语 + 补语：make me happy'],
    signals:'紧贴名词并回答“什么样/谁的”多为定语；回答“何时/何地/怎样”多为状语。',
    example:['She reads English books every day.','She 是主语；reads 是谓语','English 修饰 books，说明哪类书，是定语','books 是 reads 的宾语','every day 说明什么时候读，是时间状语'],
    answer:'English＝定语；every day＝时间状语。',
    confusions:['形容词是词性，定语是岗位：new 是形容词，在 a new book 中作定语，在 The book is new 中作表语。','副词经常作状语，但介词短语也能作状语，如 at night。','考试做选择题时先抓主干，定语和状语暂时拿掉，句子仍应基本成立。'],
    moreExamples:[['My old friend lives here.','My、old 都修饰 friend，作定语；here 是地点状语。'],['He speaks English well.','English 是宾语；well 说明怎样说，作方式状语。'],['We met on Monday.','on Monday 说明何时见面，作时间状语。']],
    memory:'修饰名词的是定语；说明动作时间、地点、方式的是状语；把意思补完整的是补语。'
  });
  addGrammarLesson({
    id:'verb-form', title:'动词原形和各种变化', subtitle:'go、goes、went、going、gone 的关系',
    goal:'认出同一个动词的不同形式，并知道什么时候必须恢复原形。',
    plain:'动词原形是词典里查到的基本形式。英语会改变动词外形来表达主语、时间或动作状态；变化后意思核心通常仍属于同一个动词。',
    terms:[['动词原形','没有因主语或时态发生变化的基本形式','go、work、study、be'],['第三人称单数','一般现在时 he/she/it 后的形式','goes、works、studies'],['过去式','表示过去发生的动作','went、worked、studied'],['现在分词','常与 be 组成进行时','going、working、studying'],['过去分词','常用于完成时或被动语态','gone、worked、studied']],
    formula:['does/did + 动词原形：Does she go? Did she go?','can/will/must/should + 动词原形：can go','一般现在时 he/she/it：go→goes','过去肯定句：go→went','be + -ing：is going'],
    signals:'看到 does、did、will、can、must、should，立刻检查后一个动词是不是原形。',
    example:['Did she ___ home yesterday?','Did 已经表示过去','后面的动作词不再变过去式','go 是原形；went 是过去式','所以填 go'],
    answer:'Did she go home yesterday? 她昨天回家了吗？',
    confusions:['Does he goes 错：does 已经承担第三人称变化，go 不能再加 es。','Did she went 错：did 已经承担过去时间，went 要恢复 go。','be 本身也是原形；am/is/are/was/were 都是 be 的变化。'],
    moreExamples:[['She goes to work.','没有助动词，主语 she，所以 go 变 goes。'],['She will go to work.','will 后必须用原形 go。'],['She is going to work.','is + going 表示正在去或安排要去。']],
    memory:'助动词或情态动词已经“穿上变化”，后面的实义动词就穿回原形。'
  });
  addGrammarLesson({
    id:'sentence-patterns', title:'五种基础句型怎么看', subtitle:'先抓主干，再看修饰信息',
    goal:'用五种骨架快速拆句，不再逐个单词硬翻。',
    plain:'大多数基础英语句子都能先压缩成几个骨架。地点、时间、方式等修饰成分先放到一边，先确认主语和谓语是否完整。',
    terms:[['主谓','主语自己完成动作，不带宾语','Birds fly.'],['主谓宾','动作作用到一个对象','I like English.'],['主系表','be 连接主语和身份/状态','She is happy.'],['双宾语','动作涉及“给谁什么”','He gave me a book.'],['宾语补足语','宾语后再补充说明宾语','The news made me happy.']],
    formula:['主语 + 谓语：He sleeps.','主语 + 谓语 + 宾语：He reads books.','主语 + 系动词 + 表语：He is busy.','主语 + 谓语 + 间接宾语 + 直接宾语：He gave me a book.','主语 + 谓语 + 宾语 + 补语：It makes me happy.'],
    signals:'先删掉时间、地点、频率等附加信息；剩下的主干通常能套入五种骨架之一。',
    example:['My teacher gives us English lessons every day.','every day 是时间状语，先拿开','My teacher 是主语；gives 是谓语','us 是“给谁”，为间接宾语','English lessons 是“给什么”，为直接宾语'],
    answer:'主语 + 谓语 + 双宾语；every day 是时间状语。',
    confusions:['不是所有句子都有宾语：He sleeps. 已经完整。','be 后面通常找表语，不找宾语。','修饰语很长时先遮住，抓出主干后再逐个放回来。'],
    moreExamples:[['The students study hard.','The students + study 是主谓；hard 是方式状语。'],['I have a new book.','I 主语；have 谓语；a new book 宾语；new 作定语。'],['The weather is very cold today.','The weather 主语；is very cold 谓语；cold 表语；today 时间状语。']],
    memory:'先找谁，再找“做/是”，然后才看对象、身份、地点和时间。'
  });

  addMicroLesson('sentence','noun','名词是什么','人、事物、地点和概念的名字','名词就是给人和事物起的名字，如 student、book、Beijing、English。',['人：student、teacher','物：book、water','地点：school、city'],['I have a book.','book 是一个事物的名字','所以 book 是名词'], 'book 是名词，在句中作 have 的宾语。','看到 a/an、this、my 后面，通常要接名词。');
  addMicroLesson('sentence','verb','动词和动词原形','go、goes、went 为什么是一家人','动词表示动作或状态；原形是词典里的基本样子，goes、went、going 都是 go 的变化。',['原形：go / have / work','三单：goes / has / works','过去：went / had / worked'],['He went home yesterday.','went 表示动作“去”','went 是 go 的过去式'], '动词是 went，原形是 go。','看到 does、did、will、can，后面使用动词原形。');
  addMicroLesson('sentence','adjective','形容词是什么','用来说明人或事物怎么样','形容词说明人或事物的性质，如 good、new、tired，常放在名词前或 be 动词后。',['形容词 + 名词：a new book','be + 形容词：She is tired.','very + 形容词：very good'],['The book is new.','book 是名词','new 说明书怎么样','所以 new 是形容词'], 'new 表示“新的”，是形容词。','看到 is/are 后的状态词，优先判断为形容词。');
  addMicroLesson('sentence','adverb','副词是什么','说明动作怎样、何时或多频繁','副词经常说明动作怎样发生、发生频率或时间，如 quickly、often、yesterday。',['方式：work hard','频率：often go','时间：came yesterday'],['He often reads books.','reads 是动作','often 说明阅读频率','所以 often 是副词'], 'often 表示“经常”，修饰 reads。','often、usually 常放在实义动词前，be 动词后。');
  addMicroLesson('be','be-negative','be 动词否定句','am/is/are 后直接加 not','句中已有 am、is、are 时，不需要 do/does，直接在后面放 not。',['am not','is not = isn’t','are not = aren’t'],['She is busy. → 否定','句中已有 is','is 后加 not'], 'She is not busy. 她不忙。','看到 am/is/are，否定时不要再加 do not。');
  addMicroLesson('be','be-question','be 动词一般疑问句','把 am/is/are 移到主语前','be 动词句变问句，只需要把 be 动词提到主语前面。',['She is busy. → Is she busy?','They are here. → Are they here?','回答继续使用 is/are'],['Is she a teacher?','问句以 Is 开头','主语是 she','肯定回答 Yes, she is.'], 'Yes, she is. 是的，她是。','问句开头是什么 be 动词，简短回答就保留它。');
  addMicroLesson('have','do-does','do 和 does 怎么选','普通动作提问需要助动词','do/does 在问句里帮助普通动作提问。I/you/we/they 用 do；he/she/it 用 does。',['Do + I/you/we/they + 原形?','Does + he/she/it + 原形?','does 出现后动词不加 s'],['___ Tom work here?','Tom 是一个人，可换成 he','he 提问用 Does','work 保持原形'], 'Does Tom work here? 汤姆在这里工作吗？','先找主语；一个他/她/它用 does。');
  addMicroLesson('have','did-helper','did 与过去时问句','did 后为什么不能再用过去式','did 已经表示过去，所以后面的实义动词必须恢复原形。',['Did + 主语 + 动词原形?','did not + 动词原形','不能写 Did she went'],['Did she ___ yesterday?','Did 已表示过去','go 使用原形，不用 went'], 'Did she go yesterday? 她昨天去了吗？','看到 did 或 did not，后面立刻找动词原形。');
  addMicroLesson('have','have-negative','have/has 怎样变否定','没有用 do not / does not have','一般现在时表达“没有”，通常用 do not have 或 does not have。',['I/they do not have','he/she does not have','不能写 does not has'],['He ___ have a car.','主语 he','一般现在时否定用 does not','后面保留 have'], 'He does not have a car. 他没有汽车。','does not 后永远用 have，不用 has。');
  addMicroLesson('question','wh-question','特殊疑问词怎么选','what、where、when、who、how','特殊疑问词告诉你题目想问哪类信息：什么、哪里、何时、谁、怎样。',['what＝什么','where＝哪里；when＝何时','who＝谁；how＝怎样'],['___ are you from?','回答会是一个地点','询问地点使用 where'], 'Where are you from? 你来自哪里？','先看答案属于人、地点、时间还是方式，再选疑问词。');
  addMicroLesson('tense','past','一般过去时','yesterday、last、ago','一般过去时表示已经发生并结束的动作，动词常变为过去式。',['规则变化：work→worked','不规则：go→went','did 后仍用原形'],['He ___ home yesterday.','yesterday 提示过去','go 的过去式是 went'], 'He went home yesterday. 他昨天回家了。','yesterday、last week、two days ago 常提示过去时。');
  addMicroLesson('tense','future','一般将来时','tomorrow 与 will','一般将来时表示还没发生的动作，最常见结构是 will + 动词原形。',['will + 动词原形','will not + 动词原形','Will + 主语 + 动词原形?'],['They will ___ tomorrow.','will 后用原形','come 不加 s/ed/ing'], 'They will come tomorrow. 他们明天会来。','tomorrow、next week、will 常提示将来。');
  addMicroLesson('tense','continuous','现在进行时','此刻正在做什么','现在进行时表示此刻正在发生：am/is/are + 动词-ing。',['I am working','he is working','they are working'],['Look! She ___ .','Look 提醒看此刻','主语 she 用 is','read 变 reading'], 'Look! She is reading. 看！她正在读书。','now、look、listen 常提示 am/is/are + ing。');
  addMicroLesson('article','the','the 什么时候使用','双方都知道的“那个”','the 用来指明确、特定或前面已经提过的人或事物。',['第一次：I see a book.','再次：The book is new.','独一无二：the sun'],['I see a dog. ___ dog is black.','第二次提到同一只狗','双方已经知道是哪一只'], 'The dog is black. 那只狗是黑色的。','前文已出现或后面有限定信息时，优先考虑 the。');
  addMicroLesson('plural','irregular-plural','不规则名词复数','children、men、women','有些名词不能只加 s，需要单独记住常见变化。',['child→children','man→men；woman→women','foot→feet'],['There are two ___ .','two 要求复数','child 的复数是 children'], 'There are two children. 有两个孩子。','看到 two/many 后先检查是不是不规则复数。');
  addMicroLesson('plural','countable','可数与不可数名词','many 和 much 怎么选','可数名词能一个个数，用 many；不可数名词通常不能直接数，用 much。',['many books / students','much water / information','some 两类都可用'],['How ___ water is there?','water 通常不可数','不可数名词用 much'], 'How much water is there? 有多少水？','many 看复数可数名词；much 看不可数名词。');
  addMicroLesson('pronoun','possessive','my / your / his / her','表示谁的东西','my、your、his、her 放在名词前，说明东西属于谁。',['my book','your name','his car / her bag'],['This is ___ book. I own it.','I 表示我','我的书用 my'], 'This is my book. 这是我的书。','空格后紧跟名词时，检查是否需要“谁的”。');
  addMicroLesson('pronoun','demonstrative','this / that / these / those','远近和单复数一起判断','this/these 较近，that/those 较远；this/that 配单数，these/those 配复数。',['this：近处单数','that：远处单数','these：近处复数；those：远处复数'],['___ are my books here.','books 是复数','here 表示近处','所以使用 These'], 'These are my books. 这些是我的书。','先看单复数，再看 here/there 或语境中的远近。');
  addMicroLesson('preposition','place-preposition','地点介词 in / on / at','里面、表面和具体地点','地点中 in 表示在内部，on 表示在表面，at 常表示具体地点或位置点。',['in the room','on the desk','at the station'],['The book is ___ the desk.','书接触桌子表面','在表面使用 on'], 'The book is on the desk. 书在桌子上。','能理解成“内部”用 in，“表面”用 on，“地点点位”常用 at。');
  addMicroLesson('preposition','transport','by 与交通方式','by bus 为什么没有冠词','表达乘坐某种交通工具，常用 by + 交通工具单数，中间通常不加 a/the。',['by bus','by bike','by train'],['I go to work ___ bus.','表示交通方式','固定搭配 by bus'], 'I go to work by bus. 我乘公交车上班。','by 后直接接交通工具；步行是 on foot。');
  addMicroLesson('reading','dialogue','完成对话题','问什么就回答什么','对话题先认问句功能：问姓名、地点、时间、状态或能力，再选择同功能回答。',['How are you? → 状态','Where...? → 地点','What time...? → 时间'],['A: What time is it? B: ___','问的是时间','答案必须包含具体时间'], 'It is eight o’clock. 八点了。','不要只看句子通顺，要看回答是否回应了问题。',['完成对话']);
  addMicroLesson('reading','reading-locate','阅读理解定位题','带着题干关键词回原文','阅读题先找题干中的人名、数字、时间或核心名词，再回原文定位对应句。',['圈题干关键词','回原文找到同词或近义词','只根据原文排除'],['题目问 Tom goes to work how?','先在原文找 Tom 和 work','对应句写 Tom goes by bus','因此选择 by bus'], 'Tom goes to work by bus.','先定位再理解，不凭生活常识选择。',['阅读理解']);
  addMicroLesson('reading','some-any','some 和 any','一些到底什么时候用','肯定句常用 some；否定句和一般疑问句常用 any。表示邀请或希望肯定回答时，疑问句也可能用 some。',['肯定：There are some books.','疑问：Are there any books?','否定：There are not any books.'],['Do you have ___ pens?','这是一般疑问句','通常使用 any'], 'Do you have any pens? 你有一些钢笔吗？','先看肯定、否定还是疑问，再判断 some/any。',['核心词汇','疑问句']);
  addMicroLesson('reading','there-be','There be 句型','某地有某物','There is/are 表示“某地存在某物”，后面的名词决定 is 还是 are。',['There is + 单数/不可数','There are + 复数','地点通常放句尾'],['There ___ two books on the desk.','two books 是复数','复数使用 are'], 'There are two books on the desk. 桌上有两本书。','不要被 there 迷惑，真正决定 is/are 的是后面名词。',['be动词','疑问句']);

  const lessonDetails = {
    noun:{terms:[['名词','人、事物、地点或概念的名称','teacher、book、Beijing、English'],['普通名词','一类人或事物的通用名称','student、city、water'],['专有名词','特定名称，首字母通常大写','Tom、China、Monday'],['可数名词','可以直接数一个、两个','a book、two books'],['不可数名词','通常不能直接用数字数','water、information']],confusions:['名词是词性；名词可以在句中作主语、宾语或表语。','a、an、the、my、this 后面常需要名词，但中间可能夹形容词：a new book。'],moreExamples:[['Books are useful.','Books 是名词，在句中作主语。'],['I read books.','books 是名词，在句中作宾语。'],['Tom is a student.','student 是名词，在句中作表语。']],memory:'能给人、事物、地点、概念“起名字”的词，通常就是名词。'},
    verb:{terms:[['动词','表示动作、状态或存在的词','go、work、like、be'],['实义动词','本身有明确动作或含义','read 读、have 有、know 知道'],['be 动词','表示是、在或状态，并连接表语','am、is、are、was、were'],['助动词','帮助构成问句、否定句或时态','do、does、did、have、will'],['情态动词','表达能、会、必须、应该','can、may、must、should']],confusions:['动词是词性，谓语是句子岗位；谓语的核心通常是动词。','同一个词可能有多种形式：go、goes、went、going。','does/did/can/will 后面必须用动词原形。'],moreExamples:[['She works here.','works 是实义动词，也是本句谓语。'],['She is busy.','is 是 be 动词；is busy 一起构成谓语。'],['Does she work?','does 是助动词，work 是实义动词原形。']],memory:'看到一个词能表达“做、是、在、拥有、想法或状态”，先考虑它是不是动词。'},
    adjective:{terms:[['形容词','说明人或事物“什么样”','good、new、tired、important'],['定语用法','放在名词前直接修饰名词','a new book'],['表语用法','放在 be 等系动词后说明主语','The book is new.'],['比较级','比较两者时使用的形式','bigger、more important']],confusions:['形容词是词性；它在句中常作定语或表语。','形容词一般不能独自作谓语：She happy 错，应为 She is happy.','very 后面常接形容词或副词，但 very 本身不是形容词。'],moreExamples:[['She is a good student.','good 修饰名词 student，作定语。'],['The student is good.','good 放在 is 后说明 student，作表语。'],['This question is difficult.','difficult 是形容词，表示“困难的”。']],memory:'形容词负责回答“什么样”，放名词前作定语，放 be 后常作表语。'},
    adverb:{terms:[['副词','修饰动词、形容词、副词或整句话','quickly、very、often、yesterday'],['方式副词','说明动作怎样发生','speak slowly'],['频率副词','说明动作多久发生一次','always、often、sometimes'],['时间副词','说明动作何时发生','today、yesterday、now'],['程度副词','说明程度大小','very good、too fast']],confusions:['副词是词性；副词在句中经常作状语。','often 通常放实义动词前、be 动词后：often go / is often late。','形容词修饰名词；副词通常不直接修饰名词。'],moreExamples:[['He runs quickly.','quickly 修饰 runs，说明怎样跑。'],['She is very kind.','very 修饰形容词 kind，说明程度。'],['They often study at night.','often 是频率副词；at night 是时间状语。']],memory:'副词常回答“怎样、何时、多久一次、到什么程度”。'}
  };
  Object.entries(lessonDetails).forEach(([id,details]) => Object.assign(topicLessons.find(item => item.id === id), details));

  topicLessons.sort((a,b) => Object.keys(chapterNames).indexOf(a.chapter ? Object.keys(chapterNames).find(key => chapterNames[key] === a.chapter) : a.id) - Object.keys(chapterNames).indexOf(b.chapter ? Object.keys(chapterNames).find(key => chapterNames[key] === b.chapter) : b.id));
  topicLessons.forEach((lesson,index) => { lesson.order = index + 1; });

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
      const ranked = shuffle(source).sort((a,b) => (severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]) || String(a.id).localeCompare(String(b.id)));
      for (const q of ranked) {
        if (!add(q)) continue;
        added += 1;
        if (added >= count) break;
      }
      return added;
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
      archive:'DEGREE-ENGLISH-WEB-V4.9',
      exportedAt:nowIso(),
      state:readState(),
      history:readHistory(),
      mastery:readMastery(),
      settings:readSettings()
      ,notebook:readJson(NOTE_KEY,{})
      ,topicCourse:readCourseProgress()
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
        if (!['DEGREE-ENGLISH-WEB-V3','DEGREE-ENGLISH-WEB-V4','DEGREE-ENGLISH-WEB-V4.1','DEGREE-ENGLISH-WEB-V4.2','DEGREE-ENGLISH-WEB-V4.3','DEGREE-ENGLISH-WEB-V4.4','DEGREE-ENGLISH-WEB-V4.5','DEGREE-ENGLISH-WEB-V4.6','DEGREE-ENGLISH-WEB-V4.7','DEGREE-ENGLISH-WEB-V4.8','DEGREE-ENGLISH-WEB-V4.9'].includes(payload.archive) || !Array.isArray(payload.history) || typeof payload.mastery !== 'object') throw new Error('格式不正确');
        if (!confirm('导入会用文件中的学习档案替换当前网页版记录，确定继续吗？')) return;
        if (payload.state) localStorage.setItem(STATE_KEY, JSON.stringify(payload.state));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload.history.slice(0,10)));
        localStorage.setItem(MASTERY_KEY, JSON.stringify(payload.mastery));
        if (payload.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
        if (payload.notebook && typeof payload.notebook === 'object' && !Array.isArray(payload.notebook)) localStorage.setItem(NOTE_KEY, JSON.stringify(payload.notebook));
        if (payload.topicCourse && typeof payload.topicCourse === 'object' && !Array.isArray(payload.topicCourse)) localStorage.setItem(COURSE_KEY, JSON.stringify(payload.topicCourse));
        if (!payload.state) localStorage.removeItem(STATE_KEY);
        alert('学习档案导入成功。');
        renderHome();
      } catch {
        alert('导入失败：请选择由本网站导出的学习档案文件。');
      }
    };
    reader.readAsText(file);
  }

  function startSession(questionIds, mode = 'simulation', customTitle = '') {
    leaveQuiz();
    const optionOrders = {};
    questionIds.forEach((id, index) => { optionOrders[id] = balancedOrder(find(id), index); });
    const state = {
      version: 4,
      sessionId: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sequenceNo: nextSequence(),
      mode,
      title: customTitle || (mode === 'reinforce' ? '错题强化' : mode === 'practice' ? '冲刺练习' : mode === 'retest' ? '重点复测' : '模拟测评'),
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

  function readCourseProgress() {
    return readJson(COURSE_KEY, {});
  }

  function saveCourseProgress(progress) {
    localStorage.setItem(COURSE_KEY, JSON.stringify(progress));
  }

  function renderTopicCourses() {
    leaveQuiz();
    const progress = readCourseProgress();
    const completed = topicLessons.filter(lesson => progress[lesson.id]?.completedAt).length;
    let lastChapter = '';
    const rows = topicLessons.map(lesson => {
      const done = Boolean(progress[lesson.id]?.completedAt);
      const chapter = lesson.chapter !== lastChapter ? `<div class="topic-chapter"><b>${esc(lesson.chapter)}</b><span>${topicLessons.filter(item => item.chapter === lesson.chapter).length} 课</span></div>` : '';
      lastChapter = lesson.chapter;
      return `${chapter}<button class="topic-row" data-topic="${lesson.id}"><b>${String(lesson.order).padStart(2,'0')}</b><span><small>${done ? '✓ 已学过' : '零基础小课'}</small><strong>${esc(lesson.title)}</strong><em>${esc(lesson.subtitle)}</em></span><i>›</i></button>`;
    }).join('');
    app.innerHTML = `<header class="guide-header topic-header"><button id="topic-home" aria-label="返回首页">←</button><div><p class="eyebrow dark">先学明白，再做同类题</p><h1>零基础题型课</h1><p>${topicLessons.length} 节小课 · 12 个模块 · 已学 ${completed}/${topicLessons.length}</p></div></header><section class="card topic-intro"><span>推荐顺序</span><h2>一次只学一个小知识点</h2><p>原来的 12 节综合课已经拆成 ${topicLessons.length} 节小课。每课只解决一个问题，再解释术语、公式和例题，最后做 5 道同类题。时间紧先完成第 1–18 课和介词模块。</p><div class="topic-flow"><b>认题型</b><i>→</i><b>懂术语</b><i>→</i><b>看例题</b><i>→</i><b>练5题</b></div></section><section class="card topic-list-card"><div class="section-head"><div><h2>全部课程</h2><p class="hint compact">按 12 个模块分组；点击课程不会改动未完成试卷</p></div><span>${completed}/${topicLessons.length}</span></div><div class="topic-list">${rows}</div></section>`;
    document.querySelector('#topic-home').onclick = renderHome;
    document.querySelectorAll('[data-topic]').forEach(button => button.onclick = () => renderTopicLesson(button.dataset.topic));
    window.scrollTo(0,0);
  }

  function startTopicPractice(lesson) {
    const active = migrateState(readState());
    if (active && !active.finishedAt) {
      alert(`你还有未完成的“${active.title}”，先继续完成，课程记录不会丢失。`);
      renderQuiz(active);
      return;
    }
    const records = readMastery();
    const severity = {'不会':0,'错误':1,'易出错':2,'未学习':3,'正确':4};
    const pool = bank.filter(question => lesson.cats.includes(question.cat)).sort((a,b) => severity[masteryStatus(records[a.id])] - severity[masteryStatus(records[b.id])]);
    const ids = [], stems = new Set();
    for (const question of pool) {
      const stem = stemKey(question);
      if (stems.has(stem)) continue;
      stems.add(stem); ids.push(question.id);
      if (ids.length === 5) break;
    }
    if (ids.length < 5) return alert('当前同类题不足 5 道，请先返回题库解析中心学习。');
    startSession(ids, 'practice', `${lesson.title} · 5题引导练习`);
  }

  function renderTopicLesson(id) {
    leaveQuiz();
    const lesson = topicLessons.find(item => item.id === id);
    if (!lesson) return renderTopicCourses();
    const progress = readCourseProgress();
    progress[id] = {...progress[id], openedAt:nowIso()};
    saveCourseProgress(progress);
    const termRows = lesson.terms.map(([term,meaning,example]) => `<div><b>${esc(term)}</b><span>${esc(meaning)}</span><small>${esc(example)}</small></div>`).join('');
    const formulaRows = lesson.formula.map((row,index) => `<p><b>${index + 1}</b><span>${esc(row)}</span></p>`).join('');
    const exampleRows = lesson.example.map((row,index) => `<li><b>${index === 0 ? '题目' : `第${index}步`}</b><span>${esc(row)}</span></li>`).join('');
    const confusionRows = (lesson.confusions || []).map(row => `<li>${esc(row)}</li>`).join('');
    const extraExampleRows = (lesson.moreExamples || []).map(([sentence,analysis]) => `<article><b>${esc(sentence)}</b><p>${esc(analysis)}</p></article>`).join('');
    const detailSections = `${confusionRows ? `<section class="card lesson-card"><div class="lesson-label">零基础最容易卡住的地方</div><h2>这些概念不要混在一起</h2><ul class="lesson-confusions">${confusionRows}</ul></section>` : ''}${extraExampleRows ? `<section class="card lesson-card"><div class="lesson-label">换句子也能认出来</div><h2>再拆几句给你看</h2><div class="lesson-extra-examples">${extraExampleRows}</div>${lesson.memory ? `<div class="lesson-memory"><b>最后只记这一句</b><span>${esc(lesson.memory)}</span></div>` : ''}</section>` : ''}`;
    const isDone = Boolean(progress[id]?.completedAt);
    const active = migrateState(readState());
    const practiceLabel = active && !active.finishedAt ? `先继续未完成的“${esc(active.title)}”` : '开始 5 题同类练习';
    app.innerHTML = `<header class="guide-header topic-header"><button id="topic-back" aria-label="返回题型课">←</button><div><p class="eyebrow dark">第 ${lesson.order}/${topicLessons.length} 课 · ${esc(lesson.chapter)} · ${lesson.cats.map(esc).join(' / ')}</p><h1>${esc(lesson.title)}</h1><p>${esc(lesson.subtitle)}</p></div></header><section class="card lesson-lead"><span>学完能解决什么</span><h2>${esc(lesson.goal)}</h2><p>${esc(lesson.plain)}</p></section><section class="card lesson-card"><div class="lesson-label">先把术语翻成大白话</div><h2>这几个词是什么意思</h2><div class="term-list">${termRows}</div></section><section class="card lesson-card"><div class="lesson-label">考场判断顺序</div><h2>只按这几步做</h2><div class="lesson-formulas">${formulaRows}</div><div class="lesson-signal"><b>看到什么先反应：</b>${esc(lesson.signals)}</div></section><section class="card lesson-card"><div class="lesson-label">老师带着做一题</div><h2>不要直接背答案</h2><ol class="worked-example">${exampleRows}</ol><div class="lesson-answer"><b>最后答案</b><span>${esc(lesson.answer)}</span></div></section>${detailSections}<section class="card lesson-actions"><button class="secondary" id="lesson-understood">${isDone ? '✓ 已学过这课' : '我看懂了，标记已学'}</button><button class="primary" id="lesson-practice">${practiceLabel}</button><p>练习中仍可展开逐词解释和逐步解题；答错后会进入重点复习。</p></section>`;
    document.querySelector('#topic-back').onclick = renderTopicCourses;
    document.querySelector('#lesson-understood').onclick = event => {
      const latest = readCourseProgress();
      latest[id] = {...latest[id], openedAt:latest[id]?.openedAt || nowIso(), completedAt:nowIso()};
      saveCourseProgress(latest);
      event.currentTarget.textContent = '✓ 已学过这课';
      event.currentTarget.classList.add('completed');
    };
    document.querySelector('#lesson-practice').onclick = () => startTopicPractice(lesson);
    window.scrollTo(0,0);
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
    app.innerHTML = `<header class="guide-header analysis-header"><button id="analysis-home" aria-label="返回首页">←</button><div><p class="eyebrow dark">零基础全题解析</p><h1>791题解析中心</h1><p>每题均有逐词、发音、结构和四个选项原因</p></div></header><section class="card analysis-tools"><form id="analysis-search"><label>搜索题目、单词或考点<input id="analysis-query" type="search" value="${esc(analysisView.query)}" placeholder="例如：some、过去时、Do they"></label><button>搜索</button></form><div class="analysis-filters"><label>题型<select id="analysis-category"><option>全部</option>${categories.map(category => `<option ${analysisView.category === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}</select></label><label>掌握状态<select id="analysis-status">${['全部','不会','错误','易出错','正确','未学习'].map(status => `<option ${analysisView.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label></div><div class="status-summary">${Object.entries(counts).map(([status,count]) => `<span><b>${count}</b>${status}</span>`).join('')}</div><p class="hint compact">当前找到 ${filtered.length} 题 · 默认按“不会 → 错误 → 易出错 → 正确 → 未学习”排序</p><button class="secondary" id="analysis-go-guide">专项讲解：go 和 goes</button></section><section class="card analysis-list-card"><div class="section-head"><div><h2>${esc(analysisView.category === '全部' ? '全部题型' : analysisView.category)}</h2><p class="hint compact">第 ${analysisView.page + 1}/${pageCount} 页 · 本页 ${pageRows.length} 题</p></div><span>${filtered.length} 题</span></div><div class="analysis-list">${rowsHtml}</div>${filtered.length ? `<div class="analysis-pagination"><button id="analysis-prev" ${analysisView.page === 0 ? 'disabled' : ''}>上一页</button><form id="analysis-jump"><label><input id="analysis-page-number" type="number" inputmode="numeric" min="1" max="${pageCount}" value="${analysisView.page + 1}" aria-label="输入页码"> / ${pageCount}</label><button>跳转</button></form><button id="analysis-next" ${analysisView.page >= pageCount - 1 ? 'disabled' : ''}>下一页</button></div>` : ''}</section>`;
    document.querySelector('#analysis-home').addEventListener('click', renderHome);
    document.querySelector('#analysis-go-guide').addEventListener('click', () => renderGoGuide('analysis'));
    document.querySelector('#analysis-search').addEventListener('submit', event => { event.preventDefault(); analysisView.query = document.querySelector('#analysis-query').value.trim(); analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-category').addEventListener('change', event => { analysisView.category = event.target.value; analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-status').addEventListener('change', event => { analysisView.status = event.target.value; analysisView.page = 0; analysisView.scrollY = 0; renderAnalysisCenter(); });
    document.querySelector('#analysis-reset')?.addEventListener('click', () => { analysisView.query=''; analysisView.category='全部'; analysisView.status='全部'; analysisView.page=0; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelector('#analysis-prev')?.addEventListener('click', () => { analysisView.page -= 1; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelector('#analysis-next')?.addEventListener('click', () => { analysisView.page += 1; analysisView.scrollY=0; renderAnalysisCenter(); });
    document.querySelector('#analysis-jump')?.addEventListener('submit', event => {
      event.preventDefault();
      const input = document.querySelector('#analysis-page-number');
      const requested = Number(input.value);
      if (!Number.isInteger(requested) || requested < 1 || requested > pageCount) {
        input.setCustomValidity(`请输入 1 到 ${pageCount} 之间的页码`);
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');
      analysisView.page = requested - 1;
      analysisView.scrollY = 0;
      renderAnalysisCenter();
    });
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
      const courseProgress = readCourseProgress();
      const learnedTopics = topicLessons.filter(lesson => courseProgress[lesson.id]?.completedAt).length;
      const courseEntry = document.createElement('section');
      courseEntry.className = 'card course-entry';
      courseEntry.innerHTML = `<div class="course-entry-copy"><span>零基础第一入口</span><h2>先学题型，再做题</h2><p>从主语、谓语、be 动词开始，拆成 ${topicLessons.length} 节小课；每课只讲一个问题，再接 5 道同类题。</p><div class="course-progress"><i style="width:${Math.round(learnedTopics / topicLessons.length * 100)}%"></i></div><small>已学 ${learnedTopics}/${topicLessons.length} 课 · 时间紧先学前 18 课和介词</small></div><button id="open-topic-courses">打开题型课</button>`;
      masteryCard.before(courseEntry);
      courseEntry.querySelector('#open-topic-courses').onclick = renderTopicCourses;
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
      report: 'DEGREE-ENGLISH-WEB-V4.9',
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
