import React, { useRef, useState, useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import Webcam from 'react-webcam';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const App = (props) => {
    const webcamRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [detectInfo, setDetectInfo] = useState("");

    useEffect(() => {
        setDetectInfo("videoFile");
        if (videoFile) {
            const pose = new Pose({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });
            setDetectInfo("new Pose");

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            setDetectInfo("Pose options");

            pose.onResults((results) => {
                setDetectInfo("Pose onResults");
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;

                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
                drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
                ctx.restore();
            });

            const objectURL = URL.createObjectURL(videoFile);
            setDetectInfo(objectURL);
            videoRef.current.src = objectURL;
            videoRef.current.onloadedmetadata = () => {
                const processFrame = async () => {
                    //if (!videoRef.current.paused && !videoRef.current.ended) {
                        await pose.send({ image: videoRef.current });
                        setDetectInfo("pose.send");
                        requestAnimationFrame(processFrame);
                    //}
                };
                requestAnimationFrame(processFrame);
            };
        }
    }, [videoFile]);

    const handleStartRecording = () => {
        const options = { mimeType: 'video/webm;codecs=vp9,opus' }; // .mp4形式はすべてのブラウザでサポートされていない
        if (MediaRecorder.isTypeSupported(options.mimeType)) {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, options);
        } else {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream);
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                setVideoBlob(event.data);
            }
        };
        mediaRecorderRef.current.start();
        setRecording(true);
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    const handleDownloadVideo = () => {
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recorded_video.webm'; // ブラウザが.mp4形式をサポートしていないため、.webm形式でダウンロード
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleVideoUpload = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setVideoFile(file);
            setPlaybackTime(0);
        }
    };

    const togglePlayback = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setPlaying(true);
            } else {
                videoRef.current.pause();
                setPlaying(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setPlaybackTime((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    return (
        <div>
            <View><Text style={{color: '#bb8912'}}>{props.route.params.description}</Text></View>
            {!videoFile ? (
                <>
                  <View>
                    {recording ? <Text style={{flex: 1, background: "#ffcccc", color: "red"}}>Recording</Text>
                               : <Text style={{flex: 1, background: "#ccffcc", color: "green"}}>Preview</Text>
                      }
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <button onClick={handleStartRecording} disabled={recording}>Start Recording</button>
                    <button onClick={handleStopRecording} disabled={!recording}>Stop Recording</button>
                    {videoBlob && <button onClick={handleDownloadVideo}>Download Video</button>}
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />
                  </View>
                  <Webcam audio={false} ref={webcamRef} />
                </>
            ) : (
                <>
                    <button onClick={togglePlayback}>{playing ? 'Pause' : 'Play'}</button>
                    <button onClick={() => setVideoFile(null)}>Camera View</button>
                    <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
                      <video ref={videoRef} style={{ display: 'block', width: '50%' }} controls autoPlay playsInline muted
                       onTimeUpdate={handleTimeUpdate} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}></video>
                      <canvas ref={canvasRef} style={{width: '50%'}}
                           onClick={()=>{
                            if (videoRef) {(!playing) ? videoRef.current.play() : videoRef.current.pause()
                          }}} />
                    </View>
                </>
            )}
        </div>
    );
};

export default App;
