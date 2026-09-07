/* 7.3.1 离线大题库：全部为依据公开考试结构编写的原创仿真题，不冒充历年真题。 */
globalThis.offlineQuestionBankV731=(()=>{
  const out=[],seen=new Set();
  const add=q=>{
    if(!q||seen.has(q.id)||!q.q||!Array.isArray(q.options)||q.options.length!==4)return;
    const options=q.options.map(String),answer=Number(q.answer);
    if(answer<0||answer>3||new Set(options).size!==4)return;
    seen.add(q.id);out.push({...q,options,answer,source:'simulated',sourceLabel:'原创仿真题',difficulty:q.difficulty||'基础',translation:q.translation||'',read:q.read||''});
  };
  const flatWords=[];
  Object.entries(groups).forEach(([cat,list])=>list.forEach((x,i)=>flatWords.push({id:`w-${cat}-${i}`,cat,en:x[0],read:x[1],cn:x[2]})));
  const pick=(arr,index,field)=>{
    const answer=String(arr[index][field]),values=[answer];
    for(let n=1;values.length<4&&n<arr.length;n++){
      const value=String(arr[(index+n*17)%arr.length][field]);
      if(!values.includes(value))values.push(value);
    }
    return values;
  };
  flatWords.forEach((w,i)=>{
    add({id:`v731-word-cn-${w.id}`,type:'vocabulary',cat:'核心词汇',q:`“${w.cn}”的正确英文是：`,options:pick(flatWords,i,'en'),answer:0,point:`词汇：${w.en}`,explain:`${w.en} 表示“${w.cn}”。辅助读法：${w.read}。`,translation:`请选择与“${w.cn}”意思相符的英文单词。`,vocab:[w],ref:{type:'word',id:w.id}});
    add({id:`v731-word-en-${w.id}`,type:'vocabulary',cat:'核心词汇',q:`${w.en} 的中文意思是：`,options:pick(flatWords,i,'cn'),answer:0,point:`词汇：${w.en}`,explain:`${w.en} 的中文意思是“${w.cn}”。辅助读法：${w.read}。`,translation:`请选择单词 ${w.en} 的正确中文意思。`,vocab:[w],ref:{type:'word',id:w.id}});
    add({id:`v731-word-read-${w.id}`,type:'listening',cat:'词汇听读',q:'点击“播放英文”，选择你听到的单词：',options:pick(flatWords,i,'en'),answer:0,point:`听音辨词：${w.en}`,explain:`语音播放的是 ${w.en}，意思是“${w.cn}”。辅助读法仅用于课后复习：${w.read}。`,translation:'先只听语音作答；实在听不清，再在交卷后查看单词解释。',audioText:w.en,vocab:[w],ref:{type:'word',id:w.id},difficulty:'巩固'});
  });
  sentenceBank.forEach((s,i)=>{
    add({id:`v731-sentence-en-${s.id}`,type:'translation',cat:'句子翻译',q:s.en,options:pick(sentenceBank,i,'cn'),answer:0,point:'句子理解与语序',explain:`${s.en} 的意思是“${s.cn}”。${s.read?`辅助读法：${s.read}。`:''}`,translation:'选择与英文句子意思一致的中文。',vocab:[],ref:{type:'sentence',id:s.id},difficulty:'巩固'});
    add({id:`v731-sentence-cn-${s.id}`,type:'translation',cat:'句子翻译',q:`“${s.cn}”的正确英文是：`,options:pick(sentenceBank,i,'en'),answer:0,point:'中译英与语序',explain:`正确表达是 ${s.en}${s.read?` 辅助读法：${s.read}。`:''}`,translation:`把“${s.cn}”译成英文。`,vocab:[],ref:{type:'sentence',id:s.id},difficulty:'提高'});
  });

  const names=['Tom','Mary','Jack','Lucy','Mr. Li','my teacher','my mother','the student'];
  const plurals=['students','teachers','friends','books','apples','bikes','phones','questions'];
  const singulars=['student','teacher','friend','book','apple','bike','phone','question'];
  const adjectives=[['busy','忙的'],['tired','累的'],['happy','高兴的'],['sad','难过的'],['ready','准备好的'],['free','空闲的'],['young','年轻的'],['healthy','健康的']];
  const objects=[['a book','一本书'],['a phone','一部手机'],['a bike','一辆自行车'],['a name','一个名字'],['two books','两本书'],['three friends','三个朋友'],['a new home','一个新家'],['four questions','四个问题']];
  names.forEach((name,i)=>{
    const be=name==='I'?'am':'is';
    add({id:`v731-be-singular-${i}`,type:'grammar',cat:'be动词',q:`${name} ___ ${adjectives[i][0]}.`,options:['is','are','am','be'],answer:0,point:'单数主语用 is',explain:`${name} 在本句中表示一个人，是单数主语，所以使用 is。`,translation:`${name} ${adjectives[i][1]}。`,difficulty:'基础'});
    add({id:`v731-have-singular-${i}`,type:'grammar',cat:'have/has',q:`${name} ___ ${objects[i][0]}.`,options:['has','have','is','does'],answer:0,point:'第三人称单数用 has',explain:`主语 ${name} 表示一个人，表达“有”时使用 has。`,translation:`${name} 有${objects[i][1]}。`,difficulty:'基础'});
    add({id:`v731-does-question-${i}`,type:'grammar',cat:'疑问句',q:`___ ${name} have ${i%2?'a book':'a phone'}?`,options:['Does','Do','Is','Are'],answer:0,point:'第三人称单数疑问句用 Does',explain:`一般现在时中，第三人称单数作主语时，疑问句用 Does 开头，后面的 have 保持原形。`,translation:`${name} 有${i%2?'一本书':'一部手机'}吗？`,difficulty:'巩固'});
    add({id:`v731-does-negative-${i}`,type:'grammar',cat:'否定句',q:`${name} ___ not have ${i%2?'a bike':'a new phone'}.`,options:['does','do','is','has'],answer:0,point:'第三人称单数否定句用 does not',explain:`主语表示一个人，一般现在时否定句用 does not，后面的 have 不加 s。`,translation:`${name} 没有${i%2?'自行车':'新手机'}。`,difficulty:'巩固'});
  });
  const singularCn=['学生','老师','朋友','书','苹果','自行车','手机','问题'];
  const pluralPlaces=[['in the classroom','教室里'],['at school','学校里'],['in the room','房间里'],['on the desk','书桌上'],['in the bag','包里'],['near the door','门旁边'],['at home','家里'],['in this lesson','这一课里']];
  plurals.forEach((noun,i)=>{
    add({id:`v731-be-plural-${i}`,type:'grammar',cat:'be动词',q:`These ${noun} ___ new.`,options:['are','is','am','be'],answer:0,point:'复数主语用 are',explain:`These 和复数名词 ${noun} 构成复数主语，因此使用 are。`,translation:`这些${singularCn[i]}是新的。`,difficulty:'基础'});
    add({id:`v731-plural-${i}`,type:'grammar',cat:'名词复数',q:`There are two ___ ${pluralPlaces[i][0]}.`,options:[noun,singulars[i],`${singulars[i]}'s`,`${noun}'`],answer:0,point:'数量大于一时用名词复数',explain:`two 表示两个，后面需要使用复数名词 ${noun}。${singulars[i]}'s 和 ${noun}' 表示所属关系，不能作为本句答案。`,translation:`${pluralPlaces[i][1]}有两个${singularCn[i]}。重点看 two 后面的名词复数。`,difficulty:'基础'});
    add({id:`v731-do-plural-${i}`,type:'grammar',cat:'疑问句',q:`___ the ${noun} have new books?`,options:['Do','Does','Are','Is'],answer:0,point:'复数主语疑问句用 Do',explain:`the ${noun} 是复数主语，一般现在时疑问句用 Do 开头。`,translation:`这些${noun}有新书吗？`,difficulty:'提高'});
  });
  const articles=[['apple','an','苹果'],['egg','an','鸡蛋'],['hour','an','小时'],['English book','an','英语书'],['book','a','书'],['student','a','学生'],['phone','a','手机'],['university','a','大学']];
  articles.forEach((x,i)=>add({id:`v731-article-${i}`,type:'grammar',cat:'冠词',q:`This is ___ ${x[0]}.`,options:[x[1],x[1]==='a'?'an':'a','the','不填'],answer:0,point:'a/an 取决于后面单词开头的发音',explain:`${x[0]} 开头是${x[1]==='an'?'元音':'辅音'}音，因此使用 ${x[1]}。判断 a/an 要听发音，不只看字母。`,translation:`这是一个${x[2]}。`,difficulty:'基础'}));
  const demos=[
    ['This','is','这个','book'],['That','is','那个','apple'],['These','are','这些','books'],['Those','are','那些','students'],
    ['This','is','这个','phone'],['That','is','那个','teacher'],['These','are','这些','friends'],['Those','are','那些','bikes']
  ];
  demos.forEach((x,i)=>add({id:`v731-demo-${i}`,type:'grammar',cat:'指示代词',q:`___ ${x[1]} my ${x[3]}.`,options:[x[0],demos[(i+1)%demos.length][0],demos[(i+2)%demos.length][0],demos[(i+3)%demos.length][0]],answer:0,point:'this/that 与 these/those 的单复数搭配',explain:`${x[1]} 和 ${x[3]} 决定这里是${x[1]==='is'?'单数':'复数'}，正确指示代词是 ${x[0]}。`,translation:`${x[2]}是我的${x[3]}。`,difficulty:'巩固'}));
  const possessives=[['my','I','我的'],['your','you','你的'],['his','he','他的'],['her','she','她的'],['our','we','我们的'],['their','they','他们的'],['its','it','它的'],['your','you','你们的']];
  const possessiveObjects=[['book','书'],['phone','手机'],['bike','自行车'],['desk','书桌'],['room','房间'],['teacher','老师'],['name','名字'],['class','班级']];
  const subjectBe={I:'am',you:'are',he:'is',she:'is',we:'are',they:'are',it:'is'};
  const subjectCn={I:'我',you:'你（们）',he:'他',she:'她',we:'我们',they:'他们',it:'它'};
  possessives.forEach((x,i)=>{
    const distractors=['I','you','he','she','we','they','me','him'].filter(value=>value!==x[0]&&value!==x[1]).slice(i%3,i%3+3);
    add({id:`v731-possessive-${i}`,type:'grammar',cat:'代词',q:`${x[1]} ${subjectBe[x[1]]} here. This is ___ ${possessiveObjects[i][0]}.`,options:[x[0],...distractors],answer:0,point:'形容词性物主代词放在名词前',explain:`空格后是名词 ${possessiveObjects[i][0]}，前面要用表示“谁的”的形容词性物主代词；${x[0]} 表示“${x[2]}”。`,translation:`${subjectCn[x[1]]}在这里。这是${x[2]}${possessiveObjects[i][1]}。`,difficulty:'基础'});
  });
  const prep=[['in','the morning','在早晨'],['on','Monday','在星期一'],['at','eight o’clock','在八点'],['in','Shandong','在山东'],['at','school','在学校'],['on','the desk','在桌子上'],['in','the room','在房间里'],['at','night','在夜晚']];
  prep.forEach((x,i)=>add({id:`v731-prep-${i}`,type:'grammar',cat:'介词',q:`I study English ___ ${x[1]}.`,options:[x[0],x[0]==='in'?'on':'in',x[0]==='at'?'on':'at','to'],answer:0,point:'时间和地点介词',explain:`固定搭配是 ${x[0]} ${x[1]}，意思是“${x[2]}”。`,translation:`我${x[2]}学习英语。`,difficulty:'提高'}));
  const modals=[['can','read','this English passage','会读这篇英语短文'],['can','write','this word','会写这个单词'],['can','help','you','能帮助你'],['can','speak','English with my teacher','会和老师说英语'],['will','study','tomorrow','明天会学习'],['will','work','hard','会努力工作'],['must','finish','the test','必须完成测试'],['should','review','today','今天应该复习']];
  const thirdForm=verb=>verb.endsWith('y')?`${verb.slice(0,-1)}ies`:verb.endsWith('sh')?`${verb}es`:`${verb}s`;
  const ingForm=verb=>verb==='write'?'writing':`${verb}ing`;
  modals.forEach((x,i)=>add({id:`v731-modal-${i}`,type:'grammar',cat:'情态动词',q:`I ${x[0]} ___ ${x[2]}.`,options:[x[1],thirdForm(x[1]),ingForm(x[1]),`to ${x[1]}`],answer:0,point:'情态动词后使用动词原形',explain:`${x[0]} 是情态动词，后面直接接动词原形 ${x[1]}，不能加 s、ing，也不能加 to。`,translation:`我${x[3]}。`,difficulty:'提高'}));

  const dialogues=[
    ['How are you?','I am fine, thank you.','你好吗？','我很好，谢谢。'],
    ['What is your name?','My name is Tom.','你叫什么名字？','我叫汤姆。'],
    ['Are you busy today?','No, I am not.','你今天忙吗？','不，我不忙。'],
    ['Does she have a phone?','Yes, she does.','她有手机吗？','是的，她有。'],
    ['Do they have books?','No, they do not.','他们有书吗？','不，他们没有。'],
    ['Is this your pen?','Yes, it is.','这是你的钢笔吗？','是的，它是。'],
    ['Are those her apples?','No, they are not.','那些是她的苹果吗？','不，它们不是。'],
    ['Where are you from?','I am from Shandong.','你来自哪里？','我来自山东。'],
    ['Can you speak English?','Yes, I can.','你会说英语吗？','是的，我会。'],
    ['What time is it?','It is eight o’clock.','几点了？','八点了。']
  ];
  dialogues.forEach((d,i)=>{
    const replies=dialogues.map(x=>x[1]);
    add({id:`v731-dialogue-${i}`,type:'dialogue',cat:'完成对话',q:`A: ${d[0]}\nB: ___`,options:pick(replies.map((x,j)=>({v:x,id:j})),i,'v'),answer:0,point:'情景对话与简短回答',explain:`问句“${d[0]}”意为“${d[2]}”，合适的回答是“${d[1]}”（${d[3]}）。`,translation:`A：${d[2]}\nB：请选择最合适的回答。`,difficulty:i<4?'基础':'提高'});
  });

  const passages=[
    {id:'study',text:'Tom is a student. He studies English every day. He reads words in the morning and does a short test in the evening. English is difficult for him, but he does not give up.',cn:'汤姆是一名学生。他每天学习英语。他早晨读单词，晚上做一个小测验。英语对他来说很难，但他没有放弃。',qs:[['What is Tom?',['A student','A teacher','A doctor','A worker'],0,'Tom is a student.'],['When does he read words?',['In the morning','At noon','In the afternoon','At night'],0,'He reads words in the morning.'],['What does he do in the evening?',['He does a short test','He plays games','He travels','He sleeps'],0,'He does a short test in the evening.'],['Does Tom give up English?',['No, he does not','Yes, he does','We do not know','He never studies'],0,'The passage says he does not give up.']]},
    {id:'family',text:'Mary has a small family. Her father is a doctor and her mother is a teacher. Mary has one brother. They often have dinner together and talk about their day.',cn:'玛丽有一个小家庭。她的父亲是医生，母亲是老师。玛丽有一个弟弟。他们经常一起吃晚饭并谈论一天的生活。',qs:[['What is Mary’s father?',['A doctor','A teacher','A student','A manager'],0,'Her father is a doctor.'],['What is Mary’s mother?',['A teacher','A nurse','A worker','A doctor'],0,'Her mother is a teacher.'],['How many brothers does Mary have?',['One','Two','Three','Four'],0,'Mary has one brother.'],['What do they often do together?',['Have dinner','Study at school','Take a train','Play football'],0,'They often have dinner together.']]},
    {id:'phone',text:'A phone is useful in daily life. Jack uses his phone to call his family and find information. He does not use it for too long because he wants to stay healthy.',cn:'手机在日常生活中很有用。杰克用手机给家人打电话并查找信息。他不会使用太久，因为他想保持健康。',qs:[['What does Jack use to call his family?',['His phone','His book','His bike','His computer'],0,'Jack uses his phone to call his family.'],['What else does he do with it?',['Find information','Cook dinner','Drive a car','Write on paper'],0,'He uses it to find information.'],['Does he use it for too long?',['No, he does not','Yes, he does','Every night','The passage does not say'],0,'He does not use it for too long.'],['Why does he limit phone time?',['He wants to stay healthy','The phone is old','He has no family','He dislikes information'],0,'He wants to stay healthy.']]},
    {id:'work',text:'Lucy works in a hospital. She is a nurse. She is busy, but she likes helping people. She goes to work by bus and comes home at six in the evening.',cn:'露西在医院工作。她是一名护士。她很忙，但喜欢帮助别人。她乘公共汽车上班，晚上六点回家。',qs:[['Where does Lucy work?',['In a hospital','In a bank','At a school','In a shop'],0,'Lucy works in a hospital.'],['What is her job?',['A nurse','A doctor','A teacher','A manager'],0,'She is a nurse.'],['How does she go to work?',['By bus','By train','By bike','On foot'],0,'She goes to work by bus.'],['When does she come home?',['At six in the evening','At eight in the morning','At noon','At night'],0,'She comes home at six in the evening.']]},
    {id:'exam-plan',text:'The English exam is on Friday. Li Ming has three days to prepare. He plans to review grammar today, practise reading tomorrow, and take a short test on Thursday. He will go to bed early before the exam.',cn:'英语考试在星期五。李明有三天准备。他计划今天复习语法，明天练习阅读，星期四做一次小测验。考试前他会早睡。',qs:[['When is the English exam?',['On Friday','On Monday','On Thursday','On Sunday'],0,'The first sentence says the exam is on Friday.'],['What will Li Ming review today?',['Grammar','Writing','History','Math'],0,'He plans to review grammar today.'],['What will he do on Thursday?',['Take a short test','Learn new words all night','Travel by train','Visit a friend'],0,'He will take a short test on Thursday.'],['Why will he go to bed early?',['To be ready for the exam','To miss the exam','To watch a film','To finish his job'],0,'Going to bed early helps him prepare for the exam.']]},
    {id:'library',text:'The city library opens at nine every morning and closes at six in the evening. Readers may borrow three books for two weeks. Food is not allowed, but people may bring water. The library is closed on Monday.',cn:'市图书馆每天早上九点开门，晚上六点关门。读者可以借三本书，借期两周。不能带食物，但可以带水。图书馆星期一闭馆。',qs:[['What time does the library open?',['At nine in the morning','At six in the morning','At noon','At nine at night'],0,'It opens at nine every morning.'],['How many books may a reader borrow?',['Three','Two','Four','Six'],0,'Readers may borrow three books.'],['What may people bring into the library?',['Water','Food','Dinner','Fruit'],0,'Food is not allowed, but water is allowed.'],['When is the library closed?',['On Monday','On Friday','Every evening','On Sunday'],0,'The passage says the library is closed on Monday.']]},
    {id:'healthy-day',text:'Wang Mei wants to stay healthy. She walks for thirty minutes after dinner and drinks enough water every day. She likes fruit, but she does not eat much meat. At night, she stops using her phone before ten and sleeps for eight hours.',cn:'王梅想保持健康。她晚饭后步行三十分钟，每天喝足够的水。她喜欢水果，但不吃太多肉。晚上十点前她停止使用手机，并睡八小时。',qs:[['How long does Wang Mei walk?',['For thirty minutes','For ten minutes','For two hours','For eight hours'],0,'She walks for thirty minutes after dinner.'],['What does she drink every day?',['Enough water','Much tea','Only milk','Coffee'],0,'She drinks enough water every day.'],['What food does she not eat much?',['Meat','Fruit','Rice','Bread'],0,'She does not eat much meat.'],['Which statement is true?',['She sleeps for eight hours','She uses her phone all night','She never walks','She dislikes fruit'],0,'The passage states that she sleeps for eight hours.']]},
    {id:'train-trip',text:'David planned to visit his parents by train. The train was at eight, but he arrived at the station at eight fifteen. He missed it, so he took the next train at ten. He called his parents and told them he would arrive late.',cn:'戴维计划乘火车看望父母。火车八点开，但他八点十五才到车站。他错过了火车，所以乘坐十点的下一班。他给父母打电话，说自己会晚到。',qs:[['Why did David miss the first train?',['He arrived late','He lost his phone','The train was cancelled','He went to the wrong city'],0,'The train left at eight, but David arrived at eight fifteen.'],['When was the next train?',['At ten','At eight','At eight fifteen','At noon'],0,'He took the next train at ten.'],['Who did David call?',['His parents','His teacher','His manager','His friend'],0,'He called his parents.'],['What can we infer from the passage?',['David would arrive later than planned','David did not travel','His parents missed the train','The station was closed'],0,'Because he took a later train, he would arrive later than planned.']]}
  ];
  passages.forEach(p=>p.qs.forEach((q,i)=>add({id:`v731-reading-${p.id}-${i}`,type:'reading',cat:'阅读理解',q:`${p.text}\n\n${q[0]}`,options:q[1],answer:q[2],point:'阅读理解：定位原文信息',explain:`${q[3]} 原文大意：${p.cn}`,translation:`短文：${p.cn}\n问题：${q[0]}`,difficulty:i<2?'提高':'冲刺'})));
  return out;
})();
