#!/bin/sh
set -eu

envsubst '${EMME_API_BASE_URL} ${EMME_APP_ENV} ${EMME_APP_NAME} ${EMME_WEB_BASE_DOMAIN}' \
  < /etc/nginx/runtime-config.js.template \
  > /usr/share/nginx/html/runtime-config.js
