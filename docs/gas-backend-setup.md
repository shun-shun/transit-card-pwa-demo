# GAS バックエンド セットアップ手順

このドキュメントは `transit-card-pwa` のモック取引データを、Google Apps Script (GAS) + スプレッドシートによる
ネットワーク経由の取得に置き換えるための手順とコードです。フロントエンド側の実装は
[`src/data/transactionsApi.ts`](../src/data/transactionsApi.ts) と
[`src/context/CardContext.tsx`](../src/context/CardContext.tsx) で完了済みで、GAS側のURL・トークンを
`.env.local` に設定すれば接続できます。

## 全体構成

- **データ保存先**: Google スプレッドシート（1行 = 1取引）
- **配信**: GAS Web App の `doGet` が、スプレッドシートの中身をJSONで返す
- **データ生成**: 時間主導トリガーが平日 9:00〜10:00 の間に1回発火し、その日の「行き」「帰り」の利用データ（各210円）を追加。残高が1000円以下ならチャージ取引も追加してから発火する
- **認証**: Googleアカウントログインは使えない（ブラウザから直接fetchするため）ので、簡易的な共有シークレット（トークン）をクエリパラメータで渡す方式

## 1. スプレッドシートを作成する

1. 新規のGoogleスプレッドシートを作成する（名前は任意。例: `transit-card-transactions`）。
2. シートタブの名前を `transactions` に変更する（コード側でこの名前を参照します）。
3. **C列（occurredAt）を先に「書式 > 数値 > プレーンテキスト」に設定する**。ISO8601文字列 (`2026-06-29T08:07:00+09:00`) が日付型に自動変換されるのを防ぐためです。
4. 1行目（ヘッダー）に次の列名をそのまま入力する。

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | id | type | occurredAt | title | amount | balanceAfter | note |

5. 2行目以降に、下記の初期データ（既存のローカルモック27件、2026-06-29〜2026-07-15の平日分）をタブ区切りのまま貼り付ける（A2セルを選択して貼り付ければ自動的に列に分かれます）。

```
txn-001	charge	2026-06-29T07:50:00+09:00	チャージ（デモ入金）	4000	4000	
txn-002	train	2026-06-29T08:07:00+09:00	バスセンター駅 → 菊水駅	-210	3790	
txn-003	train	2026-06-29T19:35:00+09:00	菊水駅 → バスセンター駅	-210	3580	
txn-004	train	2026-06-30T08:12:00+09:00	バスセンター駅 → 菊水駅	-210	3370	
txn-005	train	2026-06-30T20:10:00+09:00	菊水駅 → バスセンター駅	-210	3160	
txn-006	train	2026-07-01T08:03:00+09:00	バスセンター駅 → 菊水駅	-210	2950	
txn-007	train	2026-07-01T19:48:00+09:00	菊水駅 → バスセンター駅	-210	2740	
txn-008	train	2026-07-02T08:22:00+09:00	バスセンター駅 → 菊水駅	-210	2530	
txn-009	train	2026-07-02T19:22:00+09:00	菊水駅 → バスセンター駅	-210	2320	
txn-010	train	2026-07-03T08:15:00+09:00	バスセンター駅 → 菊水駅	-210	2110	
txn-011	train	2026-07-03T20:05:00+09:00	菊水駅 → バスセンター駅	-210	1900	
txn-012	train	2026-07-06T08:09:00+09:00	バスセンター駅 → 菊水駅	-210	1690	
txn-013	train	2026-07-06T19:58:00+09:00	菊水駅 → バスセンター駅	-210	1480	
txn-014	train	2026-07-07T08:26:00+09:00	バスセンター駅 → 菊水駅	-210	1270	
txn-015	train	2026-07-07T19:15:00+09:00	菊水駅 → バスセンター駅	-210	1060	
txn-016	charge	2026-07-08T07:50:00+09:00	チャージ（デモ入金）	3000	4060	
txn-017	train	2026-07-08T08:04:00+09:00	バスセンター駅 → 菊水駅	-210	3850	
txn-018	train	2026-07-08T20:22:00+09:00	菊水駅 → バスセンター駅	-210	3640	
txn-019	train	2026-07-09T08:18:00+09:00	バスセンター駅 → 菊水駅	-210	3430	
txn-020	train	2026-07-09T19:40:00+09:00	菊水駅 → バスセンター駅	-210	3220	
txn-021	train	2026-07-10T08:11:00+09:00	バスセンター駅 → 菊水駅	-210	3010	
txn-022	train	2026-07-10T19:52:00+09:00	菊水駅 → バスセンター駅	-210	2800	
txn-023	train	2026-07-13T08:29:00+09:00	バスセンター駅 → 菊水駅	-210	2590	
txn-024	train	2026-07-13T20:15:00+09:00	菊水駅 → バスセンター駅	-210	2380	
txn-025	train	2026-07-14T08:06:00+09:00	バスセンター駅 → 菊水駅	-210	2170	
txn-026	train	2026-07-14T19:28:00+09:00	菊水駅 → バスセンター駅	-210	1960	
txn-027	train	2026-07-15T08:14:00+09:00	バスセンター駅 → 菊水駅	-210	1750	
```

