import { useSocket } from "@/context/socker.context";
import Peer from "peerjs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type PeerInfo, type Player } from "@/types";

const usePlayer = (
  myId: string,
  roomId?: string,
  peer?: Peer,
  stream?: MediaStream
) => {
  const socket = useSocket();
  const [players, setPlayers] = useState<Player>();
  const navigate = useNavigate();

  const sourcePlayer: PeerInfo | undefined = players?.[myId];

  const leaveRoom = () => {
    socket?.emit("user-leave", myId, roomId);
    peer?.disconnect();
    stream?.getTracks().forEach(function (track) {
      track.stop();
    });
    navigate("/");
  };

  const toggleAudio = (id: string) => {
    setPlayers((prev) => ({
      ...prev,
      [id]: { ...prev?.[id], muted: !prev?.[id].muted },
    }));

    if (id === myId) {
      socket?.emit("user-toggle-audio", id, roomId);
    }
  };

  const toggleVideo = (id: string) => {
    setPlayers((prev) => ({
      ...prev,
      [id]: { ...prev?.[id], playing: !prev?.[id].playing },
    }));

    if (id === myId) {
      socket?.emit("user-toggle-video", myId, roomId);
    }
  };

  return {
    players,
    sourcePlayer,
    setPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};

export default usePlayer;
