import { Button } from "../ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import Player from "../common/player";
import { Input } from "../ui/input";
import {
  type FC,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { type Controls } from "@/types";

type Props = {
  myId: string;
  stream: MediaStream | undefined;
  controls: Controls;
  name: string | undefined;
  setName: Dispatch<SetStateAction<string>>;
  setControls: Dispatch<SetStateAction<Controls>>;
  handleJoinRoom: (e: FormEvent<HTMLFormElement>) => void;
};

const Preview: FC<Props> = ({
  myId,
  stream,
  controls,
  name,
  setName,
  setControls,
  handleJoinRoom,
}) => {
  return (
    <main className="relative pb-6 md:p-10 lg:px-20 max-w-[1200px] min-h-[100dvh] w-full mx-auto border-x border-gray-300">
      <nav className="p-6 md:p-0 flex justify-between items-center bg-white sticky top-0 border-b md:border-none z-20">
        <h3 className="font-bold md:font-extrabold text-xl md:text-2xl">
          <span className="text-primary">Insta</span> Meet
        </h3>
      </nav>
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-10 place-items-center">
        <div className="gap-4 grid grid-cols-6 w-full">
          <Player
            url={stream}
            muted={controls.muted}
            playing={controls.playing}
            userName={name}
            className="!aspect-video !w-full !h-auto"
            length={1}
            self={true}
          />
          <div className="col-span-6 w-full flex items-center gap-2 justify-center">
            <div
              className="cursor-pointer"
              onClick={() =>
                setControls((prev) => ({ ...prev, muted: !prev.muted }))
              }
            >
              {!controls.muted ? (
                <Button variant="outline" size="icon" className="rounded-full">
                  <Mic className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                >
                  <MicOff className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
            </div>
            <div
              className="cursor-pointer"
              onClick={() =>
                setControls((prev) => ({ ...prev, playing: !prev.playing }))
              }
            >
              {controls.playing ? (
                <Button variant="outline" size="icon" className="rounded-full">
                  <Video className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full"
                >
                  <VideoOff className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <form
          className="flex flex-col items-center space-y-8"
          onSubmit={handleJoinRoom}
        >
          <div className="flex flex-col w-full items-center space-y-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              Join Meeting
            </h1>
            <p className="text-center font-normal text-gray-500 text-sm lg:text-base">
              Customize your settings and join the meeting with ease. Enter your
              name and click "Ask to Join" below.
            </p>
          </div>
          <div className="flex flex-col w-full items-center space-y-4">
            <Input
              name="username"
              placeholder="Enter Name"
              value={name}
              required
              min={1}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              disabled={!stream || !myId}
              type="submit"
              aria-label="join"
              className="capitalize w-32"
            >
              Join Now
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Preview;
