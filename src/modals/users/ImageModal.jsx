import {FiX} from "react-icons/fi";
import {useEffect, useState} from "react";

const ImageModal = ({imageUrl, onClose}) => {
  const [imageSize, setImageSize] = useState({width: 0, height: 0});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImageSize({
        width: img.width,
        height: img.height,
      });
      setIsLoading(false);
    };
  }, [imageUrl]);

  // Calculate display dimensions based on image aspect ratio
  const maxWidth = 600;
  const maxHeight = 600;
  let displayWidth = maxWidth;
  let displayHeight = maxHeight;

  if (imageSize.width > 0 && imageSize.height > 0) {
    const aspectRatio = imageSize.width / imageSize.height;

    if (aspectRatio > 1) {
      displayHeight = Math.min(maxHeight, maxWidth / aspectRatio);
    } else {
      displayWidth = Math.min(maxWidth, maxHeight * aspectRatio);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-75 p-4 overflow-auto"
      onClick={onClose}
    >
      <div
        className="relative mt-[250px] xl:mt-[200px] lg:mt-[230px] md:mt-[300px]"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-64 text-white">
            Loading image...
          </div>
        ) : (
          <div className="max-w-[90vw] max-h-[90vh] px-2 sm:px-0">
            <img
              src={imageUrl}
              alt="Enlarged view"
              className="w-full h-auto max-h-[90vh] object-contain rounded shadow"
              style={{
                maxWidth: `${displayWidth}px`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
