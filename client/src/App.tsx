//import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import HomePage from "./pages/home/Home";
import PageLayout from "@/components/layouts/PageLayout"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        
        
        <Route path="/login" element={ <LoginPage /> } />
        
        
        <Route path="/" element={<PageLayout>
              <HomePage />
            </PageLayout>} />
        
      </Routes>
    </Router>
  );
}

export default App;
