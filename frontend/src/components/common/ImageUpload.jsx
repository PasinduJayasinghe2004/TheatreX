import React, { useState, useRef } from 'react';

const ImageUpload = ({ onImageSelect, existingImage, label = "Profile Picture" }) => {
    const [preview, setPreview] = useState(existingImage ? (existingImage.startsWith('http') ? existingImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${existingImage}`) : null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size too large (max 5MB)");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onImageSelect(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const removeImage = () => {
        setPreview(null);
        onImageSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={triggerFileInput}>
            <label className="text-sm font-semibold text-gray-700 w-full text-center">
                {label}
            </label>

            <div className="relative group">
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                        />
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full border-4 border-white shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Change Image</span>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <p className="text-xs text-gray-500">
                JPEG, PNG or WebP. Max 5MB.
            </p>
        </div>
    );
};

export default ImageUpload;
