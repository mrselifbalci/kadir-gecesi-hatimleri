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
import { useState } from "react";
import { Link } from "react-router-dom";

interface AdminProps {
  isAdmin: boolean;
  cuzlers: CuzlerType[];
  setCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  handlePasswordSubmit: (password: string) => void;
}

const Admin = ({ isAdmin, cuzlers, handlePasswordSubmit }: AdminProps) => {
  const [localPassword, setLocalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newHatimsToAdd, setNewHatimsToAdd] = useState<number | undefined>();
  const [fullHatimNo, setFullHatimNo] = useState<number | undefined>();
  const [fullHatimName, setFullHatimName] = useState<string | undefined>();
  const [eklendiConfirm, setEklendiConfirm] = useState(false);
  const [eklendiConfirm2, setEklendiConfirm2] = useState(false);
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
  const hatimNumbers = cuzlers.map((c) => c.hatimNumber);
  const uniqueHatimNumbers = [...new Set(hatimNumbers)];
  const lastHatim = Math.max(...uniqueHatimNumbers);
  const addNewHatims = async () => {
    if (newHatimsToAdd && newHatimsToAdd > 0) {
      const newHatimNumbers = Array.from(
        { length: newHatimsToAdd },
        (_, i) => lastHatim + i + 1
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
    const filteredCuzler = cuzlers.filter(
      (item) => item.hatimNumber === fullHatimNo
    );
    if (fullHatimNo && fullHatimNo > lastHatim) {
      alert("Boyle bir hatim bulunmuyor. Once hatim eklemeniz gerekiyor.");
      return;
    }
    if (filteredCuzler.some((item) => item.personName)) {
      alert("Bu hatimde alinmis cuzler var. Full hatim ekleyemezsiniz.");
      return;
    } else {
      if (fullHatimNo) {
        await deleteData([fullHatimNo]);

        try {
          const response = await fetch(
            `https://ihya-2025-be0afcce5189.herokuapp.com/cuzlersdatawithname`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                hatimNumbers: [fullHatimNo],
                personName: fullHatimName,
              }),
            }
          );
          const data = await response.json();
          console.log(data);
          setEklendiConfirm2(true);
          setFullHatimNo(undefined);
          setFullHatimName(undefined);
          setTimeout(() => {
            setEklendiConfirm2(false);
          }, 500);
        } catch (error: unknown) {
          console.log(error);
        }
      }
    }
  };
  const handleLocalPasswordSubmit = () => {
    handlePasswordSubmit(localPassword);
    setLocalPassword("");
  };
  return (
    <Box sx={{ background: "white", height: "100vh", p: 3 }}>
      {isAdmin ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" component="h1">
              Admin Paneli
            </Typography>
          </Box>
          <Box
            sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3, mb: 3 }}
          >
            <Typography variant="h5" sx={{ color: "black", mb: 1 }}>
              Eklemek istediginiz yeni hatim sayisini yazip 'Ekle' tusuna
              basiniz.
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
              Full hatim olarak eklemek istediginiz hatim numarasini ve okuyacak
              ismi yazip 'Ekle' butonuna tiklayiniz.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <TextField
                size="small"
                type={"number"}
                placeholder="Hatim numarasi"
                value={fullHatimNo === undefined ? "" : fullHatimNo}
                onChange={(e) =>
                  setFullHatimNo(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                sx={{ mb: 2 }}
              />
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

export default Admin;
