#! /bin/bash
sudo systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres  PASSWORD 'postgres';"
