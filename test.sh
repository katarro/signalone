#!/usr/bin/env bash
API=change_me
curl -s localhost:8080/health; echo
curl -s -H "x-api-key: $API" localhost:8080/api/vlans; echo
curl -s -H "x-api-key: $API" -H "Content-Type: application/json" \
 -d '{"vid":20,"name":"corp","subnet":"192.168.20.0/24","dhcp":1}' \
 localhost:8080/api/vlans; echo
curl -s -H "x-api-key: $API" localhost:8080/api/vlans; echo
