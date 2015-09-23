#!/bin/sh

hostname=$1
outputPath=$2

openssl genrsa -passout pass:a -out $outputPath$hostname.key 2048

openssl rsa -in $outputPath$hostname.key -passin pass:a -out $outputPath$hostname.key

openssl req -new -key $outputPath$hostname.key -out $outputPath$hostname.csr -passin pass:a -subj "/C=ZH/ST=Shanghai/L=Shanghai/O=$hostname/OU=NP/CN=$hostname/emailAddress=goddy128@gmail.com"

openssl x509 -req -days 3650 -in $outputPath$hostname.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out $outputPath$hostname.crt

echo "Created server certifications" 
