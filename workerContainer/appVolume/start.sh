#!/bin/bash

while :
do
    check=$(curl -LIu  guest:guest http://rabbitmq-server:15672/api/vhosts -o /dev/null -w '%{http_code}\n' -s)
    echo $check
    if [ "$check" = 200 ]; then
        break
    fi
    sleep 3
done

npm start


