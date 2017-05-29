#!/usr/bin/env bash

# Init
sudo apt-get update
sudo apt-get install -y wget

# Install apache
sudo apt-get install -y apache2
sudo a2enmod actions
sudo a2enmod rewrite
sudo service apache2 restart

# Install Php 5.6
sudo apt-get install software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt-get update
sudo apt-get install -y php5.6-cli php5.6-cgi php5.6-curl php5.6-gd php5.6-intl php5.6-mcrypt php5.6-mbstring php5.6-mysql php5.6-xml libapache2-mod-php
php -v

# Get SuiteCRM
# pwd = /home/travis/build/adamjakab/SugarCrmJsRestConsumer
cd ~
mkdir httpdocs
git clone https://github.com/salesagility/SuiteCRM.git httpdocs
cd httpdocs
git checkout tags/v7.8.3
cp /home/travis/build/adamjakab/SugarCrmJsRestConsumer/test/.travis/travis_config_si.php config_si.php

php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('SHA384', 'composer-setup.php') === '669656bab3166a7aff8a7506b8cb2d1c292f042046c5a994c43155c0be6190fa0355160742ab2e1c88d40d5be660b410') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
php composer.phar install --no-interaction

# Execute the installer of SuiteCrm
php tests/testinstall.php

# Configure Apache
cat /home/travis/build/adamjakab/SugarCrmJsRestConsumer/test/.travis/apache-virtualhost | sed -e "s,PATH,/home/travis/httpdocs,g" | sudo tee /etc/apache2/sites-available/default > /dev/null
sudo service apache2 restart

# Get
wget -qO- http://localhost




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


#SuexecUserGroup "#1020" "#1021"
#ServerName
## ServerAlias
#
#DocumentRoot /home/httpdocs
#

#
#DirectoryIndex index.php index.html index.htm
#
#<Directory /home/httpdocs>
#Options -Indexes +SymLinksIfOwnerMatch +ExecCGI
#allow from all
#AllowOverride All Options=ExecCGI,Includes,IncludesNOEXEC,Indexes,MultiViews,SymLinksIfOwnerMatch,FollowSymLinks
#Require all granted
#AddType application/x-httpd-php .php
#AddHandler fcgid-script .php
#FCGIWrapper /home//fcgi-bin/php5.fcgi .php
#</Directory>
#RemoveHandler .php
#RemoveHandler .php5
#FcgidMaxRequestLen 1073741824