import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { CuzlerType } from "../Cuzler";

interface HeaderProps {
  cuzlers?: CuzlerType[];
}

interface GroupedResults {
  [key: number]: Array<{ cuzNumber: number; personName: string }>;
}

const Header = ({ cuzlers = [] }: HeaderProps) => {
  const location = useLocation();
  const [openSearch, setOpenSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<GroupedResults>({});
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const results = cuzlers.filter((cuz) =>
      cuz.personName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group results by hatim number
    const grouped = results.reduce((acc, curr) => {
      if (!acc[curr.hatimNumber]) {
        acc[curr.hatimNumber] = [];
      }
      acc[curr.hatimNumber].push({
        cuzNumber: curr.cuzNumber,
        personName: curr.personName,
      });
      return acc;
    }, {} as GroupedResults);

    // Sort cuz numbers within each hatim
    Object.keys(grouped).forEach((hatimNumber) => {
      grouped[Number(hatimNumber)].sort(
        (a: { cuzNumber: number }, b: { cuzNumber: number }) =>
          a.cuzNumber - b.cuzNumber
      );
    });

    setSearchResults(grouped);
    setHasSearched(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderBottom: "1px solid #e0e0e0",
        mb: 3,
      }}
    >
      {location.pathname !== "/" && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            py: 2,
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
            sx={{
              fontWeight: location.pathname === "/cuzal" ? "bold" : "normal",
            }}
          >
            Cüz Al
          </Button>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pb: 2,
          pt: location.pathname === "/" ? 2 : 0,
        }}
      >
        <Button
          onClick={() => setOpenSearch(true)}
          sx={{
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
            textTransform: "none",
          }}
          startIcon={<SearchIcon />}
        >
          Cüzünü Unuttuysan İsminle Ara
        </Button>
      </Box>

      <Dialog
        open={openSearch}
        onClose={() => {
          setOpenSearch(false);
          setSearchTerm("");
          setSearchResults({});
          setHasSearched(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>İsim Ara</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 1, mb: 2, mt: 1 }}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim yazın..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Ara
            </Button>
          </Box>

          {Object.keys(searchResults).length > 0 ? (
            <List>
              {Object.keys(searchResults)
                .sort((a, b) => Number(a) - Number(b))
                .map((hatimNumber) => (
                  <Box key={hatimNumber}>
                    <Typography
                      variant="h6"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        mt: 2,
                      }}
                    >
                      Hatim {hatimNumber}
                    </Typography>
                    {searchResults[Number(hatimNumber)].map((result, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={result.personName}
                          secondary={`Cüz ${result.cuzNumber}`}
                        />
                      </ListItem>
                    ))}
                  </Box>
                ))}
            </List>
          ) : (
            hasSearched && (
              <Typography
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                Sonuç bulunamadı
              </Typography>
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Header;
