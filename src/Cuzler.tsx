import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import React, { useState, useMemo, useCallback, useRef } from "react";
import { Visibility, VisibilityOff, ExpandMore } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
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
  adminPassword: string;
  setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handlePasswordSubmit: () => void;
  filteredCuzlers: CuzlerType[];
  setFilteredCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  filterByHatim: (hatimNumber: number, data?: CuzlerType[]) => void;
  selectedHatim: number;
  setSelectedHatim: React.Dispatch<React.SetStateAction<number>>;
}

// Memoized component for accordion content
const AccordionContent = React.memo(
  ({
    section,
    selectedHatim,
    filteredCuzlers,
    isAdmin,
    nameInputs,
    editedFields,
    updatedCuz,
    handleInputChange,
    handleUpdateName,
    handleHatimClick,
    isPreviousCuzsFilled,
    arePreviousHatimsComplete,
    setEditedFields,
  }: {
    section: { start: number; end: number; hatims: number[] };
    selectedHatim: number;
    filteredCuzlers: CuzlerType[];
    isAdmin: boolean;
    nameInputs: Record<number, string>;
    editedFields: Record<number, boolean>;
    updatedCuz: Record<number, boolean>;
    handleInputChange: (cuzNumber: number, value: string) => void;
    handleUpdateName: (id: string, cuzNumber: number) => void;
    handleHatimClick: (num: number) => void;
    isPreviousCuzsFilled: (hatimNumber: number, cuzNumber: number) => boolean;
    arePreviousHatimsComplete: (num: number) => boolean;
    setEditedFields: React.Dispatch<
      React.SetStateAction<Record<number, boolean>>
    >;
  }) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
            width: "100%",
          }}
        >
          {[...section.hatims]
            .sort((a, b) => a - b)
            .map((num) => (
              <Button
                key={num}
                variant={selectedHatim === num ? "contained" : "outlined"}
                onClick={() => handleHatimClick(num)}
                sx={{
                  minWidth: "100px",
                  fontSize: "0.8rem",
                  padding: "6px 8px",
                  backgroundColor:
                    !arePreviousHatimsComplete(num) && !isAdmin
                      ? "#f0f0f0"
                      : "",
                  color:
                    !arePreviousHatimsComplete(num) && !isAdmin ? "#999" : "",
                  cursor:
                    !arePreviousHatimsComplete(num) && !isAdmin
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Hatim {num}
              </Button>
            ))}
        </Box>

        {section.hatims.includes(selectedHatim) && (
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
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
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
                        !isPreviousCuzsFilled(
                          item.hatimNumber,
                          item.cuzNumber
                        ) && !isAdmin
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
        )}
      </Box>
    );
  }
);

const Cuzlers = ({
  setCurrentHatim,
  isAdmin,
  cuzlers,
  setCuzlers,
  adminPassword,
  setAdminPassword,
  showPassword,
  setShowPassword,
  handlePasswordSubmit,
  filteredCuzlers,
  setFilteredCuzlers,
  filterByHatim,
  selectedHatim,
  setSelectedHatim,
}: CuzlersTypeProps) => {
  const [nameInputs, setNameInputs] = useState<Record<number, string>>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | false>(false);
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
  const uniqueHatimNumbers = useMemo(
    () => [...new Set(allHatimNumbers)],
    [allHatimNumbers]
  );
  const lastHatim = useMemo(
    () => Math.max(...uniqueHatimNumbers),
    [uniqueHatimNumbers]
  );

  // Memoize section creation
  const hatimSections = useMemo(() => {
    const sections = [];
    for (let i = 1; i <= lastHatim; i += 50) {
      const sectionHatims = uniqueHatimNumbers.filter(
        (num) => num >= i && num < i + 50
      );
      if (sectionHatims.length > 0) {
        sections.push({
          start: i,
          end: Math.min(i + 49, lastHatim),
          hatims: sectionHatims,
        });
      }
    }
    return sections;
  }, [lastHatim, uniqueHatimNumbers]);

  const lastSectionIndex = useMemo(
    () => hatimSections.length - 1,
    [hatimSections]
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

  // Set the last section as expanded by default
  React.useEffect(() => {
    setExpandedSection(lastSectionIndex);
  }, [lastSectionIndex]);

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

  const generateRange = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // Create sections of 50 hatims each
  const createHatimSections = () => {
    const sections = [];
    for (let i = 1; i <= lastHatim; i += 50) {
      const sectionHatims = uniqueHatimNumbers.filter(
        (num) => num >= i && num < i + 50
      );
      if (sectionHatims.length > 0) {
        sections.push({
          start: i,
          end: Math.min(i + 49, lastHatim),
          hatims: sectionHatims,
        });
      }
    }
    return sections;
  };

  return (
    <Box sx={{ color: "black", height: "100%", padding: 2 }}>
      <Box sx={{ color: "black", height: "100%", padding: 2 }}>
        {hatimSections.map((section, sectionIndex) => (
          <Accordion
            key={sectionIndex}
            sx={{ mb: 1 }}
            expanded={expandedSection === sectionIndex}
            onChange={(_, isExpanded) =>
              setExpandedSection(isExpanded ? sectionIndex : false)
            }
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#f5f5f5",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <Typography>
                Hatim {section.start} - {section.end}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <AccordionContent
                section={section}
                selectedHatim={selectedHatim}
                filteredCuzlers={filteredCuzlers}
                isAdmin={isAdmin}
                nameInputs={nameInputs}
                editedFields={editedFields}
                updatedCuz={updatedCuz}
                handleInputChange={handleInputChange}
                handleUpdateName={handleUpdateName}
                handleHatimClick={handleHatimClick}
                isPreviousCuzsFilled={isPreviousCuzsFilled}
                arePreviousHatimsComplete={arePreviousHatimsComplete}
                setEditedFields={setEditedFields}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle style={{ fontWeight: "bold", textAlign: "center" }}>
          ⚠️ Uyarı
        </DialogTitle>
        <DialogContent>
          <p style={{ textAlign: "center" }}>{dialogMessage}</p>
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            color="primary"
          >
            Tamam
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Password Input */}
      {!isAdmin && (
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

      {isAdmin && (
        <Button component={Link} to="/admin">
          Admin Paneli
        </Button>
      )}
    </Box>
  );
};

export default Cuzlers;
