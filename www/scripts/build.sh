#!/bin/bash
cd api/
pnpm start &
sleep 3s

cd ..
FORCE_COLOR=1 pnpm turbo build

fuser -k 4000/tcp
echo API process killed
