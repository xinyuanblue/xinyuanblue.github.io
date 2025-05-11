git clone https://gitcode.com/xinyuanblue/xinyuanblue.github.io.git
rm /etc/nginx/conf.d/heluoshuyuan.conf
nano /etc/nginx/conf.d/heluoshuyuan.conf
nginx -t
systemctl reload nginx
mv xinyuanblue.github.io-main xinyuanblue.github.io
mkdir -p /var/www
cd /var/www
rm -rf xinyuanblue.github.io


# heluoshuyuan.cn 的 HTTPS 服务器配置
server {
    listen 443 ssl http2;
    server_name heluoshuyuan.cn www.heluoshuyuan.cn;

    # SSL 证书设置
    ssl_certificate /etc/letsencrypt/live/heluoshuyuan.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/heluoshuyuan.cn/privkey.pem;

    # 安全和性能优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    # 根目录配置
    root /var/www/xinyuanblue.github.io;
    index index.html;

    # 日志设置
    access_log /var/log/nginx/heluoshuyuan.cn.access.log;
    error_log /var/log/nginx/heluoshuyuan.cn.error.log warn;

    # 基本路由
    location / {
        try_files $uri $uri/ =404;
        charset utf-8;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|webp|css|js|woff|woff2|ttf|otf|eot)$ {
        expires max;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# heluoshuyuan.xyz 的 HTTPS 服务器配置
server {
    listen 443 ssl http2;
    server_name heluoshuyuan.xyz www.heluoshuyuan.xyz;

    # SSL 证书设置
    ssl_certificate /etc/letsencrypt/live/heluoshuyuan.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/heluoshuyuan.xyz/privkey.pem;

    # 安全和性能优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;

    # 根目录配置
    root /var/www/xinyuanblue.github.io;
    index index.html;

    # 日志设置
    access_log /var/log/nginx/heluoshuyuan.xyz.access.log;
    error_log /var/log/nginx/heluoshuyuan.xyz.error.log warn;

    # 基本路由
    location / {
        try_files $uri $uri/ =404;
        charset utf-8;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|webp|css|js|woff|woff2|ttf|otf|eot)$ {
        expires max;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # 错误页面
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}

# HTTP 重定向到 HTTPS - heluoshuyuan.cn
server {
    listen 80;
    server_name heluoshuyuan.cn www.heluoshuyuan.cn;
    
    # 减少访问日志
    access_log /var/log/nginx/heluoshuyuan.cn.http.access.log;
    
    # 强制所有 HTTP 请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTP 重定向到 HTTPS - heluoshuyuan.xyz
server {
    listen 80;
    server_name heluoshuyuan.xyz www.heluoshuyuan.xyz;
    
    # 减少访问日志
    access_log /var/log/nginx/heluoshuyuan.xyz.http.access.log;
    
    # 强制所有 HTTP 请求重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
