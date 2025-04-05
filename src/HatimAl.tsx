import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
} from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { CuzlerType } from "./Cuzler";

const HatimAl = () => {
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [fullHatimName, setFullHatimName] = useState<string>("");
  const [hatimCount, setHatimCount] = useState<string>("");
  const [eklendiConfirm, setEklendiConfirm] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [assignedHatims, setAssignedHatims] = useState<number[]>([]);

  // Fetch cuzlers data on component mount
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
    if (!hatimCount || parseInt(hatimCount) <= 0) {
      alert("Lütfen kaç hatim almak istediğinizi giriniz.");
      return;
    }

    if (!fullHatimName) {
      alert("Lütfen okuyacak kişinin ismini giriniz.");
      return;
    }

    // Get available hatims (those with all cüzler unassigned)
    const availableHatims = [...new Set(cuzlers.map((c) => c.hatimNumber))]
      .filter((hatimNo) => {
        const hatimCuzlers = cuzlers.filter((c) => c.hatimNumber === hatimNo);
        return hatimCuzlers.every((c) => !c.personName);
      })
      .sort((a, b) => a - b);

    if (availableHatims.length === 0) {
      setErrorModalOpen(true);
      return;
    }

    const requestedCount = parseInt(hatimCount);
    const selectedHatims = availableHatims.slice(0, requestedCount);

    if (selectedHatims.length < requestedCount) {
      alert(`Sadece ${selectedHatims.length} adet boş hatim bulunmaktadır.`);
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

      setAssignedHatims(selectedHatims);
      setSuccessModalOpen(true);
      setHatimCount("");
      setFullHatimName("");
    } catch (error) {
      console.error("Error adding full hatim:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #121212 0%, #1a237e 100%)",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 600,
          mt: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(18, 18, 18, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
              sx={{
                fontWeight: 700,
                color: "#f5f5f5",
                mb: 1,
                textAlign: "center",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                mt: 2,
              }}
            >
              Tam Hatim Al
            </Typography>

            <Divider
              sx={{
                width: "100%",
                mb: 4,
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            />

            <Typography
              sx={{
                color: "white",
                mb: 3,
                textAlign: "center",
                fontSize: "1.1rem",
              }}
            >
              Almak istediğiniz hatim sayısını ve isminizi yazarak ekleye
              basınız
            </Typography>

            <TextField
              size="medium"
              type="number"
              placeholder="Kaç hatim almak istiyorsunuz?"
              value={hatimCount}
              onChange={(e) => setHatimCount(e.target.value)}
              sx={{
                width: "100%",
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "12px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#90caf9",
                  },
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            />

            <TextField
              multiline
              minRows={4}
              size="medium"
              type="text"
              placeholder="İsminiz"
              value={fullHatimName}
              onChange={(e) => setFullHatimName(e.target.value)}
              sx={{
                width: "100%",
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    borderRadius: "12px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#90caf9",
                  },
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                },
              }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={addFullHatim}
              sx={{
                background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                boxShadow: "0 3px 15px rgba(21, 101, 192, 0.3)",
                borderRadius: "12px",
                padding: "12px 36px",
                fontSize: "1.1rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(21, 101, 192, 0.4)",
                  background:
                    "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                },
              }}
            >
              Hatim Al
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
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
          Allah Kabul Etsin
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: "1.1rem", textAlign: "center" }}>
            <span
              style={{
                color: "#4CAF50",
                fontSize: "1.3em",
                fontWeight: "bold",
              }}
            >
              {assignedHatims.length} hatim aldınız.
            </span>
          </Typography>
          <Typography sx={{ mt: 2, textAlign: "center" }}>
            Hatim numaralarınız: {assignedHatims.join(", ")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button
            onClick={() => setSuccessModalOpen(false)}
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

      <Dialog
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
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
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#EF5350",
            fontSize: "1.5em",
            fontWeight: "bold",
            justifyContent: "center",
          }}
        >
          <ErrorIcon sx={{ fontSize: 40, color: "#EF5350" }} />
          Hatim Alınamadı
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: "1.1rem", textAlign: "center" }}>
            Şu anda boş hatim bulunmamaktadır. Lütfen yeni hatim eklenmesini
            bekleyiniz. Ya da ilgili kişiye hatırlatınız.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button
            onClick={() => setErrorModalOpen(false)}
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

export default HatimAl;
