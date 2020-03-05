#!/bin/bash

pkill node-server

cd word2vec_server
exec 3< <(node server.js)
sed '/\(null\)$/q' <&3 ; cat <&3 &
cd ../web_server
node server.js