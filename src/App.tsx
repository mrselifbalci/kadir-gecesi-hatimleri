import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Button, Container } from "@mui/material";
import Cuzler from "./Cuzler";
import HatimAl from "./HatimAl";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import Admin from "./Admin";
import { CuzlerType } from "./Cuzler";

const App: React.FC = () => {
  const [currentHatim, setCurrentHatim] = useState(260);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const storedAdmin = localStorage.getItem("isAdmin");
    return storedAdmin === "true";
  });
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [filteredCuzlers, setFilteredCuzlers] = useState<CuzlerType[]>([]);
  const [selectedHatim, setSelectedHatim] = useState<number>(1);

  const handlePasswordSubmit = (password: string) => {
    if (password === "LONDRA") {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
    } else {
      alert("Yanlis sifre");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  useEffect(() => {
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

        setCuzlers(sortedData);
        filterByHatim(currentHatim, sortedData);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filterByHatim = (hatimNumber: number, data: CuzlerType[] = cuzlers) => {
    const filtered = data
      .filter((item) => item.hatimNumber === hatimNumber)
      .sort((a, b) => a.cuzNumber - b.cuzNumber);

    setFilteredCuzlers(filtered);
    setSelectedHatim(hatimNumber);
  };

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <Container>
      <Header />
      {children}
    </Container>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "center", my: 4 }}
            >
              <Button
                component={Link}
                to="/hatimal"
                variant="contained"
                color="primary"
              >
                Hatim Al
              </Button>
              <Button
                component={Link}
                to="/cuzal"
                variant="contained"
                color="primary"
              >
                Cüz Al
              </Button>
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
              />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
