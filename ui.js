// ============================================
// 幻境紀行 - UI 控制
// ============================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function updateAll() {
  if (!game.player) {
    showScreen('screen-auth');
    return;
  }
  showScreen('screen-game');
  renderPlayer();
  renderMap();
  renderInventory();
  renderEquipment();
  renderShop();
  renderJobChange();
  renderLog();
  updateFightButton();
}

function renderPlayer() {
  const p = game.player;
  const job = JOBS[p.job];
  $('#p-name').textContent = p.name;
  $('#p-job').textContent = job.name;
  $('#p-level').textContent = p.level;
  $('#p-exp').textContent = `${p.exp} / ${expNeeded(p.level)}`;
  $('#p-gold').textContent = p.gold;
  $('#p-hp').textContent = `${p.hp} / ${p.maxHp}`;
  $('#p-mp').textContent = `${p.mp} / ${p.maxMp}`;
  $('#p-str').textContent = p.str;
  $('#p-int').textContent = p.int;
  $('#p-agi').textContent = p.agi;
  $('#p-vit').textContent = p.vit;

  // HP bar
  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  $('#hp-bar').style.width = hpPct + '%';
  $('#hp-bar').className = 'bar-fill' + (hpPct < 30 ? ' danger' : hpPct < 60 ? ' warn' : '');

  const mpPct = Math.max(0, (p.mp / p.maxMp) * 100);
  $('#mp-bar').style.width = mpPct + '%';
}

function renderMap() {
  const p = game.player;
  const map = MAPS[p.map];
  $('#map-name').textContent = map.name;
  $('#map-desc').textContent = map.desc;

  // 地點按鈕
  const nav = $('#map-nav');
  nav.innerHTML = '';
  map.next.forEach(mid => {
    const m = MAPS[mid];
    const btn = document.createElement('button');
    btn.className = 'btn btn-map';
    btn.textContent = m.name + (p.level < m.levelReq ? ` (需Lv.${m.levelReq})` : '');
    btn.disabled = p.level < m.levelReq;
    btn.onclick = () => {
      if (game.travel(mid)) updateAll();
    };
    nav.appendChild(btn);
  });

  // 功能按鈕顯示
  $('#btn-heal').style.display = map.hasHeal ? 'inline-block' : 'none';
  $('#btn-shop-toggle').style.display = map.hasShop ? 'inline-block' : 'none';
  $('#panel-shop').style.display = 'none';
  $('#btn-job').style.display = map.hasJobChange ? 'inline-block' : 'none';
  $('#panel-job').style.display = 'none';

  // 戰鬥區
  const canFightHere = map.monsters && map.monsters.length > 0;
  $('#fight-area').style.display = canFightHere ? 'block' : 'none';
  if (canFightHere) {
    $('#monster-list').textContent = map.monsters.map(id => MONSTERS[id].name).join('、');
  }
}

function renderInventory() {
  const list = $('#inv-list');
  list.innerHTML = '';
  if (!game.player.inventory.length) {
    list.innerHTML = '<li class="empty">背包空空如也</li>';
    return;
  }
  game.player.inventory.forEach(slot => {
    const item = ITEMS[slot.id];
    if (!item) return;
    const li = document.createElement('li');
    li.className = 'inv-item';
    li.innerHTML = `
      <span class="item-name">${item.name} ×${slot.qty}</span>
      <span class="item-desc">${item.desc || ''}</span>
      <div class="item-actions"></div>
    `;
    const actions = li.querySelector('.item-actions');

    if (item.type === 'consumable') {
      const useBtn = document.createElement('button');
      useBtn.className = 'btn btn-sm';
      useBtn.textContent = '使用';
      useBtn.onclick = () => { game.useItem(slot.id); updateAll(); };
      actions.appendChild(useBtn);
    }
    if (['weapon', 'armor', 'accessory'].includes(item.type)) {
      const eqBtn = document.createElement('button');
      eqBtn.className = 'btn btn-sm';
      eqBtn.textContent = '裝備';
      eqBtn.onclick = () => { game.equip(slot.id); updateAll(); };
      actions.appendChild(eqBtn);
    }
    // 賣出（僅在村莊）
    if (MAPS[game.player.map].hasShop) {
      const sellBtn = document.createElement('button');
      sellBtn.className = 'btn btn-sm btn-danger';
      sellBtn.textContent = '賣';
      sellBtn.onclick = () => { game.sell(slot.id); updateAll(); };
      actions.appendChild(sellBtn);
    }
    list.appendChild(li);
  });
}

