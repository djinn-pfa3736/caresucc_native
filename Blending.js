import React, { useRef, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import teacherVideo from './assets/caresucc-icon.jpg';
import studentVideo from './assets/caresucc-icon2.jpg';

const PoseDetection = (props) => {
  const teacherVideoRef = useRef(null);
  const studentVideoRef = useRef(null);
    
  const teacherCanvasRef = useRef(null);
  const studentCanvasRef = useRef(null);
  const blendCanvasRef = useRef(null);

  const visibilityList = ['visible', 'hidden'];
  let visibilityCount = 0
  let originalVisibility = visibilityList[visibilityCount];
  let blendVisibility = visibilityList[visibilityCount + 1];

  const onClick = (event) => {
    visibilityCount++;
    visibilityCount = visibilityCount % 2;
    originalVisibility = visibilityList[visibilityCount];
    blendVisibility = visibilityList[visibilityCount + 1];
  }

  const clamp = (value) => {
    if(value > 255) return 255;
    else if(value < 0) return 0;
    return value;
  }

  const onDraw = () => {
    const teacherCanvas = teacherCanvasRef.current;
    const studentCanvas = studentCanvasRef.current;
    const blendCanvas = blendCanvasRef.current;

    const teacherCtx = teacherCanvas.getContext('2d');
    const studentCtx = studentCanvas.getContext('2d');
    const blendCtx = blendCanvas.getContext('2d');

    teacherCanvas.width = teacherVideoRef.current.videoWidth;
    teacherCanvas.height = teacherVideoRef.current.videoHeight;

    studentCanvas.width = studentVideoRef.current.videoWidth;
    studentCanvas.height = studentVideoRef.current.videoHeight;

    teacherCtx.save();
    teacherCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    teacherCtx.drawImage(teacherVideoRef.current, 0, 0, teacher);

    studentCtx.save();
    studentCtx.clearRect(0, 0, teacherCanvas.width, teacherCanvas.height);
    studentCtx.drawImage(studentVideoRef.current, 0, 0, teacher);

    const teacherImage = teacherCtx.getImageData(0, 0, teacherCanvas.width, teacherCanvas.height);
    const studentImage = studentCtx.getImageData(0, 0, studentCanvas.width, studentCanvas.height);

    let blendImage = blendCtx.createImageData(teacherCanvas.width, teacherCanvas.height);     
    const alpha = 0.5;

    let pixelCount = 0;
    for (let y = 0; y < teacherCanvas.height; y++) {
      for (var x = 0;x < teacherCanvas.width; x++) {
        blendImage.data[pixelCount*4] = clamp(Math.round(alpha*teacherImage.data[(pixelCount*4)] + (1 - alpha)*studentImage.data[pixelCount*4]));
        blendImage.data[pixelCount*4 + 1] = clamp(Math.round(alpha*teacherImage.data[(cnt*4)] + (1 - alpha)*studentImage.data[pixelCount*4 + 1]));
        blendImage.data[pixelCount*4 + 2] = clamp(Math.round(alpha*teacherImage.data[(cnt*4)] + (1 - alpha)*studentImage.data[pixelCount*4 + 2]));
        blendImage.data[pixelCount*4 + 3] = 255; 

        pixelCount++;
      }
    }   

    blendCtx.putImageData(blendImage, 0, 0);  

    window.requestAnimationFrame(onDraw);
  }

  useEffect(() => {

    teacherVideoRef.current = document.getElementById("teacherVideo");
    studentVideoRef.current = document.getElementById("studentVideo");

    teacherVideoRef.current.src = teacherVideo;
    teacherVideoRef.current.load();

    teacherVideoRef.current.src = studentVideo;
    teacherVideoRef.current.load();

  });

  return (
    <div>
      <View>
        <Text style={{color: '#bb8912'}}>{props.route.params.description}</Text>
      </View>
      <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
        <button onClick={()=>videoRef.current.play()}> Play </button>
        <button onClick={()=>videoRef.current.pause()}> Pause </button>
        <button onClick={onClick}> Blend </button>
      </View>
      <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
        <video id="teacherVideo" ref={teacherVideoRef} style={{ width: '50%', visibility: originalVisibility }} controls autoPlay playsInline />
        <video id="studentVideo" ref={teacherVideoRef} style={{ width: '50%', visibility: originalVisibility }} controls autoPlay playsInline />
        <canvas id="teacher" ref={teacherCanvasRef} style={{ width: '50%', visibility: 'hidden' }} />
        <canvas id="student" ref={studentCanvasRef} style={{ width: '50%', visibility: 'hidden' }} />
        <canvas id="blend" ref={blendCanvasRef} style={{ width: '50%', visibility: blendVisibility }} />
      </View>
    </div>
  );
};
export default PoseDetection;
