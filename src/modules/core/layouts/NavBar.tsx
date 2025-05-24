import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import { Menu as MenuIcon, Person, ExitToApp, NotificationsNone, Notifications } from '@mui/icons-material';
import { useAppSelector, useAppDispatch, RootState } from '../../../redux/app/store';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../../../redux/features/user';
import axiosInstance from '../../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { useTheme } from "../../../main";
import {fetchAlerts, readAlert} from '../apis/apis';
import {INotification} from '../interfaces/interfaces'

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const user = useAppSelector((state) => state.user);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const [notiAnchorEl, setNotiAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const username = useSelector((state: RootState) => state.user.username);
  //const { toggleTheme, isDarkMode } = useTheme();

  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => {
    // add notification in local
    loadAlerts();
  }, [username]);


  const loadAlerts = async () => {
    try {
        const response = await fetchAlerts();
        setNotifications(response);
    } catch (error) {
        console.error("Error loading filters:", error);
    }
  };

  const handleNotiClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotiAnchorEl(event.currentTarget);
  };

  const handleNotiClose = () => {
    setNotiAnchorEl(null);
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      // Demo mode logout
      localStorage.removeItem('demoUser');
      console.log('Logged out successfully (demo mode)');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(clearUser());
      navigate('/login');
    }
  };

  const handleLearnMore = async (notificationId: number) => {
    // Update the read status of the clicked notification
     const res = await readAlert(notificationId, true);
    console.log(`Learn More clicked for notification res`, res);


    // const updatedNotifications = notifications.map((notification) =>
    //   notification.id === notificationId ? { ...notification, read: true } : notification
    // );
    // setNotifications(updatedNotifications);
    const updatedNotifications = notifications.find((notification) => notification.id === notificationId)
    
    console.log(`Learn More clicked for notification ID`, updatedNotifications);

    loadAlerts();

    // jump to map page base on metadata
    if(updatedNotifications?.metadata?.map){
      navigate(`/map/${updatedNotifications.id}`);
    }
    
  };


  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#1f2937',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar className="flex justify-between">
        <IconButton onClick={onToggleSidebar}>
          <MenuIcon className="text-white" />
        </IconButton>
        <div className="flex items-center space-x-4 ">

          {/* {import.meta.env.VITE_ENV === 'local' && (
            <Button onClick={toggleTheme}
              color="primary">
              Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
            </Button>
          )} */}

          {/* Notification Button */}
          <Box className="relative">
            {username.toLowerCase().includes("tech") && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNotiClick}
                className="relative flex items-center space-x-2"
              >
                <Notifications sx={{ fontSize: 30 }} />

                {notifications.filter((noti) => !noti.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1 py-0.5">
                    {notifications.filter((noti) => !noti.read).length}
                  </span>
                )}

              </Button>
            )}


            <Menu
              anchorEl={notiAnchorEl}
              open={Boolean(notiAnchorEl)}
              onClose={handleNotiClose}
              PaperProps={{
                style: {
                  marginTop: '40px',
                  width: '400px', // Set a fixed width for the menu
                },
              }}
            >
              <Box className="p-2 max-h-72" sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {notifications.length > 0 ? (
                  notifications
                    .filter((notification) => !notification.read)
                    .map((notification) => (
                      <MenuItem
                        key={notification.id}
                        onClick={handleNotiClose}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          paddingBottom: 2,
                          paddingTop: 2,
                          width: '100%',
                        }}
                      >
                        {/* Alert Icon */}
                        <Box sx={{ flexShrink: 0, marginRight: 2, alignSelf: 'flex-start' }}>
                          <Notifications sx={{ fontSize: 24, color: 'red' }} />
                        </Box>

                        {/* Content Section */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
                          {/* Title */}
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            className="text-gray-700"
                            sx={{
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'break-word', // Ensures long words break into the next line
                              whiteSpace: 'normal', // Allows wrapping
                              width: '100%', // Ensures it respects the parent's width
                            }}
                          >
                            {notification.title}
                          </Typography>

                          {/* Description */}
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            className="text-gray-700 mt-1"
                            sx={{
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              wordWrap: 'break-word', // Ensures long words break into the next line
                              whiteSpace: 'normal', // Allows wrapping
                              width: '100%', // Ensures it respects the parent's width
                            }}
                          >
                            {notification.description}
                          </Typography>

                          {/* Note if available */}
                          {notification.note && (
                            <Typography variant="body2" className="text-gray-500 text-sm mt-1">
                              {notification.note}
                            </Typography>
                          )}

                          {/* Learn More Button (Bottom right) */}
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                            <Button variant="text" color="primary" size="small" onClick={() => handleLearnMore(notification.id)}>
                              Learn More
                            </Button>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem onClick={handleNotiClose}>
                    <Typography variant="body2" className="text-gray-500">
                      No new notifications.
                    </Typography>
                  </MenuItem>
                )}
              </Box>
            </Menu>
          </Box>

          {/* User Profile and Menu */}
          <Typography variant="body1" className="text-white">
            {user.username}
          </Typography>
          <Avatar
            alt={user.firstName}
            src={user.picture}
            className="cursor-pointer"
            onClick={handleProfileMenuClick}
          />
          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              style: {
                marginTop: '40px',
              },
            }}
          >
            {/* My Profile Menu Item with Icon */}
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>

            {/* Sign Out Menu Item with Icon */}
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sign Out</ListItemText>
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
