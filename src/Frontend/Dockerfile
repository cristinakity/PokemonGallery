FROM node:24-alpine AS build

WORKDIR /app

COPY src/Frontend/package*.json ./
RUN npm ci

COPY src/Frontend/ ./

RUN npm run build -- --output-path=dist/app && \
    mkdir -p /tmp/site && \
    if [ -d dist/app/browser ]; then \
        cp -a dist/app/browser/. /tmp/site/; \
    else \
        cp -a dist/app/. /tmp/site/; \
    fi

FROM nginxinc/nginx-unprivileged:stable-alpine

COPY src/Frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /tmp/site /usr/share/nginx/html

EXPOSE 8080