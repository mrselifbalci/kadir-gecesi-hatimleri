import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cuzler from "./Cuzler";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Cuzler />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
