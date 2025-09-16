import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUpload = (props) => {
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 16 / 9 });
  const [croppedImage, setCroppedImage] = useState(null);
  const imageRef = useRef(null);

  const onSelectFile = (e) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = handleFileRead;
      reader.readAsDataURL(file);
    }
  };

  const handleFileRead = (event) => {
    const content = event.target.result;
    setImage(content);
  };

  const onImageLoaded = (image) => {
    imageRef.current = image;
  };

  const onCropComplete = (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImageUrl(imageRef.current, crop);
      setCroppedImage(croppedImageUrl);
      props.setImageURL(croppedImageUrl);
    }
  };

  const getCroppedImageUrl = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const croppedImageUrl = canvas.toDataURL("image/png");
    return croppedImageUrl;
  };

  return (
    <div>
      <input type="file" onChange={onSelectFile} />
      <img src={image} style={{width: '50px'}}/>
      {image && (
        <ReactCrop
          src={image}
          crop={crop}
          ruleOfThirds
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={(crop) => setCrop(crop)}
        />
      )}
      {croppedImage && (
        <div>
          <h2>Cropped Image:</h2>
          <img src={croppedImage} alt="Cropped Image" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
