import React, { useState, useEffect, useRef, useContext } from 'react';
import { BotContext } from '../store/Bot';
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const { FaceLandmarker, FilesetResolver} = vision;

const WebcamCapture = ({ type, setType }) => {
    const [frameQueue, setFrameQueue] = useState([]);
    const [engagementHistory, setEngagementHistory] = useState([]);
    const { setState } = useContext(BotContext);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const ws = useRef(null);
    const jwt = localStorage.getItem("JWT");
    const BASE_URL = import.meta.env.VITE_SERVER_ML_ENDPOINT;
    const retryCount = useRef(0);
    const maxRetries = 5;
    const HISTORY_SIZE = 10;
    const retryDelay = 3000;
    const FPS = 1;
    const messagedisplay = 5000;
    const canUpdateFromWS = useRef(true);
    const hasQuizStateSet = useRef(false);
    const lastTypeRef = useRef(type);

    const isEngaged = (landmarks, imageWidth, imageHeight) => {
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        const leftEyePx = [leftEye.x * imageWidth, leftEye.y * imageHeight];
        const rightEyePx = [rightEye.x * imageWidth, rightEye.y * imageHeight];
        const noseTipPx = [noseTip.x * imageWidth, noseTip.y * imageHeight];
        const eyeDistance = Math.hypot(
          rightEyePx[0] - leftEyePx[0],
          rightEyePx[1] - leftEyePx[1]
        );
        const eyeMidpoint = [
          (leftEyePx[0] + rightEyePx[0]) / 2,
          (leftEyePx[1] + rightEyePx[1]) / 2
        ];
        const noseToEyeDistance = Math.hypot(
          noseTipPx[0] - eyeMidpoint[0],
          noseTipPx[1] - eyeMidpoint[1]
        );
        const engagementRatio = noseToEyeDistance / eyeDistance;
        return engagementRatio > 0.3 && engagementRatio < 0.7;
    };

    useEffect(() => {
        setType(type);
        if (type === "Quiz" && lastTypeRef.current !== "Quiz") {
            setState({
                prediction: "engaged",
                bot_image: "GIFs/not_engaged.gif",
                message: "Remember to read each question carefully. You've got this!",
            });
            hasQuizStateSet.current = true;
        } else if (lastTypeRef.current === "Quiz" && type !== "Quiz") {
            setState({
                prediction: "engaged",
                bot_image: "GIFs/Engagement.gif",
                message: "You're doing an excellent job staying focused. Keep it up!",
            });
            hasQuizStateSet.current = false;
        }
        lastTypeRef.current = type;
    }, [type, setState, setType]);

    useEffect(() => {
        if (engagementHistory.length < HISTORY_SIZE) return;

        const engagedCount = engagementHistory.filter(Boolean).length;
        const isMajorityEngaged = engagedCount >= engagementHistory.length / 2;

        const statePayload = isMajorityEngaged ? {
            prediction: "engaged",
            bot_image: "GIFs/Engagement.gif",
            message: "You're doing an excellent job staying focused. Keep it up!",
        } : {
            prediction: "not_engaged",
            bot_image: "GIFs/not_engaged.gif",
            message: "It seems like you're not very engaged. Let's try to focus!",
        };

        if (canUpdateFromWS.current && type !== "Quiz") {
            setState(statePayload);
            canUpdateFromWS.current = false;
            setTimeout(() => canUpdateFromWS.current = true, messagedisplay);
        }

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const filteredFrames = isMajorityEngaged
                ? frameQueue.slice(-HISTORY_SIZE).filter((_, i) => engagementHistory[i])
                : [];

            ws.current.send(JSON.stringify({
                action: type,
                state: isMajorityEngaged ? "engaged" : "not_engaged",
                data: filteredFrames
            }));
            if (isMajorityEngaged) setFrameQueue([]);
        }

        setEngagementHistory([]);
    }, [engagementHistory, setState, frameQueue]);

    useEffect(() => {
        const wsUrl = `${BASE_URL}?jwt=${jwt}`;
        let reconnectTimeout;
    
        const connectWebSocket = () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                return; // Already connected
            }
    
            ws.current = new WebSocket(wsUrl);
    
            ws.current.onopen = () => {
                retryCount.current = 0;
                clearTimeout(reconnectTimeout);
            };
    
            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (canUpdateFromWS.current) {
                        setState(data);
                        canUpdateFromWS.current = false;
                        setTimeout(() => canUpdateFromWS.current = true, messagedisplay);
                    }
                } catch (err) {
                    console.error("WebSocket parse error:", err);
                }
            };
    
            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                retryConnection();
            };
    
            ws.current.onclose = (e) => {
                if (!e.wasClean) {
                    retryConnection();
                }
            };
        };
    
        const retryConnection = () => {
            if (retryCount.current < maxRetries) {
                retryCount.current++;
                reconnectTimeout = setTimeout(() => {
                    connectWebSocket();
                }, retryDelay);
            } else {
                console.error("WebSocket failed after max retries.");
            }
        };
        connectWebSocket();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [setState]);
    
    useEffect(() => {
        let faceLandmarker;
        let animationFrameId;

        const setupCameraAndLandmarker = async () => {
            const visionFileset = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );

            faceLandmarker = await FaceLandmarker.createFromOptions(visionFileset, {
            baseOptions: {
                modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                delegate: "CPU",
            },
            runningMode: "VIDEO",
            numFaces: 1,
            });

            // Access webcam
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = videoRef.current;
            video.srcObject = stream;
            await video.play();

            const processFrame = async () => {
            if (video.readyState >= 2) {
                const results = await faceLandmarker.detectForVideo(video, performance.now());

                // Handle landmarks and engagement detection
                if (!results.faceLandmarks?.length) {
                setEngagementHistory(prev => [...prev.slice(-HISTORY_SIZE + 1), false]);
                } else {
                const landmarks = results.faceLandmarks[0];
                const engaged = isEngaged(landmarks, video.videoWidth, video.videoHeight);
                setEngagementHistory(prev => [...prev.slice(-HISTORY_SIZE + 1), engaged]);

                if (engaged) {
                    const ctx = canvasRef.current.getContext("2d");
                    const xs = landmarks.map(p => p.x * video.videoWidth);
                    const ys = landmarks.map(p => p.y * video.videoHeight);
                    const minX = Math.max(Math.min(...xs) - 20, 0);
                    const minY = Math.max(Math.min(...ys) - 20, 0);
                    const maxX = Math.min(Math.max(...xs) + 20, video.videoWidth);
                    const maxY = Math.min(Math.max(...ys) + 20, video.videoHeight);
                    const width = maxX - minX;
                    const height = maxY - minY;

                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(video, minX, minY, width, height, 0, 0, width, height);

                    canvasRef.current.toBlob(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = reader.result;
                        setFrameQueue(prev => [...prev, base64]);
                    };
                    reader.readAsDataURL(blob);
                    }, 'image/jpeg', 0.5);
                }
                }
            }
            animationFrameId = requestAnimationFrame(processFrame);
            };

            processFrame();
        };

        setupCameraAndLandmarker();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);


    return (
        <div>
            <video ref={videoRef} style={{ display: 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default WebcamCapture;
