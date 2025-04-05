import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import Cuzler from "./Cuzler";
import HatimAl from "./HatimAl";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import Admin from "./Admin";
import SuperAdmin from "./SuperAdmin";
import { CuzlerType } from "./Cuzler";
import femaleImage from "./assets/female.png";

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

      // Find the first hatim with a blank personName
      const hatimNumbers = [
        ...new Set(sortedData.map((item: CuzlerType) => item.hatimNumber)),
      ] as number[];
      hatimNumbers.sort((a, b) => a - b);
      let firstHatimWithBlank = 1;

      for (const hatimNumber of hatimNumbers) {
        const hatimCuzlers = sortedData.filter(
          (item: CuzlerType) => item.hatimNumber === hatimNumber
        );
        if (
          hatimCuzlers.some(
            (cuz: CuzlerType) => !cuz.personName || cuz.personName.trim() === ""
          )
        ) {
          firstHatimWithBlank = hatimNumber;
          break;
        }
      }

      // Set the selected hatim and filtered cuzlers directly
      setSelectedHatim(firstHatimWithBlank);
      const filtered = sortedData
        .filter((item: CuzlerType) => item.hatimNumber === firstHatimWithBlank)
        .sort((a: CuzlerType, b: CuzlerType) => a.cuzNumber - b.cuzNumber);
      setFilteredCuzlers(filtered);
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
      <Header cuzlers={cuzlers} />
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              position: "relative",
              "&::before": {
                content: '""',
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url(${femaleImage}) no-repeat center center`,
                backgroundSize: "cover",
                zIndex: 0,
              },
              "&::after": {
                content: '""',
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.50)",
                zIndex: 1,
              },
            }}
          >
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Header cuzlers={cuzlers} />
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
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 4,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.95)",
                      mb: 2,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    Kurban Bayramı Hatimleri
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      maxWidth: 600,
                      mx: "auto",
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    "Kim Kur'an okur ve onu ezberlerse, helâli helâl, haramı da
                    haram kabul ederse, Allah onu bu sebeple Cennete koyar."
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontStyle: "italic",
                      mb: 6,
                    }}
                  >
                    (Tirmizî, Fedâilü'l-Kur'ân, 13)
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 4 },
                    width: "100%",
                    maxWidth: 600,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    component={Link}
                    to="/hatimal"
                    variant="contained"
                    size="large"
                    sx={{
                      fontSize: "1.2rem",
                      padding: "16px 32px",
                      minWidth: "240px",
                      background:
                        "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      boxShadow: "0 3px 15px rgba(21, 101, 192, 0.3)",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      textTransform: "none",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(21, 101, 192, 0.4)",
                        background:
                          "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                        color: "#90caf9",
                      },
                    }}
                  >
                    Tam Hatim Al
                  </Button>
                  <Button
                    component={Link}
                    to="/cuzal"
                    variant="contained"
                    size="large"
                    sx={{
                      fontSize: "1.2rem",
                      padding: "16px 32px",
                      minWidth: "240px",
                      background:
                        "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      boxShadow: "0 3px 15px rgba(21, 101, 192, 0.3)",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                      textTransform: "none",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(21, 101, 192, 0.4)",
                        background:
                          "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                        color: "#90caf9",
                      },
                    }}
                  >
                    Cüz Al
                  </Button>
                </Box>

                <Box
                  sx={{
                    mt: 6,
                    textAlign: "center",
                    maxWidth: 800,
                    mx: "auto",
                    px: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      fontSize: "1.1rem",
                      lineHeight: 1.8,
                    }}
                  >
                    Kurban Bayramı'nda okunacak hatimlerimize katılarak bu
                    mübarek bayramın feyzinden ve bereketinden istifade
                    edebilirsiniz. Tam hatim almak için "Tam Hatim Al" butonuna,
                    bir veya birden fazla cüz almak için "Cüz Al" butonuna
                    tıklayabilirsiniz.
                  </Typography>
                </Box>
              </Box>
              <Footer
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                handleLogout={handleLogout}
                handleSuperAdminLogout={handleSuperAdminLogout}
              />
            </Container>
          </Box>
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
              handleLogout={handleLogout}
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
