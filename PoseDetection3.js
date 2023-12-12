import React, { useRef, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Webcam from 'react-webcam';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// カメラ映像と動画ファイルからの映像を切り替えt骨格検出をするバージョン

const PoseDetection = (props) => {
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [useCamera, setUseCamera] = useState(true);
    const [videoFile, setVideoFile] = useState(null);

    useEffect(() => {
        const onResults = (results) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = useCamera ? webcamRef.current.video.videoWidth : videoRef.current.videoWidth;
            canvas.height = useCamera ? webcamRef.current.video.videoHeight : videoRef.current.videoHeight;

            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(useCamera ? webcamRef.current.video : videoRef.current, 0, 0, canvas.width, canvas.height);

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
        
        let camera;
        if (useCamera) {
            camera = new Camera(webcamRef.current.video, {
                onFrame: async () => {
                    await pose.send({ image: webcamRef.current.video });
                },
                width: 640,
                height: 480
            });
            camera.start();
        } else {
            const processVideoFrame = async () => {
                if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                    await pose.send({ image: videoRef.current });
                    requestAnimationFrame(processVideoFrame);
                }
            };
            videoRef.current.addEventListener('play', () => { requestAnimationFrame(processVideoFrame); });
        }
        
        return () => {
        	if (camera) camera.stop();
        };
    }, [useCamera]);

    useEffect(() => {
      if (videoFile) {
        videoRef.current.src = URL.createObjectURL(videoFile);
        videoRef.current.load();
        setUseCamera(false);
      }
    }, [videoFile]);

    const toggleSource = () => {
      if (!useCamera) {
        videoRef.current.pause();
      } else {
        if (videoRef) videoRef.current.play();
      }
      setUseCamera(!useCamera);
    };

    const handleFileChange = (event) => {
      if (event.target.files && event.target.files.length>0) {
        const file = event.target.files[0];
        setVideoFile(file);
      }
    };

    // <video>タグの解説
    //   <video>: 動画埋め込み要素 - HTML: ハイパーテキストマークアップ言語 | MDN https://developer.mozilla.org/ja/docs/Web/HTML/Element/video

    return (
        <div>
            <View><Text style={{color: '#bb8912'}}>{props.route.params.description}</Text></View>
            <View style={{flex: 1, flexDirection: 'row', width: '100%'}} >
              <button onClick={toggleSource} disabled={(!videoFile) ? true : false}>{useCamera ? 'Switch to Video' : 'Switch to Camera'}</button>
              <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: useCamera ? 'block' : 'none' }} />
              <button onClick={()=>videoRef.current.play()} style={{ display: !useCamera ? 'block' : 'none' }}>Play</button>
              <button onClick={()=>videoRef.current.pause()} style={{ display: !useCamera ? 'block' : 'none' }}>Pause</button>
            </View>
            <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
              {useCamera ? (
                  <Webcam ref={webcamRef} style={{ width: '50%' }} />
              ) : null}
              {videoFile ? (
                  <video ref={videoRef} style={{ width: '50%', display: !useCamera ? 'block' : 'none' }} controls autoPlay playsInline 
                  /> /* autoplay要素が効かないようなので、onLoadDataでの自動再生を指定 ⇒ JSXではautoPlayの語での指定だった */
              ) : null}
              <canvas ref={canvasRef} style={{ width: '50%' }} />
            </View>
        </div>
    );
};

export default PoseDetection;
