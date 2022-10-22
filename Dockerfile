FROM archlinux:latest
RUN pacman -Syyu git ffmpeg nodejs npm --noconfirm
WORKDIR /root
RUN mkdir ./src
COPY ./package.json /root/
COPY ./tsconfig.json /root/
COPY ./src/index.ts /root/src/
CMD npm start