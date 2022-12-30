#! /bin/bash
cd api/
pnpm start &
sleep 3s

cd ..
pnpm build

fuser -k 4000/tcp
echo API process killed
