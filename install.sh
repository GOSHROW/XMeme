#! /bin/bash


# Any installation related commands
apt-get update
apt-get -y upgrade
apt-get -y install curl

curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
apt-get update
apt-get -y upgrade
apt-get install -y nodejs

apt-get install -y postgresql postgresql-contrib

# Any configuration related commands
nodejs --version
npm --version
# systemctl enable postgresql
systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres  PASSWORD 'postgres';"