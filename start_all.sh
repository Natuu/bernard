#!/bin/bash

pkill node-server

cd word2vec_server
exec 3< <(node server.js)
sed '/\(null\)$/q' <&3 ; cat <&3 &
cd ../web_server
exec 4< <(node server.js)
sed '/Server started on port 8080$/q' <&4 ; cat <&4 &
cd ..
./display/application.linux-armv6hf/display $1 $2