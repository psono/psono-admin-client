if [ ! -z "$PSONO_PORTAL_CONFIG_JSON" ]
then
      echo "$PSONO_PORTAL_CONFIG_JSON" > /usr/share/nginx/html/portal/config.json
fi

nginx -g "daemon off;"
