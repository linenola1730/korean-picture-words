// [Wikipedia title (for the picture), Korean word, English pronunciation]
const WORDS = [
 ["Cat","고양이","go-yang-ee"],["Dog","개","gae"],["Horse","말","mal"],["Cattle","소","so"],
 ["Pig","돼지","dwae-ji"],["Rabbit","토끼","to-kki"],["Bird","새","sae"],["Fish","물고기","mul-go-gi"],
 ["Elephant","코끼리","ko-kki-ri"],["Lion","사자","sa-ja"],["Tiger","호랑이","ho-rang-ee"],["Brown bear","곰","gom"],
 ["Monkey","원숭이","won-sung-ee"],["Butterfly","나비","na-bi"],["Duck","오리","o-ri"],["Chicken","닭","dak"],
 ["Sheep","양","yang"],["Giraffe","기린","gi-rin"],["Penguin","펭귄","peng-gwin"],["Turtle","거북이","geo-buk-ee"],
 ["Spider","거미","geo-mi"],["Frog","개구리","gae-gu-ri"],["Snake","뱀","baem"],["Dolphin","돌고래","dol-go-rae"],
 ["Whale","고래","go-rae"],["Owl","부엉이","bu-eong-ee"],["Eagle","독수리","dok-su-ri"],["Bee","벌","beol"],["Ant","개미","gae-mi"],
 ["Apple","사과","sa-gwa"],["Banana","바나나","ba-na-na"],["Strawberry","딸기","ttal-gi"],["Watermelon","수박","su-bak"],
 ["Orange (fruit)","오렌지","o-ren-ji"],["Grape","포도","po-do"],["Peach","복숭아","bok-sung-a"],["Tomato","토마토","to-ma-to"],
 ["Carrot","당근","dang-geun"],["Potato","감자","gam-ja"],["Onion","양파","yang-pa"],["Egg as food","계란","gye-ran"],
 ["Bread","빵","ppang"],["Rice","밥","bap"],["Pizza","피자","pi-ja"],["Coffee","커피","keo-pi"],["Milk","우유","u-yu"],["Cake","케이크","ke-i-keu"],
 ["Tree","나무","na-mu"],["Flower","꽃","kkot"],["Sun","해","hae"],["Moon","달","dal"],["Mountain","산","san"],
 ["River","강","gang"],["Sea","바다","ba-da"],["Rain","비","bi"],["Snow","눈","nun"],["Cloud","구름","gu-reum"],["Fire","불","bul"],
 ["House","집","jip"],["Castle","성","seong"],["Bridge","다리","da-ri"],["Door","문","mun"],["Bed","침대","chim-dae"],
 ["Car","자동차","ja-dong-cha"],["Bicycle","자전거","ja-jeon-geo"],["Airplane","비행기","bi-haeng-gi"],["Train","기차","gi-cha"],
 ["Ship","배","bae"],["Bus","버스","beo-seu"],
 ["Book","책","chaek"],["Pencil","연필","yeon-pil"],["Chair","의자","ui-ja"],["Clock","시계","si-gye"],["Key (lock)","열쇠","yeol-soe"],
 ["Umbrella","우산","u-san"],["Hat","모자","mo-ja"],["Shoe","신발","sin-bal"],["Glasses","안경","an-gyeong"],
 ["Telephone","전화기","jeon-hwa-gi"],["Computer","컴퓨터","keom-pyu-teo"],["Television","텔레비전","tel-le-bi-jeon"],
 ["Camera","카메라","ka-me-ra"],["Guitar","기타","gi-ta"],["Piano","피아노","pi-a-no"],["Ball","공","gong"]
];


// ---- words / sentences ----
let unit = "words";
let tpl = 0;
const hasBatchim = ch => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c % 28 !== 0; };
// [Korean before, particle if final consonant, particle if not, Korean after, pron before, pron c, pron v, pron after]
const TEMPLATES = [
  w => ["이것은 " + w[1] + "입니다.", "i-geo-seun " + w[2] + "-im-ni-da."],
  w => { const b = hasBatchim(w[1].slice(-1)); return ["저는 " + w[1] + (b ? "을" : "를") + " 좋아해요.", "jeo-neun " + w[2] + (b ? "-eul" : "-reul") + " jo-a-hae-yo."]; },
  w => { const b = hasBatchim(w[1].slice(-1)); return ["여기에 " + w[1] + (b ? "이" : "가") + " 있어요.", "yeo-gi-e " + w[2] + (b ? "-i" : "-ga") + " is-seo-yo."]; },
  w => ["저것은 " + w[1] + "인가요?", "jeo-geo-seun " + w[2] + "-in-ga-yo?"]
];
function view(w){
  if(unit === "words") return {ko:w[1], pron:w[2]};
  const [ko, pron] = TEMPLATES[tpl](w);
  return {ko, pron};
}

