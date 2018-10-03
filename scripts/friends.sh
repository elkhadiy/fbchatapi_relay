#!/bin/bash

email=$1

res=$( \
curl -s --request GET \
    -H @.session_header_$email \
    https://messenger4business.elkrafts.xyz/friends \
)

echo $res | python -mjson.tool
