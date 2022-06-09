#!/bin/sh
rm -rf out
yarn build
yarn export
rm -rf /var/www/html
cp -r out /var/www/html
