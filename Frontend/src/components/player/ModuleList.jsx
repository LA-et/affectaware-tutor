import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Typography,
} from "@mui/material";

import { apiResponse } from "../../utils/httpResponse";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function ModuleList(props) {
  const { courseData } = props;
  const [loading, setLoading] = useState(false);
  const [ModelData, setModelData] = useState([]);
  const jwt = localStorage.getItem("JWT");

  useEffect(() => {
    const getCourseById = async () => {
      setLoading(true);
      const payload = {
        jwt,
        courseid: courseData.CourseID,
      };

      try {
        const response = await apiResponse(
          `/course/course_details`,
          "POST",
          payload
        );
        setModelData(response.Modules);
        setLoading(false);
      } catch (error) {
        // setCourseData(error.response.Error);
      }
    };
    getCourseById();
  }, []);

  return (
    <div>
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "background.paper",
        }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={
          <ListSubheader
            style={{ padding: "29px" }}
            component="div"
            id="nested-list-subheader"
          >
            <Typography
              style={{
                fontWeight: "bold",
                color: "black",
                userSelect: "none",
              }}
              variant="h5"
            >
              Modules
            </Typography>
          </ListSubheader>
        }
      >
        {ModelData?.map((module, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <strong  className="text-md font-semibold">
               {index + 1}. {module.Title}
              </strong>
            </AccordionSummary>
            <AccordionDetails>
              <div className="text-xs" variant="subtitle1">{module?.Description}</div>
            </AccordionDetails>
          </Accordion>
        ))}
      
      </List>
    </div>
  );
}

export default ModuleList;
