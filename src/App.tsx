import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Box, Button, Container } from "@mui/material";
import Cuzler from "./Cuzler";
import HatimAl from "./HatimAl";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Admin from "./Admin";
import SuperAdmin from "./SuperAdmin";
import { CuzlerType } from "./Cuzler";

const AppContent = () => {
  const [currentHatim, setCurrentHatim] = useState(1);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    return storedAdmin === "true";
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    const storedSuperAdmin = localStorage.getItem("isSuperAdmin");
    return storedSuperAdmin === "true";
  });
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [filteredCuzlers, setFilteredCuzlers] = useState<CuzlerType[]>([]);
  const [selectedHatim, setSelectedHatim] = useState<number>(1);
  const location = useLocation();

  const handlePasswordSubmit = (password: string) => {
    if (password === "LONDRA") {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
    } else {
      alert("Yanlis sifre");
    }
  };

  const handleSuperAdminPasswordSubmit = (password: string) => {
    if (password === "LONDON2020%") {
      setIsSuperAdmin(true);
      localStorage.setItem("isSuperAdmin", "true");
    } else {
      alert("Yanlis sifre");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  const handleSuperAdminLogout = () => {
    setIsSuperAdmin(false);
    localStorage.removeItem("isSuperAdmin");
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlers`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      const sortedData = result.response.sort(
        (a: CuzlerType, b: CuzlerType) => a.cuzNumber - b.cuzNumber
      );
      console.log(sortedData);
      setCuzlers(sortedData);
      filterByHatim(currentHatim, sortedData);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.pathname]); // Re-fetch when route changes

  const filterByHatim = (hatimNumber: number, data: CuzlerType[] = cuzlers) => {
    const filtered = data
      .filter((item) => item.hatimNumber === hatimNumber)
      .sort((a, b) => a.cuzNumber - b.cuzNumber);

    setFilteredCuzlers(filtered);
    setSelectedHatim(hatimNumber);
  };

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <Container
      sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Footer
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        handleLogout={handleLogout}
        handleSuperAdminLogout={handleSuperAdminLogout}
      />
    </Container>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <Button
                component={Link}
                to="/hatimal"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  fontSize: "1.2rem",
                  padding: "12px 36px",
                  minWidth: "200px",
                }}
              >
                Hatim Al
              </Button>
              <Button
                component={Link}
                to="/cuzal"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  fontSize: "1.2rem",
                  padding: "12px 36px",
                  minWidth: "200px",
                }}
              >
                Cüz Al
              </Button>
            </Box>
            <Footer
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              handleLogout={handleLogout}
              handleSuperAdminLogout={handleSuperAdminLogout}
            />
          </Container>
        }
      />
      <Route
        path="/hatimal"
        element={
          <Layout>
            <HatimAl />
          </Layout>
        }
      />
      <Route
        path="/cuzal"
        element={
          <Layout>
            <Cuzler
              setCurrentHatim={setCurrentHatim}
              isAdmin={isAdmin}
              cuzlers={cuzlers}
              setCuzlers={setCuzlers}
              filteredCuzlers={filteredCuzlers}
              setFilteredCuzlers={setFilteredCuzlers}
              filterByHatim={filterByHatim}
              selectedHatim={selectedHatim}
              setSelectedHatim={setSelectedHatim}
              setIsAdmin={handleLogout}
            />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <Admin
              isAdmin={isAdmin}
              cuzlers={cuzlers}
              setCuzlers={setCuzlers}
              handlePasswordSubmit={handlePasswordSubmit}
            />
          </Layout>
        }
      />
      <Route
        path="/superadmin"
        element={
          <Layout>
            <SuperAdmin
              isSuperAdmin={isSuperAdmin}
              cuzlers={cuzlers}
              setCuzlers={setCuzlers}
              handlePasswordSubmit={handleSuperAdminPasswordSubmit}
            />
          </Layout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
