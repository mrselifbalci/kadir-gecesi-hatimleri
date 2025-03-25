import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cuzler, { CuzlerType } from "./Cuzler";
import { useEffect, useState } from "react";
import Admin from "./Admin";

const App: React.FC = () => {
  const [currentHatim, setCurrentHatim] = useState(133);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [filteredCuzlers, setFilteredCuzlers] = useState<CuzlerType[]>([]);
  const [selectedHatim, setSelectedHatim] = useState<number>(1);

  const handlePasswordSubmit = () => {
    if (adminPassword === "LONDRA") {
      setIsAdmin(true);
    } else {
      alert("Yanlis sifre");
    }
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
        // console.log(
        //   result.response.filter((item: any) => {
        //     return item.personName.toLowerCase().includes("mustafa b");
        //   })
        // );
        const sortedData = result.response.sort(
          (a: CuzlerType, b: CuzlerType) => a.cuzNumber - b.cuzNumber
        );

        setCuzlers(sortedData);
        filterByHatim(currentHatim, sortedData);
      } catch (error: any) {
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
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Cuzler
                setCurrentHatim={setCurrentHatim}
                isAdmin={isAdmin}
                cuzlers={cuzlers}
                setCuzlers={setCuzlers}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handlePasswordSubmit={handlePasswordSubmit}
                filteredCuzlers={filteredCuzlers}
                setFilteredCuzlers={setFilteredCuzlers}
                filterByHatim={filterByHatim}
                selectedHatim={selectedHatim}
              />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <Admin
                isAdmin={isAdmin}
                cuzlers={cuzlers}
                setCuzlers={setCuzlers}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handlePasswordSubmit={handlePasswordSubmit}
              />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
