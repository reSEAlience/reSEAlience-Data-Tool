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
  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    })
    .catch((error) => {
      console.error("Could not enable offline app support:", error);
    });
}