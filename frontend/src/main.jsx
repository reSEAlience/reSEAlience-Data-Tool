import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import {Toaster} from "react-hot-toast";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <App />
      <Toaster/>
    </BrowserRouter>
  </StrictMode>,
)

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
  navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL).then((registration) => {
    if (registration?.active?.scriptURL.endsWith("/sw.js")) {
      registration.unregister().catch((error) => {
        console.error("Could not disable offline app support:", error);
      });
    }
  }).catch((error) => {
    console.error("Could not check offline app support:", error);
  });
}