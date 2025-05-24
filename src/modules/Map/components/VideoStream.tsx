import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoStreamProps {
  hlsUrl: string;
}

const VideoStream: React.FC<VideoStreamProps> = ({ hlsUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari
        video.src = hlsUrl;
      }
    }
  }, [hlsUrl]);

  return (
    <div className="relative">
      <video ref={videoRef} controls autoPlay className="w-full h-auto rounded-lg shadow-md" />
    </div>
  );
};

export default VideoStream;
