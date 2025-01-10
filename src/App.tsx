import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitchShift, setPitchShift] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      loadAudioFile(file);
    }
  };

  const loadAudioFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferRef.current = audioBuffer;
  };

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    const sourceNode = audioContextRef.current.createBufferSource();
    sourceNode.buffer = audioBufferRef.current;
    sourceNode.detune.value = pitchShift * 100;
    sourceNode.connect(audioContextRef.current.destination);
    sourceNode.start();
    sourceNodeRef.current = sourceNode;
    setIsPlaying(true);

    sourceNode.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      setIsPlaying(false);
    }
  };

  const handlePitchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const shift = parseInt(event.target.value, 10);
    setPitchShift(shift);
    if (sourceNodeRef.current) {
      sourceNodeRef.current.detune.value = shift * 100;
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const isChinese = navigator.language.startsWith('zh');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isChinese ? '音频播放器' : 'Audio Player'}
      </h1>
      <input
        type="file"
        accept="audio/mp3"
        onChange={handleFileChange}
        className="mb-4"
      />
      <div className="flex items-center mb-4">
        <label className="mr-2">
          {isChinese ? '转调:' : 'Pitch Shift:'}
        </label>
        <select
          value={pitchShift}
          onChange={handlePitchChange}
          className="p-2 border rounded"
        >
          {Array.from({ length: 25 }, (_, i) => i - 12).map((shift) => (
            <option key={shift} value={shift}>
              {shift}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={playAudio}
          disabled={!audioFile || isPlaying}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isChinese ? '播放' : 'Play'}
        </button>
        <button
          onClick={stopAudio}
          disabled={!isPlaying}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
        >
          {isChinese ? '停止' : 'Stop'}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;