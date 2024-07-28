#!/bin/sh -e
rm -rf dist
mkdir -p dist/pages
cp src/*.html dist
cp -r src/assets dist
cp dist/assets/favicon.ico dist
cp -r src/components dist
cp -r src/scripts dist
cp -r src/style dist
./tools/tailwindcss-extra -i ./src/style/style.css -o ./dist/style/style.css --minify
./tools/ssg src/pages dist/pages "M. Cullen McClellan - Blog" "https://mcullenm.dev/blog"
mv dist/pages/sitemap.xml dist/sitemap.xml
