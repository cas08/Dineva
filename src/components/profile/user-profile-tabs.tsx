"use client";

import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { UserProfileInfo } from "./user-info";
import { UserBookings } from "@/components/profile/user-booking";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function UserProfileTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTabs-indicator": {
            backgroundColor: "var(--primary)",
          },
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="profile tabs"
          variant="fullWidth"
          textColor="inherit"
        >
          <Tab
            label="Інформація"
            sx={{
              color: "var(--secondary)",
              "&.Mui-selected": {
                color: "var(--primary)",
                fontWeight: "bold",
              },
            }}
          />
          <Tab
            label="Бронювання"
            sx={{
              color: "var(--secondary)",
              "&.Mui-selected": {
                color: "var(--primary)",
                fontWeight: "bold",
              },
            }}
          />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <UserProfileInfo />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UserBookings />
      </TabPanel>
    </Box>
  );
}
