FROM ghcr.io/pnpm/pnpm:11
ENV CI=true
RUN pnpm runtime set node 22 -g
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
CMD ["pnpm", "start"]
