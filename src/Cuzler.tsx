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
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
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
              backgroundColor: "#333",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& .MuiSelect-icon": {
                color: "white",
              },
              "& .MuiMenu-root": {
                backgroundColor: "grey",
              },
              "& .MuiMenu-paper": {
                backgroundColor: "grey",
                color: "white",
              },
              "& .MuiMenuItem-root": {
                color: "white",
                "&:hover": {
                  backgroundColor: "#333",
                  color: "#666",
                },
                "&.Mui-disabled": {
                  color: "#666",
                },
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
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
                background: "#cccccc",
                padding: 1,
                borderRadius: 1,
                color: "grey",
              }}
            >
              <span>Cüz {item.cuzNumber}:</span>

              {editedFields[item.cuzNumber] || !item.personName ? (
                <>
                  <TextField
                    size="small"
                    placeholder="Isminizi yaziniz"
                    value={nameInputs[item.cuzNumber] ?? item.personName}
                    onChange={(e) =>
                      handleInputChange(item.cuzNumber, e.target.value)
                    }
                    disabled={
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                    }
                    sx={{
                      background: "white",
                      border: "1px solid #ccc",
                      width: "170px",
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
                      backgroundColor:
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
                          ? "#ccc"
                          : "primary",
                      color:
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
                          ? "#666"
                          : "white",
                      cursor:
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
                          ? "not-allowed"
                          : "pointer",
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
                <span
                  style={{
                    cursor: isAdmin ? "pointer" : "default",
                    fontWeight: isAdmin ? "bold" : "normal",
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
                </span>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Uyarı</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Tamam</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cuzler;
