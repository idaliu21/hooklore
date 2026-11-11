# 图片迁移 Cloudflare R2 方案

> **状态：站点已于 2026-11-11 在 Cloudflare Pages 恢复上线。**
> 最终没有做 R2 —— 实测表明它不是复活站点的必要条件，详见第 11 节。
> 起因：hooklore.com 自 2026-10-31 起返回 HTTP 402，Vercel 团队被暂停，共计挂了 11 天。

---

## 1. 为什么要迁

### 事故经过

Vercel dashboard 原文：

> Paused since **Oct 31, 2026** for Edge Requests. Your team exceeded the Hobby fair use limits. This pause ends on **Nov 30, 2026**.

整个 `ida's projects` team 被停，所有项目一起返回 `402 DEPLOYMENT_DISABLED`。

### 爆的是请求数，不是带宽

| 指标 | 用量 | Hobby 上限 | 占比 |
|---|---|---|---|
| **CDN Requests** | **1,334,908** | **1,000,000** | **133%** ← 爆点 |
| ISR Reads | 947K | 1M | 95% ← 下一个 |
| Fast Origin Transfer | 5.56 GB | 10 GB | 56% |
| Fast Data Transfer | 9.36 GB | 100 GB | 9% |
| Image Optimization | 799 | 5K | 16% |

带宽才用了 9%，请求数却 133%。原因是 2026-09 那次改动（`images.unoptimized = true`）之后，所有图片作为静态文件从 `public/` 直出 CDN：

| 尺寸 | 文件数 | 体积 |
|---|---|---|
| thumb | 1,561 | 28 MB |
| medium | 1,561 | 131 MB |
| full | 1,561 | 228 MB |
| **合计** | **4,683** | **397 MB** |

258 个图解、1,561 张原图。一个列表页就要几十个 thumb 请求，字节数却很小 —— **请求计数器比带宽计数器快十倍烧完**。这是第三次被同一件事绊倒（2026-08 预警体积 → 2026-09 炸图片优化额度 → 这次炸请求数）。

### 两个必须先说清楚的事实

1. **迁移救不了今天。** Vercel 这个暂停是**按时间**的，不是用量一降就解除。不升 Pro 的话，11/30 之前站点不会自己活过来。
2. **但站点其实可以不留在 Vercel。** 排查时发现这个站是**完全静态**的，这打开了一条既能立刻复活、又零成本的路。见下节。

---

## 2. 关键发现：这个站是纯静态的

| 检查项 | 结果 |
|---|---|
| 动态路由 | `pattern/[slug]`、`tag/[slug]` 都有 `generateStaticParams()` |
| Route Handler | 只有 `feed.xml`，且是 `export const dynamic = "force-static"` |
| `cookies()` / `headers()` / `NextRequest` | 无 |
| API routes / Server Actions | 无 |
| 数据源 | 构建时读 `src/content/patterns.json` |
| 运行时依赖 | 只有 `next` + `react`（零第三方） |
| 客户端组件 | 3 个，纯交互（轮播、文本折叠、Pin 按钮） |

也就是说 `output: 'export'` 跑得通，产物是一堆纯 HTML/CSS/JS，**任何静态托管都能放**，不需要 Node 服务器、不需要 ISR、不需要 Vercel。

唯一要处理的不兼容项：`next.config.ts` 里的 8 条 `redirects()`（legacy note_id → slug 的 301）。静态导出不支持 `redirects()`，但 Cloudflare Pages 原生支持 `_redirects` 文件，等价搬过去即可，不是阻塞点。

---

## 3. 三个选项

| | **A. 只迁图片** | **B. 图片 + 站点全上 Cloudflare** | **C. 升 Pro + 迁图片** |
|---|---|---|---|
| 站点何时活 | 11/30 自动解除 | **约 1 天后** | 立刻（付款即恢复） |
| 月成本 | ¥0 | **¥0** | **$20/月** |
| 要迁 DNS | 要 | 要 | 要 |
| 工作量 | 半天 | 约 1 天 | 半天 |
| 根治请求数 | ✅ | ✅ 彻底（CF 不限请求数） | ✅ |
| 还受 Vercel 额度约束 | 是（HTML 仍走 Vercel） | **否** | 是（但 Pro 额度 10M，够用） |
| 回滚难度 | — | 低（DNS 切回即可） | — |

