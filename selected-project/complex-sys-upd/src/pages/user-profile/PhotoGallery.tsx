import React, { useState } from 'react';
import { Image, Row, Col, Button, Modal } from 'antd';
import { LeftOutlined, RightOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Photo } from '../../types';

type PhotoGalleryProps = { photos: Photo[] };

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePreview = (photo: Photo, index: number) => {
    setPreviewImage(photo.url);
    setPreviewTitle(photo.caption || '');
    setPreviewVisible(true);
    setCurrentIndex(index);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    }
    setCurrentIndex(newIndex);
    setPreviewImage(photos[newIndex].url);
    setPreviewTitle(photos[newIndex].caption || '');
  };

  return (
    <div className="photo-gallery">
      <Row gutter={[16, 16]}>
        {photos.map((photo, index) => (
          <Col key={photo.id} xs={12} sm={8} md={6} lg={4}>
            <div className="photo-thumbnail">
              <Image
                src={photo.url}
                alt={photo.caption}
                preview={false}
                onClick={() => handlePreview(photo, index)}
              />
              <div className="photo-meta">
                <p>{photo.caption}</p>
                {/* <small>{photo.date} • {photo.location}</small> */}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            Download
          </Button>,
          <Button 
            key="close" 
            onClick={() => setPreviewVisible(false)}
          >
            Close
          </Button>
        ]}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
      >
        <div className="image-navigation">
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => navigateImage('prev')}
            className="nav-button"
          />
          <Image
            src={previewImage}
            alt={previewTitle}
            style={{ maxHeight: '70vh', objectFit: 'contain' }}
          />
          <Button 
            icon={<RightOutlined />} 
            onClick={() => navigateImage('next')}
            className="nav-button"
          />
        </div>
      </Modal>
    </div>
  );
};

export default PhotoGallery;