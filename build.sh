#!/bin/sh
# src/ の部品をつなげて index.html を作る。バージョンは VERSION ファイル(「1.1.0 2026-10-02」の形)から入れる。
# Web 公開用のオフライン部品(sw.js・manifest・アイコン)も一緒に置く
cd "$(dirname "$0")" || exit 1
read -r VER DATE < VERSION
cat src/00_head.html src/*.js src/99_tail.html | sed "s/__APP_VERSION__/$VER/g; s/__APP_DATE__/$DATE/g" > index.html
cp src/pwa/manifest.webmanifest src/pwa/icon-*.png .
HASH=$(cat index.html src/pwa/manifest.webmanifest | shasum | cut -c1-12)
sed "s/__VERSION__/v$VER-$HASH/" src/pwa/sw.js > sw.js
echo "index.html を作成しました(v$VER $DATE / $HASH)"