**推荐 B。** 既然 DNS 本来就得迁到 Cloudflare（R2 自定义域的硬性要求），而站点又恰好是纯静态的，那把 HTML 也放 Cloudflare Pages 是顺手的事 —— 省下的不只是 $20/月，而是以后再也不用盯着请求数计数器。

A 的问题是站点还要躺 26 天，这期间 GSC 会掉索引、Pinterest 每天 3 个 Pin 全指向死链。
C 能最快复活，如果你不想碰 DNS、愿意每月 $20，这是最省心的；但请求数的根因还在，Pro 的 10M 额度按当前增长速度大约能撑一年半。

---

## 4. 前置条件（需要你确认 / 操作）

1. **Cloudflare 账号** —— 没有的话注册一个，免费版即可。
2. **hooklore.com 的 NS 要迁到 Cloudflare。**
   - 当前：`dns9.hichina.com` / `dns10.hichina.com`（阿里云万网，注册商 Alibaba Cloud / HiChina，到期 2027-04-04）
   - 原因：R2 的 Custom Domain 功能要求域名 zone 托管在 Cloudflare，没有例外。
   - 操作在阿里云控制台改 NS，我没法代做。
   - **时机其实正好**：站点现在本来就是挂的，DNS 传播期（几小时到 48h）不会额外损失流量。
3. **R2 需要绑定支付方式** —— Cloudflare 要求即使用免费额度也要绑卡。按下面的用量测算，账单是 $0。

---

## 5. 成本测算

**R2**

| 项 | 用量 | 免费额度 | 费用 |
|---|---|---|---|
| 存储 | 397 MB | 10 GB | $0 |
| Class A（写） | 首次 4,683 次，之后每月几百 | 100 万/月 | $0 |
| Class B（读） | 命中 CDN 缓存的不计，回源极少 | 1,000 万/月 | $0 |
| 出站流量 | 约 10 GB/月 | **R2 零出口费** | $0 |

**Cloudflare Pages（选项 B）**：带宽无限、请求无限，构建 500 次/月。费用 $0。

**合计：$0/月。** 对比选项 C 的 $240/年。

---

## 6. 实施步骤（按选项 B 写，A 做到阶段 2 为止）

### 阶段 0 · 准备（不碰线上）

1. 注册/登录 Cloudflare，创建 R2 bucket：`hooklore-images`
2. 创建 R2 API Token（Object Read & Write），记下 Access Key / Secret / Account ID
3. 本地写入 `web/.env.local`（已被 `.gitignore` 忽略）：
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=hooklore-images
   NEXT_PUBLIC_IMAGE_BASE=https://img.hooklore.com
   ```

### 阶段 1 · DNS 迁到 Cloudflare

1. Cloudflare 添加站点 `hooklore.com`，它会自动扫描现有记录 —— **逐条核对**，确保 Vercel 的 A/CNAME 记录都被带过来了
2. 阿里云控制台把 NS 改成 Cloudflare 给的两个
3. 等待生效（`dig NS hooklore.com` 确认）
4. 此时站点行为不变（仍是 Vercel 的 402），只是 DNS 换了管家

### 阶段 2 · 图片上 R2

1. R2 bucket 绑定自定义域 `img.hooklore.com`，开启公共访问
2. 首次全量上传 397 MB（用 `rclone` 或 `aws s3 sync`，S3 兼容端点）：
   ```bash
   rclone sync web/public/images r2:hooklore-images/images \
     --header-upload "Cache-Control: public, max-age=31536000, immutable"
   ```
   图片内容永不变更（文件名含固定的 `image_N_size`），可以放心设一年强缓存。
3. 验证：`curl -I https://img.hooklore.com/images/relief-dove-lace-coaster/image_0_thumb.webp`

### 阶段 3 · 改 export-data.py（代码改动的核心，也是唯一真正要改的逻辑）

好消息：整个前端引用链路设计得很干净，**组件一行都不用改**。

- 所有图片路径都只来自 `PatternImage` 的 `thumb` / `medium` / `full` 三个字段
- 这三个字段只在 `scripts/export-data.py` 的 160-162 行生成
- `src/lib/site.ts` 的 `absoluteUrl()` 已经有 `if (/^https?:\/\//i.test(path)) return path;` —— 传绝对 URL 进去会原样返回，sitemap / OG / RSS / JSON-LD 全部自动正确

