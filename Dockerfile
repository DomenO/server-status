FROM oven/bun:1.0.4-alpine

WORKDIR /app

COPY . .

COPY src src
COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install --production --frozen-lockfile

EXPOSE 35622

CMD [ "bun", "start:prod" ]