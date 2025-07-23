 cd  /var/www/
 sudo rm -rf heluoshuyuan.cn
  sudo git clone https://github.com/xinyuanblue/xinyuanblue.github.io
  sudo mv xinyuanblue.github.io heluoshuyuan.cn
  cd  heluoshuyuan.cn/flask
   sudo nano .env

   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieGlueXVhbmJsdWUiLCJhIjoiY203cHhybnp3MHYxZzJscHJyYnYwMHMzZyJ9.9Be1af0pb9DVIlt5PJ8COQ
# You can optionally define FLASK_RUN_PORT here, e.g., FLASK_RUN_PORT=5001
# Or set the FLASK_APP variable if needed: FLASK_APP=app.py

screen

python3 app.py

ctrl shirf A D
  
