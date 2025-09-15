import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CourseBox from "./CourseBox";


function FormRow1({ title, description, thumbnail, courseID }) {
  const imageurl = `${import.meta.env.VITE_SERVER_ENDPOINT}/content/${thumbnail}`
  return (
    <Grid item xs={3}>
      <CourseBox
        image={imageurl}
        courseName={title}
        description={description}
        courseID={courseID}
      />
    </Grid>
  );
}
export default function SimpleContainer({ courseData, regData }) {
  return (
    <Box sx={{ flexGrow: 1, padding: "50px" }}>
      <Grid container spacing={10}>
        <Grid container item spacing={8}>
          {courseData
            ? courseData?.map((course) => (
                <FormRow1
                  key={course.CourseID}
                  courseID={course.CourseID}
                  title={course.Title}
                  description={course.Description}
                  thumbnail={course.Thumbnail}
                />
              ))
            : regData?.map((course) => (
                <FormRow1
                  key={course?.course?.CourseID}
                  courseID={course?.course?.CourseID}
                  title={course?.course?.Title}
                  description={course?.course?.Description}
                  thumbnail={course?.course?.Thumbnail}
                />
              ))}
        </Grid>
      </Grid>
    </Box>
  );
}
