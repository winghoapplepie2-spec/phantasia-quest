// ============================================
// 幻境紀行 - 遊戲資料
// ============================================

const JOBS = {
  warrior: {
    id: 'warrior',
    name: '戰士',
    desc: '高力量與體質，近戰輸出',
    base: { str: 12, int: 5, agi: 7, vit: 12 },
    growth: { str: 3, int: 1, agi: 1.5, vit: 2.5 },
    skills: ['重擊', '防禦姿態']
  },
  mage: {
    id: 'mage',
    name: '法師',
    desc: '高智力，強力魔法',
    base: { str: 4, int: 14, agi: 6, vit: 6 },
    growth: { str: 1, int: 3.5, agi: 1.2, vit: 1.5 },
    skills: ['火球術', '魔力護盾']
  },
  ranger: {
    id: 'ranger',
    name: '遊俠',
    desc: '高敏捷，精準射擊',
    base: { str: 8, int: 6, agi: 13, vit: 8 },
    growth: { str: 2, int: 1.5, agi: 3, vit: 1.8 },
    skills: ['精準射擊', '陷阱']
  },
  // 轉職
  knight: {
    id: 'knight',
    name: '騎士',
    desc: '戰士進階・守護與榮耀',
    base: { str: 18, int: 8, agi: 10, vit: 20 },
    growth: { str: 4, int: 1.5, agi: 2, vit: 3.5 },
    skills: ['聖光斬', '守護之盾', '衝鋒'],
    require: { job: 'warrior', level: 10 }
  },
  berserker: {
    id: 'berserker',
    name: '狂戰士',
    desc: '戰士進階・瘋狂的破壞力',
    base: { str: 24, int: 5, agi: 12, vit: 14 },
    growth: { str: 5, int: 1, agi: 2.5, vit: 2 },
    skills: ['狂暴', '血之狂怒', '撕裂'],
    require: { job: 'warrior', level: 10 }
  },
  archmage: {
    id: 'archmage',
    name: '大法師',
    desc: '法師進階・毀滅魔法',
    base: { str: 6, int: 26, agi: 9, vit: 10 },
    growth: { str: 1.2, int: 5, agi: 1.8, vit: 2 },
    skills: ['隕石術', '時間靜止', '魔力爆發'],
    require: { job: 'mage', level: 10 }
  },
  summoner: {
    id: 'summoner',
    name: '召喚師',
    desc: '法師進階・召喚強大生物',
    base: { str: 7, int: 22, agi: 10, vit: 12 },
    growth: { str: 1.5, int: 4.5, agi: 2, vit: 2.2 },
    skills: ['召喚精靈', '元素契約', '犧牲'],
    require: { job: 'mage', level: 10 }
  },
  assassin: {
    id: 'assassin',
    name: '刺客',
    desc: '遊俠進階・致命一擊',
    base: { str: 14, int: 8, agi: 24, vit: 10 },
    growth: { str: 2.5, int: 1.5, agi: 5, vit: 1.8 },
    skills: ['背刺', '影分身', '毒刃'],
    require: { job: 'ranger', level: 10 }
  },
  hunter: {
    id: 'hunter',
    name: '獵人',
    desc: '遊俠進階・追蹤與遠程',
    base: { str: 12, int: 10, agi: 20, vit: 12 },
    growth: { str: 2.2, int: 2, agi: 4.5, vit: 2 },
    skills: ['多重射擊', '馴獸', '追蹤'],
    require: { job: 'ranger', level: 10 }
  }
};

