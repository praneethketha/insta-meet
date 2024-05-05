import Preview from "@/components/room/preview";
import RoomInfo from "@/components/room/room";
import { useSocket } from "@/context/socker.context";
import useMediaStream from "@/hooks/useMediaStream";
import usePeer from "@/hooks/usePeer";
import usePlayer from "@/hooks/usePlayer";
import { Controls } from "@/types";
import { FormEvent, useState } from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [controls, setControls] = useState<Controls>({
    muted: true,
    playing: true,
  });

  const socket = useSocket();
  const { stream } = useMediaStream();
  const { peer, myId } = usePeer();
  const { roomId } = useParams();
  const {
    players,
    sourcePlayer,
    setPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  } = usePlayer(myId, roomId, peer, stream);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stream || !myId) return;

    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        userName: name,
        ...controls,
      },
    }));

    const data = {
      userName: name,
      controls,
    };
    socket?.emit("join-room", roomId, myId, data);
    setJoined(true);
  };

  if (!joined) {
    return (
      <Preview
        myId={myId}
        stream={stream}
        controls={controls}
        name={name}
        setName={setName}
        setControls={setControls}
        handleJoinRoom={handleJoinRoom}
      />
    );
  }
  return (
    <RoomInfo
      peer={peer}
      stream={stream}
      myId={myId}
      name={name}
      controls={controls}
      players={players}
      sourcePlayer={sourcePlayer}
      toggleAudio={toggleAudio}
      toggleVideo={toggleVideo}
      leaveRoom={leaveRoom}
      setPlayers={setPlayers}
    />
  );
};

export default Room;