改动：

```python
# scripts/export-data.py
IMAGE_BASE = os.environ.get("NEXT_PUBLIC_IMAGE_BASE", "")  # 空 = 回退到本地路径

def image_url(slug: str, stem: str, size: str) -> str:
    path = f"/images/{slug}/{stem}_{size}.webp"
    return f"{IMAGE_BASE}{path}" if IMAGE_BASE else path
```

然后 160-162 行替换成 `image_url(slug, stem, "thumb")` 等。

同时把 WebP 输出目录从 `web/public/images` 改到仓库外的缓存目录（如 `web/.image-cache/`，加进 `.gitignore`），并在脚本末尾调用 rclone 增量同步到 R2。保留 `IMAGE_BASE` 为空时回退本地路径的行为，本地 `next dev` 才能照常预览。

### 阶段 4 · 站点静态化

1. `next.config.ts`：
   - 加 `output: 'export'`
   - 删掉 `redirects()`（静态导出不支持），改写成 `public/_redirects`：
     ```
     /pattern/686300370000000010013181  /pattern/small-elephant-amigurumi  301
     /pattern/69ccaa970000000023025702  /pattern/four-corner-granny-square-flower  301
     ... （共 8 条）
     ```
   - 补一条老图片 URL 的兜底（Google 图片索引 + 已发 Pin 的 og:image 指向旧地址）：
     ```
     /images/*  https://img.hooklore.com/images/:splat  301
     ```
   - `images.unoptimized: true` 保留 —— 静态导出 + unoptimized 是官方支持的组合，不需要 custom loader
2. `next build` 验证 `out/` 产物，重点检查：
   - `opengraph-image.tsx` 有没有正常生成静态 PNG
   - `sitemap.xml` / `robots.txt` / `feed.xml` 三个文件在不在，里面的 URL 对不对
   - 随机抽几个 `pattern/*/index.html` 看图片 src 是不是 `img.hooklore.com`

> ⚠️ 本项目是 Next.js **16.2.2**，`web/AGENTS.md` 明确要求写代码前先读 `node_modules/next/dist/docs/` 里的对应文档，不要凭记忆写。阶段 4 的配置我已核对过 `01-app/02-guides/static-exports.md`，实施时仍需逐条复核。

### 阶段 5 · 上 Cloudflare Pages 并切流

1. Cloudflare Pages 连 `idaliu21/hooklore` 仓库，构建命令 `next build`，产物目录 `out`
2. 环境变量设 `SITE_URL=https://www.hooklore.com`、`NEXT_PUBLIC_IMAGE_BASE=https://img.hooklore.com`
3. 先用 `*.pages.dev` 预览域名完整验收
4. 验收通过后把 `hooklore.com` / `www` 的 DNS 指向 Pages
5. 站点复活 ✅

### 阶段 6 · 收尾

1. 从 git 删除 `web/public/images`（397 MB），`.git` 目前 354 MB，可选做一次历史瘦身
2. Vercel 项目可以先留着不删（11/30 解除后作为备份），确认稳定后再删
3. 恢复 Pinterest 日更任务
4. GSC 提交新 sitemap，观察索引

---

## 7. 风险与回滚

| 风险 | 影响 | 应对 |
|---|---|---|
| DNS 迁移出错 | 站点/邮箱解析中断 | 迁之前把阿里云现有记录**全量截图存档**；逐条核对 CF 扫描结果；站点现在本来就是挂的，容错窗口大 |
| `output: export` 踩 Next 16 的坑 | 构建失败 | 阶段 4 在本地验证，不通就退回选项 A（只迁图片，站点留 Vercel 等 11/30） |
| 老图片 URL 404 | Google 图片索引掉、已发 Pin 的 og:image 失效 | 阶段 4 的 `/images/*` 301 兜底 |
| R2 自定义域没生效 | 图片全挂 | 阶段 2 单独验证完再改 export 脚本，两步解耦 |
| Pages 构建超限 | 部署失败 | 免费版 500 次/月，当前发布频率每周一次，远不到 |

**回滚**：任何阶段出问题，把 DNS 指回 Vercel 即可。`public/images` 在阶段 6 之前不删，Vercel 项目在确认稳定前不删，所以阶段 1-5 全程可逆。

---

## 8. 改动文件清单