const MAPS = {
  village: {
    id: 'village',
    name: '新手村',
    desc: '安全的起始之地，可治療與購買物品，也可在此轉職。',
    levelReq: 1,
    monsters: [],
    hasHeal: true,
    hasShop: true,
    hasJobChange: true,
    next: ['forest']
  },
  forest: {
    id: 'forest',
    name: '迷霧森林',
    desc: '濃霧籠罩的古老森林，有許多低階魔物出沒。',
    levelReq: 1,
    monsters: ['slime', 'wolf', 'goblin'],
    hasHeal: false,
    hasShop: false,
    hasJobChange: false,
    next: ['village', 'cave']
  },
  cave: {
    id: 'cave',
    name: '幽暗洞穴',
    desc: '陰暗潮濕的洞穴，危險開始提升。',
    levelReq: 8,
    monsters: ['bat', 'spider', 'orc'],
    hasHeal: false,
    hasShop: false,
    hasJobChange: false,
    next: ['forest', 'ruins']
  },
  ruins: {
    id: 'ruins',
    name: '廢棄古城',
    desc: '曾經繁華的城市如今只剩廢墟與強大的亡靈。',
    levelReq: 18,
    monsters: ['skeleton', 'ghost', 'golem'],
    hasHeal: false,
    hasShop: false,
    hasJobChange: false,
    next: ['cave', 'dragon_nest']
  },
  dragon_nest: {
    id: 'dragon_nest',
    name: '龍之巢穴',
    desc: '傳說中的龍族棲息地，只有最強者才能挑戰。',
    levelReq: 30,
    monsters: ['dragon_whelp', 'wyvern', 'ancient_dragon'],
    hasHeal: false,
    hasShop: false,
    hasJobChange: false,
    next: ['ruins']
  }
};

const MONSTERS = {
  slime: { name: '史萊姆', hp: 30, atk: 8, def: 2, exp: 12, gold: 5, drop: ['slime_gel'] },
  wolf: { name: '野狼', hp: 45, atk: 14, def: 4, exp: 20, gold: 8, drop: ['wolf_fang'] },
  goblin: { name: '哥布林', hp: 55, atk: 16, def: 5, exp: 28, gold: 12, drop: ['goblin_ear'] },
  bat: { name: '吸血蝙蝠', hp: 70, atk: 22, def: 6, exp: 40, gold: 18, drop: ['bat_wing'] },
  spider: { name: '巨型蜘蛛', hp: 90, atk: 26, def: 8, exp: 55, gold: 25, drop: ['spider_silk'] },
  orc: { name: '獸人戰士', hp: 120, atk: 32, def: 12, exp: 75, gold: 35, drop: ['orc_tusk'] },
  skeleton: { name: '骷髏兵', hp: 150, atk: 38, def: 15, exp: 100, gold: 50, drop: ['bone'] },
  ghost: { name: '幽靈', hp: 130, atk: 45, def: 10, exp: 120, gold: 60, drop: ['ectoplasm'] },
  golem: { name: '石魔像', hp: 250, atk: 40, def: 30, exp: 180, gold: 90, drop: ['golem_core'] },
  dragon_whelp: { name: '幼龍', hp: 300, atk: 55, def: 25, exp: 250, gold: 120, drop: ['dragon_scale'] },
  wyvern: { name: '飛龍', hp: 400, atk: 70, def: 30, exp: 350, gold: 180, drop: ['wyvern_wing'] },
  ancient_dragon: { name: '遠古巨龍', hp: 800, atk: 100, def: 50, exp: 800, gold: 500, drop: ['dragon_heart'] }
};