> 最終行（txn-027）は残高1750円の状態で終わっています。トリガー稼働後はここから続きが積み上がります（1750円は閾値1000円より上なので、次回発火時はチャージなしで行き帰り分が引かれます）。

## 2. Apps Script を作成する

1. スプレッドシートのメニューから **拡張機能 > Apps Script** を開く。
2. デフォルトの `Code.gs` の中身を、下記のコードで丸ごと置き換える。

```javascript
/**
 * transit-card-pwa 用のデモバックエンド (Google Apps Script)
 * - スプレッドシート「transactions」に取引データを蓄積する
 * - Web App (doGet) がJSONとして配信する
 * - 平日 9:00〜10:00 の間に発火する時間主導トリガーで、その日の行き/帰り利用データを自動生成する
 * - 残高が閾値(1000円)以下になったら自動でチャージ取引を追加する
 */

const SHEET_NAME = 'transactions'
const CHARGE_THRESHOLD = 1000
const CHARGE_AMOUNT = 3000
const OUTBOUND_TITLE = 'バスセンター駅 → 菊水駅'
const INBOUND_TITLE = '菊水駅 → バスセンター駅'
const FARE = 210
const TIMEZONE = 'Asia/Tokyo'

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error(`シート "${SHEET_NAME}" が見つかりません`)
  return sheet
}

function getSharedSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET')
}

/** Web App エントリポイント。フロントエンドからの GET リクエストを受ける */
function doGet(e) {
  const secret = getSharedSecret_()
  const token = e && e.parameter && e.parameter.token
  if (!secret || token !== secret) {
    return jsonOutput_({ error: 'unauthorized' })
  }

  const sheet = getSheet_()
  const values = sheet.getDataRange().getValues()
  const header = values[0]
  const rows = values.slice(1)
  const transactions = rows
    .filter((row) => row[0] !== '' && row[0] !== null)
    .map((row) => rowToTransaction_(header, row))

  return jsonOutput_({ transactions })
}

function rowToTransaction_(header, row) {
  const obj = {}
  header.forEach((key, i) => {
    obj[key] = row[i]
  })
  const tx = {
    id: String(obj.id),
    type: obj.type,
    occurredAt: toIsoString_(obj.occurredAt),
    title: obj.title,
    amount: Number(obj.amount),
    balanceAfter: Number(obj.balanceAfter),
  }
  if (obj.note) tx.note = obj.note
  return tx
}

function toIsoString_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
  }
  return value
}

function jsonOutput_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

/** 現在の最終残高（シートが空なら0） */
function getCurrentBalance_(sheet) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return 0
  return Number(sheet.getRange(lastRow, 6).getValue()) // F列 = balanceAfter
}

function nextId_(sheet) {
  return `txn-${String(sheet.getLastRow()).padStart(3, '0')}`
}

function appendRow_(sheet, tx) {
  sheet.appendRow([tx.id, tx.type, tx.occurredAt, tx.title, tx.amount, tx.balanceAfter, tx.note || ''])
}

/** startHour:startMinute 〜 endHour:endMinute の範囲でランダムな時刻のISO文字列を作る（baseDateと同じ日付） */
function randomTimeIso_(baseDate, startHour, startMinute, endHour, endMinute) {
  const startTotal = startHour * 60 + startMinute
  const endTotal = endHour * 60 + endMinute
  const randTotal = startTotal + Math.floor(Math.random() * (endTotal - startTotal + 1))
  const d = new Date(baseDate)
  d.setHours(Math.floor(randTotal / 60), randTotal % 60, 0, 0)
  return Utilities.formatDate(d, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

/**
 * 時間主導トリガーから毎日呼ばれる。
 * 平日のみ、行き/帰りの利用データを追加。残高が閾値以下ならチャージも追加してから引く。
 */
function generateDailyTransactions() {
  const now = new Date()
  const day = now.getDay() // 0=日, 6=土
  if (day === 0 || day === 6) return // 土日はスキップ

  const sheet = getSheet_()
  let balance = getCurrentBalance_(sheet)

  if (balance <= CHARGE_THRESHOLD) {
    balance += CHARGE_AMOUNT
    appendRow_(sheet, {
      id: nextId_(sheet),
      type: 'charge',
      occurredAt: Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      title: 'チャージ（自動入金）',
      amount: CHARGE_AMOUNT,
      balanceAfter: balance,
    })
  }

  balance -= FARE
  appendRow_(sheet, {
    id: nextId_(sheet),
    type: 'train',
    occurredAt: randomTimeIso_(now, 8, 0, 8, 30),
    title: OUTBOUND_TITLE,
    amount: -FARE,
    balanceAfter: balance,
  })

  balance -= FARE
  appendRow_(sheet, {
    id: nextId_(sheet),
    type: 'train',
    occurredAt: randomTimeIso_(now, 19, 0, 20, 30),
    title: INBOUND_TITLE,
    amount: -FARE,
    balanceAfter: balance,
  })
}

/** 初回だけ手動実行する：時間主導トリガーを（再）登録する。9:00〜10:00の間に1回発火する */
function setupDailyTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'generateDailyTransactions')
    .forEach((t) => ScriptApp.deleteTrigger(t))

  ScriptApp.newTrigger('generateDailyTransactions').timeBased().everyDays(1).atHour(9).create()
}
```

