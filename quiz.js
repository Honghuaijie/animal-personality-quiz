// 位序依次表示更偏向结伴、尝鲜、即兴。0 表示相对偏向另一端。
const animals = {
  "111": ["🦦", "攒局海獭", "你只是发了张小吃照片，群里已经开始数人头。", "遇到新鲜事，你很快就会想到可以和谁一起玩。比起排好全天行程，你更享受大家凑在一起、边走边决定的那一段。", "把一个还没成形的点子变成有人响应的邀约。", "你的随身宝物是一张可以一直加座的小桌。"],
  "110": ["🦜", "领航鹦鹉", "你说发现了一处秘境，下一条消息就是集合定位。", "陌生的目的地会勾起你的兴致。你喜欢叫上同伴，也愿意在出发前查到足够的信息，让大家放心跟上。", "在旁人还拿不准的时候，给新想法安排一个容易参加的第一步。", "如果森林开旅行社，你的路线图旁会夹着一串报名纸条。"],
  "101": ["🐕", "街坊小狗", "常去的那家店，你总能给朋友再挪出一个座。", "你喜欢熟悉的去处，以及在那里碰到的人。安排可以临时改，只要还能和喜欢的人待一会儿，普通的一天也很尽兴。", "让临时加入的人很快有参与感。", "街角的小店给你留了一只永远不用预约的水碗。"],
  "100": ["🐧", "点名企鹅", "出门前你回头数了一遍，刚好一个都没落下。", "你享受结伴，也在意大家能顺顺当当地走到终点。熟悉的路线和明确的安排，会给你留出更多照顾同行者的余裕。", "在团队里记住那些很小、却会影响别人体验的安排。", "你的队伍暗号是到了发个表情。"],
  "011": ["🦊", "岔路狐狸", "本来只是下楼买面包，回家时多认识了两条巷子。", "独处给了你好奇张望的自由。没有人催着赶路时，你愿意临时转弯，把偶然遇见的小东西当作今天的收获。", "注意到既定路线之外的机会，还敢先试一小步。", "地图上那条没有名字的小径，是你偷偷添上去的。"],
  "010": ["🦉", "绘图猫头鹰", "别人看见你第一次出发，你已经在纸上走过一遍。", "你愿意独自研究陌生事物，并且喜欢给探索搭一个框架。做足准备，会让你更有心情留意路上的细节。", "把一个看起来难以入门的新爱好拆成能动手的几步。", "翻开你的森林笔记，书签本身就是一张小地图。"],
  "001": ["🐈", "窗台小猫", "今天也走了那条老路，只在有阳光的地方多待了一会儿。", "熟悉的环境和属于自己的空间对你很重要。你愿意把时间留松一点，同样的一天也能按当下的心情过出不同节奏。", "知道什么时候该把生活调慢，很会给自己找回舒服的状态。", "窗台上的光斑每天只挪一点，你总能找到它。"],
  "000": ["🐿️", "藏栗松鼠", "昨天随手留好的那一颗，刚好接住了今天的自己。", "你倾向用安静的时间恢复精力，喜欢手边有熟悉的工具，也愿意提前做些准备。事情有序时，你更能安心投入。", "把重复的小事安排妥当，忙起来也能稳住自己的节奏。", "你的秘密树洞里连备用钥匙都有固定的小格子。"]
};

function matchAnimal(answers) {
  const totals = [0, 0, 0];
  const clues = [null, null, null];
  answers.forEach((choice, i) => {
    const q = questions[i];
    totals[q.axis] += q.options[choice].value;
  });
  // 总分持平时，以该维度第一道生活题的方向作轻量决胜。
  const signs = totals.map((sum, axis) =>
    Math.sign(sum || questions[axis].options[answers[axis]].value));
  answers.forEach((choice, i) => {
    const q = questions[i];
    const opt = q.options[choice];
    const prev = clues[q.axis];
    if (Math.sign(opt.value) === signs[q.axis] && (!prev || Math.abs(opt.value) > Math.abs(prev.value))) {
      clues[q.axis] = { prompt: q.prompt, ...opt };
    }
  });
  return { key: signs.map(s => Number(s > 0)).join(""), clues, totals };
}

const el = id => document.getElementById(id);
const stages = ["home", "quiz", "result"];
let answers = [];
let current = 0;
function show(stage) {
  stages.forEach(id => { el(id).hidden = id !== stage; });
  window.scrollTo(0, 0);
}
function renderQuestion() {
  const q = questions[current];
  el("topic").textContent = ["和谁一起玩", "你喜欢什么", "你会怎么做"][q.axis];
  el("count").textContent = (current + 1) + " / " + questions.length;
  el("progress").value = current + 1;
  el("question").textContent = q.prompt;
  el("back").disabled = current === 0;
  el("next").disabled = answers[current] == null;
  el("next").textContent = current === questions.length - 1 ? "查看我的动物" : "下一题";
  el("options").replaceChildren(...q.options.map((opt, i) => {
    const b = document.createElement("button");
    b.textContent = opt.label;
    b.setAttribute("aria-pressed", String(answers[current] === i));
    b.onclick = () => {
      answers[current] = i;
      Array.from(el("options").children).forEach((button, j) =>
        button.setAttribute("aria-pressed", String(j === i)));
      el("next").disabled = false;
    };
    return b;
  }));
  el("question").focus();
}
function startQuiz() {
  answers = [];
  current = 0;
  show("quiz");
  renderQuestion();
}
function renderResult() {
  const { key, clues, totals } = matchAnimal(answers);
  ["animalIcon", "animalName", "quote", "traits", "strength", "egg"].forEach((id, i) => {
    el(id).textContent = animals[key][i];
  });
  el("evidence").replaceChildren(...clues.map((clue, axis) => {
    const li = document.createElement("li");
    li.textContent = clue.prompt + " 你选了「" + clue.label + "」。";
    if (Math.abs(totals[axis]) <= 2) li.textContent += "这一项的两种倾向在你的答案里很接近。";
    return li;
  }));
  show("result");
  el("animalName").tabIndex = -1;
  el("animalName").focus({ preventScroll: true });
}
el("start").onclick = startQuiz;
el("restart").onclick = startQuiz;
el("back").onclick = () => { if (current > 0) { current--; renderQuestion(); } };
el("next").onclick = () => {
  if (answers[current] == null) return;
  if (current === questions.length - 1) renderResult();
  else { current++; renderQuestion(); }
};
