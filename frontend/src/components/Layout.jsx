import React from 'react';
import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  UploadFile as UploadIcon,
  Assessment as AssessmentIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const drawerWidth = 240;
const minDrawerWidth = 65;

function Layout({ children }) {
  const { user, logout } = useAuth0();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', minHeight: 64 }}>
        <IconButton onClick={() => setIsDrawerCollapsed(!isDrawerCollapsed)}>
          {isDrawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        <Tooltip title={isDrawerCollapsed ? 'Dashboard' : ''} placement="right">
          <ListItem 
            button 
            onClick={() => handleNavigation('/')} 
            selected={location.pathname === '/'}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            {!isDrawerCollapsed && <ListItemText primary="Dashboard" />}
          </ListItem>
        </Tooltip>
        <Tooltip title={isDrawerCollapsed ? 'Upload Statement' : ''} placement="right">
          <ListItem 
            button 
            onClick={() => handleNavigation('/upload')} 
            selected={location.pathname === '/upload'}
          >
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            {!isDrawerCollapsed && <ListItemText primary="Upload Statement" />}
          </ListItem>
        </Tooltip>
        <Tooltip title={isDrawerCollapsed ? 'Analysis' : ''} placement="right">
          <ListItem 
            button 
            onClick={() => handleNavigation('/analysis')} 
            selected={location.pathname === '/analysis'}
          >
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            {!isDrawerCollapsed && <ListItemText primary="Analysis" />}
          </ListItem>
        </Tooltip>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${isDrawerCollapsed ? minDrawerWidth : drawerWidth}px)` },
          ml: { sm: `${isDrawerCollapsed ? minDrawerWidth : drawerWidth}px` },
          transition: 'width 0.2s, margin 0.2s'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SpendWise
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar alt={user?.name} src={user?.picture} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: isDrawerCollapsed ? minDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: 'width 0.2s'
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isDrawerCollapsed ? minDrawerWidth : drawerWidth,
              transition: 'width 0.2s'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isDrawerCollapsed ? minDrawerWidth : drawerWidth,
              transition: 'width 0.2s'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isDrawerCollapsed ? minDrawerWidth : drawerWidth}px)` },
          mt: 8,
          transition: 'width 0.2s'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;