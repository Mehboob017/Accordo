'use client';

import { Container, Row, Col } from 'reactstrap';
import { useState } from 'react';
import { RiPlayCircleFill } from 'react-icons/ri';
import { FiVideo } from 'react-icons/fi';

const EventVideosSection = ({ eventData }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url) => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\s]+)/, // Standard & short URLs
      /youtube\.com\/embed\/([^&\?\s]+)/, // Embed URLs
      /youtube\.com\/shorts\/([^&\?\s]+)/, // Shorts URLs
      /youtube\.com\/v\/([^&\?\s]+)/, // Old embed format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Map API videos to component format
  const videos =
    eventData?.videos
      ?.map((video) => ({
        id: video.uid,
        title: video.title,
        videoId: extractYouTubeId(video.videoUrl),
        videoUrl: video.videoUrl,
      }))
      .filter((v) => v.videoId) || []; // Filter out invalid videos

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  const getYouTubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Don't render if no videos
  if (!videos || videos.length === 0) {
    return (
      <section className="event-videos-section">
        <div className="event-section-card">
          <div className="event-section-header">
            <span className="event-section-indicator" />
            <h2 className="section-title">
              <span className="icon">
                <FiVideo />
              </span>{' '}
              Event Videos
            </h2>
          </div>
          <p className="no-videos-text">No videos available for this event.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-videos-section">
      <div className="event-section-card">
        <div className="event-section-header">
          <span className="event-section-indicator" />
          <h2 className="section-title">
            <span className="icon">
              <FiVideo />
            </span>{' '}
            Event Videos
          </h2>
        </div>

        <Row className="g-4">
          {videos.map((video, index) => (
            <Col key={video.id || index} xs={6} lg={6} xl={6}>
              <div className="video-card" onClick={() => openVideo(video)}>
                <div className="video-thumbnail-wrapper">
                  <img
                    src={video.thumbnail || getYouTubeThumbnail(video.videoId)}
                    alt={video.title}
                    className="video-thumbnail"
                  />
                  <div className="video-play-overlay">
                    <RiPlayCircleFill className="play-icon" />
                  </div>
                </div>
                <div className="video-info">
                  <h4 className="video-title">{video.title}</h4>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideo}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="video-modal-close" onClick={closeVideo}>
              ×
            </button>
            <div className="video-wrapper">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.videoId)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventVideosSection;