| 文件 | 改动 |
|---|---|
| `web/scripts/export-data.py` | 图片 URL 加 `IMAGE_BASE` 前缀；输出目录改到仓库外；加 R2 同步 |
| `web/next.config.ts` | 加 `output: 'export'`；`redirects()` 迁到 `_redirects` |
| `web/public/_redirects` | 新建：8 条 legacy 301 + 1 条 `/images/*` 兜底 |
| `web/.gitignore` | 加 `.image-cache/` |
| `web/.env.local` | 新增 R2 凭证 + `NEXT_PUBLIC_IMAGE_BASE`（不进 git） |
| `web/public/images/` | 阶段 6 删除（397 MB） |

前端组件（`PatternCard` / `ImageCarousel` / `PatternDiagrams` / `sitemap.ts` / `feed.xml` / 各 page）**零改动**。

---

## 9. 已决定（2026-11-07）

1. 走**选项 B**：全站迁 Cloudflare。
2. NS 从阿里云迁到 Cloudflare —— 同意。
3. Pinterest 日更**继续发**，不停。

---

## 10. 实施进度

### ✅ 已完成（阶段 3、4，代码部分）

| 文件 | 改动 |
|---|---|
| `scripts/export-data.py` | 加 `IMAGE_BASE`（读 `NEXT_PUBLIC_IMAGE_BASE`）+ `image_url()` helper；三处路径生成改为调用它。空值回退站内相对路径，`next dev` 照常预览 |
| `next.config.ts` | 加 `output: "export"`；删掉 `redirects()`（静态导出不支持） |
| `public/_redirects` | 新建：8 条 legacy 301 + `/images/* → img.hooklore.com` 兜底 |
| `public/_headers` | 新建（**方案原文没列到，实测必须加**，见下） |
| `src/app/robots.ts`<br>`src/app/sitemap.ts`<br>`src/app/opengraph-image.tsx` | 各加一行 `export const dynamic = "force-static"` |

### 实施中发现的、方案原文漏掉的三件事

1. **三个 metadata route 必须显式声明 `force-static`。** Next 16 在 `output: "export"` 下不再自动推断，`robots.txt` / `sitemap.xml` / `opengraph-image` 会直接让 `next build` 报错退出。已逐个加上。

2. **OG 图导出成无扩展名文件，Pages 会发错 Content-Type。** `next build` 产出的是 `out/opengraph-image`（真 PNG，1200×630，54 KB），HTML 里引用 `/opengraph-image?<hash>`。Cloudflare Pages 按扩展名推断类型，没扩展名就走 `application/octet-stream`，Facebook / X / Pinterest 一律拒绝这张卡片。已在 `public/_headers` 里钉死 `Content-Type: image/png`。

3. **`public/images` 不用搬到仓库外。** 原方案阶段 3 说把 WebP 输出目录改到 `web/.image-cache/`，但那样 `IMAGE_BASE` 为空时本地预览就没图了，自相矛盾。实际不需要搬：`patterns.json` 是**本地导出时**就把 URL 固化进去的，Pages 构建只读这个 JSON，根本不看 `NEXT_PUBLIC_IMAGE_BASE`。所以只要用带 `IMAGE_BASE` 的方式跑一次 export，再把 `public/images` 从 git 移除即可，目录原地不动，本地预览和上传 R2 都还用它当源。

### 本地验证结果

```
npx next build  →  ✓ 311 个页面，0 错误
```

- `out/` 产物 7,468 文件 / 534 MB（其中 `images/` 473 MB，阶段 6 从仓库移除后不再进构建）
- `index.html`、`404.html`、`about.html`、`robots.txt`、`sitemap.xml`、`feed.xml`、`icon.svg`、`_redirects`、`_headers` 全部就位；`pattern/*.html` 258 个、`tag/*.html` 44 个，与数据库里 258 个图解吻合
- `robots.txt` / `sitemap.xml` 里的域名是 `https://www.hooklore.com`，正确
- 本地 `python3 -m http.server` 起 `out/`，playwright 实测首页和图解页（`relief-dove-lace-coaster`）渲染正常、图片加载正常、轮播可用、**console 零报错**

### Cloudflare Pages 本地实测（2026-11-11，`wrangler pages dev out`）

不用开账号也能在本地跑 Pages 的真实运行时，上面那些「应该能行」的推断全部实测过了：

