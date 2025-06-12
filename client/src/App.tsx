import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import HomePage from "./pages/home/Home";
import { CollectionsPage } from "./pages/collections/CollectionsPage";
import { SingleCollectionPage } from "./pages/collections/SingleCollectionPage";

import PageLayout from "@/components/layouts/PageLayout";

function App() {
  return (
   <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PageLayout>
              <HomePage />
            </PageLayout>
          }
        />
        
            <Route 
            path="/collections" element={
            <PageLayout>
              <CollectionsPage />
            </PageLayout >
              }
            /> 
<Route
  path="/collections/:slug"
  element={
    <PageLayout>
      <SingleCollectionPage />
    </PageLayout>
  }
/>

        
        
      </Routes>
    </Router>
  );
}

export default App;
