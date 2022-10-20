FROM archlinux:latest
RUN pacman -Syyu git ffmpeg nodejs npm --noconfirm
RUN git clone 
WORKDIR /root
CMD npm start