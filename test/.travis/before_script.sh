#!/usr/bin/env bash

echo "---CONF---"
sudo cat /etc/apache2/sites-available/000-default.conf
ls -la /home/travis/httpdocs

echo "---REQ---"
wget -qO- http://localhost

echo "---LOG---"
sudo cat /var/log/apache2/error.log


exit 0

# Variables
REPOPATH="$(pwd)"       # /home/travis/build/adamjakab/SugarCrmJsRestConsumer
HTTPPATH="/home/travis//httpdocs"   # /home/travis/httpdocs

# Init & Install packages
#sudo apt-get install -y software-properties-common
#sudo add-apt-repository ppa:ondrej/php -y
#sudo add-apt-repository ppa:ondrej/apache2 -y
#sudo apt-get update
#sudo apt-get install -y apache2 libapache2-mod-php5.6 \
#    php5.6-cli php5.6-cgi php5.6-curl php5.6-gd php5.6-intl php5.6-mcrypt php5.6-mbstring php5.6-mysql php5.6-xml

# Get SuiteCRM
mkdir ${HTTPPATH}
cd ${HTTPPATH}
ls -lan
cp ${REPOPATH}/test/.travis/index.php ./index.php
#git clone https://github.com/salesagility/SuiteCRM.git httpdocs
#cd httpdocs
#git checkout tags/v7.8.3

# Configure Php
mkdir /home/travis/tmp
mkdir -p /home/travis/etc/php5
mkdir /home/travis/fcgi-bin
cp ${REPOPATH}/test/.travis/php.ini /home/travis/etc/php5
cp ${REPOPATH}/test/.travis/php5.fcgi /home/travis/fcgi-bin
chmod 744 /home/travis/fcgi-bin/php5.fcgi
php -v

# echo "cgi.fix_pathinfo = 1" >> ~/.phpenv/versions/$(phpenv version-name)/etc/php.ini

# Configure Apache
sudo a2enmod alias actions rewrite fcgid suexec
cat ${REPOPATH}/test/.travis/apache.vhost | sed -e "s,PATH,/home/travis/httpdocs,g" | sudo tee /etc/apache2/sites-available/default > /dev/null
sudo service apache2 restart


# Configure SuiteCrm and execute the installer
#cp /home/travis/build/adamjakab/SugarCrmJsRestConsumer/test/.travis/travis_config_si.php config_si.php
#php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
#php -r "if (hash_file('SHA384', 'composer-setup.php') === '669656bab3166a7aff8a7506b8cb2d1c292f042046c5a994c43155c0be6190fa0355160742ab2e1c88d40d5be660b410') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
#php composer-setup.php
#php -r "unlink('composer-setup.php');"
#php composer.phar install --no-interaction
#php tests/testinstall.php



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

