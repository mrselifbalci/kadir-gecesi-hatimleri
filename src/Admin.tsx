import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { CuzlerType } from "./Cuzler";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as XLSX from "xlsx";

interface AdminProps {
  isAdmin: boolean;
  cuzlers: CuzlerType[];
  setCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  adminPassword: string;
  setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handlePasswordSubmit: () => void;
}

const Admin = ({
  isAdmin,
  cuzlers,
  adminPassword,
  setAdminPassword,
  showPassword,
  setShowPassword,
  handlePasswordSubmit,
}: AdminProps) => {
  const handleDownloadExcel = () => {
    const formattedData = cuzlers
      .sort((a, b) => a.hatimNumber - b.hatimNumber) // Sorting by hatimNumber in ascending order
      .map((item) => ({
        "Hatim Numarasi": item.hatimNumber,
        "Cüz numarası": item.cuzNumber,
        İsim: item.personName || "",
      }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuzlers");

    XLSX.writeFile(workbook, "cuzlers.xlsx");
  };
  return (
    <Box>
      {isAdmin ? (
        <Box>
          <Box></Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={handleDownloadExcel}
          >
            Download Excel
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            marginTop: 3,
            background: "#EF9A9A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 1,
          }}
        >
          <Typography sx={{ color: "white" }}>Admin girisi</Typography>
          <Box
            sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1 }}
          >
            <TextField
              size="small"
              type={showPassword ? "text" : "password"}
              placeholder="Admin şifresi"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handlePasswordSubmit}
            >
              Tamam
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Admin;
