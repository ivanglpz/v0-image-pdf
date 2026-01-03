# image to pdf

image to pdf is a client-side web application that converts images into PDF documents directly in the browser. The project focuses on simplicity, performance, and privacy by avoiding any server-side image processing. All files remain on the user’s device at all times.

The application is deployed on Vercel and built with Next.js, React, Tailwind CSS, and jsPDF.

---

## Features

- Upload images via file picker or drag-and-drop
- Convert a single image into a PDF
- Generate multi-page PDFs from multiple images
- Select which images are included in the final PDF
- Configure PDF orientation (portrait or landscape)
- Choose paper format (Letter, A4, Legal, Tabloid)
- Adjust page margins in millimeters
- Live preview of page layout and margins
- Client-side PDF generation using jsPDF
- No backend, no uploads, no user accounts

---

## Architecture Overview

image to pdf is a fully client-rendered Next.js application. The core logic lives in a single page component, supported by small reusable hooks and utilities.

Key architectural decisions:

- All state is local to the page component using React state hooks
- PDF generation is handled entirely in the browser
- Images are stored as object URLs for preview and rendering
- Canvas is used to normalize images before embedding them into PDFs
- UI components are composed from a reusable design system

---

## Directory Structure

```
app/
  globals.css        Global Tailwind and CSS variable definitions
  layout.tsx         Root layout and metadata configuration
  page.tsx           Main image-to-PDF application logic

hooks/
  use-mobile.tsx     Responsive helper hook
  use-toast.ts       Global toast notification system

lib/
  utils.ts           Utility helpers (class name merging)

styles/
  globals.css        Shared global styles and theme tokens
```

---

## Core Components

### app/page.tsx

This is the main application entry point and contains:

- Image upload and drag-and-drop handling
- Image selection and removal logic
- PDF configuration state (orientation, format, margin)
- Preview size calculation
- Single-page and multi-page PDF generation

The component uses jsPDF to create PDF documents and HTML canvas to convert images into JPEG data before insertion.

---

## PDF Generation Flow

1. User uploads one or more image files
2. Images are converted into object URLs for preview
3. User selects PDF settings (orientation, format, margins)
4. For each image:
   - Image is loaded into an offscreen canvas
   - Aspect ratio is preserved
   - Image is centered within the page respecting margins
   - Image is added to the PDF using jsPDF
5. PDF file is generated and downloaded locally

No external APIs or servers are involved in this process.

---

## Toast Notification System

The custom `useToast` hook provides a lightweight global notification system inspired by `react-hot-toast`.

Characteristics:

- Centralized in-memory state
- Supports add, update, dismiss, and auto-remove actions
- Limits concurrent toasts to one
- Uses a reducer-based state model

This keeps user feedback consistent across actions such as uploads, errors, and successful downloads.

---

## Styling and Theming

- Tailwind CSS is used for all layout and styling
- CSS variables define light and dark theme tokens
- The design is responsive and adapts to mobile and desktop screens
- Utility-first styling is combined with reusable UI components

---

## Metadata and SEO

The root layout defines comprehensive metadata:

- Open Graph tags for social sharing
- Twitter card configuration
- Application icons and PWA support
- SEO-friendly titles and descriptions

This ensures good discoverability and link previews when shared.

---

## Privacy and Security

image to pdf is designed with privacy as a core principle:

- No images are uploaded to any server
- No analytics track file contents
- All processing is performed locally
- Files are discarded when the page is refreshed

---

## Local Development

Prerequisites:

- Node.js 18 or later
- npm, pnpm, or yarn

Install dependencies:

```
npm install
```

Run the development server:

```
npm run dev
```

Open the application at:

```
http://localhost:3000
```

---

## Deployment

The project is optimized for deployment on Vercel. It does not require any server configuration, environment variables, or backend services.

---

## Limitations

- Large images may increase memory usage due to canvas processing
- PDF generation performance depends on the client device
- No persistent storage between sessions

---

## License

This project is provided as-is for educational and demonstration purposes. Add a license file if you intend to distribute or reuse it publicly.

