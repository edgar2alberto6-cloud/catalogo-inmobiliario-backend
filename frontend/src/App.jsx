import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import PublicPropertyDetail from "./pages/PublicPropertyDetail";
import SellerPropertyDetail from "./pages/SellerPropertyDetail";
import AdminPropertyDetail from "./pages/AdminPropertyDetail";
import PropertyEdit from "./pages/PropertyEdit";
import PropertyCreate from "./pages/PropertyCreate";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminUserEdit from "./pages/AdminUserEdit";
import MainLayout from "./layouts/MainLayout";
import AdminRoute from "./routes/AdminRoute";
import SellerRoute from "./routes/SellerRoute";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/properties/create"
            element={
              <AdminRoute>
                <PropertyCreate />
              </AdminRoute>
            }
          />

          <Route path="/property/:id" element={<PublicPropertyDetail />} />

          <Route
            path="/seller/property/:id"
            element={
              <SellerRoute>
                <SellerPropertyDetail />
              </SellerRoute>
            }
          />

          <Route
            path="/admin/property/:id"
            element={
              <AdminRoute>
                <AdminPropertyDetail />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/property/:id/edit"
            element={
              <AdminRoute>
                <PropertyEdit />
              </AdminRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <SellerRoute>
                <Settings />
              </SellerRoute>
            }
          />

          <Route
            path="/settings/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/settings/users/:id"
            element={
              <AdminRoute>
                <AdminUserDetail />
              </AdminRoute>
            }
          />

          <Route
            path="/settings/users/:id/edit"
            element={
              <AdminRoute>
                <AdminUserEdit />
              </AdminRoute>
            }
          />

          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;