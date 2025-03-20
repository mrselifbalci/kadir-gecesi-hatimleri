import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface CuzlerType {
  _id: string;
  hatimNumber: number;
  cuzNumber: number;
  personName: string;
}

const Cuzler: React.FC = () => {
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [filteredCuzlers, setFilteredCuzlers] = useState<CuzlerType[]>([]);
  const [selectedHatim, setSelectedHatim] = useState<number>(1);
  const [nameInputs, setNameInputs] = useState<Record<number, string>>({});
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(
    "Lütfen önceki cüzü tamamlayın, ardından bir sonraki cüze geçebilirsiniz."
  ); // Store message dynamically

  const isHatimComplete = (hatimNumber: number) => {
    const hatimCuzlers = cuzlers.filter(
      (cuz) => cuz.hatimNumber === hatimNumber
    );
    return hatimCuzlers.every(
      (cuz) => cuz.personName && cuz.personName.trim() !== ""
    );
  };
  const arePreviousHatimsComplete = (hatimNumber: number) => {
    for (let i = 1; i < hatimNumber; i++) {
      if (!isHatimComplete(i)) return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlers`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const sortedData = result.response.sort(
          (a: CuzlerType, b: CuzlerType) => a.cuzNumber - b.cuzNumber
        );

        setCuzlers(sortedData);
        filterByHatim(91, sortedData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filterByHatim = (hatimNumber: number, data: CuzlerType[] = cuzlers) => {
    const filtered = data
      .filter((item) => item.hatimNumber === hatimNumber)
      .sort((a, b) => a.cuzNumber - b.cuzNumber);

    setFilteredCuzlers(filtered);
    setSelectedHatim(hatimNumber);
  };

  const handleInputChange = (cuzNumber: number, value: string) => {
    setNameInputs((prev) => ({ ...prev, [cuzNumber]: value }));
  };

  const [updatedCuz, setUpdatedCuz] = useState<Record<number, boolean>>({});
  const [editedFields, setEditedFields] = useState<Record<number, boolean>>({}); // Track which fields are being edited

  const handleUpdateName = async (id: string, cuzNumber: number) => {
    const newName = nameInputs[cuzNumber]?.trim() ?? ""; // Allow empty string

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
        // Handle the "exists" case (e.g., show a message or prevent further update)
        alert(
          "Bu cuz baskasi tarafindan alindi. Sayfayi yenileyerek tekrar deneyin."
        );
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to update personName");
      }
      // 1️⃣ **Update both states to reflect the new (even blank) name immediately**
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

      // 2️⃣ **Show "Güncellendi" for 2 seconds, then hide button**
      setUpdatedCuz((prev) => ({ ...prev, [cuzNumber]: true }));

      setTimeout(() => {
        setUpdatedCuz((prev) => ({ ...prev, [cuzNumber]: false }));
        setEditedFields((prev) => ({ ...prev, [cuzNumber]: false })); // Disable input after update
        setNameInputs((prev) => ({ ...prev, [cuzNumber]: "" })); // Reset input field
      }, 2000);
    } catch (error: any) {
      console.log(error);
    }
  };

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

  const handlePasswordSubmit = () => {
    if (adminPassword === "LONDRA") {
      setIsAdmin(true);
    } else {
      alert("Yanlis sifre");
    }
  };
  const isPreviousCuzsFilled = (hatimNumber: number, cuzNumber: number) => {
    const hatimCuzlers = cuzlers.filter(
      (cuz) => cuz.hatimNumber === hatimNumber
    );
    return hatimCuzlers
      .slice(0, cuzNumber - 1) // Check only previous cüzs
      .every((cuz) => cuz.personName && cuz.personName.trim() !== "");
  };
  const generateRange = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // Example usage:
  const hatimNumbers = generateRange(1, 100); // Generates numbers from 10 to 90

  const hatimRows = hatimNumbers.reduce((acc, num, index) => {
    if (index % 5 === 0) acc.push([]);
    acc[acc.length - 1].push(num);
    return acc;
  }, [] as number[][]);

  // const deleteData = async () => {
  //   const hatimNumbersDelete = [93];
  //   try {
  //     const deleteRequests = hatimNumbersDelete.map((hatimNumber) =>
  //       fetch(
  //         `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlers/hatim/${hatimNumber}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       )
  //     );

  //     await Promise.all(deleteRequests);
  //     console.log("All delete requests completed.");
  //   } catch (error) {
  //     console.error("Error deleting data:", error);
  //   }
  // };

  return (
    <Box sx={{ color: "black", height: "100%", padding: 2 }}>
      {/* <button onClick={deleteData}>delete</button> */}
      <Box sx={{ color: "black", height: "100%", padding: 2 }}>
        {hatimRows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: "flex",
              gap: 1,
              marginBottom: 2,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {row.map((num) => (
              <Button
                key={num}
                variant={selectedHatim === num ? "contained" : "outlined"}
                onClick={() => {
                  if (!arePreviousHatimsComplete(num) && !isAdmin) {
                    setDialogMessage(
                      "Lütfen önceki hatmi tamamlayın, ardından bir sonraki hatime geçebilirsiniz."
                    );
                    setOpenDialog(true);
                  } else {
                    filterByHatim(num);
                  }
                }}
                sx={{
                  flex: 1,
                  minWidth: "auto",
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
        ))}
      </Box>
      {/* List of Cuzlers */}
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

            {/* Show Input Only If Editing, Otherwise Show Name */}
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
                  } // Disable input unless all previous cüzs are taken
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
                  } // Disable if input is disabled
                  sx={{
                    backgroundColor:
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                        ? "#ccc"
                        : "primary", // Gray out if disabled
                    color:
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                        ? "#666"
                        : "white", // Adjust text color
                    cursor:
                      !isPreviousCuzsFilled(item.hatimNumber, item.cuzNumber) &&
                      !isAdmin
                        ? "not-allowed"
                        : "pointer", // Show "not-allowed" cursor
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
              // Show name as text, allow admin to click to edit
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
                {item.personName || "—"} {/* Show dash if blank */}
              </span>
            )}
          </Box>
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

      {/* Download Excel Button (Visible only for admin) */}
      {isAdmin && (
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </Button>
      )}
    </Box>
  );
};

export default Cuzler;