```
✨ Parsed 9 valid redirect rules.
✨ Parsed 3 valid header rules.
```

| 验的事 | 结果 |
|---|---|
| 无扩展名路由 `/pattern/foo` → `foo.html` | ✅ 200 text/html（`/`、`/about`、`/pattern/*`、`/tag/*` 都对） |
| 8 条 legacy 301 | ✅ 抽查 3 条，`Location` 正确 |
| `/images/*` → R2 兜底 | ✅ 301 到 `img.hooklore.com` |
| **OG 图 Content-Type** | ✅ `image/png`（`_headers` 生效，坑已堵上） |
| `robots.txt` / `sitemap.xml` / `feed.xml` / `icon.svg` | ✅ 200，MIME 分别是 text/plain、application/xml、application/xml、image/svg+xml |
| 不存在的 slug | ✅ 404 |
| `.html` 直连 | ✅ 308 规范化到无扩展名，不会产生重复 URL |

### ⚠️ 实测发现的部署顺序硬约束

**`_redirects` 的 `/images/*` 通配规则会抢在真实静态文件前面命中。** 实测：`out/images/relief-dove-lace-coaster/image_0_full.webp` 这个文件确实存在（422 KB），但请求它照样返回 301 跳 `img.hooklore.com`。

后果：**R2 没活之前绝对不能把 Pages 接到正式域名**，否则全站图片 301 到一个不存在的域名，等于从「402 整站挂」换成「图片全挂」。也因此阶段 5.3 说的「先用 `*.pages.dev` 验收」必须排在 R2 验证通过之后，没法提前拿本地图片凑合着验。

严格顺序：**R2 建桶上传 → `curl -I img.hooklore.com` 验证 → 重导出 patterns.json → 才轮到 Pages**。

### ⏳ 卡住的步骤（需要你操作）

| # | 事情 | 说明 |
|---|---|---|
| 1 | 注册 / 登录 Cloudflare，添加站点 `hooklore.com` | 免费版即可。它会扫描现有 DNS 记录，**逐条核对**后再继续 |
| 2 | 阿里云控制台把 NS 改成 Cloudflare 给的两个 | 当前是 `dns9/dns10.hichina.com`。改之前把现有记录全量截图存档 |
| 3 | 创建 R2 bucket `hooklore-images` + 绑卡 | 按第 5 节测算账单 $0，但 Cloudflare 要求绑卡 |
| 4 | R2 绑自定义域 `img.hooklore.com`，开公共访问 | 要求 zone 已托管在 Cloudflare，所以必须在第 2 步之后 |
| 5 | 创建 R2 API Token（Object Read & Write） | 把 Access Key / Secret / Account ID 给我，我写进 `.env.local`（已 gitignore） |

### 第 2-5 步做完之后，我接着做

1. `rclone sync` 把 `public/images` 全量传到 R2（带一年强缓存头），`curl -I` 验证 `img.hooklore.com`
2. `NEXT_PUBLIC_IMAGE_BASE=https://img.hooklore.com python3 scripts/export-data.py` 重新导出 `patterns.json`，图片 URL 全部变绝对
3. `git rm -r --cached public/images` + `.gitignore` 加 `/public/images/`，仓库瘦 397 MB
4. Pages 连 `idaliu21/hooklore`，构建命令 `next build`、产物目录 `out`，环境变量补齐：`SITE_URL`、`NEXT_PUBLIC_GTM_ID`、`NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG`（后两个现在只在本地 `.env.local` 里，Vercel 上也配过，别漏）
5. 先用 `*.pages.dev` 验收，通过再把 `hooklore.com` / `www` 指向 Pages

---

## 11. 最终结果（2026-11-11）

**站点已恢复，运行在 Cloudflare Pages 上，月成本 $0。R2 没有做，也不需要做。**

### 为什么砍掉 R2

方案原本把「图片迁 R2」当成复活站点的前提。实施中查证 Cloudflare 官方文档后发现这个前提不成立：

| 限制项 | Pages Free 上限 | 本站实际 | 余量 |
|---|---|---|---|
| 单次部署文件数 | 20,000 | 7,469 | 2.7× |
| 单文件体积 | 25 MiB | 最大 0.7 MB | 充裕 |
| 请求数 | **不计量** | — | — |
| 带宽 | **不计量** | — | — |