const ITEMS = {
  // 消耗品
  potion_s: { id: 'potion_s', name: '小型生命藥水', type: 'consumable', effect: { hp: 50 }, price: 20, desc: '恢復 50 HP' },
  potion_m: { id: 'potion_m', name: '中型生命藥水', type: 'consumable', effect: { hp: 120 }, price: 50, desc: '恢復 120 HP' },
  potion_l: { id: 'potion_l', name: '大型生命藥水', type: 'consumable', effect: { hp: 300 }, price: 120, desc: '恢復 300 HP' },
  mana_s: { id: 'mana_s', name: '小型魔力藥水', type: 'consumable', effect: { mp: 40 }, price: 25, desc: '恢復 40 MP' },
  // 武器
  wood_sword: { id: 'wood_sword', name: '木劍', type: 'weapon', atk: 5, price: 30, desc: '初學者的劍' },
  iron_sword: { id: 'iron_sword', name: '鐵劍', type: 'weapon', atk: 15, price: 120, desc: '普通的鐵製長劍' },
  steel_sword: { id: 'steel_sword', name: '精鋼劍', type: 'weapon', atk: 30, price: 350, desc: '鋒利的精鋼之劍' },
  staff: { id: 'staff', name: '法師杖', type: 'weapon', atk: 8, matk: 12, price: 100, desc: '增強魔法的法杖' },
  magic_staff: { id: 'magic_staff', name: '奧術法杖', type: 'weapon', atk: 10, matk: 28, price: 400, desc: '蘊含魔力的法杖' },
  bow: { id: 'bow', name: '短弓', type: 'weapon', atk: 12, price: 90, desc: '輕巧的短弓' },
  longbow: { id: 'longbow', name: '長弓', type: 'weapon', atk: 25, price: 320, desc: '強勁的長弓' },
  // 防具
  cloth: { id: 'cloth', name: '布衣', type: 'armor', def: 3, price: 25, desc: '簡單的布製衣物' },
  leather: { id: 'leather', name: '皮甲', type: 'armor', def: 10, price: 100, desc: '輕便的皮甲' },
  chain: { id: 'chain', name: '鎖子甲', type: 'armor', def: 22, price: 280, desc: '堅固的鎖子甲' },
  plate: { id: 'plate', name: '板甲', type: 'armor', def: 40, price: 600, desc: '厚重的金屬板甲' },
  // 飾品
  ring_str: { id: 'ring_str', name: '力量之戒', type: 'accessory', str: 5, price: 200, desc: '力量 +5' },
  ring_int: { id: 'ring_int', name: '智慧之戒', type: 'accessory', int: 5, price: 200, desc: '智力 +5' },
  ring_agi: { id: 'ring_agi', name: '敏捷之戒', type: 'accessory', agi: 5, price: 200, desc: '敏捷 +5' },
  // 材料（掉落）
  slime_gel: { id: 'slime_gel', name: '史萊姆凝膠', type: 'material', price: 3, desc: '史萊姆的殘留物' },
  wolf_fang: { id: 'wolf_fang', name: '狼牙', type: 'material', price: 5, desc: '尖銳的狼牙' },
  goblin_ear: { id: 'goblin_ear', name: '哥布林耳朵', type: 'material', price: 6, desc: '戰利品' },
  bat_wing: { id: 'bat_wing', name: '蝙蝠翅膀', type: 'material', price: 8, desc: '輕盈的翅膀' },
  spider_silk: { id: 'spider_silk', name: '蜘蛛絲', type: 'material', price: 10, desc: '強韌的絲線' },
  orc_tusk: { id: 'orc_tusk', name: '獸人獠牙', type: 'material', price: 15, desc: '堅硬的獠牙' },
  bone: { id: 'bone', name: '骸骨', type: 'material', price: 12, desc: '古老的骨頭' },
  ectoplasm: { id: 'ectoplasm', name: '靈質', type: 'material', price: 18, desc: '幽靈的殘留' },
  golem_core: { id: 'golem_core', name: '魔像核心', type: 'material', price: 40, desc: '石魔像的動力源' },
  dragon_scale: { id: 'dragon_scale', name: '龍鱗', type: 'material', price: 60, desc: '堅硬的龍鱗' },
  wyvern_wing: { id: 'wyvern_wing', name: '飛龍翼膜', type: 'material', price: 80, desc: '珍貴的翼膜' },
  dragon_heart: { id: 'dragon_heart', name: '龍之心', type: 'material', price: 300, desc: '傳說中的材料' }
};

const SHOP_ITEMS = ['potion_s', 'potion_m', 'potion_l', 'mana_s', 'wood_sword', 'iron_sword', 'staff', 'bow', 'cloth', 'leather', 'ring_str', 'ring_int', 'ring_agi'];

// 經驗需求
function expNeeded(level) {
  return Math.floor(50 * Math.pow(level, 1.6));
}
