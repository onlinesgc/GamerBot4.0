FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache fontconfig ttf-dejavu font-noto

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

CMD ["npm", "start"]
