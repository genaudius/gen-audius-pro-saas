import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.8);

    const audioRef = useRef(new Audio());

    useEffect(() => {
        const audio = audioRef.current;

        const updateProgress = () => {
            if (audio.duration) {
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    const playTrack = (track) => {
        if (!track || !track.url) return;

        if (currentTrack?.url === track.url) {
            togglePlay();
            return;
        }

        setCurrentTrack(track);
        audioRef.current.src = track.url;
        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Player Error:", err));
    };

    const togglePlay = () => {
        if (!currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Player Error:", err));
        }
    };

    const seek = (percent) => {
        if (!audioRef.current.duration) return;
        const time = (percent / 100) * audioRef.current.duration;
        audioRef.current.currentTime = time;
        setProgress(percent);
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            progress,
            duration,
            currentTime,
            volume,
            setVolume,
            playTrack,
            togglePlay,
            seek,
            formatTime
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);