function renderEquipment() {
  const eq = game.player.equipment;
  const slots = [
    { key: 'weapon', label: '武器' },
    { key: 'armor', label: '防具' },
    { key: 'accessory', label: '飾品' }
  ];
  const box = $('#eq-list');
  box.innerHTML = '';
  slots.forEach(s => {
    const id = eq[s.key];
    const name = id ? ITEMS[id].name : '（空）';
    const div = document.createElement('div');
    div.className = 'eq-slot';
    div.innerHTML = `<strong>${s.label}</strong>：${name}`;
    if (id) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm';
      btn.textContent = '卸下';
      btn.onclick = () => { game.unequip(s.key); updateAll(); };
      div.appendChild(btn);
    }
    box.appendChild(div);
  });
}

function renderShop() {
  const list = $('#shop-list');
  list.innerHTML = '';
  SHOP_ITEMS.forEach(id => {
    const item = ITEMS[id];
    const li = document.createElement('li');
    li.className = 'shop-item';
    li.innerHTML = `
      <span>${item.name} - ${item.price} 金幣</span>
      <span class="item-desc">${item.desc}</span>
    `;
    const btn = document.createElement('button');
    btn.className = 'btn btn-sm';
    btn.textContent = '購買';
    btn.onclick = () => { game.buy(id); updateAll(); };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderJobChange() {
  const avail = game.getAvailableJobs();
  const box = $('#job-list');
  box.innerHTML = '';
  if (avail.length === 0) {
    box.innerHTML = '<p class="empty">目前沒有可轉職的職業（需達到對應等級）</p>';
    return;
  }
  avail.forEach(job => {
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `
      <h4>${job.name}</h4>
      <p>${job.desc}</p>
      <p>技能：${job.skills.join('、')}</p>
    `;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = '轉職';
    btn.onclick = () => {
      if (confirm(`確定要轉職為【${job.name}】嗎？等級將重置為 1！`)) {
        game.changeJob(job.id);
        updateAll();
      }
    };
    div.appendChild(btn);
    box.appendChild(div);
  });
}

function renderLog() {
  const box = $('#log-box');
  box.innerHTML = game.log.map(l => `<div class="log-line">${l}</div>`).join('');
}

function updateFightButton() {
  const btn = $('#btn-fight');
  const left = game.getCooldownLeft();
  if (left > 0) {
    btn.disabled = true;
    btn.textContent = `冷卻中 ${left}s`;
  } else if (game.player.hp <= 0) {
    btn.disabled = true;
    btn.textContent = '已倒下';
  } else {
    btn.disabled = false;
    btn.textContent = '⚔️ 開始戰鬥';
  }
}

// ---------- 事件綁定 ----------
function bindEvents() {
  // 註冊 / 登入（本地版）
  $('#btn-register').onclick = () => {
    const name = $('#reg-name').value.trim();
    const job = $('#reg-job').value;
    if (!name) {
      alert('請輸入角色名稱');
      return;
    }
    if (game.createCharacter(name, job)) {
      updateAll();
    }
  };

  $('#btn-load').onclick = () => {
    game.load();
    if (game.player) updateAll();
    else alert('沒有找到存檔');
  };

  $('#btn-logout').onclick = () => {
    if (confirm('確定要登出嗎？（存檔仍會保留）')) {
      // 只是回到標題，不刪存檔
      showScreen('screen-auth');
    }
  };

  $('#btn-delete-save').onclick = () => {
    if (confirm('確定要刪除存檔嗎？此操作無法復原！')) {
      game.clearSave();
      showScreen('screen-auth');
      alert('存檔已刪除');
    }
  };

  // 戰鬥
  $('#btn-fight').onclick = () => {
    const result = game.fight();
    if (result) {
      // 顯示戰鬥過程
      const modal = $('#battle-modal');
      const body = $('#battle-log');
      body.innerHTML = result.log.map(l => `<div>${l}</div>`).join('');
      if (result.win) {
        body.innerHTML += `<div class="win">勝利！+${result.exp} EXP +${result.gold} 金幣${result.drop ? '，掉落 ' + result.drop : ''}</div>`;
      } else {
        body.innerHTML += `<div class="lose">戰敗……損失 ${result.goldLoss} 金幣</div>`;
      }
      modal.classList.add('show');
      updateAll();
    }
  };

  $('#btn-close-battle').onclick = () => {
    $('#battle-modal').classList.remove('show');
  };

  // 治療
  $('#btn-heal').onclick = () => {
    game.heal();
    updateAll();
  };

  // 商店切換
  $('#btn-shop-toggle').onclick = () => {
    const panel = $('#panel-shop');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  // 轉職面板
  $('#btn-job').onclick = () => {
    const panel = $('#panel-job');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    renderJobChange();
  };

  // 冷卻計時器
  setInterval(() => {
    if (game.player) updateFightButton();
  }, 500);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  if (game.player) updateAll();
  else showScreen('screen-auth');
});
