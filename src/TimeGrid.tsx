import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import Grid from "@mui/material/Grid";
import { Box, Checkbox, Typography } from "@mui/material";

type NameStatus = {
  name: string;
  status: boolean;
  _id: string;
};

type HourData = {
  hour: string; // Example: "00:00"
  names: NameStatus[]; // Array of names with their status
  _id: string;
};

const TimeGrid: React.FC<{ selectedIslamicDate: string }> = ({
  selectedIslamicDate,
}) => {
  const [data, setData] = useState<HourData[]>([]); // State to hold grid data
  const [currentHour, setCurrentHour] = useState<number>(
    DateTime.now().setZone("Asia/Istanbul").hour
  );

  // Fetch data from backend
  useEffect(() => {
    if (!selectedIslamicDate) return; // Ensure we have a valid date before fetching

    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://ihya-2025-be0afcce5189.herokuapp.com/date/${selectedIslamicDate}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result.data); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Update the current hour every minute
    const interval = setInterval(() => {
      setCurrentHour(DateTime.now().setZone("Asia/Istanbul").hour);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedIslamicDate]); // Dependency includes selectedIslamicDate

  // Get the current Islamic date in Turkey
  const currentIslamicDate = DateTime.now()
    .setZone("Asia/Istanbul")
    .toFormat("yyyy-MM-dd");

  // Update status on the backend
  const updateStatus = async (
    hour: string,
    name: string,
    status: boolean,
    id: string
  ) => {
    console.log(hour, name, status, id);
    const selectedData = data.find((item) => item._id === id);
    const updatedData = {
      ...selectedData,
      names: selectedData?.names.map((item) =>
        item.name === name ? { ...item, status: status } : item
      ),
    };

    try {
      const response = await fetch(
        `https://ihya-2025-be0afcce5189.herokuapp.com/date/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData), // Send the updated data directly
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      console.log(`Updated ${name} at ${hour} to status: ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Determine tile color
  const getTileColor = (hour: number): string => {
    if (selectedIslamicDate < currentIslamicDate) {
      // Selected date is in the past
      return "#E57373"; // Red for all hours
    }

    if (selectedIslamicDate > currentIslamicDate) {
      // Selected date is in the future
      return "grey"; // Grey for all hours
    }

    // Selected date is today, check the time
    if (hour < currentHour) return "#E57373"; // Red for past hours
    if (hour === currentHour) return "#4CAF50"; // Green for the current hour
    return "grey"; // Grey for future hours
  };

  // Determine if editing is allowed
  // const canEdit = (hour: number): boolean => {
  //   return (
  //     selectedIslamicDate === currentIslamicDate && // Date must match
  //     hour === currentHour // Hour must match
  //   );
  // };

  return data?.length === 0 || data === undefined ? (
    <Box sx={{ height: "200px", background: "white" }}>
      <Typography variant="h6" align="center" sx={{ mt: 4, color: "grey" }}>
        Ileri tarihler icin isim listesi henuz hazir degil.
      </Typography>
    </Box>
  ) : (
    <Grid container spacing={2} style={{ padding: "20px" }}>
      {data?.map((hourData, index) => {
        const hour = parseInt(hourData.hour.split(":")[0], 10);
        const color = getTileColor(hour);
        // const isEditable = canEdit(hour); // Check if editing is allowed

        return (
          <Grid
            item
            xs={6} // Full-width on mobile
            sm={6} // Two columns on tablets
            md={4} // Three columns on desktops
            key={index}
          >
            <div
              style={{
                backgroundColor: color,
                padding: "10px",
                borderRadius: "8px",
                color: "white",
                textAlign: "center",
                height: "150px", // Fixed height
                display: "flex", // Align content inside
                flexDirection: "column",
                justifyContent: "center", // Center vertically
                alignItems: "center", // Center horizontally
              }}
            >
              <strong>🤲🏻 Saat {hourData.hour}</strong>
              <Grid container spacing={1} style={{ marginTop: "10px" }}>
                {hourData.names.map((nameStatus, i) => (
                  <Grid item xs={12} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <span style={{ minWidth: "50%" }}>
                        {nameStatus?.name}
                      </span>
                      <Checkbox
                        checked={nameStatus?.status}
                        // disabled={!isEditable} // Disable if not editable
                        sx={{
                          marginLeft: "10px",
                          "&.Mui-checked": {
                            color: "primary.main", // Material-UI blue
                          },
                        }}
                        onChange={(e) => {
                          const newStatus = e.target.checked;
                          updateStatus(
                            hourData.hour,
                            nameStatus.name,
                            newStatus,
                            hourData._id
                          ); // Call update function
                          setData((prevData) =>
                            prevData.map((entry) =>
                              entry.hour === hourData.hour
                                ? {
                                    ...entry,
                                    names: entry.names.map((name) =>
                                      name.name === nameStatus.name
                                        ? { ...name, status: newStatus }
                                        : name
                                    ),
                                  }
                                : entry
                            )
                          ); // Update state optimistically
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </div>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default TimeGrid;
