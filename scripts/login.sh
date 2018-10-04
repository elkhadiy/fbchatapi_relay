#!/bin/bash

function getJsonVal () {
    python -c "import sys, json; obj=json.load(sys.stdin); print(obj['$1']);";
}

echo -n "Email: "
read email
echo -n "Password: "
read -s password
echo

res=$( \
curl -s --request POST \
    -H "Content-Type: application/json" \
    -d '{"email":"'$email'","password":"'$password'"}' \
    https://messenger4business.elkrafts.xyz/login \
    )

token=$(echo $res | getJsonVal authorization)

echo "Accept: application/json" > .session_header_$email
echo "Content-Type: application/json" > .session_header_$email
echo "Authorization: "$token >> .session_header_$email
