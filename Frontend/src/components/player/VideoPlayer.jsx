import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import Stack from "@mui/material/Stack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Slider from "@mui/material/Slider";
import VolumeMuteIcon from "@mui/icons-material/VolumeMute";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

import Quiz from "./quiz/Quiz";
import { useHttpRequest } from "../../hooks/httpClient";
import useEventLogger, {ACTIONS} from "../../hooks/eventLogger";

export default function VideoPlayer(props) {
  const { link, quizzes, score, setScore, videoData } = props;
  const playerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [seekTime, setSeekTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [durationTime, setDurationTime] = useState("00:00:00");

  const [showQuiz, setshowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizDataArray, setQuizDataArray] = useState([]);

  const sendRequest = useHttpRequest();
  const logEvent = useEventLogger();


  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        setSeekTime(currentTime);
        setDurationTime(formatTime(currentTime));

        quizDataArray.forEach((quiz) => {
          const quizTime = quiz?.time;
          const formattedQuizTime = formatTime(
            parseInt(
              quizTime?.split(":").reduce((acc, time) => 60 * acc + +time)
            )
          );
          if (formattedQuizTime === durationTime) {
            setCurrentQuiz(quiz?._id);
            setshowQuiz(true);
            setPlaying(false);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationTime]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };


  const handlePlayPause = () => {
    logEvent({
      action: playing ? ACTIONS.PAUSE : ACTIONS.PLAY,
      details: {
        moduleId: videoData.ModuleID,
          moduleTitle: videoData.Module_Name,
          ContentType: videoData.Content_Type,
          CourseID: videoData.CourseID,
          CourseTitle: videoData.Course_Title,
          CourseType: videoData.Course_Type,
          URL: videoData.URL,
      },
    })
    setPlaying(!playing);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      setVolume(0.5);
      logEvent({
        action: ACTIONS.UNMUTE,
        details: {
          moduleId: videoData.ModuleID,
          moduleTitle: videoData.Module_Name,
          ContentType: videoData.Content_Type,
          CourseID: videoData.CourseID,
          CourseTitle: videoData.Course_Title,
          CourseType: videoData.Course_Type,
          URL: videoData.URL,
        },
      });
    } else {
      setVolume(0);
      logEvent({
        action: ACTIONS.MUTE,
        details: {
          moduleId: videoData.ModuleID,
          moduleTitle: videoData.Module_Name,
          ContentType: videoData.Content_Type,
          CourseID: videoData.CourseID,
          CourseTitle: videoData.Course_Title,
          CourseType: videoData.Course_Type,
          URL: videoData.URL,
        },
      });
    }
  };

  const handleSeekChange = (event, value) => {
    setSeekTime(value);
    playerRef.current.seekTo(value);
    setDurationTime(formatTime(value));
  };

  const handleVolumeChange = (event, value) => {
    setVolume(value);
    playerRef.current.setVolume(value);
  };

  const handleQuizPlayback = () => {
    setPlaying(true);
    setshowQuiz(false);
    setDurationTime(formatTime(playerRef.current.getCurrentTime() + 1));
  };

   const videourl = `${link}`
  return (
    <div style={{ position: "relative" }}>
      <div style={{ paddingTop: "1px" }}>
        <ReactPlayer
          ref={playerRef}
          controls={false}
          muted={false}
          url={videourl}
          height="400px"
          width="100%"
          playing={playing}
          volume={volume}
          onPause={() => {
            setPlaying(false);
           
          }}
          onPlay={() => {
            setPlaying(true);
            
          }}
        />
      </div>
      <div direction="row"className="flex justify-center gap-5 items-center">
        <button onClick={handlePlayPause} style={{ padding: "5px" }}>
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </button>
        <Slider
          min={0}
          max={playerRef.current ? playerRef.current.getDuration() : 0}
          step={1}
          value={seekTime}
          onChange={handleSeekChange}
          style={{ width: "275px", paddingTop: "20px" }}
          aria-labelledby="continuous-slider"
        />
        <div style={{ paddingTop: "7px" }}>{durationTime}</div>
        <button onClick={handleMute} style={{ padding: "5px" }}>
          {isMuted ? (
            <VolumeMuteIcon />
          ) : volume === 0 ? (
            <VolumeOffIcon />
          ) : (
            <VolumeUpIcon />
          )}
        </button>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: "120px", paddingTop: "20px" }}
          aria-labelledby="continuous-slider"
        />
      </div>
      {showQuiz && (
        <div
          style={{
            backgroundColor: "white",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Quiz
            isVideo={true}
            handleNext={handleQuizPlayback}
            quiz_id={currentQuiz}
            score={score}
            setScore={setScore}
          />
        </div>
      )}
    </div>
  );
}
