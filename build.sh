#!/bin/sh
# src/ の部品をつなげて index.html を作る。Web 公開用のオフライン部品(sw.js・manifest・アイコン)も一緒に置く
cd "$(dirname "$0")" || exit 1
cat src/00_head.html src/*.js src/99_tail.html > index.html
cp src/pwa/manifest.webmanifest src/pwa/icon-*.png .
VERSION=$(cat index.html src/pwa/manifest.webmanifest | shasum | cut -c1-12)
sed "s/__VERSION__/v-$VERSION/" src/pwa/sw.js > sw.js
echo "index.html を作成しました(v-$VERSION)"
