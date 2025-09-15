import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function RecentActivity() {
  const recentActivities = [
    {
      type: "quiz",
      name: "Quiz 1",
      course: "React",
      timestamp: "2023-10-20 10:30 AM",
    },
    {
      type: "video",
      name: "Module 2",
      course: "Node",
      timestamp: "2023-10-19 3:45 PM",
    },
    {
      type: "notes",
      name: "Notes 1",
      course: "Express",
      timestamp: "2023-10-17 9:30 AM",
    },
  ];

  const getIconForType = (type) => {
    switch (type) {
      case "quiz":
        return <AssignmentIcon />;
      case "video":
        return <PlayCircleOutlineIcon />;
      case "notes":
        return <MenuBookIcon />;
      default:
        return null;
    }
  };

  return (
    <List
      sx={{
        width: "100%",
        height:'100%',
        bgcolor: "background.paper",
        overflowY: "scroll",
      }}
      component="nav"
      aria-label="recent activity"
    >
      <Typography variant="h5" className="pl-3 pd-3">
        Recent Activities
      </Typography>
      {recentActivities.map((activity, index) => (
        <div key={index}>
          <ListItem button>
            {getIconForType(activity.type)}
            <ListItemText
              sx={{ marginLeft: 3 }}
              primary={`${activity.name} in ${activity.course}`}
              secondary={`${activity.timestamp}`}
            />
          </ListItem>
          {index < recentActivities.length - 1 && <Divider />}
        </div>
      ))}
    </List>
  );
}
