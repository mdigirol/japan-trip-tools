# Glossary: signs, tickets, menus

Format: kanji/kana · romaji · meaning · tag. The decoder groups these by category and makes them searchable by romaji and English. Most are general knowledge `[V]`. The check is for correctness, not sourcing.

For anything not listed, Signs & menus opens Kuli Kuli first (camera translate for menus, labels and handwriting), then Google Translate and Google Lens. Phrases has the same Kuli Kuli button at the bottom (#41). The button opens Kuli Kuli's store listing for the phone's OS (App Store, or Google Play on Android), which shows Open when it's installed. A web page can't open the app directly: it has no URL scheme, and its universal link (`menu-gpt-orpin.vercel.app`) didn't open the app when tested on an iPhone. `src/components/KuliKuli.tsx`.

## Signs

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| 出口 | deguchi | Exit | [V] |
| 入口 | iriguchi | Entrance | [V] |
| 非常口 | hijouguchi | Emergency exit | [V] |
| 改札 | kaisatsu | Ticket gates | [V] |
| 乗り換え / 乗換 | norikae | Transfer | [V] |
| 精算 | seisan | Fare adjustment (machine by the gates) | [V] |
| お手洗い / トイレ | otearai / toire | Restroom | [V] |
| 男 / 女 | otoko / onna | Men / Women | [N] |
| 男湯 / 女湯 | otoko-yu / onna-yu | Men's bath / Women's bath | [N] |
| 押 / 引 | osu / hiku | Push / Pull | [V] |
| 営業中 | eigyou-chuu | Open | [V] |
| 準備中 | junbi-chuu | Not open yet (preparing) | [V] |
| 定休日 | teikyuubi | Regular closing day | [V] |
| 本日休業 | honjitsu kyuugyou | Closed today | [V] |
| 満席 | manseki | Full | [V] |
| 売り切れ | urikire | Sold out | [V] |
| 貸切 | kashikiri | Private / reserved (whole venue or bath) | [N][V] |
| 予約制 | yoyaku-sei | Reservation only | [V] |
| 禁煙 / 喫煙 | kin'en / kitsuen | No smoking / Smoking | [N] |
| 撮影禁止 | satsuei kinshi | No photography | [T][V] |
| 立入禁止 | tachiiri kinshi | No entry | [V] |
| 現金のみ | genkin nomi | Cash only | [V] |
| 免税 | menzei | Tax-free | [N][V] |
| 税込 / 税抜 | zeikomi / zeinuki | Tax included / Tax not included | [V] |
| 空車 | kuusha | Taxi available (usually red) | [N][T] |
| 賃走 | chinsou | Taxi occupied | [N][T] |
| 迎車 | geisha | Taxi on its way to a pickup (not available) | [V] |
| チャージ | chaaji | Top up (IC card machine), or cover charge (bar) | [N][V] |

## Train tickets and platforms

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| 号車 | gousha | Car number | [V] |
| 番 / 席 | ban / seki | Seat number / seat | [V] |
| 番線 | bansen | Platform / track number | [V] |
| 指定席 | shiteiseki | Reserved seat | [N] |
| 自由席 | jiyuuseki | Non-reserved seat | [N] |
| グリーン車 | guriinsha | Green car (first class) | [K] |
| 発 / 着 | hatsu / chaku | Departs / Arrives | [V] |
| 行き | yuki | Bound for | [V] |
| 各駅停車 / 普通 | kakueki teisha / futsuu | Local (all stops) | [T] |
| 快速 | kaisoku | Rapid (skips stops) | [T] |
| 急行 / 特急 | kyuukou / tokkyuu | Express / Limited express | [V] |
| のぞみ / ひかり / こだま | Nozomi / Hikari / Kodama | Shinkansen services, fastest to slowest | [K][V] |
| 終電 / 始発 | shuuden / shihatsu | Last train / First train | [T] |
| 特大荷物スペースつき座席 | tokudai nimotsu supeesu tsuki zaseki | Seat with oversized-luggage space | [N][V] |
| みどりの窓口 | midori no madoguchi | JR ticket office | [T] |

## Sushi

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| おまかせ | omakase | Chef's choice | [V] |
| 大トロ / 中トロ / 赤身 | ootoro / chuutoro / akami | Fattiest / medium-fatty / lean tuna | [V] |
| サーモン | saamon | Salmon | [V] |
| ぶり / はまち / かんぱち | buri / hamachi / kanpachi | Yellowtail (mature / young) / amberjack | [V] |
| 鯛 | tai | Sea bream | [V] |
| 平目 / ひらめ | hirame | Flounder | [V] |
| 鯵 / 鯖 / 小鰭 | aji / saba / kohada | Horse mackerel / mackerel / gizzard shad (silver-skinned fish) | [V] |
| 穴子 / 鰻 | anago / unagi | Sea eel / freshwater eel | [V] |
| 雲丹 / うに | uni | Sea urchin | [V] |
| いくら | ikura | Salmon roe | [V] |
| 甘えび / 車えび | amaebi / kuruma-ebi | Sweet shrimp / tiger prawn | [V] |
| 帆立 / ほたて | hotate | Scallop | [V] |
| いか / たこ | ika / tako | Squid / octopus | [V] |
| 玉子 | tamago | Sweet omelet | [V] |
| 赤貝 / 貝 | akagai / kai | Ark clam / shellfish | [V] |
| ガリ | gari | Pickled ginger | [V] |
| あがり | agari | Green tea (counter term) | [V] |

## Yakitori

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| もも | momo | Thigh | [V] |
| ねぎま | negima | Thigh and leek | [V] |
| つくね | tsukune | Chicken meatball | [V] |
| 皮 | kawa | Skin | [V] |
| ぼんじり | bonjiri | Tail | [V] |
| ハツ / レバー / 砂肝 | hatsu / rebaa / sunagimo | Heart / liver / gizzard | [V] |
| ささみ | sasami | Breast tender | [V] |
| 手羽先 | tebasaki | Wing tip | [V] |
| タレ / 塩 | tare / shio | Sweet soy glaze / salt | [T] |

## Ramen

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| 醤油 / 塩 / 味噌 | shouyu / shio / miso | Soy / salt / miso base | [V] |
| 豚骨 | tonkotsu | Pork-bone broth | [N][V] |
| 魚介 / 煮干し | gyokai / niboshi | Seafood / dried-sardine broth | [T][V] |
| つけ麺 | tsukemen | Dipping noodles | [V] |
| 替え玉 | kaedama | Extra noodles for your leftover broth | [V] |
| かため / ふつう / やわらかめ | katame / futsuu / yawarakame | Firm / regular / soft noodles | [V] |
| 大盛り | oomori | Large portion | [V] |
| 味玉 | ajitama | Marinated soft egg | [V] |
| チャーシュー | chaashuu | Braised pork slices | [V] |
| 食券 | shokken | Meal ticket (from the machine) | [N][V] |

## Izakaya and drinks

| Japanese | Romaji | Meaning | Tag |
| --- | --- | --- | --- |
| お通し | otoshi | Small cover-charge dish | [V] |
| おすすめ | osusume | House recommendations | [N] |
| 飲み放題 / 食べ放題 | nomihoudai / tabehoudai | All-you-can-drink / all-you-can-eat | [T] |
| ラストオーダー | rasuto oodaa | Last order | [V] |
| 生ビール | nama biiru | Draft beer | [N] |
| ハイボール | haibooru | Whisky highball | [N] |
| レモンサワー | remon sawaa | Lemon sour (shochu, lemon, soda) | [T] |
| 日本酒 · 冷 / 燗 | nihonshu · hiya / kan | Sake · cold / warm | [V] |
| 焼酎 | shouchuu | Shochu (distilled spirit) | [V] |
| ストレート / ロック / 水割り | sutoreeto / rokku / mizuwari | Neat / on the rocks / with water | [V] |
| ノンアルコール | non-arukooru | Alcohol-free | [V] |

## Regional dishes

| Japanese | Romaji | Meaning | Where | Tag |
| --- | --- | --- | --- | --- |
| 懐石 | kaiseki | Seasonal multi-course meal | Kyoto, ryokan | [K][N] |
| おばんざい | obanzai | Kyoto home-style small dishes | Kyoto | [K] |
| 湯豆腐 | yudoufu | Tofu simmered in kombu broth | Kyoto (Arashiyama) | [K] |
| 京野菜 | kyou-yasai | Heirloom Kyoto vegetables | Kyoto | [K] |
| いなり寿司 | inari-zushi | Rice in sweet fried-tofu pouches | Fushimi | [K] |
| にしんそば | nishin soba | Soba with sweet simmered herring | Kyoto | [K] |
| 抹茶 | matcha | Powdered green tea (ceremonial vs cafe grade) | Kyoto, Uji | [K] |
| たこ焼き | takoyaki | Octopus batter balls | Osaka | [N][T] |
| お好み焼き | okonomiyaki | Savory cabbage pancake | Osaka | [N] |
| 串カツ | kushikatsu | Fried skewers; one dip only in the shared sauce | Osaka | [N][V] |
| 豚まん | butaman | Pork bun | Osaka | [N] |
| 柿の葉寿司 | kakinoha-zushi | Sushi wrapped in persimmon leaf | Nara | [N] |
| 温泉まんじゅう | onsen manjuu | Steamed bean-paste buns | Hakone | [I] |
| 駅弁 | ekiben | Station bento for the train | Shinkansen | [N][K] |
| 牛丼 | gyuudon | Beef bowl (Matsuya, Yoshinoya) | Anywhere | [T] |
| 唐揚げ | karaage | Japanese fried chicken | Anywhere | [T] |