const app = document.getElementById("app");
let mode = "learn";
let bag = [];            // shuffled bag so words never repeat in order and never repeat until all are used
let current = null;
let score = {right:0, total:0};
const imgCache = {};

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function nextWord(){
  if(!bag.length){ bag = shuffle(WORDS.map((_,i)=>i)); if(bag[bag.length-1]===current) bag.reverse(); }
  current = bag.pop();
  // warm up the next few pictures in the background so they show instantly
  bag.slice(-4).forEach(i => getImage(WORDS[i][0]).then(src => { new Image().src = src; }));
  return WORDS[current];
}

// pictures are saved locally in /images, so they show instantly
function getImage(title){
  const fn = title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + ".jpg";
  return Promise.resolve("images/" + fn);
}

function speak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR"; u.rate = .8;
  const v = speechSynthesis.getVoices().find(v=>v.lang.startsWith("ko"));
  if(v) u.voice = v;
  speechSynthesis.speak(u);
}

function imageBox(w){
  const box = document.createElement("div");
  box.className = "imgwrap";
  box.innerHTML = '<span class="loading">Loading picture…</span>';
  getImage(w[0]).then(src=>{
    const img = new Image();
    img.alt = "";
    img.onload = ()=>{ box.innerHTML=""; box.appendChild(img); };
    img.onerror = ()=>{ img.onerror=null; img.src="https://loremflickr.com/900/600/"+encodeURIComponent(w[0].split(" ")[0].toLowerCase()); };
    img.src = src;
  });
  return box;
}

function wordInfo(w){
  const d = document.createElement("div");
  d.className = "info";
  d.innerHTML = `<div class="ko">${view(w).ko}</div><div class="pron">${view(w).pron}</div><button class="speak">🔊 Listen</button>`;
  d.querySelector(".speak").onclick = e=>{ e.stopPropagation(); speak(view(w).ko); };
  return d;
}

function render(){
  app.innerHTML = "";
  app.classList.toggle("sent", unit === "sentences");
  tpl = Math.floor(Math.random()*TEMPLATES.length);
  const w = nextWord();
  if(mode==="learn") renderLearn(w);
  else if(mode==="flash") renderFlash(w);
  else renderChoose(w);
}

function nextBtn(label){
  const a = document.createElement("div");
  a.className = "actions";
  a.innerHTML = `<button class="next">${label}</button>`;
  a.firstChild.onclick = e=>{ e.stopPropagation(); render(); };
  return a;
}

// image/stage on the left (landscape) or top (portrait); everything else in .side
function layout(stageEl){
  const lay = document.createElement("div");
  lay.className = "layout";
  const stage = document.createElement("div");
  stage.className = "stage";
  stage.append(stageEl);
  const side = document.createElement("div");
  side.className = "side";
  lay.append(stage, side);
  app.append(lay);
  return side;
}

function renderLearn(w){
  const side = layout(imageBox(w));
  side.append(wordInfo(w), nextBtn("Next random ➜"));
  speak(view(w).ko);
}

function renderFlash(w){
  const flipper = document.createElement("div");
  flipper.className = "flipper";
  const front = document.createElement("div");
  front.className = "face front";
  front.append(imageBox(w));
  const back = document.createElement("div");
  back.className = "face back";
  back.append(wordInfo(w));
  flipper.append(front, back);
  flipper.onclick = ()=>{
    const on = flipper.classList.toggle("flipped");
    if(on) speak(view(w).ko);
  };
  const side = layout(flipper);
  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "👆 Tap the card to flip it";
  side.append(hint, nextBtn("Next card ➜"));
}

function renderChoose(w){
  const side = layout(imageBox(w));
  const sc = document.createElement("div");
  sc.className = "score";
  sc.textContent = `Score: ${score.right} / ${score.total}`;
  const opts = document.createElement("div"); opts.className = "options";
  const wrong = shuffle(WORDS.filter(x=>x!==w)).slice(0,3);
  const choices = shuffle([w, ...wrong]);
  let done = false;
  choices.forEach(c=>{
    const b = document.createElement("button");
    b.className = "opt"; b.innerHTML = `${view(c).ko}<small>${view(c).pron}</small>`;
    b.onclick = ()=>{
      if(done) return; done = true;
      score.total++;
      if(c===w){ score.right++; b.classList.add("right"); }
      else b.classList.add("wrong");
      [...opts.children].forEach((el,i)=>{
        el.querySelector("small").textContent = view(choices[i]).pron;
        if(choices[i]===w) el.classList.add("right");
      });
      sc.textContent = `Score: ${score.right} / ${score.total}`;
      speak(view(w).ko);
    };
    opts.append(b);
  });
  side.append(sc, opts, nextBtn("Next random ➜"));
}

document.querySelectorAll(".tab").forEach(t=>{
  t.onclick = ()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    t.classList.add("active"); mode = t.dataset.mode; render();
  };
});
document.querySelectorAll(".unit").forEach(u=>{
  u.onclick = ()=>{
    document.querySelectorAll(".unit").forEach(x=>x.classList.remove("active"));
    u.classList.add("active"); unit = u.dataset.unit; render();
  };
});
document.getElementById("randomBtn").onclick = render;
if("speechSynthesis" in window) speechSynthesis.getVoices();
render();