import { BrowserRouter, Routes, Route } from "react-router-dom";

function Home() {
  return (
    <div className="h-screen flex items-center justify-center text-3xl font-bold">
      Welcome to Trustivo 🚀
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;