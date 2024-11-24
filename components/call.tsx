'use client'

import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
  useRemoteVideoTracks,
} from 'agora-rtc-react';
import { useState, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  Monitor,
  MonitorOff,
} from 'lucide-react';

interface CallProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  stoken: string;
  suid: number; 
}

function Videos({
  channelName,
  appId,
  token,
  uid,
  stoken,
  suid
}: {
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  stoken: string;
  suid: number;
}) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMicReady, setIsMicReady] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any | null>(null);

  const { isLoading: isLoadingMic, localMicrophoneTrack } =
    useLocalMicrophoneTrack(isAudioEnabled);
  const { isLoading: isLoadingCam, localCameraTrack } =
    useLocalCameraTrack(isVideoEnabled);

  const remoteUsers = useRemoteUsers();
  const { videoTracks } = useRemoteVideoTracks(remoteUsers);
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  const client = useRTCClient(
    AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' })
  );

  const sclient = useRTCClient(
    AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' })
  );

  useJoin({
    appid: appId,
    channel: channelName,
    token: token,
    uid: uid,
  });

  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Handle camera track enable/disable
  useEffect(() => {
    const setupCamera = async () => {
      if (localCameraTrack) {
        try {
          await localCameraTrack.setEnabled(isVideoEnabled);
          setIsCameraReady(true);
        } catch (error) {
          console.error('Error setting camera state:', error);
          setIsCameraReady(false);
        }
      }
    };

    setupCamera();

    return () => {
      setIsCameraReady(false);
    };
  }, [isVideoEnabled, localCameraTrack]);

  // Handle microphone track enable/disable
  useEffect(() => {
    const setupMic = async () => {
      if (localMicrophoneTrack) {
        try {
          await localMicrophoneTrack.setEnabled(isAudioEnabled);
          setIsMicReady(true);
        } catch (error) {
          console.error('Error setting microphone state:', error);
          setIsMicReady(false);
        }
      }
    };

    setupMic();

    return () => {
      setIsMicReady(false);
    };
  }, [isAudioEnabled, localMicrophoneTrack]);

  // Handle screen sharing toggle
  const handleScreenShareToggle = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenTrack) {
          try {
            // Stop the track first
            await screenTrack.stop();
            // Unpublish the track
            await sclient.unpublish(screenTrack);
            // Close and dispose of the track
            screenTrack.close();
            // Leave the channel with screen share client
            await sclient.leave();
            // Reset states
            setScreenTrack(null);
            setIsScreenSharing(false);
          } catch (stopError) {
            console.error('Error stopping screen share:', stopError);
            // Force cleanup even if there's an error
            screenTrack.close();
            await sclient.leave();
            setScreenTrack(null);
            setIsScreenSharing(false);
          }
        }
      } else {
        try {
          // Join channel with screen share client if not already connected
          if (!sclient.connectionState || sclient.connectionState !== 'CONNECTED') {
            await sclient.join(appId, channelName, stoken, suid);
          }

          // Create screen share track
          const screenTracks = await AgoraRTC.createScreenVideoTrack(
            {
              encoderConfig: '1080p_1',
              optimizationMode: 'detail', // Optimize for detail
              screenSourceType: 'screen', // Explicitly set source type
            },
            'disable'
          );

          // Handle if screenTracks is an array or a single track
          const track = Array.isArray(screenTracks) ? screenTracks[0] : screenTracks;

          // Set up screen share stopped callback
          track.on('track-ended', async () => {
            try {
              await track.stop();
              await sclient.unpublish(track);
              track.close();
              await sclient.leave();
              setScreenTrack(null);
              setIsScreenSharing(false);
            } catch (error) {
              console.error('Error in track-ended handler:', error);
              // Force cleanup
              track.close();
              await sclient.leave();
              setScreenTrack(null);
              setIsScreenSharing(false);
            }
          });

          // Publish the track
          await sclient.publish(track);
          setScreenTrack(track);
          setIsScreenSharing(true);

        } catch (error) {
          console.error('Error starting screen share:', error);
          // Clean up if screen share fails
          if (screenTrack) {
            try {
              await screenTrack.stop();
              screenTrack.close();
              await sclient.leave();
            } catch (cleanupError) {
              console.error('Error during cleanup:', cleanupError);
            }
          }
          setScreenTrack(null);
          setIsScreenSharing(false);
        }
      }
    } catch (error) {
      console.error('Error toggling screen sharing:', error);
      // Reset state if there's an error
      if (screenTrack) {
        try {
          await screenTrack.stop();
          screenTrack.close();
        } catch (e) {
          console.error('Error during error cleanup:', e);
        }
      }
      setIsScreenSharing(false);
      setScreenTrack(null);
    }
  };


  // Handle camera toggle
  const handleCameraToggle = () => {
    setIsVideoEnabled((prev) => !prev);
  };

  // Handle mic toggle
  const handleMicToggle = () => {
    setIsAudioEnabled((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      {(isLoadingMic || isLoadingCam) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-white text-lg">Initializing media devices...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-24 right-4 w-64 h-48 rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
        {localCameraTrack && isVideoEnabled && isCameraReady ? (
          <LocalVideoTrack
            track={localCameraTrack}
            play
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            className="aspect-video rounded-lg overflow-hidden border border-gray-700 bg-gray-800"
          >
            <RemoteUser
              user={user}
              playVideo
              playAudio
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {remoteUsers.length === 0 && (
          <div className="col-span-full h-[50vh] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
                Waiting for others to join...
              </h3>
              <p>Share the channel name with others to invite them</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center items-center gap-4 p-4 bg-gray-900/80 backdrop-blur-sm">
        <button
          onClick={handleCameraToggle}
          disabled={isLoadingCam || !isCameraReady}
          title={!isCameraReady ? 'Camera not available' : ''}
          className={`p-4 rounded-full transition-all ${isLoadingCam || !isCameraReady
              ? 'bg-gray-700 opacity-50 cursor-not-allowed'
              : isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          {isLoadingCam ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isVideoEnabled ? (
            <Camera className="w-6 h-6 text-white" />
          ) : (
            <CameraOff className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={handleMicToggle}
          disabled={isLoadingMic || !isMicReady}
          title={!isMicReady ? 'Microphone not available' : ''}
          className={`p-4 rounded-full transition-all ${isLoadingMic || !isMicReady
              ? 'bg-gray-700 opacity-50 cursor-not-allowed'
              : isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
        >
          {isLoadingMic ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isAudioEnabled ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
        </button>

        <button
          onClick={handleScreenShareToggle}
          className={`p-4 rounded-full transition-all ${isScreenSharing
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-6 h-6 text-white" />
          ) : (
            <Monitor className="w-6 h-6 text-white" />
          )}
        </button>

        <a
          href="/"
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </a>
      </div>
    </div>
  );
}

export default function Call(props: CallProps) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' }));

  return (
    <AgoraRTCProvider client={client}>
      <Videos {...props} />
    </AgoraRTCProvider>
  );
}
