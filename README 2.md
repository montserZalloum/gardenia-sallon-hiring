cd /www/wwwroot/gardenia-sallon-hiring/gardenia-sallon-hiring/gardenia-sallon-hiring
sudo -u www git fetch origin
sudo -u www git reset --hard origin/master
sudo -u www npm install
sudo -u www npm run build
sudo -u www pm2 restart gardenia-hiring