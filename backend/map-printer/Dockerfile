FROM ubuntu:22.04

ENV NODE_MAJOR 20
ENV NODE_ENV production
ENV DISPLAY :99

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl gnupg libcurl4-openssl-dev libglfw3-dev libuv1-dev libpng-dev libicu-dev libjpeg-turbo8-dev libwebp-dev xvfb xauth wget unzip && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg   && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list  && \
    apt update && apt install nodejs  && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN npm install

CMD  xvfb-run -a node src/server.mjs
