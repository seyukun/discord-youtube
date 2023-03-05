#!/bin/bash

############################################################################################
#   ____    ____              __    __        __                                           #
#  /\  _`\ /\  _`\           /\ \  /\ \      /\ \                                          #
#  \ \ \L\_\ \,\L\_\         \ `\`\\/'/__  __\ \ \/'\   __  __    ___                      #
#   \ \  _\L\/_\__ \   _______`\ `\ /'/\ \/\ \\ \ , <  /\ \/\ \ /' _ `\                    #
#    \ \ \L\ \/\ \L\ \/\______\ `\ \ \\ \ \_\ \\ \ \\`\\ \ \_\ \/\ \/\ \                   #
#     \ \____/\ `\____\/______/   \ \_\\ \____/ \ \_\ \_\ \____/\ \_\ \_\                  #
#      \/___/  \/_____/            \/_/ \/___/   \/_/\/_/\/___/  \/_/\/_/                  #
#                                                                                          #
#  [ Usage ]                                                                               #
#  DISCORD_TOKEN=AAAAAAAAAAAA.vvvvvv.BBBBBBBBBBB ./kubernetes/deploy.sh                    #
#
#  *Environment options
#   - NAMESPACE=(default/*)
#   - DEBUG=(false/true)
#
############################################################################################





# if DISCORD_TOKEN does not set, exit process
if [ ${#DISCORD_TOKEN} == 0 ]; then
  echo "[-] Not found DISCORD_TOKEN in environment" 
  exit 0;
fi

# set namespace of kubernetes
if [ ${#NAMESPACE} == 0 ]; then
NAMESPACE="default"
fi
if [ ${#NAMESPACE} != 0 ]; then
  echo "[+] Found NAMESPACE in environment"
fi

# make sure DEBUG
if [ ${#DEBUG} == 0 ]; then
DEBUG=false
fi
if [ ${#DEBUG} != 0 ]; then
  echo "[+] Found DEBUG in environment"
fi

echo "[+] Using namespace $NAMESPACE"

# apply to kubernetes
kubectl apply -f - << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: discord-youtube-frontend
  name: discord-youtube-frontend
  namespace: $NAMESPACE
spec: 
  replicas: 1
  selector:
    matchLabels:
      app: discord-youtube-frontend
  template:
    metadata:
      labels:
        app: discord-youtube-frontend
    spec:
      containers:
      - name: discord-youtube-frontend
        image: docheio/git-runner-nodejs:19.4.0
        env:
        - name: REPO
          value: https://github.com/ES-Yukun/discord-youtube.git
        - name: DISCORD_TOKEN
          value: $DISCORD_TOKEN
        - name: DEBUG
          value: $DEBUG
        - name: START_COMMAND
          value: cd ./server/frontend && npm run archlinux
---
# apiVersion: v1
# kind: Service
# metadata:
#   name: coder
# spec:
#   selector:
#     app: coder
#   type: LoadBalancer
#   ports:
#   - name: coder
#     protocol: TCP
#     port: 8080
#     targetPort: http
EOF