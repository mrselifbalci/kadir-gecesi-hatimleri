import { Box, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "center",
        py: 2,
        borderBottom: "1px solid #e0e0e0",
        mb: 3,
      }}
    >
      <Button
        component={Link}
        to="/"
        variant="text"
        color={location.pathname === "/" ? "primary" : "inherit"}
        sx={{ fontWeight: location.pathname === "/" ? "bold" : "normal" }}
      >
        Ana Sayfa
      </Button>
      <Button
        component={Link}
        to="/hatimal"
        variant="text"
        color={location.pathname === "/hatimal" ? "primary" : "inherit"}
        sx={{
          fontWeight: location.pathname === "/hatimal" ? "bold" : "normal",
        }}
      >
        Hatim Al
      </Button>
      <Button
        component={Link}
        to="/cuzal"
        variant="text"
        color={location.pathname === "/cuzal" ? "primary" : "inherit"}
        sx={{ fontWeight: location.pathname === "/cuzal" ? "bold" : "normal" }}
      >
        Cüz Al
      </Button>
    </Box>
  );
};

export default Header;
