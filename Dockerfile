FROM archlinux:latest
RUN pacman -Syyu git ffmpeg nodejs npm --noconfirm
WORKDIR /root
RUN mkdir ./src
RUN mkdir -p ./node_modules/youtube-stream-url/src
ADD ./node_modules/youtube-stream-url /root/node_modules/youtube-stream-url
COPY ./package.json /root/
COPY ./tsconfig.json /root/
COPY ./src/index.ts /root/src/
CMD npm start