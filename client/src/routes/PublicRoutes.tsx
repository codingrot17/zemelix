import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/home/Home";
import { CollectionsPage } from "@/pages/collections/CollectionsPage";
import { SingleCollectionPage } from "@/pages/collections/SingleCollectionPage";
import PageLayout from "@/components/layouts/PageLayout";
import LoginPage from "../pages/auth/Login";
import Unauthorized from "../pages/auth/Unauthorized";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <PageLayout>
            <HomePage />
          </PageLayout>
        }
      />
      <Route
        path="/collections"
        element={
          <PageLayout>
            <CollectionsPage />
          </PageLayout>
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
  );
};

export default PublicRoutes;
