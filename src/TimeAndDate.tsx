import React, { useState, useEffect } from "react";
import moment from "moment-hijri";
import momentTimezone from "moment-timezone"; // Import moment-timezone
import {
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
} from "@mui/material";

type TimeAndDateProps = {
  onDateChange: (selectedDate: string) => void;
};

const TimeAndDate: React.FC<TimeAndDateProps> = ({ onDateChange }) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [islamicDate, setIslamicDate] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>(""); // Selected Islamic day
  const [currentIslamicDayTurkey, setCurrentIslamicDayTurkey] =
    useState<number>(0);

  useEffect(() => {
    moment.locale("en");

    const interval = setInterval(() => {
      // Get the current time in Turkey
      const turkeyDate = momentTimezone().tz("Asia/Istanbul");
      // console.log(turkeyDate);
      // Set Turkey's current time
      const timeInTurkey = turkeyDate.format("HH:mm:ss");
      setCurrentTime(timeInTurkey);

      // Calculate the current Islamic day in Turkey
      const islamicDayInTurkey = parseInt(moment(turkeyDate).format("iD"), 10);
      setCurrentIslamicDayTurkey(islamicDayInTurkey);

      // Default `selectedDay` to the current Islamic day in Turkey if not already set
      if (!selectedDay) {
        setSelectedDay(islamicDayInTurkey.toString());
      }
      // Update the displayed Islamic date in Turkey
      const hijriDateTurkey = moment(turkeyDate.toDate())
        .iDate(islamicDayInTurkey)
        .locale("en")
        .format("iD iMMMM");
      setIslamicDate(hijriDateTurkey);

      // Notify the parent component of the selected date change
      onDateChange(
        moment(turkeyDate.toDate())
          .iDate(parseInt(selectedDay || islamicDayInTurkey.toString(), 10))
          .format("YYYY-MM-DD")
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDay, onDateChange]);

  const handleDateChange = (event: SelectChangeEvent) => {
    setSelectedDay(event.target.value); // Update the selected day
  };

  return (
    <Box
      sx={{
        fontFamily: "Arial",
        fontSize: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
      }}
    >
      <Box>
        <Typography variant="h6">Türkiye Saati</Typography>
        <Typography variant="h5">{currentTime}</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Hicri Tarih</Typography>
        <Typography variant="h5">{islamicDate}</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">Tarihi değiştir:</Typography>
        <Select
          value={selectedDay}
          onChange={handleDateChange}
          sx={{
            mt: 1,
            minWidth: "150px",
            color: "white", // Text color for the selected item
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "white", // Border color
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "white", // Border color when focused
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "white", // Border color on hover
            },
            ".MuiSvgIcon-root": {
              color: "white", // Dropdown arrow color
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "black", // Background color for dropdown
                color: "white", // Text color for dropdown items
              },
            },
          }}
        >
          {Array.from({ length: 30 }, (_, i) => i + 7).map((day) => (
            <MenuItem
              key={day}
              value={day.toString()}
              disabled={day > currentIslamicDayTurkey} // Disable future days based on Turkey's Islamic day
              sx={{
                backgroundColor: "black", // Background color for each item
                "&:hover": {
                  backgroundColor: "grey", // Background color on hover
                },
                color: day > currentIslamicDayTurkey ? "grey" : "white", // Grey out future dates
              }}
            >
              {day}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
};

export default TimeAndDate;
