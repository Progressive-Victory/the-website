#!/bin/bash

echo "$PV_CONTRACTS_SSH_KEY" > id_ed25519
chmod 0400 ./id_ed25519


eval $(ssh-agent)
ssh-add id_ed25519
ssh -o StrictHostKeyChecking=no -vT git@github.com

git config url."ssh://".insteadOf https://
pnpm install --frozen-lockfile

rm ./id_ed25519