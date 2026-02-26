import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import PdfPage from "./pages/PdfPage";
import PhotoPage from "./pages/PhotoPage";
import OtherServices from "./pages/OtherServices";
import UploadPage from "./pages/UploadPage";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload/pdf" element={<PdfPage />} />
          <Route path="/upload/photo" element={<PhotoPage />} />
          <Route path="/upload/other" element={<OtherServices />} />
          <Route path="/upload/:type" element={<UploadPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;