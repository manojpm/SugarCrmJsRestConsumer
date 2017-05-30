#!/usr/bin/env bash

echo "---CONF---"
sudo cat /etc/apache2/sites-available/001-travis.conf
ls -la /var/www/travis
ls -la /var/www/fcgi-bin
sudo /usr/lib/apache2/suexec -V
sudo cat /etc/hosts
sudo  ls -la /usr/bin | grep php


echo "---REQ---"
wget -qO- http://travis.local

echo "---LOG---"
sudo cat /var/log/apache2/travis_error.log
sudo cat /var/log/apache2/travis_access.log


exit 0


# Configure SuiteCrm and execute the installer
#cp /home/travis/build/adamjakab/SugarCrmJsRestConsumer/test/.travis/travis_config_si.php config_si.php
#php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
#php -r "if (hash_file('SHA384', 'composer-setup.php') === '669656bab3166a7aff8a7506b8cb2d1c292f042046c5a994c43155c0be6190fa0355160742ab2e1c88d40d5be660b410') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
#php composer-setup.php
#php -r "unlink('composer-setup.php');"
#php composer.phar install --no-interaction
#php tests/testinstall.php



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

