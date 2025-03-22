import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cuzler, { CuzlerType } from "./Cuzler";
import { useState } from "react";
import Admin from "./Admin";

const App: React.FC = () => {
  const [currentHatim, setCurrentHatim] = useState(117);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordSubmit = () => {
    if (adminPassword === "LONDRA") {
      setIsAdmin(true);
    } else {
      alert("Yanlis sifre");
    }
  };
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Cuzler
                currentHatim={currentHatim}
                setCurrentHatim={setCurrentHatim}
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
