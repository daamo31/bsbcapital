import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';

const WatermarkedVideo = ({ 
  src, 
  poster, 
  className = '',
  controls = true,
  autoPlay = false,
  ...props 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !user) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    const drawWatermark = () => {
      if (video.paused || video.ended) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Configure watermark style
      const fontSize = Math.max(16, canvas.width / 40);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;

      // Watermark text
      const watermarkText = user.email;
      const textWidth = ctx.measureText(watermarkText).width;

      // Position watermark (bottom-right with padding)
      const x = canvas.width - textWidth - 20;
      const y = canvas.height - 20;

      // Draw text with outline
      ctx.strokeText(watermarkText, x, y);
      ctx.fillText(watermarkText, x, y);

      // Additional timestamp watermark (top-left)
      const timestamp = new Date().toLocaleString();
      ctx.font = `${fontSize * 0.7}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(timestamp, 10, 30);

      animationId = requestAnimationFrame(drawWatermark);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      drawWatermark();
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handlePause);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [user]);

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Disable video download
  const handleKeyDown = (e) => {
    // Disable F12, Ctrl+S, Ctrl+U, etc.
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.key === 's') ||
      (e.ctrlKey && e.key === 'u') ||
      (e.ctrlKey && e.shiftKey && e.key === 'I')
    ) {
      e.preventDefault();
      return false;
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Debes iniciar sesión para ver este contenido.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hidden original video for processing */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls={false}
        autoPlay={autoPlay}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        {...props}
      />
      
      {/* Watermarked canvas display */}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto rounded-lg ${className}`}
        onContextMenu={handleContextMenu}
        style={{
          maxWidth: '100%',
          height: 'auto',
          userSelect: 'none',
          pointerEvents: isPlaying ? 'none' : 'auto'
        }}
      />
      
      {/* Custom controls overlay */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const video = videoRef.current;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <div className="text-white text-sm opacity-70">
              {user.email} • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      {/* Anti-screenshot overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)',
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
};

export default WatermarkedVideo;