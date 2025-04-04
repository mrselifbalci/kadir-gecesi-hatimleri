import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useState, useEffect } from "react";
import { CuzlerType } from "./Cuzler";

const HatimAl = () => {
  const [cuzlers, setCuzlers] = useState<CuzlerType[]>([]);
  const [fullHatimName, setFullHatimName] = useState<string>("");
  const [hatimCount, setHatimCount] = useState<string>("");
  const [eklendiConfirm, setEklendiConfirm] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
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
      alert("Şu anda boş hatim bulunmamaktadır.");
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Hatim Al
      </Typography>

      <Box sx={{ border: "solid 2px grey", borderRadius: "8px", p: 3 }}>
        <Typography variant="h5" sx={{ color: "white", mb: 1 }}>
          Kaç hatim almak istediğinizi ve adınızı yazarak ekle'ye basınız.
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <TextField
            size="small"
            type="number"
            placeholder="Kaç hatim almak istiyorsunuz?"
            value={hatimCount}
            onChange={(e) => setHatimCount(e.target.value)}
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
                color: "white",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "white",
                opacity: 0.7,
              },
            }}
          />
          <TextField
            multiline
            minRows={4}
            size="small"
            type="text"
            placeholder="Okuyacak isim"
            value={fullHatimName}
            onChange={(e) => setFullHatimName(e.target.value)}
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
                color: "white",
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
          >
            Ekle
          </Button>
        </Box>
      </Box>

      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#333",
            color: "white",
          },
        }}
      >
        <DialogTitle>Allah kabul etsin</DialogTitle>
        <DialogContent>
          <Typography>
            <span
              style={{
                color: "#4CAF50",
                fontSize: "1.2em",
                fontWeight: "bold",
              }}
            >
              {assignedHatims.length} hatim aldınız.
            </span>{" "}
            Hatim numaralarınız: {assignedHatims.join(", ")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessModalOpen(false)} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HatimAl;
