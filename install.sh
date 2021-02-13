#! /bin/bash


# Any installation related commands
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get --assume-yes install curl

curl -fsSL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs
nodejs --version
npm --version

cd src/backend
npm install

sudo apt-get install -y postgresql postgresql-contrib

sudo systemctl enable postgres
sudo systemctl start postgres

# Any configuration related commands

createdb -h localhost -p 5432 -U postgres memeDB
cd ..
