import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import TransactionInsights from './TransactionInsights';
import CreditCardRecommendations from './CreditCardRecommendations';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Analysis() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Analysis
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
          <Tab label="Insights" />
          <Tab label="Credit Cards" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TransactionInsights />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <CreditCardRecommendations />
      </TabPanel>
    </Box>
  );
}

export default Analysis;