

import { useHttpRequest } from "./httpClient";

export const ACTIONS = {
  LOGIN: "login",
  OPENED_COURSE: "opened_course",
  CLICK: "click",
  OPENED_MODULE: "opened_module",
  MUTE: "mute",
  UNMUTE: "unmute",
  PLAY: "play",
  PAUSE: "pause",
  SUBMIT_QUIZ: "submit_quiz",
  COURSE_REGISTRATION: "course_registration",
  COURSE_STARTED: "course_started",
  LOGOUT: "logout",
};

export default function useEventLogger() {
  const sendRequest = useHttpRequest();
  const jwt = localStorage.getItem("JWT");

  return async (event) => {
    const { action, details = {} } = event; // Extract details from event

    const data = {
      jwt: jwt,
      details: details, // Pass the details object
      action: action || "unknown",
    };

    const URI = "/user/user_logs"; // Set the correct URI for your API

    sendRequest(URI, {
      method: "POST",
      body: JSON.stringify(data),
    })
    .then((response) => {
      console.log("Log Created - " + action);
    })
      .catch((error) => {
        console.error("Error creating log:", error);
      });
  };
}
