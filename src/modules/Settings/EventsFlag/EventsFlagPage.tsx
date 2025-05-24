import { useEffect, useState } from "react";
import PageMeta from '@/components/common/PageMeta';
import {
  MenuItem, Select, Typography, Box, FormControl, InputLabel, Button, CircularProgress,
  TextField, Divider, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { Check } from 'lucide-react';
import { fetchEventsFlagOptions, fetchEventsFlag, updateEventsFlag } from "./apis/apis";
import { IEventFlags } from "./interfaces/interfaces";
import { toast } from "react-toastify";
import { systemPlan, systemModule } from '@/utils/constants'
import { checkModuleExists, checkPlanExists } from '@/lib/moduleUtils';
import Error404Page from "@/modules/core/pages/Error404Page";
import LockedFeature from '@/modules/core/components/LockedFeature'
import GeneralTab from "./components/GeneralTab";
import AIDashCamTab from "./components/AIDashCamTab";
import HistoryTab from "./components/HistoryTab";

interface EventFlagOptions {
  flag: "High" | "Medium" | "Low";
  channel: number;
  duration: number;
}

interface EventFlagsData {
  vehicleEventsFlag: Record<string, EventFlagOptions>;
  vehicleEventsFlagName: Record<string, string>;
}

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
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EventsFlagPage: React.FC = () => {
  if (!checkModuleExists(systemModule.SettingsEventsFlag)) {
    return checkPlanExists(systemPlan.FreeTrial) ? <LockedFeature featureName="Events Flag" /> : <Error404Page />;
  }
  const isMapAIDashCamModuleAvailable = checkModuleExists(systemModule.MapAIDashCam);

  const [eventFlags, setEventFlags] = useState<Record<string, "High" | "Medium" | "Low"> | null>(null);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
  const [notificationSettings, setNotificationSettings] = useState<Record<string, string | boolean | number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch default event flag options (names & default values)
        const optionsData: EventFlagsData = await fetchEventsFlagOptions();
        setEventNames(optionsData.vehicleEventsFlagName);

        // Extract default flag values from vehicleEventsFlag
        const defaultFlags = Object.fromEntries(
          Object.entries(optionsData.vehicleEventsFlag).map(([key, value]) => [key, value.flag])
        ) as Record<string, "High" | "Medium" | "Low">;

        console.log("defaultFlags =", defaultFlags);
        setEventFlags(defaultFlags);

        // Fetch latest values (may be empty)
        const updatedData = await fetchEventsFlag();

        if (updatedData.metadata) {
          setNotificationSettings(updatedData.metadata);
          setEventFlags((prevFlags) => {
            if (!prevFlags) return null;
            const newFlags: Record<string, "High" | "Medium" | "Low"> = { ...prevFlags };
            Object.entries(updatedData.metadata).forEach(([key, value]) => {
              if (value === "High" || value === "Medium" || value === "Low") {
                newFlags[key] = value;
              }
            });
            return newFlags;
          });
        }

      } catch (error) {
        console.error("Error fetching event flags:", error);
      } finally {
        setLoading(false);
      }
    };


    loadData();
  }, []);

  // const handleChange = (eventKey: string, newValue: "High" | "Medium" | "Low") => {
  //   setEventFlags((prev) => (prev ? { ...prev, [eventKey]: newValue } : null));
  // };

  const handleSave = async () => {
    if (!notificationSettings) return;
    setSaving(true);
    try {
      await updateEventsFlag(notificationSettings);
      toast.success("Notification updated successfully!");
    } catch (error) {
      console.error("Error updating notification:", error);
      toast.success("Error updating notification!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Notification | Synops AI"
        description="This is Notification page for Synops AI"
      />
      <Box display="flex" flexDirection="column" p={3} bgcolor="#f9f9f9">
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Notification Center
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#FF0000",
                  },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "normal",
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "#FF0000",
                      fontWeight: "bold",
                    },
                  },
                }}
              >
                <Tab label="General" />
                <Tab label="AI Dash Cam" disabled={!isMapAIDashCamModuleAvailable} />
                <Tab label="History" />
              </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
              <GeneralTab
                loading={loading}
                notificationSettings={notificationSettings}
                onSettingsChange={(key, value) => {
                  setNotificationSettings(prev => ({ ...prev, [key]: value }));
                }}
                handleSave={handleSave}
              />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              {isMapAIDashCamModuleAvailable && (
                <AIDashCamTab
                  loading={loading}
                />
              )}
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <HistoryTab />
            </TabPanel>

            {/* Save Button */}
            {currentTab !== 2 && (
              // <Box display="flex" justifyContent="flex-end" mt={3}>
              //   <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              //     {saving ? "Saving..." : "Save"}
              //   </Button>
              // </Box>
              <div className="mt-8 flex justify-end space-x-4">
              {/* <button
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 min-w-[120px]"
                  disabled={loading}
              >
                  Cancel
              </button> */}
              <button
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed min-w-[140px]"
                  disabled={loading}
                  onClick={handleSave}
              >
                  <Check size={16} />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
          </div>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default EventsFlagPage;
