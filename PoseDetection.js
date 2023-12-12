import React, { useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import Webcam from 'react-webcam';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// MediaPipe側のCamera映像を元にMediaPipeを適用するバージョン（ChatGPT生成）
//  そのままだと「import { Camera } from '@mediapipe/camera_utils';」の行が抜けてエラーになっていた。
// Snackのウェブエミュレータだと動作したが、Androidエミュレータだと「`canvas` must be a function」のエラーとなって動作しなかった。

const PoseDetection = (props) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const onResults = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = webcamRef.current.video.videoWidth;
        canvas.height = webcamRef.current.video.videoHeight;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);

        // Draw the pose annotations on the canvas.
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        ctx.restore();
    };

    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);

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

    return (
      <>
        <View><Text style={{color: '#bb8912'}}>{props.route.params.description}</Text></View>
        <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
            <Webcam ref={webcamRef} style={{ width: '640px', height: '480px', display: 'none' }} />
            <canvas ref={canvasRef} style={{ display: 'display' }} />
        </View>
      </>
    );
};

export default PoseDetection;
