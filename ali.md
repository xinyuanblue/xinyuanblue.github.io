git clone https://gitcode.com/xinyuanblue/xinyuanblue.github.io.git
rm /etc/nginx/conf.d/heluoshuyuan.conf
nano /etc/nginx/conf.d/heluoshuyuan.conf
mv xinyuanblue.github.io-main xinyuanblue.github.io
mkdir -p /var/www
cd /var/www
rm -rf xinyuanblue.github.io