> `atHour(9)` は GAS の仕様上「9時台（9:00〜10:00）のどこか」で発火するので、要件の「9:00〜10:00の間で発火」をそのまま満たします。分単位で厳密に指定するオプションはありません。

## 3. スクリプトプロパティに共有シークレットを設定する

1. Apps Script エディタ左側の歯車アイコン **プロジェクトの設定** を開く。
2. 「スクリプト プロパティ」に以下を追加する。

   | プロパティ | 値 |
   |---|---|
   | `SHARED_SECRET` | 任意の推測されにくい文字列（例: `openssl rand -hex 16` などで生成） |

   このデモは学習用途のため、値の強度自体は問いませんが、第三者にURLと一緒に知られると誰でもデータを読めてしまう点は理解した上で運用してください。

## 4. トリガーを登録する

1. エディタ上部の関数選択ドロップダウンで `setupDailyTrigger` を選択し、**実行** ボタンを押す。
2. 初回はGoogleの権限確認ダイアログが出るので、自分のアカウントで承認する。
3. 左メニューの「トリガー」（時計アイコン）を開き、`generateDailyTransactions` が `時間主導型 / 日タイマー / 午前9時〜10時` で登録されていることを確認する。

## 5. Web App として公開する

1. エディタ右上の **デプロイ > 新しいデプロイ** を選択。
2. 種類の選択で「ウェブアプリ」を選ぶ。
3. 設定:
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. **デプロイ** をクリックし、発行された **ウェブアプリのURL**（`https://script.google.com/macros/s/xxxx/exec` の形式）をコピーする。

   > コードを更新した際は「デプロイを管理 > 編集 > バージョン: 新バージョン」で再デプロイしないと反映されません（同じURLのまま更新できます）。

## 6. フロントエンド側に接続情報を設定する

このリポジトリのルートに `.env.local` を作成し（`.env.example` をコピーして使うと早い）、次の2つを設定してください。

```
VITE_GAS_ENDPOINT_URL=（手順5でコピーしたウェブアプリのURL）
VITE_GAS_SHARED_SECRET=（手順3で設定したSHARED_SECRETと同じ値）
```

設定後、`npm run dev` で起動すればホーム画面・履歴画面ともにGAS経由のデータが表示されます。取得に失敗した場合は履歴画面にエラーメッセージが表示されます（URL・トークンの設定漏れ、デプロイのアクセス権限設定などを確認してください）。

## 動作確認のポイント

- Apps Script エディタから `generateDailyTransactions` を直接実行すると、平日であればすぐに2件（行き・帰り）、必要なら+1件（チャージ）がシートに追加されます。土日に手動実行した場合は何も起きません（意図した挙動です）。
- ブラウザで `ウェブアプリのURL?token=正しいトークン` に直接アクセスすると、`{"transactions":[...]}` 形式のJSONが返ることを確認できます。トークンが違う場合は `{"error":"unauthorized"}` が返ります。
