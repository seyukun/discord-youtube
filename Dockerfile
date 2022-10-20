FROM archlinux:latest
RUN pacman -Syyu git ffmpeg nodejs npm --noconfirm
RUN git clone git@github.com:ES-Yukun/discord-youtube.git
WORKDIR /root/discord-youtube
CMD npm start