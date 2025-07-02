"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import {
  Download,
  Eye,
  FileImage,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";

interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
}

interface PdfSettings {
  orientation: "portrait" | "landscape";
  format: "letter" | "a4" | "legal" | "tabloid";
  margin: number;
}

const formatSizes = {
  letter: { width: 216, height: 279 },
  a4: { width: 210, height: 297 },
  legal: { width: 216, height: 356 },
  tabloid: { width: 279, height: 432 },
};

export default function ImageToPdfConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    orientation: "portrait",
    format: "letter",
    margin: 12,
  });
  const { toast } = useToast();
  const [selectedForPdf, setSelectedForPdf] = useState<Set<string>>(new Set());

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona solo archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setImages((prev) => [...prev, ...newImages]);
    // Auto-seleccionar nuevas imágenes para PDF
    const newImageIds = newImages.map((img) => img.id);
    setSelectedForPdf((prev) => new Set([...prev, ...newImageIds]));
    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }

    toast({
      title: "Imágenes cargadas",
      description: `${newImages.length} imagen(es) agregada(s) exitosamente`,
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (selectedImage?.id === id) {
        setSelectedImage(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
    // Remover también de selectedForPdf
    setSelectedForPdf((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const generatePDF = async (image: ImageFile) => {
    try {
      const { orientation, format } = pdfSettings;
      const dimensions = formatSizes[format];

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [dimensions.width, dimensions.height],
      });

      const img = new Image();
      img.crossOrigin = "anonymous";

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imgData = canvas.toDataURL("image/jpeg", 0.95);

          const pageWidth =
            orientation === "portrait" ? dimensions.width : dimensions.height;
          const pageHeight =
            orientation === "portrait" ? dimensions.height : dimensions.width;

          // Usar el margen configurado por el usuario
          const margin = pdfSettings.margin;

          const availableWidth = pageWidth - margin * 2;
          const availableHeight = pageHeight - margin * 2;

          const imgAspectRatio = img.width / img.height;
          const availableAspectRatio = availableWidth / availableHeight;

          let imgWidth, imgHeight;

          if (imgAspectRatio > availableAspectRatio) {
            imgWidth = availableWidth;
            imgHeight = availableWidth / imgAspectRatio;
          } else {
            imgHeight = availableHeight;
            imgWidth = availableHeight * imgAspectRatio;
          }

          // Centrar la imagen dentro del área disponible (con márgenes)
          const x = margin + (availableWidth - imgWidth) / 2;
          const y = margin + (availableHeight - imgHeight) / 2;

          pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
          pdf.save(`${image.name.split(".")[0]}.pdf`);

          toast({
            title: "PDF generado",
            description: "El archivo PDF se ha descargado exitosamente",
          });

          resolve();
        };

        img.onerror = () => {
          reject(new Error("Error al cargar la imagen"));
        };

        img.src = image.url;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const getPreviewDimensions = () => {
    const { orientation, format } = pdfSettings;
    const dimensions = formatSizes[format];
    const baseWidth = 200;

    if (orientation === "portrait") {
      return {
        width: baseWidth,
        height: (baseWidth * dimensions.height) / dimensions.width,
      };
    } else {
      return {
        width: baseWidth,
        height: (baseWidth * dimensions.width) / dimensions.height,
      };
    }
  };

  const toggleImageForPdf = (imageId: string) => {
    setSelectedForPdf((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const generateMultiPagePDF = async () => {
    const selectedImages = images.filter((img) => selectedForPdf.has(img.id));

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una imagen para incluir en el PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      const { orientation, format } = pdfSettings;
      const dimensions = formatSizes[format];

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [dimensions.width, dimensions.height],
      });

      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];

        if (i > 0) {
          pdf.addPage();
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              reject(new Error("No se pudo crear el contexto del canvas"));
              return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = canvas.toDataURL("image/jpeg", 0.95);

            const pageWidth =
              orientation === "portrait" ? dimensions.width : dimensions.height;
            const pageHeight =
              orientation === "portrait" ? dimensions.height : dimensions.width;

            const margin = pdfSettings.margin;
            const availableWidth = pageWidth - margin * 2;
            const availableHeight = pageHeight - margin * 2;

            const imgAspectRatio = img.width / img.height;
            const availableAspectRatio = availableWidth / availableHeight;

            let imgWidth, imgHeight;

            if (imgAspectRatio > availableAspectRatio) {
              imgWidth = availableWidth;
              imgHeight = availableWidth / imgAspectRatio;
            } else {
              imgHeight = availableHeight;
              imgWidth = availableHeight * imgAspectRatio;
            }

            const x = margin + (availableWidth - imgWidth) / 2;
            const y = margin + (availableHeight - imgHeight) / 2;

            pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
            resolve();
          };

          img.onerror = () => {
            reject(new Error("Error al cargar la imagen"));
          };

          img.src = image.url;
        });
      }

      pdf.save(`imagenes-convertidas-${Date.now()}.pdf`);

      toast({
        title: "PDF generado",
        description: `PDF con ${selectedImages.length} imagen(es) descargado exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 py-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight">
              Conversor de Imagen a PDF
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Transforma tus imágenes en documentos PDF profesionales con
              control total sobre formato y diseño
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  Subir Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra y suelta tus imágenes aquí
                  </p>
                  <p className="text-gray-500 mb-4">
                    o haz clic para seleccionar archivos
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <Button asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      Seleccionar Imágenes
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Images List */}
            {images.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileImage className="w-5 h-5 text-green-600" />
                    </div>
                    Imágenes Cargadas ({images.length}) - {selectedForPdf.size}{" "}
                    seleccionadas para PDF
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedImage?.id === image.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <Checkbox
                          checked={selectedForPdf.has(image.id)}
                          onCheckedChange={() => toggleImageForPdf(image.id)}
                          className="mr-2"
                        />
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {image.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(image.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              generatePDF(image);
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                {selectedForPdf.size > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {selectedForPdf.size} imagen(es) seleccionada(s) para
                          PDF
                        </p>
                        <p className="text-sm text-blue-700">
                          Todas las páginas usarán la misma configuración
                        </p>
                      </div>
                      <Button
                        onClick={generateMultiPagePDF}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generar PDF Completo
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Settings and Preview */}
          <div className="space-y-6">
            {/* PDF Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  Configuración PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="orientation">Orientación</Label>
                  <Select
                    value={pdfSettings.orientation}
                    onValueChange={(value: "portrait" | "landscape") =>
                      setPdfSettings((prev) => ({
                        ...prev,
                        orientation: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Vertical</SelectItem>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Tamaño de Papel</Label>
                  <Select
                    value={pdfSettings.format}
                    onValueChange={(
                      value: "letter" | "a4" | "legal" | "tabloid"
                    ) => setPdfSettings((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Carta (8.5" × 11")</SelectItem>
                      <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                      <SelectItem value="legal">Legal (8.5" × 14")</SelectItem>
                      <SelectItem value="tabloid">
                        Tabloid (11" × 17")
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="margin">Margen (mm)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[pdfSettings.margin]}
                      onValueChange={(value) =>
                        setPdfSettings((prev) => ({
                          ...prev,
                          margin: value[0],
                        }))
                      }
                      max={30}
                      min={0}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {pdfSettings.margin}mm
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Sin margen</span>
                    <span>Máximo</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <Badge variant="secondary">
                    {pdfSettings.orientation === "portrait"
                      ? "Vertical"
                      : "Horizontal"}
                  </Badge>
                  <Badge variant="outline">
                    {pdfSettings.format.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{pdfSettings.margin}mm margen</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedImage && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Eye className="w-5 h-5 text-orange-600" />
                    </div>
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className="inline-block border-2 border-gray-300 bg-white shadow-lg relative mx-auto"
                      style={getPreviewDimensions()}
                    >
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          padding: `${(pdfSettings.margin / 12) * 12}px`,
                        }}
                      >
                        <img
                          src={selectedImage.url || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      {/* Indicador visual de márgenes dinámico */}
                      <div
                        className="absolute inset-0 border border-dashed border-gray-400 pointer-events-none"
                        style={{
                          margin: `${(pdfSettings.margin / 12) * 12}px`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedImage.name}
                    </p>
                    <Separator className="my-4" />
                    <Button
                      onClick={() => generatePDF(selectedImage)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
