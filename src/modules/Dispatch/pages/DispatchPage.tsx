import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Pagination,
  Grid,
} from "@mui/material";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
//import Error404Page from "@/modules/core/pages/Error404Page";
import NotFound from "@/pages/OtherPage/NotFound";
import LockedFeature from '@/modules/core/components/LockedFeature'
import UnderConstruction from '@/modules/core/components/UnderConstruction';

export const DispatchPage: React.FC = () => {
  if (!checkModuleExists(systemModule.Dispatch)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Dispatch" /> : <NotFound />;
  }

  return <UnderConstruction pageName="Dispatch" />;
};

export default DispatchPage;
