#!/usr/bin/env bash

# Init
sudo apt-get update

# Install apache
sudo apt-get install apache2
sudo a2enmod actions
sudo a2enmod rewrite
sudo service apache2 restart

# Install Php
sudo apt-get install php5-cli php5-cgi php5-curl php5-gd php5-intl php5-json php5-mcrypt php5-mysql pdo-mysql
php -v

# Get SuiteCRM
pwd
cd ~
mkdir httpdocs
git clone https://github.com/salesagility/SuiteCRM.git httpdocs
cd httpdocs
git checkout tags/v7.8.3
composer selfupdate
composer install --no-interaction
cp tests/travis_config_si.php config_si.php
ls -la
php tests/testinstall.php



#- echo "export PATH=/home/vagrant/.phpenv/bin:$PATH" | sudo tee -a /etc/apache2/envvars > /dev/null
#- echo "$(curl -fsSL https://gist.github.com/roderik/16d751c979fdeb5a14e3/raw/gistfile1.txt)" | sudo tee /etc/apache2/conf.d/phpconfig > /dev/null
#- echo "$(curl -fsSL https://gist.github.com/roderik/2eb301570ed4a1f4c33d/raw/gistfile1.txt)" | sed -e "s,PATH,`pwd`/web,g" | sudo tee /etc/apache2/sites-available/default > /dev/null
#- sudo service apache2 restart
#- mysql -u root -e "CREATE USER 'myproject'@'localhost' IDENTIFIED BY 'mypass'"
#- mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'myproject'@'localhost' WITH GRANT OPTION;"
#- bin/vendors install
#- app/console doctrine:database:create
#- app/console doctrine:schema:update --force
#- app/console doctrine:fixtures:load