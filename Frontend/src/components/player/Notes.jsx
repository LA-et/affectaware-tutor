import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { apiResponse } from "../../utils/httpResponse";

export default function Notes({ link, courseData }) {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const jwt = localStorage.getItem("JWT");

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const getUserLog = async (action) => {
    const payload = {
      jwt,
      action: String(action),
      details: {
        moduleId: courseData.ModuleID,
        moduleTitle: courseData.Module_Name,
        ContentType: courseData.Content_Type,
        CourseID: courseData.CourseID,
        CourseTitle: courseData.Course_Title,
        CourseType: courseData.Course_Type,
        URL: courseData.URL,
      },
    };

    try {
      const response = await apiResponse(`/user/user_logs`, "POST", payload);
    } catch (error) {
      console.log(error.response.Error);
    }
  };

  const handlePageChange = (event, value) => {
    setPageNumber(value);
    getUserLog(value);
  };

  const notesurl = `${import.meta.env.VITE_SERVER_ENDPOINT}/content/${link}`

  return (
    // <div
    // className=""
    //   style={{
    //     paddingTop: "1px",
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     maxHeight: "450px",
    //   }}
    // >
    //   <div
    //     style={{
    //       display: "flex",
    //       overflowY: "scroll",
    //     }}
    //   >
    //     <Document
    //       file={notesurl}
    //       onLoadSuccess={onDocumentLoadSuccess}
    //     >
    //       <Page pageNumber={pageNumber} />
    //     </Document>
    //   </div>

    //   <Stack spacing={2} className="flex items-center justify-center py-4">

    //      <Pagination
    //     count={numPages}
    //     page={pageNumber} 
    //     onChange={handlePageChange}
    //     renderItem={(item) => (
    //       <PaginationItem
    //         slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
    //         {...item}
    //         color="primary"
    //       />
    //     )}
    //   />
    //   </Stack>
    // </div>

    <div
      className=""
      style={{
        paddingTop: "1px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxHeight: "450px",
        width: "100%", // Ensure the container takes full width
      }}
    >
      <div
        style={{
          display: "flex",
          overflowY: "scroll",
          overflowX: "hidden",
          width: "100%", // Ensure the inner container takes full width
        }}
      >
        <Document
          file={notesurl}
          onLoadSuccess={onDocumentLoadSuccess}
          style={{ width: "100%", height: "auto" }} // Make the document responsive
        >
          <Page pageNumber={pageNumber} style={{ width: "100%", height: "auto" }} /> {/* Make the page responsive */}
        </Document>
      </div>

      <Stack spacing={2} className="flex items-center justify-center py-4">
        <Pagination
          count={numPages}
          page={pageNumber}
          onChange={handlePageChange}
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
              {...item}
              color="primary"
            />
          )}
        />
      </Stack>
    </div>

  );
}
