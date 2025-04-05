import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
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
import {
  Visibility,
  VisibilityOff,
  Error as ErrorIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { useState } from "react";
import { Link } from "react-router-dom";

interface AdminProps {
  isAdmin: boolean;
  cuzlers: CuzlerType[];
  setCuzlers: React.Dispatch<React.SetStateAction<CuzlerType[]>>;
  handlePasswordSubmit: (password: string) => void;
  handleLogout: () => void;
}

const Admin = ({
  isAdmin,
  cuzlers,
  setCuzlers,
  handlePasswordSubmit,
  handleLogout,
}: AdminProps) => {
  const [localPassword, setLocalPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newHatimsToAdd, setNewHatimsToAdd] = useState<number | undefined>();
  const [fullHatimNo, setFullHatimNo] = useState<number | undefined>();
  const [fullHatimName, setFullHatimName] = useState<string | undefined>();
  const [eklendiConfirm, setEklendiConfirm] = useState(false);
  const [eklendiConfirm2, setEklendiConfirm2] = useState(false);
  const [selectedHatims, setSelectedHatims] = useState<number[]>([]);
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

        // Create new cuzlers entries for each new hatim
        const newCuzlers = newHatimNumbers.flatMap((hatimNumber) =>
          Array.from({ length: 30 }, (_, i) => ({
            _id: `${hatimNumber}-${i + 1}`, // Temporary ID
            hatimNumber,
            cuzNumber: i + 1,
            personName: "",
          }))
        );

        // Update the cuzlers state with new entries
        setCuzlers((prevCuzlers) => [...prevCuzlers, ...newCuzlers]);

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
  const handleLocalPasswordSubmit = () => {
    handlePasswordSubmit(localPassword);
    setLocalPassword("");
  };
  return (
    <Box sx={{ height: "100%", p: 3 }}>
      {isAdmin ? (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" component="h1">
              Admin Paneli
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Çıkış Yap
            </Button>
          </Box>
          <Box
            sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3, mb: 3 }}
          >
            <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "&:hover fieldset": {
                      borderColor: "white",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                    },
                    "& input": {
                      color: "white",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white",
                    opacity: 0.7,
                  },
                }}
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
            <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
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
                {[...uniqueHatimNumbers]
                  .sort((a, b) => a - b)
                  .filter((hatimNo) => {
                    const hatimCuzlers = cuzlers.filter(
                      (c) => c.hatimNumber === hatimNo
                    );
                    return hatimCuzlers.every((c) => !c.personName);
                  }).length > 0 ? (
                  <>
                    <FormLabel sx={{ color: "white" }}>
                      Boş Olan Hatimler
                    </FormLabel>
                    <FormGroup
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 1,
                      }}
                    >
                      {[...uniqueHatimNumbers]
                        .sort((a, b) => a - b)
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
                                sx={{
                                  color: "white",
                                  "&.Mui-checked": {
                                    color: "#1976d2",
                                  },
                                }}
                              />
                            }
                            label={`Hatim ${num}`}
                            sx={{ color: "white" }}
                          />
                        ))}
                    </FormGroup>
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "#EF5350",
                      fontSize: "1.2em",
                      fontWeight: "bold",
                      mt: 1,
                    }}
                  >
                    <ErrorIcon sx={{ fontSize: 30, color: "#EF5350" }} />
                    <Typography sx={{ color: "#EF5350" }}>
                      Hiç boş hatim bulunmuyor, yukarıdaki kısımdan yeni hatim
                      ekleyin.
                    </Typography>
                  </Box>
                )}
              </FormControl>
              <TextField
                multiline
                minRows={4}
                size="small"
                type={"text"}
                placeholder="Okuyacak isim"
                value={fullHatimName === undefined ? "" : fullHatimName}
                onChange={(e) => setFullHatimName(e.target.value)}
                disabled={
                  [...uniqueHatimNumbers]
                    .sort((a, b) => a - b)
                    .filter((hatimNo) => {
                      const hatimCuzlers = cuzlers.filter(
                        (c) => c.hatimNumber === hatimNo
                      );
                      return hatimCuzlers.every((c) => !c.personName);
                    }).length === 0
                }
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "&:hover fieldset": {
                      borderColor: "white",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                    },
                    "& textarea": {
                      color: "white",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white",
                    opacity: 0.7,
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={addFullHatim}
                sx={{ ml: 1 }}
                disabled={
                  [...uniqueHatimNumbers]
                    .sort((a, b) => a - b)
                    .filter((hatimNo) => {
                      const hatimCuzlers = cuzlers.filter(
                        (c) => c.hatimNumber === hatimNo
                      );
                      return hatimCuzlers.every((c) => !c.personName);
                    }).length === 0
                }
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "white",
                  },
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                  "& input": {
                    color: "white",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "white",
                  opacity: 0.7,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "white" }}
                    >
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
