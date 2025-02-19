import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
} from "@mui/material";
import axios from "axios";

// Define the shape of a sura
interface Sura {
  _id: string;
  suraName: string;
  personName?: string;
  order: number; // Added order property
}

// Define the type for grouped suras
type GroupedSuras = {
  [suraName: string]: Sura[];
};

// Define the type for editing inputs
type EditingInputs = {
  [suraName: string]: {
    [id: string]: string;
  };
};

const GunlukSureler: React.FC = () => {
  const [list, setList] = useState<Sura[]>([]);
  const [groupedSuras, setGroupedSuras] = useState<GroupedSuras>({});
  const [editingInputs, setEditingInputs] = useState<EditingInputs>({});
  console.log(list);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/suras`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();

        // Log API response to debug order values
        console.log("API Response:", result?.response);

        // Sort suras by their `order` property in ascending order
        const sortedSuras = (result?.response || []).sort(
          (a: Sura, b: Sura) => a.order - b.order
        );

        // Debug the sorted array
        console.log("Sorted Suras:", sortedSuras);

        setList(sortedSuras.reverse());

        // Group suras by suraName
        const grouped: GroupedSuras = sortedSuras.reduce(
          (acc: GroupedSuras, sura: Sura) => {
            acc[sura.suraName] = acc[sura.suraName] || [];
            acc[sura.suraName].push(sura);
            return acc;
          },
          {}
        );
        setGroupedSuras(grouped);

        // Initialize editing inputs for each sura
        const initialEditingState: EditingInputs = Object.keys(grouped).reduce(
          (acc: any, suraName) => {
            acc[suraName] = grouped[suraName].reduce((subAcc, sura) => {
              subAcc[sura._id] = ""; // Initialize input value
              return subAcc;
            }, {} as { [suraId: string]: string });
            return acc;
          },
          {}
        );
        setEditingInputs(initialEditingState);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    suraName: string,
    suraId: string,
    value: string
  ) => {
    setEditingInputs((prev) => ({
      ...prev,
      [suraName]: {
        ...prev[suraName],
        [suraId]: value,
      },
    }));
  };

  const handleSubmit = (suraName: string, suraId: string) => {
    const name = editingInputs[suraName][suraId];
    if (!name) return;

    axios
      .patch(`https://ihya-2025-be0afcce5189.herokuapp.com/suras/${suraId}`, {
        personName: name,
      })
      .then(() => {
        // Reset input value after submission
        setEditingInputs((prev) => ({
          ...prev,
          [suraName]: {
            ...prev[suraName],
            [suraId]: "",
          },
        }));

        // Update the UI immediately
        setGroupedSuras((prev) => ({
          ...prev,
          [suraName]: prev[suraName].map((sura) =>
            sura._id === suraId ? { ...sura, personName: name } : sura
          ),
        }));
      })
      .catch((error) => {
        console.error("Error updating sura:", error);
      });
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#121212", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, color: "white", textAlign: "center" }}
      >
        Günlük Sureler
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {Object.keys(groupedSuras).map((suraName, index) => (
          <Box
            key={suraName}
            sx={{
              p: 2,
              border: "1px solid white",
              borderRadius: "8px",
              backgroundColor: "#1e1e1e",
            }}
          >
            <h3
              style={{
                fontFamily: "'Arial', 'Roboto', sans-serif", // Add fallback fonts
                textTransform: "uppercase", // Ensure consistency
                marginBottom: 2,
                color: "white",
                textAlign: "center",
              }}
            >
              {`${index + 1}. ${suraName}`}
            </h3>
            <List>
              {groupedSuras[suraName].map((sura, suraIndex) => (
                <ListItem
                  key={sura._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                  }}
                >
                  {/* Display 1 to 5 */}
                  <Typography sx={{ mr: 2, color: "white" }}>
                    {suraIndex + 1}
                  </Typography>
                  {/* If personName exists, display it as plain text */}
                  {sura.personName ? (
                    <Typography sx={{ color: "white" }}>
                      {sura.personName}
                    </Typography>
                  ) : (
                    // Otherwise, show the input area
                    <>
                      <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Isminizi yaziniz"
                        value={editingInputs[suraName]?.[sura._id] || ""}
                        onChange={(e) =>
                          handleInputChange(suraName, sura._id, e.target.value)
                        }
                        sx={{
                          flexGrow: 1,
                          marginRight: 2,
                          input: { color: "white" },
                        }}
                      />
                      {/* Show submit button only if input is not empty */}
                      {editingInputs[suraName]?.[sura._id] && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSubmit(suraName, sura._id)}
                        >
                          Ekle
                        </Button>
                      )}
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default GunlukSureler;
