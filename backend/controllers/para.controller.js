// Example: controllers/paragraphController.js
import { Paragraph } from "../models/paragraph.model.js";
import { User } from "../models/user.model.js";
const insertPara = async (req, res) => {
  const data = [
    {
      content: [
        "ram",
        "sam",
        "tom",
        "sun",
        "sky",
        "air",
        "sea",
        "land",
        "hill",
        "wind",
        "tree",
        "rock",
        "dark",
        "blue",
        "warm",
        "cool",
        "calm",
        "soft",
        "pure",
        "safe",
        "kind",
        "mild",
        "soft",
        "deep",
        "rain",
        "drop",
        "bird",
        "song",
        "flow",
        "wave",
        "rise",
        "fall",
        "step",
        "walk",
        "stay",
        "move",
        "look",
        "star",
        "moon",
        "glow",
        "dust",
        "sand",
        "soil",
        "root",
        "leaf",
        "stem",
        "seed",
        "buds",
        "fill",
        "grow",
        "bloom",
        "fork",
        "path",
        "road",
        "lane",
        "yard",
        "park",
        "lake",
        "pond",
        "mist",
        "snow",
        "cold",
        "heat",
        "fire",
        "beam",
        "lite",
        "stem",
        "wing",
        "claw",
        "snap",
        "peep",
        "chirp",
        "chip",
        "dart",
        "dash",
        "jump",
        "leap",
        "roll",
        "tide",
        "wind",
        "gust",
        "bree",
        "moss",
        "fern",
        "dirt",
        "sage",
        "pine",
        "wood",
        "twig",
        "bark",
        "echo",
        "puff",
        "hush",
        "whim",
        "spin",
        "swim",
        "dive",
        "soar",
        "glid",
        "drip",
        "pull",
        "push",
        "grab",
        "hold",
        "cast",
        "lift",
        "set",
        "rest",
        "stay",
        "calm",
        "pure",
        "soft",
        "kind",
        "long",
        "near",
        "far",
        "wide",
        "narrow",
        "tiny",
        "mini",
        "many",
        "some",
        "few",
        "more",
        "less",
        "high",
        "low",
        "fair",
        "just",
        "true",
        "open",
        "shut",
        "lock",
        "free",
        "bold",
        "calm",
        "mild",
        "easy",
        "hard",
        "fast",
        "slow",
        "thin",
        "thick",
        "full",
        "half",
        "loop",
        "bend",
        "warp",
        "tilt",
        "flip",
        "spin",
        "roll",
        "turn",
        "wave",
        "hero",
        "girl",
        "boy",
        "lady",
        "gent",
        "team",
        "crew",
        "unit",
        "ally",
        "peer",
        "mate",
        "folk",
        "tribe",
        "clan",
        "band",
        "home",
        "room",
        "wall",
        "door",
        "desk",
        "seat",
        "lamp",
        "sink",
        "cook",
        "wash",
        "draw",
        "note",
        "plot",
        "plan",
        "idea",
        "goal",
        "aim",
        "hope",
        "wish",
        "love",
        "care",
        "give",
        "take",
        "send",
        "lend",
        "gain",
        "earn",
        "save",
        "play",
        "read",
        "work",
        "rest",
        "walk",
        "call",
        "talk",
        "hear",
        "feel",
        "stay",
        "join",
        "help",
        "lead",
        "make",
        "rate",
        "keep",
        "hold",
        "build",
        "form",
        "mold",
        "join",
        "link",
        "bond",
        "grow",
        "rise",
      ],
      difficultyLevel: "easy",
      isSpecialCharIncluded: false,
      language: "en",
    },
    {
      content:[
  "river","sound","clear","sunny","grass","birds","small","quiet","smile","happy",
  "water","earth","light","sweet","brave","quick","maybe","early","plain","storm",
  "faith","grace","shine","fresh","bloom","charm","craft","focus","dream","guide",
  "spark","flame","drift","float","stone","shore","beach","crest","reach","broad",
  "scale","flash","press","carry","touch","serve","honor","value","glory","peace",
  "truth","sense","group","field","minds","works","heart","voice","proud","calm",
  "north","south","east","west","urban","rural","coast","plain","ridge","valley",
  "harsh","mild","quiet","solid","swift","eager","ready","clear","sweet","fresh",
  "blend","shape","form","point","focus","skill","learn","teach","share","write",
  "paint","build","grow","plant","harvest","track","chart","model","solve","logic",
  "dream","faith","grace","blend","scope","range","shine","glide","sweep","curve",
  "shift","orbit","layer","cycle","phase","trend","ratio","speed","level","reach",
  "touch","sense","honor","value","clear","sound","solid","brave","tough","alert",
  "magic","lunar","solar","metal","grain","fiber","water","stone","cloud","bloom",
  "early","sunny","grass","birds","happy","minds","voice","works","guide","learn",
  "teach","share","plant","write","solve","build","chart","track","model","shift",
  "cycle","phase","trend","speed","ratio","curve","level","scope","range","flare"
],
      difficultyLevel: "medium",
      isSpecialCharIncluded: false,
      language: "en",
      wordCount: 200,
    },
    {
      content:[
  "@","ram","sam","tom","sun","sky","air","sea","land","hill","wind","tree","rock","blue","warm","cool","calm","soft",
  "pure","safe","kind","mild","deep","drop","bird","song","flow","wave","rise","step","walk","star","moon","dust","sand",
  "#","soil","root","leaf","stem","seed","buds","grow","path","road","lane","park","lake","pond","mist","snow","cold","heat",
  "fire","beam","lite","wing","claw","snap","chip","dart","jump","leap","roll","tide","gust","moss","fern","sage","pine",
  "!","wood","twig","echo","puff","hush","whim","spin","swim","dive","soar","glid","drip","pull","push","grab","hold","cast",
  "rest","stay","calm","pure","soft","kind","wide","tiny","mini","many","some","few","more","less","high","fair","true",
  "%","open","shut","lock","free","bold","easy","hard","fast","slow","thin","full","half","bend","tilt","flip","hero","girl",
  "boy","lady","gent","team","crew","unit","ally","peer","mate","folk","tribe","clan","band","home","room","wall","door",
  "&","desk","seat","lamp","sink","cook","wash","draw","note","plot","idea","goal","aim","hope","wish","love","care","give",
  "take","send","lend","gain","earn","save","play","read","work","walk","hear","feel","join","help","lead","rate","keep",
  "form","mold","join","link","bond","grow","rise"
],
      difficultyLevel: "easy",
      isSpecialCharIncluded: true,
      language: "en",
     
    },
    {
      content:[
  "@","river","sound","clear","sunny","grass","birds","small","quiet","smile","happy","water","earth","light","sweet","brave","quick","maybe",
  "early","plain","storm","faith","grace","shine","fresh","bloom","charm","craft","focus","dream","guide","#","spark","flame","drift","float",
  "stone","shore","crest","reach","scale","flash","press","carry","touch","serve","honor","value","peace","truth","sense","group","field",
  "minds","works","heart","voice","north","south","urban","rural","coast","ridge","mild","solid","swift","eager","ready","blend","shape","form",
  "!","point","skill","learn","teach","share","write","plant","build","grow","solve","logic","phase","trend","ratio","speed","level","curve",
  "shift","orbit","layer","cycle","phase","range","shine","glide","sweep","curve","clear","sound","solid","magic","solar","water","stone",
  "cloud","bloom","early","sunny","smile","voice","minds","guide","teach","share","plant","write","build","solve","chart","track","model","shift",
  "%","cycle","phase","trend","speed","ratio","level","scope","range","flare"
],
      difficultyLevel: "medium",
      isSpecialCharIncluded: true,
      language: "en",
      
    },
    {
      content:[
  "complex","puzzle","reason","gather","theory","system","method","derive","expand","explore",
  "predict","compute","concept","process","pattern","modeling","signal","formula","assumed","refined",
  "context","dynamic","insight","cluster","feature","balance","optimum","mapping","encoded","resolve",
  "advance","measure","analysis","require","perform","enhance","capture","improve","general","problem",
  "network","process","storage","channel","digital","quantum","science","version","control","upgrade",
  "demand","respond","adaptor","machine","learning","optical","balance","seeking","dynamic","notions",
  "theorem","logical","thought","sustain","concepts","pattern","extract","precise","metrics","clarity",
  "compute","refined","cluster","feature","mapping","process","upgrade","version","quantum","numeric",
  "formula","resolve","inference","abstract","matrixes","gradient","optimize","analysis","context","derived",
  "compute","dynamic","pattern","balance","upgrade","general","science","machine","digital","network",
  "explore","feature","clarity","channel","storage","enhance","capture","process","improve","refined",
  "advance","control","encoded","inquiry","problem","general","formula","dynamic","cluster","mapping",
  "concept","precise","balance","quantum","storage","science","pattern","resolved","metrics","context",
  "optimum","thought","learning","channel","optical","version","theorem","refined","analysis","derived"
],
      difficultyLevel: "hard",
      isSpecialCharIncluded: false,
      language: "en",
      
    },
    {
      content:[
  "@","complex","puzzle","reason","gather","theory","system","method","derive","expand","explore","predict","compute","concept","process","pattern","modeling","signal",
  "formula","refined","context","dynamic","insight","cluster","feature","balance","optimum","mapping","encoded","resolve","#","advance","measure","analysis","require",
  "perform","enhance","capture","improve","general","problem","network","storage","channel","digital","quantum","science","control","upgrade","respond","adaptor","machine",
  "learning","optical","seeking","theorem","logical","thought","sustain","extract","precise","metrics","clarity","numeric","formula","resolve","inference","abstract","matrixes",
  "!","gradient","optimize","context","derived","dynamic","balance","upgrade","science","machine","digital","network","explore","feature","clarity","storage","enhance","capture",
  "improve","refined","control","encoded","inquiry","general","formula","cluster","mapping","concept","precise","pattern","quantum","metrics","context","optimum","thought",
  "%","version","theorem","analysis","derived","pattern","science","signal","resolved","process","channel","storage","upgrade","feature","dynamic","concept","clarity"
],
      difficultyLevel: "hard",
      isSpecialCharIncluded: true,
      language: "en"
    }
  ];
  try {
    await Paragraph.insertMany(data);
    res.status(200).json({ message: "Paragraphs inserted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error inserting paragraphs", error: error.message });
  }
};

