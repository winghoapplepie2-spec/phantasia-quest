// ============================================
// 幻境紀行 - 核心遊戲邏輯
// ============================================

class Game {
  constructor() {
    this.player = null;
    this.cooldownUntil = 0;
    this.log = [];
    this.load();
  }

  // ---------- 存檔 ----------
  save() {
    if (!this.player) return;
    const data = {
      player: this.player,
      cooldownUntil: this.cooldownUntil
    };
    localStorage.setItem('phantasia_save', JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem('phantasia_save');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.player = data.player;
        this.cooldownUntil = data.cooldownUntil || 0;
      } catch (e) {
        console.warn('存檔讀取失敗', e);
      }
    }
  }

  clearSave() {
    localStorage.removeItem('phantasia_save');
    this.player = null;
    this.cooldownUntil = 0;
  }

  // ---------- 角色建立 ----------
  createCharacter(name, jobId) {
    const job = JOBS[jobId];
    if (!job) return false;

    this.player = {
      name: name.trim().slice(0, 12) || '無名冒險者',
      job: jobId,
      level: 1,
      exp: 0,
      gold: 50,
      hp: 0,
      maxHp: 0,
      mp: 0,
      maxMp: 0,
      str: job.base.str,
      int: job.base.int,
      agi: job.base.agi,
      vit: job.base.vit,
      map: 'village',
      inventory: [
        { id: 'potion_s', qty: 3 },
        { id: 'wood_sword', qty: 1 },
        { id: 'cloth', qty: 1 }
      ],
      equipment: {
        weapon: 'wood_sword',
        armor: 'cloth',
        accessory: null
      },
      skills: [...job.skills],
      totalKills: 0,
      createdAt: Date.now()
    };

    this.recalcStats();
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.save();
    this.addLog(`歡迎來到幻境紀行，${this.player.name}！你選擇了【${job.name}】。`);
    return true;
  }

  // ---------- 屬性計算 ----------
  recalcStats() {
    const p = this.player;
    const job = JOBS[p.job];
    // 基礎 + 等級成長
    let str = job.base.str + Math.floor((p.level - 1) * job.growth.str);
    let intel = job.base.int + Math.floor((p.level - 1) * job.growth.int);
    let agi = job.base.agi + Math.floor((p.level - 1) * job.growth.agi);
    let vit = job.base.vit + Math.floor((p.level - 1) * job.growth.vit);

    // 裝備加成
    const eq = p.equipment;
    if (eq.weapon && ITEMS[eq.weapon]) {
      const w = ITEMS[eq.weapon];
      str += w.atk || 0;
      intel += w.matk || 0;
    }
    if (eq.armor && ITEMS[eq.armor]) {
      vit += Math.floor((ITEMS[eq.armor].def || 0) / 2);
    }
    if (eq.accessory && ITEMS[eq.accessory]) {
      const a = ITEMS[eq.accessory];
      str += a.str || 0;
      intel += a.int || 0;
      agi += a.agi || 0;
    }

    p.str = str;
    p.int = intel;
    p.agi = agi;
    p.vit = vit;

    p.maxHp = 80 + vit * 8 + p.level * 5;
    p.maxMp = 30 + intel * 4 + p.level * 2;
    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.mp > p.maxMp) p.mp = p.maxMp;
  }

  // ---------- 經驗與升級 ----------
  addExp(amount) {
    const p = this.player;
    p.exp += amount;
    let leveled = false;
    while (p.exp >= expNeeded(p.level)) {
      p.exp -= expNeeded(p.level);
      p.level++;
      leveled = true;
      this.addLog(`🎉 升級了！目前等級：${p.level}`);
    }
    if (leveled) {
      this.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    }
  }

  // ---------- 背包 ----------
  addItem(itemId, qty = 1) {
    const inv = this.player.inventory;
    const exist = inv.find(i => i.id === itemId);
    if (exist) exist.qty += qty;
    else inv.push({ id: itemId, qty });
  }

  removeItem(itemId, qty = 1) {
    const inv = this.player.inventory;
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    if (inv[idx].qty <= qty) inv.splice(idx, 1);
    else inv[idx].qty -= qty;
    return true;
  }

  hasItem(itemId, qty = 1) {
    const item = this.player.inventory.find(i => i.id === itemId);
    return item && item.qty >= qty;
  }

  // ---------- 裝備 ----------
  equip(itemId) {
    const item = ITEMS[itemId];
    if (!item || !['weapon', 'armor', 'accessory'].includes(item.type)) return false;
    if (!this.hasItem(itemId)) return false;

    const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : 'accessory';
    const old = this.player.equipment[slot];

    // 卸下舊的放回背包
    if (old) this.addItem(old, 1);
    this.removeItem(itemId, 1);
    this.player.equipment[slot] = itemId;
    this.recalcStats();
    this.addLog(`已裝備【${item.name}】`);
    this.save();
    return true;
  }

  unequip(slot) {
    const old = this.player.equipment[slot];
    if (!old) return false;
    this.addItem(old, 1);
    this.player.equipment[slot] = null;
    this.recalcStats();
    this.addLog(`已卸下【${ITEMS[old].name}】`);
    this.save();
    return true;
  }

  // ---------- 使用道具 ----------
  useItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'consumable') return false;
    if (!this.hasItem(itemId)) return false;

    if (item.effect.hp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.effect.hp);
      this.addLog(`使用【${item.name}】，恢復了 ${item.effect.hp} HP`);
    }
    if (item.effect.mp) {
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + item.effect.mp);
      this.addLog(`使用【${item.name}】，恢復了 ${item.effect.mp} MP`);
    }
    this.removeItem(itemId, 1);
    this.save();
    return true;
  }

  // ---------- 治療 ----------
  heal() {
    if (this.player.map !== 'village') {
      this.addLog('只有在新手村才能治療！');
      return false;
    }
    const cost = Math.ceil((this.player.maxHp - this.player.hp) * 0.3);
    if (this.player.gold < cost) {
      this.addLog(`金幣不足！需要 ${cost} 金幣。`);
      return false;
    }
    this.player.gold -= cost;
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.addLog(`治療完成，花費 ${cost} 金幣。HP/MP 已回滿。`);
    this.save();
    return true;
  }

  // ---------- 商店 ----------
  buy(itemId) {
    if (this.player.map !== 'village') return false;
    const item = ITEMS[itemId];
    if (!item || !item.price) return false;
    if (this.player.gold < item.price) {
      this.addLog('金幣不足！');
      return false;
    }
    this.player.gold -= item.price;
    this.addItem(itemId, 1);
    this.addLog(`購買了【${item.name}】`);
    this.save();
    return true;
  }

  sell(itemId) {
    if (!this.hasItem(itemId)) return false;
    const item = ITEMS[itemId];
    const price = Math.floor((item.price || 5) * 0.4);
    this.removeItem(itemId, 1);
    this.player.gold += price;
    this.addLog(`賣出【${item.name}】，獲得 ${price} 金幣`);
    this.save();
    return true;
  }

  // ---------- 移動 ----------
  travel(mapId) {
    const map = MAPS[mapId];
    if (!map) return false;
    if (this.player.level < map.levelReq) {
      this.addLog(`等級不足！需要 Lv.${map.levelReq}`);
      return false;
    }
    if (!MAPS[this.player.map].next.includes(mapId) && mapId !== this.player.map) {
      this.addLog('無法直接前往該地點。');
      return false;
    }
    this.player.map = mapId;
    this.addLog(`來到了【${map.name}】`);
    this.save();
    return true;
  }

  // ---------- 戰鬥 ----------
  canFight() {
    return Date.now() >= this.cooldownUntil && this.player.hp > 0;
  }

  getCooldownLeft() {
    return Math.max(0, Math.ceil((this.cooldownUntil - Date.now()) / 1000));
  }

  fight() {
    if (!this.canFight()) {
      this.addLog(`戰鬥冷卻中，還剩 ${this.getCooldownLeft()} 秒`);
      return null;
    }
    if (this.player.hp <= 0) {
      this.addLog('你已經倒下了，請先回村莊治療！');
      return null;
    }

    const map = MAPS[this.player.map];
    if (!map.monsters || map.monsters.length === 0) {
      this.addLog('這裡沒有怪物可以戰鬥。');
      return null;
    }

    const mid = map.monsters[Math.floor(Math.random() * map.monsters.length)];
    const mon = { ...MONSTERS[mid] };
    const p = this.player;

    // 玩家攻擊力
    const playerAtk = Math.floor(p.str * 1.2 + p.agi * 0.3 + (ITEMS[p.equipment.weapon]?.atk || 0));
    const playerMatk = Math.floor(p.int * 1.5 + (ITEMS[p.equipment.weapon]?.matk || 0));
    const playerDef = Math.floor(p.vit * 0.6 + (ITEMS[p.equipment.armor]?.def || 0));

    // 簡單回合制模擬
    let log = [];
    let monHp = mon.hp;
    let turns = 0;
    const maxTurns = 20;

    while (monHp > 0 && p.hp > 0 && turns < maxTurns) {
      turns++;
      // 玩家行動
      const isMagic = p.job.includes('mage') || p.job === 'archmage' || p.job === 'summoner' || Math.random() < 0.3;
      let dmg;
      if (isMagic && p.mp >= 8) {
        dmg = Math.max(1, Math.floor(playerMatk * (0.8 + Math.random() * 0.5) - mon.def * 0.3));
        p.mp -= 8;
        log.push(`你施放魔法，對【${mon.name}】造成 ${dmg} 傷害！`);
      } else {
        dmg = Math.max(1, Math.floor(playerAtk * (0.85 + Math.random() * 0.4) - mon.def * 0.4));
        log.push(`你攻擊【${mon.name}】，造成 ${dmg} 傷害！`);
      }
      monHp -= dmg;

      if (monHp <= 0) break;

      // 怪物反擊
      const monDmg = Math.max(1, Math.floor(mon.atk * (0.7 + Math.random() * 0.5) - playerDef * 0.5));
      p.hp -= monDmg;
      log.push(`【${mon.name}】攻擊你，造成 ${monDmg} 傷害！`);
    }

    // 結果
    this.cooldownUntil = Date.now() + 15000; // 15 秒冷卻
    let result = { win: false, mon: mon.name, log };

    if (monHp <= 0) {
      // 勝利
      const expGain = mon.exp;
      const goldGain = mon.gold + Math.floor(Math.random() * 5);
      this.addExp(expGain);
      p.gold += goldGain;
      p.totalKills++;
      result.win = true;
      result.exp = expGain;
      result.gold = goldGain;

      // 掉落
      if (mon.drop && Math.random() < 0.45) {
        const dropId = mon.drop[Math.floor(Math.random() * mon.drop.length)];
        this.addItem(dropId, 1);
        result.drop = ITEMS[dropId].name;
        log.push(`獲得掉落物：【${ITEMS[dropId].name}】`);
      }

      log.push(`勝利！獲得 ${expGain} 經驗、${goldGain} 金幣。`);
      this.addLog(`擊敗了【${mon.name}】！+${expGain} EXP、+${goldGain} 金幣`);
    } else {
      // 失敗
      const goldLoss = Math.min(p.gold, Math.floor(mon.gold * 0.6) + 5);
      p.gold -= goldLoss;
      p.hp = Math.max(1, Math.floor(p.hp * 0.3)); // 殘血
      result.goldLoss = goldLoss;
      log.push(`你被擊敗了……損失 ${goldLoss} 金幣，勉強逃回。`);
      this.addLog(`被【${mon.name}】擊敗，損失 ${goldLoss} 金幣。請盡快回村治療！`);
    }

    this.recalcStats();
    this.save();
    return result;
  }

  // ---------- 轉職 ----------
  getAvailableJobs() {
    const p = this.player;
    return Object.values(JOBS).filter(j => {
      if (!j.require) return false;
      return j.require.job === p.job && p.level >= j.require.level;
    });
  }

  changeJob(newJobId) {
    const avail = this.getAvailableJobs();
    const job = avail.find(j => j.id === newJobId);
    if (!job) {
      this.addLog('無法轉職為該職業。');
      return false;
    }
    if (this.player.map !== 'village') {
      this.addLog('請先回到新手村再轉職。');
      return false;
    }

    const oldName = JOBS[this.player.job].name;
    this.player.job = newJobId;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.skills = [...job.skills];
    this.recalcStats();
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;

    this.addLog(`✨ 轉職成功！從【${oldName}】轉為【${job.name}】！等級重置為 1，屬性大幅提升！`);
    this.save();
    return true;
  }

  // ---------- 日誌 ----------
  addLog(msg) {
    const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.log.unshift(`[${time}] ${msg}`);
    if (this.log.length > 50) this.log.pop();
  }
}

// 全域實例
window.game = new Game();