当初炸的就是「请求数」（1.33M / 1M 上限），而 Pages 根本不对请求数计费 —— 把站点搬过来，根因就已经消失了。R2 剩下的唯一价值是「让 397 MB 图片不进 git」，那是个可以任何时候单独做的事，不该成为站点多躺 19 天的理由。

因此 `public/_redirects` 里那条 `/images/*` → R2 的跳转已移除（原因见下），图片直接由 Pages 提供。

### 最终架构

```
阿里云（注册商，NS 已指向 Cloudflare）
  └─ Cloudflare DNS
       ├─ hooklore.com      CNAME → hooklore.pages.dev（已代理）
       │    └─ 重定向规则 "Apex to www" → https://www.hooklore.com/${1}  301
       ├─ www.hooklore.com  CNAME → hooklore.pages.dev（已代理）← canonical
       └─ TXT               google-site-verification（保留）

GitHub idaliu21/hooklore (main)
  └─ Cloudflare Pages 项目 "hooklore"
       构建命令  npm run build
       产物目录  out
       环境变量  SITE_URL / NEXT_PUBLIC_GTM_ID /
                NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG / NODE_VERSION=22
```

以后发布：`/import → /translate → export-data.py → git push` 即自动构建上线，不再需要手动部署。

### 线上验收（全部通过）

- 首页 / about / 258 个图解页 / 44 个标签页 → 200
- `robots.txt` text/plain、`sitemap.xml` 与 `feed.xml` application/xml、`opengraph-image` **image/png**
- 8 条 legacy note_id → slug 的 301 全部正确，跳转目标 200
- 裸域 301 → www，路径和查询串都保留（`?utm_source=pinterest` 可用，Pinterest 引流不受影响）
- 图片 200 image/webp
- 不存在的 slug → 404
- 环境变量全部生效：GTM 注入、canonical 指向 www、Amazon `tag=hooklore-20` 已挂上
- 浏览器实测渲染正常，console 零报错

### 实施中踩到的坑（方案原文没有的）

1. **Next 16 的 metadata route 必须显式 `force-static`。** `robots.ts` / `sitemap.ts` / `opengraph-image.tsx` 三个都要，否则 `next build` 在 `output: "export"` 下直接报错退出。

2. **OG 图会被 Pages 发成 `application/octet-stream`。** 产物是无扩展名的 `out/opengraph-image`（真 PNG），Pages 按扩展名判类型。已用 `public/_headers` 钉死 `Content-Type: image/png`，线上已验证生效。这个坑如果上线后才发现，所有社交平台的卡片都会失效。

3. **`_redirects` 的通配规则优先于真实静态文件。** 拿一个确实存在于 `out/` 的图片实测，`/images/*` 规则照样让它 301。所以 R2 没活之前挂这条规则 = 全站图片挂掉。这也是它被移除的直接原因。

4. **Cloudflare 的 DNS 自动扫描会漏记录。** 扫描只找到 1 条 CNAME + 1 条 TXT，**漏掉了裸域的 A 记录**（216.198.79.1）。必须自己从原权威 NS `dig` 一遍逐条核对，不能信扫描结果。

5. **迁 NS 前必须确认 DNSSEC 关闭。** 注册商开着 DNSSEC 又换 NS，域名会直接解析失败。本站两边查证都是关闭状态，无 MX 记录，所以也不影响邮件。

6. **`wrangler pages dev out` 可以在零账号成本下跑真实 Pages 运行时。** 上线前用它验证了 `_redirects`、`_headers`、无扩展名路由，三个都和线上行为一致 —— 强烈建议以后改这类配置都先这样验一遍。

### 遗留事项

- **图片仍在 git 里**（4,683 个文件，约 400 MB，`.git` 约 354 MB）。不影响线上，但 clone 很重。想治理时再做 R2：建桶 → 绑 `img.hooklore.com` → rclone 上传 → 带 `NEXT_PUBLIC_IMAGE_BASE` 重跑 export → `git rm -r --cached public/images` → 把 `/images/*` 跳转规则加回 `_redirects`（顺序不能反，见坑 3）。`export-data.py` 的 `IMAGE_BASE` 支持已经就位，到时候不用改代码。
- **Vercel 项目尚未删除**，11/30 自动解除暂停后可作为冷备。确认 Pages 稳定后再删。
- GSC 里重新提交 sitemap，观察索引恢复情况。
