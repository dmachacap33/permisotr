import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Image } from "lucide-react";

interface PhotoCaptureProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  disabled?: boolean;
}

export default function PhotoCapture({ photos, onPhotosChange, disabled = false }: PhotoCaptureProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    if (disabled) return;
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Verifique los permisos.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const newPhotos = [...photos, url];
        onPhotosChange(newPhotos);
        
        toast({
          title: "Foto capturada",
          description: "La foto ha sido capturada exitosamente",
        });
      }
    }, 'image/jpeg', 0.8);

    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const newPhotos = [...photos, url];
        onPhotosChange(newPhotos);
      }
    });

    toast({
      title: "Fotos cargadas",
      description: `${files.length} foto(s) cargada(s) exitosamente`,
    });

    // Reset input
    event.target.value = '';
  };

  const removePhoto = (index: number) => {
    if (disabled) return;
    
    const photoToRemove = photos[index];
    URL.revokeObjectURL(photoToRemove); // Clean up object URL
    
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Camera View */}
      {isCapturing && (
        <Card className="p-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg"
              data-testid="video-camera"
            />
            <div className="flex justify-center space-x-4 mt-4">
              <Button
                onClick={capturePhoto}
                className="bg-primary text-primary-foreground"
                data-testid="button-capture-photo"
              >
                <Camera className="mr-2 w-4 h-4" />
                Capturar
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
                data-testid="button-cancel-camera"
              >
                Cancelar
              </Button>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </Card>
      )}

      {/* Upload Controls */}
      {!isCapturing && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Camera className="text-muted-foreground w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">Capturar Foto del Sitio</p>
              <p className="text-sm text-muted-foreground">Tome fotos del área de trabajo antes de iniciar</p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={startCamera}
                disabled={disabled}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-start-camera"
              >
                <Camera className="mr-2 w-4 h-4" />
                Tomar Foto
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                data-testid="button-upload-file"
              >
                <Upload className="mr-2 w-4 h-4" />
                Subir Archivo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        data-testid="input-file-upload"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="grid-photos">
          {photos.map((photo, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-32 object-cover"
                data-testid={`img-photo-${index}`}
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                  data-testid={`button-remove-photo-${index}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                Foto {index + 1}
              </div>
            </Card>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="text-center py-4" data-testid="text-no-photos">
          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No hay fotos capturadas</p>
        </div>
      )}
    </div>
  );
}
