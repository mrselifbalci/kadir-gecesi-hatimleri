import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { CuzlerType } from "./Cuzler";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SuperAdminProps {
  isSuperAdmin: boolean;
  cuzlers: CuzlerType[];
  setCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  handlePasswordSubmit: (password: string) => void;
}

const SuperAdmin = ({
  isSuperAdmin,
  cuzlers,
  setCuzlers,
  handlePasswordSubmit,
}: SuperAdminProps) => {
  const navigate = useNavigate();
  const [localPassword, setLocalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newHatimsToAdd, setNewHatimsToAdd] = useState<number | undefined>();
  const [fullHatimNo, setFullHatimNo] = useState<number | undefined>();
  const [fullHatimName, setFullHatimName] = useState<string | undefined>();
  const [eklendiConfirm, setEklendiConfirm] = useState(false);
  const [eklendiConfirm2, setEklendiConfirm2] = useState(false);
  const [hatimNumbersToDelete, setHatimNumbersToDelete] = useState<string>("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [numbersToDelete, setNumbersToDelete] = useState<number[]>([]);
  const [selectedHatims, setSelectedHatims] = useState<number[]>([]);

  const handleLocalPasswordSubmit = () => {
    handlePasswordSubmit(localPassword);
    setLocalPassword("");
  };

  const handleDownloadExcel = () => {
    const formattedData = cuzlers
      .sort((a, b) => a.hatimNumber - b.hatimNumber)
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

  const hatimNumbers = cuzlers.map((c) => c.hatimNumber);
  const uniqueHatimNumbers = [...new Set(hatimNumbers)];
  const lastHatim = Math.max(...uniqueHatimNumbers);

  const addNewHatims = async () => {
    if (newHatimsToAdd && newHatimsToAdd > 0) {
      const startingNumber = uniqueHatimNumbers.length > 0 ? lastHatim + 1 : 1;
      const newHatimNumbers = Array.from(
        { length: newHatimsToAdd },
        (_, i) => startingNumber + i
      );

      try {
        const response = await fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlersdata`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ hatimNumbers: newHatimNumbers }),
          }
        );
        console.log(response);
        setEklendiConfirm(true);
        setNewHatimsToAdd(undefined);
        setTimeout(() => {
          setEklendiConfirm(false);
        }, 400);
      } catch (error: unknown) {
        console.log(error);
      }
    }
  };

  const deleteData = async (hatimNumbersToDelete: number[]) => {
    try {
      const deleteRequests = hatimNumbersToDelete.map((hatimNumber) =>
        fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlers/hatim/${hatimNumber}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      );

      await Promise.all(deleteRequests);
      console.log("All delete requests completed.");
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const addFullHatim = async () => {
    if (selectedHatims.length === 0) {
      alert("Lütfen en az bir hatim seçiniz.");
      return;
    }

    if (!fullHatimName) {
      alert("Lütfen okuyacak kişinin ismini giriniz.");
      return;
    }

    try {
      // Delete existing data for selected hatims
      await deleteData(selectedHatims);

      // Add new data with the person's name
      const response = await fetch(
        `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlersdatawithname`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hatimNumbers: selectedHatims,
            personName: fullHatimName,
          }),
        }
      );
      const data = await response.json();
      console.log(data);

      // Update the cuzlers state to reflect the changes immediately
      setCuzlers((prevCuzlers) =>
        prevCuzlers.map((cuz) =>
          selectedHatims.includes(cuz.hatimNumber)
            ? { ...cuz, personName: fullHatimName }
            : cuz
        )
      );

      setEklendiConfirm2(true);
      setSelectedHatims([]);
      setFullHatimName(undefined);
      setTimeout(() => {
        setEklendiConfirm2(false);
      }, 500);
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const handleDeleteClick = () => {
    const numbers = hatimNumbersToDelete
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    if (numbers.length === 0) {
      alert("Lütfen geçerli hatim numaralarını giriniz");
      return;
    }

    setNumbersToDelete(numbers);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteData(numbersToDelete);
      setCuzlers((prevCuzlers) =>
        prevCuzlers.filter((cuz) => !numbersToDelete.includes(cuz.hatimNumber))
      );
      setHatimNumbersToDelete("");
      setOpenConfirmDialog(false);
      alert("Hatimler başarıyla silindi");
      localStorage.setItem("forceRefresh", "true");
    } catch (error) {
      alert("Hatim silme işlemi başarısız oldu");
    }
  };

  return (
    <Box sx={{ background: "white", height: "100%", p: 3 }}>
      {isSuperAdmin ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" component="h1">
              Süper Admin Paneli
            </Typography>
          </Box>
          <Box
            sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3, mb: 3 }}
          >
            <Typography variant="h5" sx={{ color: "black", mb: 1 }}>
              Kaç yeni boş hatim eklemek istiyorsunuz?
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                size="small"
                type={"number"}
                placeholder="Hatim sayisi"
                value={newHatimsToAdd === undefined ? "" : newHatimsToAdd}
                onChange={(e) =>
                  setNewHatimsToAdd(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={addNewHatims}
                sx={{ ml: 1 }}
              >
                Ekle
              </Button>
              {eklendiConfirm && (
                <Typography variant="body1" sx={{ color: "red", ml: 2 }}>
                  Eklendi
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3 }}>
            <Typography variant="h5" sx={{ color: "black", mb: 1 }}>
              Full hatim olarak eklemek istediginiz hatim numaralarini ve
              okuyacak ismi yazip 'Ekle' butonuna tiklayiniz.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel sx={{ color: "black" }}>Hatim Numaraları</FormLabel>
                <FormGroup>
                  {uniqueHatimNumbers
                    .filter((hatimNo) => {
                      const hatimCuzlers = cuzlers.filter(
                        (c) => c.hatimNumber === hatimNo
                      );
                      return hatimCuzlers.every((c) => !c.personName);
                    })
                    .map((num) => (
                      <FormControlLabel
                        key={num}
                        control={
                          <Checkbox
                            checked={selectedHatims.includes(num)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedHatims([...selectedHatims, num]);
                              } else {
                                setSelectedHatims(
                                  selectedHatims.filter((h) => h !== num)
                                );
                              }
                            }}
                          />
                        }
                        label={`Hatim ${num}`}
                        sx={{ color: "black" }}
                      />
                    ))}
                </FormGroup>
              </FormControl>
              <TextField
                multiline
                minRows={4}
                size="small"
                type={"text"}
                placeholder="Okuyacak isim"
                value={fullHatimName === undefined ? "" : fullHatimName}
                onChange={(e) => setFullHatimName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={addFullHatim}
                sx={{ ml: 1 }}
              >
                Ekle
              </Button>
              {eklendiConfirm2 && (
                <Typography variant="body1" sx={{ color: "red", ml: 2 }}>
                  Eklendi
                </Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3, mt: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={handleDownloadExcel}
            >
              Download Excel
            </Button>
          </Box>
          <Box
            sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3, mt: 3 }}
          >
            <Typography variant="h5" sx={{ color: "black", mb: 1 }}>
              Hatim Silme
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                Silmek istediğiniz hatim numaralarını virgülle ayırarak giriniz
                (örn: 1,2,3)
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Örn: 1,2,3"
                  value={hatimNumbersToDelete}
                  onChange={(e) => setHatimNumbersToDelete(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleDeleteClick}
                >
                  Sil
                </Button>
              </Box>
            </Box>
          </Box>

          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
          >
            <DialogTitle>Silme İşlemini Onayla</DialogTitle>
            <DialogContent>
              <Typography>
                {numbersToDelete.length > 0 &&
                  `${numbersToDelete.join(
                    ", "
                  )} numaralı hatimleri silmek istediğinizden emin misiniz?`}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirmDialog(false)}>İptal</Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
              >
                Sil
              </Button>
            </DialogActions>
          </Dialog>
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
          <Typography sx={{ color: "white" }}>Süper Admin Girişi</Typography>
          <Box
            sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1 }}
          >
            <TextField
              size="small"
              type={showPassword ? "text" : "password"}
              placeholder="Süper Admin şifresi"
              value={localPassword}
              onChange={(e) => setLocalPassword(e.target.value)}
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
              onClick={handleLocalPasswordSubmit}
            >
              Tamam
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SuperAdmin;
