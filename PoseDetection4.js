import React, { useRef, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Webcam from 'react-webcam';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

//ウェブカメラからの映像で骨格検出して録画し再生できるバージョン

const PoseDetection = (props) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const [capturedVideo, setCapturedVideo] = useState(null);

    useEffect(() => {
        const onResults = (results) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = webcamRef.current.video.videoWidth;
            canvas.height = webcamRef.current.video.videoHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);

            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
            ctx.restore();
        };

        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);


        // MediaRecorderのセットアップ
        const stream = canvasRef.current.captureStream(30); // 30 FPSでキャプチャ
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setCapturedVideo(URL.createObjectURL(event.data));
            }
        };

        if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null) {
            const camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    await pose.send({ image: webcamRef.current.video });
                },
                width: 640,
                height: 480
            });
            camera.start();

            return () => camera.stop();
        }
    }, []);

    const startRecording = () => {
        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    return (
      <View>
        <View><Text style={{color: '#bb8912'}}>{props.route.params.description}</Text></View>
        <div>
            <button onClick={startRecording} disabled={recording}>Start Recording</button>
            <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
        </div>
        {capturedVideo && (<video src={capturedVideo} controls autoPlay />) }
        <Webcam ref={webcamRef} style={{ width: 640, height: 480, display: 'none' }} />
        <canvas ref={canvasRef} style={{ width: 640, height: 480 }} />
      </View>
    );
};

export default PoseDetection;
