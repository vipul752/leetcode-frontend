import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState("auto");

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      setIsLoading(true);
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleFullscreen = () => {
    const playerElement = videoRef.current?.parentElement;
    if (playerElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerElement.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettings && !event.target.closest(".settings-dropdown")) {
        setShowSettings(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    if (video) {
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadstart", handleLoadStart);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("pause", handlePause);
      video.addEventListener("play", handlePlay);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("play", handlePlay);
        clearTimeout(hideControlsTimeoutRef.current);
      };
    }
  }, []);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-900 ring-1 ring-gray-800/50 backdrop-blur-sm"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video bg-black cursor-pointer"
        preload="metadata"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          !isPlaying && !isLoading
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={togglePlayPause}
          className="w-20 h-20 bg-black bg-opacity-60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all duration-200 hover:scale-110 border border-gray-600"
        >
          <Play className="w-8 h-8 text-white ml-1" />
        </button>
      </div>

      {/* Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent text-white transition-all duration-300 ${
          isHovering || !isPlaying || showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-2">
          <div className="relative group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #4b5563 ${progressPercentage}%, #4b5563 100%)`,
              }}
            />
          </div>
        </div>

        {/* Control Buttons and Info */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 group">
              <button
                onClick={toggleMute}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors duration-200"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 slider-volume"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    volume * 100
                  }%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                }}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center space-x-1 text-sm font-medium">
              <span className="text-white min-w-[40px]">
                {formatTime(currentTime)}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-300 min-w-[40px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Settings Button */}
            <div className="relative settings-dropdown">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors duration-200"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 min-w-[200px] z-50">
                  <div className="p-3">
                    {/* Speed Control */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Playback Speed
                      </label>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => {
                          const speed = parseFloat(e.target.value);
                          setPlaybackSpeed(speed);
                          if (videoRef.current) {
                            videoRef.current.playbackRate = speed;
                          }
                        }}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0.25}>0.25x</option>
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>Normal</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={1.75}>1.75x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>

                    {/* Quality Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quality
                      </label>
                      <select
                        value={selectedQuality}
                        onChange={(e) => {
                          setSelectedQuality(e.target.value);
                          // Quality switching logic would go here
                          // This depends on your video source setup
                          console.log("Quality changed to:", e.target.value);
                        }}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded transition-colors duration-200"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider-volume::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 1px solid white;
        }

        .slider-volume::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 1px solid white;
        }
      `}</style>
    </div>
  );
};

export default Editorial;
