import React from "react";
import { useState, useRef } from "react";
import ImageUploader from 'react-image-upload'
import 'react-image-upload/dist/index.css'
import Icon from '../Icon.js';
import { upload } from '../utils/ServerCall';

const ImageUpload = (props) => {
    const [image, setImage] = useState(props.src);
    const [showSave, setShowSave] = useState('none');

    const fileAdded = (img) => {
        setImage(img);
        setShowSave('block');
    };

    const fileRemoved = (img) => {
        setShowSave('none');
    };

    const saveImage = async () => {
        if (image == props.src) {
            return;
        }

        const result = await upload('sadmin/upload_system_image', props.user, { file_var: props.name }, image.file);
        await props.updateImages();
        setShowSave('none');
    };

    return (
        <div style={{ position: 'relative', ...props.style }}>
            <ImageUploader
                style={{ background: 'rgba(128, 200, 200)', width: '300px', height: '200px', position: 'absolute', right: 0, top: 0, left: 0, right: 0 }}
                deleteIcon={
                    <div
                        style={{
                            backgroundColor: 'var(--toolbar_background_color)',
                            border: '1px solid darkgrey'
                        }}
                    >
                        <Icon name="remove" />
                    </div>
                }
                uploadIcon={
                    <div
                        style={{
                            backgroundColor: 'var(--toolbar_background_color)',
                            border: '1px solid darkgrey'
                        }}
                    >
                        <Icon name="upload" />
                    </div>
                }
                onFileAdded={fileAdded}
                onFileRemoved={fileRemoved}
            />
            <div
                onClick={saveImage}
                style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    display: showSave,
                    cursor: 'pointer',
                    backgroundColor: 'var(--toolbar_background_color)',
                    border: '1px solid darkgrey'
                }}
            >
                <Icon name="save" />
            </div>
        </div>
    );
};

export default ImageUpload;
