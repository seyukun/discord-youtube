FROM archlinux:latest
RUN pacman -Syyu git ffmpeg nodejs npm --noconfirm
WORKDIR /root
RUN git clone https://github.com/ES-Yukun/discord-youtube.git
WORKDIR /root/discord-youtube
CMD npm start