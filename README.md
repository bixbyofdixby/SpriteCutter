# SpriteCutter ✂️

A fast, client-side, open-source single-page application built with React and Vite for instantly slicing game asset spritesheets into individual files. Completely private—your images never leave your browser!

## Features
- **Grid Auto-Slicing**: Instant uniform slicing with configurable offsets, dimensions, padding, and custom naming overlays.
- **Custom Slicing Canvas**: An interactive environment where you can click/drag to isolate specific assets, adjust bounding boxes on the fly, and view real-time dimension metrics.
- **Dynamic Quick-Presets**: 1-click generators for common game sizes (8x8, 16x16, 32x32, 64x64, etc.)
- **Mass Exporting**: Extracts your custom boundaries and exports them safely into a single neat `.zip` file for zero browser hassle, or toggles directly to standard PNG downloads.

## 🚀 How to Run Locally

If you've grabbed the code from GitHub and want to run or mod the application on your own machine, follow these steps:

### Prerequisites
You will need to have [Node.js](https://nodejs.org/) installed on your computer.

### Step-by-step Setup
1. **Open your terminal** and navigate to the folder where you downloaded or cloned this repository.
2. **Install the dependencies** by running:
   ```bash
   npm install
   ```
3. **Start the local development server** by running:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to the URL provided in the terminal (usually `http://localhost:5173/`).

## Modding & Building
If you want to create a production-ready build to host on your own server (or GitHub Pages / Vercel), simply run:
```bash
npm run build
```
The compiled, ready-to-deploy static files will be placed in the `/dist` folder. 

PS: Do whatever you want, just dont try to sell it somewhere (includes modded versions)!
