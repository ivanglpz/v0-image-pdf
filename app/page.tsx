"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Download, FileImage, Settings, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"

interface ImageFile {
  id: string
  file: File
  url: string
  name: string
  size: number
}

interface PdfSettings {
  orientation: "portrait" | "landscape"
  format: "letter" | "a4" | "legal" | "tabloid"
}

const formatSizes = {
  letter: { width: 216, height: 279 },
  a4: { width: 210, height: 297 },
  legal: { width: 216, height: 356 },
  tabloid: { width: 279, height: 432 },
}

export default function ImageToPdfConverter() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    orientation: "portrait",
    format: "letter",
  })
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona solo archivos de imagen",
        variant: "destructive",
      })
      return
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }))

    setImages((prev) => [...prev, ...newImages])
    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0])
    }

    toast({
      title: "Imágenes cargadas",
      description: `${newImages.length} imagen(es) agregada(s) exitosamente`,
    })
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      if (selectedImage?.id === id) {
        setSelectedImage(filtered.length > 0 ? filtered[0] : null)
      }
      return filtered
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const generatePDF = async (image: ImageFile) => {
    try {
      const { orientation, format } = pdfSettings
      const dimensions = formatSizes[format]

      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [dimensions.width, dimensions.height],
      })

      const img = new Image()
      img.crossOrigin = "anonymous"

      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"))
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const imgData = canvas.toDataURL("image/jpeg", 0.95)

          const pageWidth = orientation === "portrait" ? dimensions.width : dimensions.height
          const pageHeight = orientation === "portrait" ? dimensions.height : dimensions.width

          // Agregar márgenes de 12mm en todos los lados
          const margin = 12
          const availableWidth = pageWidth - margin * 2
          const availableHeight = pageHeight - margin * 2

          const imgAspectRatio = img.width / img.height
          const availableAspectRatio = availableWidth / availableHeight

          let imgWidth, imgHeight

          if (imgAspectRatio > availableAspectRatio) {
            imgWidth = availableWidth
            imgHeight = availableWidth / imgAspectRatio
          } else {
            imgHeight = availableHeight
            imgWidth = availableHeight * imgAspectRatio
          }

          // Centrar la imagen dentro del área disponible (con márgenes)
          const x = margin + (availableWidth - imgWidth) / 2
          const y = margin + (availableHeight - imgHeight) / 2

          pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight)
          pdf.save(`${image.name.split(".")[0]}.pdf`)

          toast({
            title: "PDF generado",
            description: "El archivo PDF se ha descargado exitosamente",
          })

          resolve()
        }

        img.onerror = () => {
          reject(new Error("Error al cargar la imagen"))
        }

        img.src = image.url
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      })
    }
  }

  const getPreviewDimensions = () => {
    const { orientation, format } = pdfSettings
    const dimensions = formatSizes[format]
    const baseWidth = 200

    if (orientation === "portrait") {
      return {
        width: baseWidth,
        height: (baseWidth * dimensions.height) / dimensions.width,
      }
    } else {
      return {
        width: baseWidth,
        height: (baseWidth * dimensions.width) / dimensions.height,
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Conversor de Imagen a PDF</h1>
          <p className="text-gray-600 text-lg">Sube tus imágenes y conviértelas en PDFs profesionales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Subir Imágenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Arrastra y suelta tus imágenes aquí</p>
                  <p className="text-gray-500 mb-4">o haz clic para seleccionar archivos</p>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="w-5 h-5" />
                    Imágenes Cargadas ({images.length})
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
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{image.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(image.size)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              generatePDF(image)
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(image.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings and Preview */}
          <div className="space-y-6">
            {/* PDF Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orientation">Orientación</Label>
                  <Select
                    value={pdfSettings.orientation}
                    onValueChange={(value: "portrait" | "landscape") =>
                      setPdfSettings((prev) => ({ ...prev, orientation: value }))
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
                    onValueChange={(value: "letter" | "a4" | "legal" | "tabloid") =>
                      setPdfSettings((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Carta (8.5" × 11")</SelectItem>
                      <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                      <SelectItem value="legal">Legal (8.5" × 14")</SelectItem>
                      <SelectItem value="tabloid">Tabloid (11" × 17")</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="secondary">
                    {pdfSettings.orientation === "portrait" ? "Vertical" : "Horizontal"}
                  </Badge>
                  <Badge variant="outline">{pdfSettings.format.toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className="inline-block border-2 border-gray-300 bg-white shadow-lg relative mx-auto"
                      style={getPreviewDimensions()}
                    >
                      <div className="w-full h-full p-3 flex items-center justify-center">
                        <img
                          src={selectedImage.url || "/placeholder.svg"}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      {/* Indicador visual de márgenes */}
                      <div className="absolute inset-0 border border-dashed border-gray-400 pointer-events-none m-3"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{selectedImage.name}</p>
                    <Separator className="my-4" />
                    <Button onClick={() => generatePDF(selectedImage)} className="w-full">
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
  )
}
