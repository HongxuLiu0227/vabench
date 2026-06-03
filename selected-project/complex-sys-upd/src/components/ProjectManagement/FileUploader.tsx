import React from 'react';

const FileUploader: React.FC<{ files?: any[]; onUpload?: (file: File) => void }> = ({ files = [], onUpload }) => (
  <div>File Uploader Placeholder ({files.length} files)</div>
);

export default FileUploader; 