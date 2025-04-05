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
import CloseIcon from "@mui/icons-material/Close";
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
        borderBottom: "2px solid rgba(255, 255, 255, 0.12)",
        mb: 4,
        background:
          "linear-gradient(180deg, rgba(25,118,210,0.2) 0%, rgba(25,118,210,0.05) 100%)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
      }}
    >
      {location.pathname !== "/" && (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            justifyContent: "center",
            alignItems: "center",
            py: 2.5,
          }}
        >
          <Button
            component={Link}
            to="/"
            variant="text"
            color={location.pathname === "/" ? "primary" : "inherit"}
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: location.pathname === "/" ? 600 : 400,
              fontSize: "1.1rem",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                color: "#90caf9",
                backgroundColor: "rgba(144, 202, 249, 0.08)",
              },
            }}
          >
            Ana Sayfa
          </Button>
          <Button
            component={Link}
            to="/hatimal"
            variant="text"
            color={location.pathname === "/hatimal" ? "primary" : "inherit"}
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: location.pathname === "/hatimal" ? 600 : 400,
              fontSize: "1.1rem",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                color: "#90caf9",
                backgroundColor: "rgba(144, 202, 249, 0.08)",
              },
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
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: location.pathname === "/cuzal" ? 600 : 400,
              fontSize: "1.1rem",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                color: "#90caf9",
                backgroundColor: "rgba(144, 202, 249, 0.08)",
              },
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
          pb: 2.5,
          pt: location.pathname === "/" ? 2.5 : 0,
        }}
      >
        <Button
          onClick={() => setOpenSearch(true)}
          sx={{
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            padding: "12px 28px",
            borderRadius: "30px",
            background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
            boxShadow: "0 3px 15px rgba(21, 101, 192, 0.3)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 5px 20px rgba(21, 101, 192, 0.4)",
              background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
            },
          }}
          startIcon={<SearchIcon sx={{ fontSize: "1.3rem" }} />}
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
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: "#121212",
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.12),
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 80px rgba(25, 118, 210, 0.2),
              0 0 120px rgba(25, 118, 210, 0.1)
            `,
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
            background: "rgba(25, 118, 210, 0.08)",
            pr: 1,
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              pb: 2,
              pt: 2,
              flex: 1,
            }}
          >
            İsim Ara
          </DialogTitle>
          <IconButton
            onClick={() => {
              setOpenSearch(false);
              setSearchTerm("");
              setSearchResults({});
              setHasSearched(false);
            }}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.95)",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ background: "#121212" }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 3, mt: 2 }}>
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(144, 202, 249, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#90caf9",
                  },
                  "& input": {
                    color: "rgba(255, 255, 255, 0.9)",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "14px 18px",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                borderRadius: "12px",
                padding: "0 28px",
                background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                boxShadow: "0 3px 15px rgba(21, 101, 192, 0.3)",
                transition: "all 0.2s ease-in-out",
                color: "white",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 20px rgba(21, 101, 192, 0.4)",
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                },
              }}
            >
              Ara
            </Button>
          </Box>

          {Object.keys(searchResults).length > 0 ? (
            <List sx={{ mt: 1 }}>
              {Object.keys(searchResults)
                .sort((a, b) => Number(a) - Number(b))
                .map((hatimNumber) => (
                  <Box key={hatimNumber} sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        background:
                          "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                        color: "rgba(255, 255, 255, 0.95)",
                        px: 2.5,
                        py: 1.5,
                        borderRadius: "12px",
                        fontWeight: 600,
                        boxShadow: "0 3px 15px rgba(21, 101, 192, 0.2)",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Hatim {hatimNumber}
                    </Typography>
                    {searchResults[Number(hatimNumber)].map((result, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            backgroundColor: "rgba(144, 202, 249, 0.08)",
                          },
                          borderRadius: "8px",
                          my: 1,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontWeight: 500,
                                fontSize: "1.1rem",
                                color: "rgba(255, 255, 255, 0.95)",
                                letterSpacing: "0.3px",
                              }}
                            >
                              {result.personName}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7)",
                                fontSize: "0.95rem",
                                mt: 0.5,
                              }}
                            >
                              Cüz {result.cuzNumber}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </Box>
                ))}
            </List>
          ) : (
            hasSearched && (
              <Typography
                sx={{
                  textAlign: "center",
                  mt: 3,
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "1.1rem",
                  fontWeight: 500,
                }}
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
