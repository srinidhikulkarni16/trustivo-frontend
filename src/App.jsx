import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import PdfPage from "./pages/PdfPage";
import PublicSignPage from "./pages/PublicSignPage";
import AuditTrail from "./pages/AuditTrail";
import SignatureManager from "./pages/SignatureManager";
import UploadPage from "./pages/UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Documents Page */}
          <Route path="/documents" element={<Documents />} />

          {/* Upload */}
          <Route path="/upload/:type" element={<UploadPage />} />

          {/* PDF Editor */}
          <Route path="/upload/pdf" element={<PdfPage />} />
          <Route path="/pdf/:documentId" element={<PdfPage />} />

          <Route path="/sign/:token" element={<PublicSignPage />} />
          <Route path="/audit/:documentId" element={<AuditTrail />} />
          <Route path="/signatures/:documentId" element={<SignatureManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;