# 幻境紀行 (Phantasia Quest)

文字 RPG 網頁遊戲 — 打怪升級、轉職、裝備、多地圖。

## 目前功能

- 三種初始職業：戰士 / 法師 / 遊俠
- 轉職系統（Lv.10 可轉職，等級重置 + 屬性大幅提升）
- 五張地圖（新手村 → 森林 → 洞穴 → 古城 → 龍之巢）
- 戰鬥系統 + **15 秒冷卻**
- 失敗扣金幣，需回村治療
- 背包 + 裝備系統（武器 / 防具 / 飾品）
- 商店、藥水、材料掉落
- 本地存檔（localStorage）

## 快速試玩

直接用瀏覽器開啟 `index.html` 即可遊玩（建議用 Live Server 或本地伺服器）。

## 上線到互聯網（免費方案）

### 方法一：Vercel / Netlify（推薦）

1. 把整個 `phantasia-quest` 資料夾上傳到 GitHub
2. 到 [vercel.com](https://vercel.com) 或 [netlify.com](https://netlify.com) 用 GitHub 帳號登入
3. Import 專案 → 部署
4. 會得到一個免費網址（例如 `phantasia-quest.vercel.app`）

### 方法二：GitHub Pages

1. 上傳到 GitHub repo
2. Settings → Pages → Source 選 main branch
3. 網址會是 `https://你的帳號.github.io/repo名稱`

## 接上真正的登入註冊 + 資料庫（Supabase）

目前是本地存檔。要讓玩家有帳號、跨裝置存檔，建議用 **Supabase**（免費額度很夠）：

1. 到 [supabase.com](https://supabase.com) 註冊並建立新專案
2. 在 Authentication → Providers 開啟 Email
3. 建立資料表 `players`：

```sql
create table players (
  id uuid references auth.users primary key,
  name text not null,
  job text not null,
  level int default 1,
  exp int default 0,
  gold int default 50,
  hp int,
  max_hp int,
  mp int,
  max_mp int,
  str int,
  int int,
  agi int,
  vit int,
  map text default 'village',
  inventory jsonb default '[]',
  equipment jsonb default '{}',
  skills text[] default '{}',
  total_kills int default 0,
  updated_at timestamptz default now()
);
```

4. 在專案設定拿到 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
5. 之後我可以幫你把 `game.js` 改成使用 Supabase 存讀角色資料

## 域名建議

遊戲名稱：**幻境紀行**

可考慮的域名（需自行購買）：
- phantasia-quest.com
- phantasia.app
- eldoria-quest.com
- 幻境紀行.tw（若有中文域名需求）

推薦到 [Namecheap](https://namecheap.com)、[Cloudflare Registrar](https://cloudflare.com) 或 [GoDaddy](https://godaddy.com) 購買後，把 DNS 指到 Vercel / Netlify。

## 之後可擴充

- 真正帳號系統（Supabase Auth）
- 即時排行榜
- 更多轉職路線（二轉、三轉）
- 任務系統
- 好友 / 交易
- PWA（可安裝到手機主畫面）

---

有任何想加的功能或要改成 Supabase 版本，直接告訴我即可。
