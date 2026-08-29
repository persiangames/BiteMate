import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_MAX_SECONDS = 120;

export function useVoiceRecorder(maxSeconds = DEFAULT_MAX_SECONDS) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const autoStopRef = useRef<(() => void) | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      mediaRecorderRef.current?.stop();
      stopTracks();
    };
  }, [stopTracks]);

  async function finish(): Promise<File | null> {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return null;
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        stopTracks();
        setRecording(false);

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        if (blob.size < 800) {
          resolve(null);
          return;
        }

        resolve(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }));
      };
      recorder.stop();
    });
  }

  useEffect(() => {
    if (!recording) {
      return;
    }
    if (seconds < maxSeconds) {
      return;
    }
    autoStopRef.current?.();
  }, [recording, seconds, maxSeconds]);

  async function start(): Promise<boolean> {
    if (recording) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 32_000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(200);
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((value) => value + 1), 1000);

      autoStopRef.current = () => {
        void finish();
      };

      return true;
    } catch {
      stopTracks();
      return false;
    }
  }

  function cancel() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    autoStopRef.current = null;
    stopTracks();
    setRecording(false);
    setSeconds(0);
  }

  return { recording, seconds, maxSeconds, start, finish, cancel };
}
