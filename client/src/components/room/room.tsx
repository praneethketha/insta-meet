import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Copy,
  Info,
  Mic,
  MicOff,
  Phone,
  Video,
  VideoOff,
  SendHorizontal,
  X,
  MessageCircle,
} from "lucide-react";
import Player from "../common/player";
import { Button } from "../ui/button";
import { useParams } from "react-router-dom";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
  type FC,
} from "react";
import { Controls, PeerInfo, Player as PlayerType, UserData } from "@/types";
import { useSocket } from "@/context/socker.context";
import Peer, { DataConnection } from "peerjs";
import { cloneDeep } from "lodash";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";

type Props = {
  peer?: Peer;
  stream?: MediaStream;
  controls: Controls;
  players: PlayerType | undefined;
  name: string;
  myId: string;
  sourcePlayer: PeerInfo | undefined;
  toggleAudio: (id: string) => void;
  toggleVideo: (id: string) => void;
  leaveRoom: () => void;
  setPlayers: Dispatch<SetStateAction<PlayerType | undefined>>;
};

type Message = {
  sender: string;
  message: string;
  timestamp: number;
  userName?: string;
};

const RoomInfo: FC<Props> = ({
  peer,
  stream,
  controls,
  players,
  name,
  myId,
  sourcePlayer,
  toggleAudio,
  toggleVideo,
  leaveRoom,
  setPlayers,
}) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conn, setConn] = useState<DataConnection>();
  const [count, setCount] = useState<number>(0);
  const [openChat, setOpenChat] = useState<boolean>(false);

  const { roomId } = useParams();
  const socket = useSocket();

  const handleMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (conn && conn.open) {
      setMessages((prev) => [
        ...prev,
        {
          sender: myId,
          message,
          timestamp: Date.now(),
          userName: sourcePlayer?.userName,
        },
      ]);
      conn.send(message);
      setMessage("");
    }
  };

  useEffect(() => {
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (user: UserData) => {
      const { userId, userName, controls: userControls } = user;
      const options = { metadata: { name, controls } };
      const call = peer.call(userId, stream, options);

      call.on("stream", (incomingStream) => {

        setPlayers((prev) => ({
          ...prev,
          [userId]: {
            url: incomingStream,
            userName,
            call,
            ...userControls,
          },
        }));
      });

      const conn = peer.connect(userId, options);
      setConn(conn);

      conn.on("open", function () {
        conn.on("data", (data) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: userId,
              message: data as string,
              timestamp: Date.now(),
              userName,
            },
          ]);
          setCount((prev) => prev + 1);
        });
      });
    };

    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [name, peer, socket, stream, controls]);

  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId, metadata } = call;
      call.answer(stream);

      call.on("stream", (incomingStream) => {
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            userName: metadata?.name,
            call,
            ...metadata?.controls,
          },
        }));
      });
    });
  }, [peer, players, stream]);

  useEffect(() => {
    if (!peer) return;

    peer.on("connection", function (conn) {
      const userName = conn.metadata?.name;
      setConn(conn);

      conn.on("data", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            sender: conn.peer,
            message: data as string,
            timestamp: Date.now(),
            userName,
          },
        ]);
        setCount((prev) => prev + 1);
      });
    });
  }, [openChat, peer]);

  useEffect(() => {
    if (!socket) return;
    const handleToggleAudio = (userId: string) => {
      toggleAudio(userId);
    };

    const handleToggleVideo = (userId: string) => {
      toggleVideo(userId);
    };

    const handleUserLeave = (userId: string) => {
      players?.[userId].call?.close();

      const playersCopy = cloneDeep(players);
      delete playersCopy?.[userId];
      setPlayers(playersCopy);
    };

    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, socket]);

  useEffect(() => {}, []);

  const handleOpenChat = (value: boolean) => {
    setCount(0);
    setOpenChat(value);
  };

  const handleCopy = (value: string | undefined) => {
    if (!value) return;

    navigator.clipboard.writeText(value);
  };

  return (
    <main className="relative max-w-[1200px] max-h-[100dvh] w-full h-[100dvh] flex flex-row mx-auto border-x bg-gray-100">
      <div className="flex-1 flex flex-col gap-6 md:p-6 overflow-hidden">
        <nav className="p-6 md:p-0 flex justify-between items-center bg-gray-100 sticky top-0 border-b md:border-none">
          <h3 className="font-bold md:font-extrabold text-xl md:text-2xl">
            <span className="text-primary">Insta</span> Meet
          </h3>
          <Popover>
            <PopoverTrigger>
              <Info className="w-5 h-5 text-gray-400" />
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="space-y-4">
                <h4>Meeting Details</h4>
                <section className="space-y-2">
                  <p className="text-[0.8rem] text-gray-500">
                    Share the following meeting link with others
                  </p>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-100 rounded">
                    <p className="truncate text-gray-500 text-[0.8rem] flex-1">{`instameet.com/${roomId}`}</p>
                    <Copy
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() => handleCopy(`instameet.com/${roomId}`)}
                    />
                  </div>
                </section>
                <div className="w-full bg-gray-100 h-[1px] relative before:absolute before:p-1 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['or'] before:bg-white" />
                <section className="space-y-2">
                  <p className="text-[0.8rem] text-gray-500">
                    Copy for the following meeting Id and share with others
                  </p>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-100 rounded">
                    <p className="truncate text-gray-500 text-[0.8rem] flex-1">
                      {roomId}
                    </p>
                    <Copy
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() => handleCopy(roomId)}
                    />
                  </div>
                </section>
              </div>
            </PopoverContent>
          </Popover>
        </nav>
        <div className="flex-1 h-1 flex flex-col gap-4">
          <div className="px-6 md:p-0 relative flex-1 h-1 grid grid-cols-6 gap-4 flex-wrap overflow-y-auto">
            {players
              ? Object.keys(players).map((playerId) => {
                  const { url, muted, playing, userName } = players[playerId];
                  const length = Object.keys(players).length;
                  return (
                    <Player
                      key={playerId}
                      url={url}
                      muted={muted}
                      playing={playing}
                      userName={userName}
                      length={length}
                      self={playerId === myId}
                    />
                  );
                })
              : null}
          </div>
          <section className="relative flex justify-between items-center px-6 py-4 md:p-4 md:rounded-lg bg-gray-200">
            <article className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-full flex items-center justify-center w-8 h-8 text-white capitalize">
                {name[0]}
              </div>
              <p className="md:block hidden">{name}</p>
            </article>
            <article className="flex items-center gap-2">
              <div className="cursor-pointer" onClick={() => toggleAudio(myId)}>
                {!sourcePlayer?.muted ? (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Mic className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                onClick={leaveRoom}
              >
                <Phone className="rotate-[135deg] w-4 h-4 md:w-5 md:h-5 text-white" />
              </Button>
              <div className="cursor-pointer" onClick={() => toggleVideo(myId)}>
                {sourcePlayer?.playing ? (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <VideoOff className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                )}
              </div>
            </article>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => handleOpenChat(!openChat)}
            >
              {!openChat && count > 0 ? (
                <p className="p-1 text-xs bg-destructive text-white flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full absolute top-0 right-0 animate-pulse">
                  {count}
                </p>
              ) : null}
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 cursor-pointer" />
            </Button>
          </section>
        </div>
      </div>

      {/* chat  */}
      {/* {openChat ? ( */}
      <div
        className={cn(
          "translate-x-full md:hidden transition-all absolute md:static top-0 right-0 z-40 md:w-80 w-full h-[100dvh]",
          {
            "translate-x-0 md:block": openChat,
          }
        )}
      >
        <section className="relative h-full w-full bg-white border-l overflow-hidden flex flex-col">
          <article className="sticky top-0 bg-white p-4 w-full flex justify-between items-center border-b">
            <h3 className="text-lg font-medium">Chat</h3>
            <X
              className="w-4 h-4 text-gray-500 cursor-pointer"
              onClick={() => handleOpenChat(false)}
            />
          </article>
          <p className="text-gray-500 p-2 m-4 text-xs bg-gray-100">
            Messages can only be seen people in the call when the message is
            sent. All the messages are deleted when the call ends.
          </p>
          <ScrollArea className="flex-1 h-full pb-20">
            <div className="p-4 w-full flex flex-col gap-4">
              {messages.map((item, index) => (
                <article
                  key={index}
                  className={cn("flex flex-col items-start", {
                    "items-end w-full": item.sender === myId,
                  })}
                >
                  <p className="text-[0.6rem] font-light space-x-1 text-gray-400">
                    <span>{item?.userName}</span> <span>|</span>
                    <span>
                      {new Intl.DateTimeFormat("en-us", {
                        timeStyle: "short",
                      }).format(item.timestamp)}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "p-2 max-w-[70%] bg-gray-100 text-sm rounded-md rounded-tl-none text-gray-500",
                      {
                        "bg-[#0069D1]/75 text-white rounded-md rounded-tr-none":
                          item.sender === myId,
                      }
                    )}
                  >
                    {item.message}
                  </p>
                </article>
              ))}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleMessage}
            className="p-4 bg-white flex items-center gap-2 border-t fixed bottom-0 md:w-80 w-full"
          >
            <div className="w-full bg-gray-100 pr-2 flex items-center justify-between rounded-sm">
              <input
                type="text"
                name="message"
                id="message"
                placeholder="Enter message"
                className="h-8 w-full outline-none rounded-sm p-2 pr-0 text-sm bg-gray-100"
                required
                min={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button
              aria-label="send"
              type="submit"
              disabled={!conn || !message.length}
              className="!h-8 aspect-square bg-primary text-white flex items-center justify-center rounded-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <SendHorizontal className="w-4 h-4 text-white" />
            </button>
          </form>
        </section>
      </div>
      {/* ) : null} */}
    </main>
  );
};

export default RoomInfo;
