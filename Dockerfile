FROM lkwg82/h2o-http2-server

ADD dist /var/www/html
COPY h2o.conf .