const getPara = async (req, res) => {
  try {
    const {
      isSpecialCharIncluded = false,
      language = "en",
      difficultyLevel = "easy",
      timeInSeconds = 60,
    } = req.body;
    if (!["easy", "medium", "hard"].includes(difficultyLevel)) {
      return res.status(400).json({ message: "Invalid difficulty level" });
    }
    if (!["en", "es", "fr", "de", "it", "pt"].includes(language)) {
      return res.status(400).json({ message: "Invalid language" });
    }
    if (typeof isSpecialCharIncluded !== "boolean") {
      return res
        .status(400)
        .json({ message: "isSpecialCharIncluded must be a boolean" });
    }
    const chosenWPM = 150;
    const para = await Paragraph.findOne({
      isSpecialCharIncluded: isSpecialCharIncluded,
      language: language,
      difficultyLevel: difficultyLevel,
    });
    if (!para) {
      return res.status(404).json({ message: "No paragraph found" });
    }
    const totalWordsCanType = Math.floor((chosenWPM / 60) * timeInSeconds);
    const wordsToSend = [];
    for (let i = 0; i < totalWordsCanType; i++) {
        const randomIndex = Math.floor(Math.random() * para.content.length);
        wordsToSend.push(para.content[randomIndex]);
    }
    
    // Set cache headers - paragraphs are static content that rarely changes
    res.set({
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'ETag': `"para-${difficultyLevel}-${isSpecialCharIncluded}-${language}"`,
      'Vary': 'Accept-Encoding',
    });
    
    return res.status(200).json({ paragraph: wordsToSend , message: "Paragraph fetched successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export { getPara, insertPara };
