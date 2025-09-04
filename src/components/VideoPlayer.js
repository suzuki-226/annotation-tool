"use client";
import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoUrl, onTimeUpdate, playerRef, onReady }) => {
  const containerRef = useRef(null);
  const playerInstance = useRef(null);

  useEffect(() => {
    // video タグを自前で追加（Reactに管理させない）
    const videoEl = document.createElement("video");
    videoEl.className = "video-js vjs-default-skin";
    videoEl.controls = true;
    videoEl.setAttribute("playsinline", "");
    containerRef.current.innerHTML = ""; // クリア
    containerRef.current.appendChild(videoEl);

    const player = videojs(videoEl, {}, () => {
      player.src({ type: "video/mp4", src: videoUrl });
      if (onReady) onReady(player);
    });

    if (playerRef) playerRef.current = player;
    playerInstance.current = player;

    player.on("timeupdate", () => {
      if (onTimeUpdate) {
        onTimeUpdate(player.currentTime());
      }
    });

    return () => {
      player.dispose();
    };
  }, [videoUrl]);

  return <div ref={containerRef} />;
};

export default VideoPlayer;
