#!/bin/bash

pkill node-server

cd word2vec_server
exec 3< <(node server.js)
sed '/\(null\)$/q' <&3 ; cat <&3 &
cd ../web_server
exec 3< <(node server.js)
sed '/Word Client connected$/q' <&3 ; cat <&3 &
./display/application.linux-armv6hf/display $1 $2