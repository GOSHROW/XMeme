FROM ubuntu:18.04
WORKDIR /usr/src/app
COPY ./backend/package*.json ./
RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y nodejs
RUN nodejs --version
RUN npm --version
RUN npm install
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y postgresql postgresql-contrib
RUN dpkg --status postgresql
EXPOSE 5432
CMD ["sh","./systemctlPostgresql.sh"]
RUN sleep 20
COPY ./backend/ ./
EXPOSE 8081
CMD ["node","server.js"]