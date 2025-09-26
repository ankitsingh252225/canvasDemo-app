# POC Canvas AI Editor

A minimal browser-based **image editor** built as a **POC assignment** using **React**, **HTML5 Canvas**, **OpenCV.js (WASM)**, and AI/ML APIs.

---

## Features Implemented

### 1. Image Loading
- Upload via file input or drag-and-drop.
- Canvas auto-fits the image while maintaining aspect ratio.

### 2. WASM Filter (Gaussian Blur)
- Integrated **OpenCV.js** for real-time blur adjustment using a slider.

### 3. Background Removal
- Uses **Remove.bg** API to remove background.
- Shows loading indicator during processing.
- Processed image overlays on the canvas.

### 4. Natural-Language Commands
- Users can type commands like:
  - `draw red circle at x:200 y:150 radius:50`
  - `brighten 20%`
- Commands sent to **OpenAI Chat Completion** for JSON generation.
- JSON parsed and executed on canvas (draw circle, adjust brightness).

### 5. User Feedback
- Toast notifications for errors and successful operations.

---

## How to Run Locally

1. Clone repository:
   ```bash
   git clone https://github.com/your-username/canvas-ai-poc.git
   cd canvas-ai-poc
   ```
2. Install dependencies:
```bash
npm install
```
3. Create .env with
```bash
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXX
REMOVE_BG_API_KEY=your_key_here
```
4. Run dev server:
```bash
npm run dev
```
5. run server.
```bash
node server.js
```
