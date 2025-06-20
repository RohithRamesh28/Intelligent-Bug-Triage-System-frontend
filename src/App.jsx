import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import "antd/dist/reset.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectCreatePage from "./pages/ProjectCreatePage";
import DashboardPage from "./pages/DashboardPage";
import MyUploadsPage from "./pages/MyUploadsPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import UploadPage from "./pages/UploadPage";
import DashboardLayout from "./components/DashboardLayout";
import AllUploadsPage from "./pages/AllUploadsPage";
import SettingsPage from "./pages/SettingsPage";
import UploadDetails from "./pages/UploadDetails";

function App() {

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/projects/create" element={<ProjectCreatePage />} />

        {/* All Private Routes wrapped in ConfigProvider for theme */}
        <Route
          path="/*"
          element={
            <ConfigProvider
              theme={{
                algorithm: isDarkMode
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
              }}
            >
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <DashboardPage />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/uploads"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <UploadPage />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-uploads"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <MyUploadsPage />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/all-uploads"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <AllUploadsPage />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <SettingsPage
                          isDarkMode={isDarkMode}
                          onThemeChange={setIsDarkMode}
                        />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/upload/:uploadId"
                  element={
                    <PrivateRoute>
                      <DashboardLayout>
                        <UploadDetails />
                      </DashboardLayout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </ConfigProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
