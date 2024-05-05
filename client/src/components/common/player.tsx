import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";
import { FC } from "react";
import ReactPlayer from "react-player";

type Props = {
  url?: MediaStream;
  muted?: boolean;
  playing?: boolean;
  userName?: string;
  length: number;
  className?: string;
  self?: boolean;
};

const Player: FC<Props> = ({
  url,
  playing,
  muted,
  userName,
  length,
  className,
  self = false,
}) => {
  return (
    <div
      className={cn(
        "!rounded-md react-player relative cover-video col-span-6 !w-full", {
          "md:col-span-2" : length % 3 === 0 || length > 4,
          "md:col-span-3" : length % 2 === 0,
        },
        className
      )}
    >
      {playing ? (
        <ReactPlayer url={url} playing={playing} muted={self ? true : muted} />
      ) : (
        <div className="rounded-md shadow-[0px_0px_10px_rgba(0,0,0,0.25)] bg-gray-800 flex justify-center items-center">
          <p className="relative w-2/12 aspect-square bg-primary text-white flex items-center justify-center rounded-full text-[200%] font-medium capitalize">
            {userName?.[0]}
          </p>
        </div>
      )}
      {!self ? 
      <section className="flex items-center gap-1 absolute py-1 px-2 rounded-full bottom-5 left-5 bg-black/40">
        <p className="text-white text-xs">{userName}</p>
        {muted ? (
          <MicOff className="w-4 h-4 text-white" />
        ) : (
          <Mic className="w-4 h-4 text-white" />
        )}
      </section> : null}
    </div>
  );
};

export default Player;
