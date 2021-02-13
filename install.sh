#! /bin/bash


# Any installation related commands
apt-get update
apt-get -y upgrade
apt-get -y install curl

curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
apt-get update
apt-get -y upgrade
apt-get install -y nodejs
nodejs --version
npm --version

cd src/backend
npm install

apt-get install -y postgresql postgresql-contrib
systemctl enable postgres
systemctl start postgres

# Any configuration related commands

createdb -h localhost -p 5432 -U postgres postgres
cd ..