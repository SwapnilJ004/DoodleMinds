import { useMusicStore } from './useMusicStore';
import audioSource from '../assets/BackgroundMusic.mp3';
import { useAudioPlayer } from 'expo-audio';
import { useEffect } from 'react';

export function useMusic() {
    const { setPlayer, setIsPlaying } = useMusicStore();
    const player = useAudioPlayer(audioSource);

    // Store player globally when available
    useEffect(() => {
        if (player) {
            setPlayer(player);
            setIsPlaying(false);
        }
    }, [player]);

    const loadAndPlay = async () => {
        if (!player) return;
        player.seekTo(0);
        player.play();
        setIsPlaying(true);
    };

    const pauseMusic = async () => {
        if (!player) return;
        player.pause();
        setIsPlaying(false);
    };

    const resumeMusic = async () => {
        if (!player) return;
        player.play();
        setIsPlaying(true);
    }
 
    return {loadAndPlay, pauseMusic, resumeMusic, player};
}