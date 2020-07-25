#!/bin/sh

set -e

cp -a ./pf2stats/example-dot-env.txt  ./pf2stats/.env
cp -a ./pf2_discord_bot/example-dot-env.txt ./pf2_discord_bot\.env
cp -a ./example-dot-env.txt ./.env
