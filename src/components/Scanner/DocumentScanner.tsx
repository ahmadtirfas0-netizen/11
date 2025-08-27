import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Scan, RotateCw, Crop, Download, X } from 'lucide-react';

interface DocumentScannerProps {
  onScanComplete: (files: File[]) => void;
  onClose: () => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('لا يمكن الوصول للكاميرا. تأكد من منح الإذن للموقع.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply basic image processing for document scanning
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const processedImageData = enhanceDocument(imageData);
    context.putImageData(processedImageData, 0, 0);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setScannedImages(prev => [...prev, dataUrl]);
  }, []);

  const enhanceDocument = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    // Simple contrast and brightness enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast
      const contrast = 1.2;
      const brightness = 10;
      
      data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));     // Red
      data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness)); // Green
      data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness)); // Blue
    }
    
    return imageData;
  };

  const rotateImage = (index: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        
        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setScannedImages(prev => prev.map((img, i) => i === index ? rotatedDataUrl : img));
      }
    };
    
    img.src = scannedImages[index];
  };

  const removeImage = (index: number) => {
    setScannedImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex >= scannedImages.length - 1) {
      setCurrentImageIndex(Math.max(0, scannedImages.length - 2));
    }
  };

  const convertToFiles = async (): Promise<File[]> => {
    const files: File[] = [];
    
    for (let i = 0; i < scannedImages.length; i++) {
      const dataUrl = scannedImages[i];
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `scanned-document-${i + 1}.jpg`, { type: 'image/jpeg' });
      files.push(file);
    }
    
    return files;
  };

  const handleComplete = async () => {
    if (scannedImages.length === 0) return;
    
    const files = await convertToFiles();
    onScanComplete(files);
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Scan className="w-6 h-6 ml-3 text-blue-600" />
            ماسح المستندات
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Camera/Scanner Area */}
          <div className="flex-1 bg-gray-900 relative">
            {!isScanning ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">ابدأ المسح الضوئي</h3>
                  <p className="text-gray-300 mb-6">انقر على زر الكاميرا لبدء مسح المستندات</p>
                  <button
                    onClick={startCamera}
                    className="btn btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Camera className="w-5 h-5" />
                    تشغيل الكاميرا
                  </button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-4 border-blue-500 border-dashed w-80 h-60 rounded-lg"></div>
                </div>

                {/* Capture button */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={captureImage}
                    className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                </div>

                {/* Stop camera button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={stopCamera}
                    className="btn btn-secondary"
                  >
                    إيقاف الكاميرا
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Scanned Images Panel */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">المستندات الممسوحة ({scannedImages.length})</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {scannedImages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>لم يتم مسح أي مستندات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scannedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Scanned document ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      
                      {/* Image controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => rotateImage(index)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          title="تدوير"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                          title="حذف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={handleComplete}
                disabled={scannedImages.length === 0}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                استخدام المستندات ({scannedImages.length})
              </button>
              
              {!isScanning && scannedImages.length > 0 && (
                <button
                  onClick={startCamera}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  مسح المزيد
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default DocumentScanner;