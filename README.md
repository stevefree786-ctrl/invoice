# Professional Invoice Generator

A fullstack React application for generating professional invoices with two templates:
- **Sabir Engineering Services** - Simple invoice template
- **Power Control Sales & Services** - Tax invoice/quotation template

## Features

- Two professional invoice templates
- Real-time preview with shareable links
- PDF generation and download
- Invoice history with localStorage
- Responsive design for mobile and desktop
- Demo data loading for quick testing

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS 4
- React Router DOM 7
- Deployed on Vercel

### Backend
- Node.js + Express
- Puppeteer for PDF generation
- Deployed on Railway or Render

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Chrome (for PDF generation)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd invoice-generator
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server && npm install && cd ..
```

4. Start the backend server:
```bash
npm run server
# or
node server/index.js
```

5. In a new terminal, start the frontend:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Deployment

### Deploy to Render (Single Service)

1. Push this repository to GitHub

2. Go to https://render.com and sign up

3. Create a new **Web Service**

4. Connect your GitHub repository

5. Configure:
   - **Root Directory:** `.` (project root)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/index.js`
   - **Environment:** Node.js

6. Add environment variable:
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (or leave blank, Render sets it automatically)

7. Deploy

8. Your app will be available at `https://your-app.onrender.com`

### Alternative: Railway

1. Go to https://railway.app
2. New project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Node.js
5. Set start command: `npm start`
6. Deploy

### Local Production Test

```bash
npm run build
npm start
# Open http://localhost:3001
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Backend
No environment variables required for local development. For production, the backend runs on port 3001 by default.

## Project Structure

```
invoice-generator/
├── server/
│   ├── index.js          # Express backend with PDF generation
│   ├── package.json
│   └── data/
│       └── invoices.json # Saved invoices storage
├── src/
│   ├── components/
│   │   └── InvoiceForm.jsx
│   ├── pages/
│   │   └── PreviewPage.jsx
│   ├── templates/
│   │   ├── InvoiceTemplate1.jsx  # Sabir template
│   │   └── InvoiceTemplate2.jsx  # Power Control template
│   ├── data/
│   │   ├── companies.js          # Company configurations
│   │   └── demoData.js           # Demo invoice data
│   ├── assets/
│   │   ├── sabir-logo.png
│   │   ├── power-control-logo.png
│   │   ├── sign-sabir.png
│   │   └── sign-powercontrol.png
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vercel.json
├── vite.config.js
└── package.json
```

## Usage

1. Select a company template from the home page
2. Fill in invoice details:
   - Ref #, Date, Client info
   - Add products/services with quantities and prices
   - Add notes/terms if needed
3. Click "Preview Invoice" to see a fullscreen preview
4. Click "Download PDF" to save the invoice

## Troubleshooting

### White Screen on Vercel
- Check browser console for errors
- Ensure `VITE_API_BASE_URL` is set correctly in Vercel environment variables
- Make sure backend is running and accessible

### PDF Generation Fails
- Ensure backend has Chrome/Chromium installed
- Check backend logs for errors
- Verify backend URL is correct in frontend environment variables

### CORS Errors
- Backend is configured with `cors({ origin: '*' })`
- Ensure backend URL in frontend matches actual backend URL

## License

ISC
