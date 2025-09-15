
import React, { useState, useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { VideocamOff as VideocamOffIcon } from "@mui/icons-material";
import Content from "../components/player/Content";
import Bot from "../components/bot/Frame";
import Camera from "../utils/Camera";
import { BotProvider } from "../store/Bot";
import { useParams } from "react-router-dom";
import Loader from "../components/utils/Loader";

export default function CoursePlayer() {
  const location = useLocation();
  const moduleData = location.state?.moduleData;
  const course_id = useParams().id;
  const [open] = useOutletContext();
  const [cameraAccess, setCameraAccess] = useState(false);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatedCourseData, setUpdatedCourseData] = useState(moduleData);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setCameraAccess(true);
        })
        .catch((error) => {
          setCameraAccess(false);
        });
    } else {
      setCameraAccess(false);
    }
    setType(updatedCourseData.Content_Type);

  }, [type,updatedCourseData]);

  if (loading) {
    return (
      <div>
        <Loader height="600px" />
      </div>
    );
  }

  return (
    <BotProvider>
      {cameraAccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-10 my-5 gap-5 justify-center fixed">
          <div className="col-span-8">
            <Content
              moduleData={moduleData}
              courseData={moduleData}
              onsetType={setType}
              setType={setType}
              type={type}
              setUpdatedCourseData={setUpdatedCourseData}
              updatedCourseData={updatedCourseData}
            />
          </div>
          {!open && (
            <div className="col-span-2 mt-5">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                  padding: "10px",
                }}
              >
                <Bot />
              </div>
            </div>
          )}
          {!open && cameraAccess && <Camera type={type} setType={setType} />}
        </div>
       ) : (
         <motion.div
          className="message-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VideocamOffIcon style={{ fontSize: 48, color: "#ff4d4d" }} />
          <p className="message">
            Camera access not granted.<br/> The course will start once the camera is enabled.
          </p>
        </motion.div>
      )}
    </BotProvider>
  );
}
