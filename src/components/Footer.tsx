import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface FooterProps {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  handleLogout: () => void;
  handleSuperAdminLogout: () => void;
}

const Footer: React.FC<FooterProps> = ({
  isAdmin,
  isSuperAdmin,
  handleLogout,
  handleSuperAdminLogout,
}) => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        mt: "auto",
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        fontSize: "0.8rem",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} Kurban Bayrami Hatimleri
      </Typography>

      {!isAdmin && (
        <Button
          component={Link}
          to="/admin"
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            py: 0.25,
            px: 0.75,
            fontSize: "0.7rem",
            minHeight: "20px",
            textTransform: "none",
          }}
        >
          Admin giris
        </Button>
      )}

      {isAdmin && (
        <Button
          component={Link}
          to="/admin"
          size="small"
          color="primary"
          variant="outlined"
          sx={{
            py: 0.5,
            px: 1,
            fontSize: "0.75rem",
            minHeight: "24px",
          }}
        >
          Admin Paneline Git
        </Button>
      )}
    </Box>
  );
};

export default Footer;
