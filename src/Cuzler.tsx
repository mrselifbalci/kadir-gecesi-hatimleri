import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogTitle,
} from "@mui/material";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

export interface CuzlerType {
  _id: string;
  hatimNumber: number;
  cuzNumber: number;
  personName: string;
}

interface CuzlersTypeProps {
  setCurrentHatim: React.Dispatch<React.SetStateAction<number>>;
  isAdmin: boolean;
  cuzlers: CuzlerType[];
  setCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  filteredCuzlers: CuzlerType[];
  setFilteredCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  filterByHatim: (hatimNumber: number, data?: CuzlerType[]) => void;
  selectedHatim: number;
  setSelectedHatim: React.Dispatch<React.SetStateAction<number>>;
  setIsAdmin: () => void;
}

const Cuzler = ({
  setCurrentHatim,
  isAdmin,
  cuzlers,
  setCuzlers,
  filteredCuzlers,
  setFilteredCuzlers,
  filterByHatim,
  selectedHatim,
  setSelectedHatim,
  setIsAdmin,
}: CuzlersTypeProps) => {
  const [nameInputs, setNameInputs] = useState<Record<number, string>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(
    "Lütfen önceki cüzü tamamlayın, ardından bir sonraki cüze geçebilirsiniz."
  );
  const [updatedCuz, setUpdatedCuz] = useState<Record<number, boolean>>({});
  const [editedFields, setEditedFields] = useState<Record<number, boolean>>({});
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Memoize expensive computations
  const allHatimNumbers = useMemo(
    () => cuzlers.map((c) => c.hatimNumber),
    [cuzlers]
  );
  console.log(cuzlers);
  const uniqueHatimNumbers = useMemo(
    () => [...new Set(allHatimNumbers)],
    [allHatimNumbers]
  );
  const lastHatim = useMemo(
    () => Math.max(...uniqueHatimNumbers),
    [uniqueHatimNumbers]
  );

  // Memoize handlers
  const handleInputChange = useCallback((cuzNumber: number, value: string) => {
    setNameInputs((prev) => ({ ...prev, [cuzNumber]: value }));
  }, []);

  const handleUpdateName = useCallback(
    async (id: string, cuzNumber: number) => {
      const newName = nameInputs[cuzNumber]?.trim() ?? "";

      try {
        const response = await fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlers/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ personName: newName, isAdmin: isAdmin }),
          }
        );
        const data = await response.json();
        if (data.message === "exists") {
          alert(
            "Bu cuz baskasi tarafindan alindi. Sayfayi yenileyerek tekrar deneyin."
          );
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to update personName");
        }

        // Batch state updates
        const updates = () => {
          setCuzlers((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, personName: newName } : item
            )
          );

          setFilteredCuzlers((prev) =>
            prev.map((item) =>
              item._id === id ? { ...item, personName: newName } : item
            )
          );

          setUpdatedCuz((prev) => ({ ...prev, [cuzNumber]: true }));

          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }

          updateTimeoutRef.current = setTimeout(() => {
            setUpdatedCuz((prev) => ({ ...prev, [cuzNumber]: false }));
            setEditedFields((prev) => ({ ...prev, [cuzNumber]: false }));
            setNameInputs((prev) => ({ ...prev, [cuzNumber]: "" }));
          }, 2000);
        };

        updates();
      } catch (error: unknown) {
        console.error("Error updating name:", error);
      }
    },
    [nameInputs, isAdmin, setCuzlers, setFilteredCuzlers]
  );

  const isHatimComplete = useCallback(
    (hatimNumber: number) => {
      const hatimCuzlers = cuzlers.filter(
        (cuz) => cuz.hatimNumber === hatimNumber
      );
      return hatimCuzlers.every(
        (cuz) => cuz.personName && cuz.personName.trim() !== ""
      );
    },
    [cuzlers]
  );

  const arePreviousHatimsComplete = useCallback(
    (hatimNumber: number) => {
      for (let i = 1; i < hatimNumber; i++) {
        if (!isHatimComplete(i)) return false;
      }
      return true;
    },
    [isHatimComplete]
  );

  // Memoize the hatim click handler with debounce
  const handleHatimClick = useCallback(
    debounce((num: number) => {
      if (!arePreviousHatimsComplete(num) && !isAdmin) {
        setDialogMessage(
          "Lütfen önceki hatmi tamamlayın, ardından bir sonraki hatime geçebilirsiniz."
        );
        setOpenDialog(true);
      } else {
        // Batch state updates
        setCurrentHatim(num);
        filterByHatim(num);
      }
    }, 100),
    [isAdmin, setCurrentHatim, filterByHatim, arePreviousHatimsComplete]
  );

  // Cleanup debounced function on unmount
  React.useEffect(() => {
    return () => {
      handleHatimClick.cancel();
    };
  }, [handleHatimClick]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const isPreviousCuzsFilled = useCallback(
    (hatimNumber: number, cuzNumber: number) => {
      const hatimCuzlers = cuzlers.filter(
        (cuz) => cuz.hatimNumber === hatimNumber
      );
      return hatimCuzlers
        .slice(0, cuzNumber - 1)
        .every((cuz) => cuz.personName && cuz.personName.trim() !== "");
    },
    [cuzlers]
  );

  // Add effect to check for refresh flag
  React.useEffect(() => {
    const shouldRefresh = localStorage.getItem("forceRefresh");
    if (shouldRefresh === "true") {
      // Remove the flag
      localStorage.removeItem("forceRefresh");
      // Fetch fresh data
      window.location.reload();
    }
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 2,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #121212 0%, #1a237e 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 80,
          },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "#f5f5f5",
            textAlign: "center",
            fontWeight: 700,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            mt: 2,
          }}
        >
          Hatim Listesi
        </Typography>

        <FormControl fullWidth>
          <InputLabel sx={{ color: "white" }}>Hatim Seçin</InputLabel>
          <Select
            value={selectedHatim}
            label="Hatim Seçin"
            onChange={(e) => handleHatimClick(Number(e.target.value))}
            disabled={!isAdmin && !arePreviousHatimsComplete(selectedHatim)}
            sx={{
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#90caf9",
              },
              "& .MuiSelect-icon": {
                color: "white",
              },
              "& .MuiMenu-root": {
                backgroundColor: "rgba(18, 18, 18, 0.95)",
              },
              "& .MuiMenu-paper": {
                backgroundColor: "rgba(18, 18, 18, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
              },
              "& .MuiMenuItem-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255, 255, 255, 0.3)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(25, 118, 210, 0.2)",
                  color: "#90caf9",
                },
              },
            }}
          >
            {[...uniqueHatimNumbers]
              .sort((a, b) => a - b)
              .map((num) => (
                <MenuItem
                  key={num}
                  value={num}
                  disabled={!isAdmin && !arePreviousHatimsComplete(num)}
                >
                  Hatim {num}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {filteredCuzlers.map((item) => (
            <Box
              key={item._id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                background: "rgba(255, 255, 255, 0.05)",
                padding: 2,
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.08)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 500,
                  minWidth: "100px",
                }}
              >
                Cüz {item.cuzNumber}:
              </Typography>

              {editedFields[item.cuzNumber] || !item.personName ? (
                <>
                  <TextField
                    size="small"
                    placeholder="İsminizi yazınız"
                    value={nameInputs[item.cuzNumber] ?? item.personName}
                    onChange={(e) =>
                      handleInputChange(item.cuzNumber, e.target.value)
                    }
                    disabled={
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                    }
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#90caf9",
                        },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUpdateName(item._id, item.cuzNumber)}
                    disabled={
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                    }
                    sx={{
                      minWidth: "100px",
                      background:
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
                          ? "rgba(255, 255, 255, 0.1)"
                          : "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                      color: "white",
                      borderRadius: "8px",
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background:
                          !isPreviousCuzsFilled(
                            item.hatimNumber,
                            item.cuzNumber
                          ) && !isAdmin
                            ? "rgba(255, 255, 255, 0.1)"
                            : "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                        transform: "translateY(-1px)",
                      },
                      "&.Mui-disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.3)",
                      },
                    }}
                  >
                    {updatedCuz[item.cuzNumber]
                      ? "Güncellendi"
                      : item.personName
                      ? "Güncelle"
                      : "Ekle"}
                  </Button>
                </>
              ) : (
                <Typography
                  sx={{
                    flex: 1,
                    color: "white",
                    cursor: isAdmin ? "pointer" : "default",
                    fontWeight: isAdmin ? 600 : 400,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: isAdmin ? "#90caf9" : "white",
                    },
                  }}
                  onClick={() =>
                    isAdmin &&
                    setEditedFields((prev) => ({
                      ...prev,
                      [item.cuzNumber]: true,
                    }))
                  }
                >
                  {item.personName || "—"}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#1a237e",
            color: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 600,
            background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
            color: "white",
          }}
        >
          Uyarı
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: "1.1rem", textAlign: "center" }}>
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            sx={{
              background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
              },
            }}
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cuzler;
