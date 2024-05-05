import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import IMAGES from "@/constants/images";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleNewMeet = async () => {
    try {
      const roomId = uuid();

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: roomId }),
      });

      const body = await res.text();
      if (res.status === 201) {
        navigate(`/${roomId}`);
      } else {
        setError(body);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/room/${roomId}`
      );
      const body = await res.text();
      if (res.status === 200) {
        navigate(`/${roomId}`);
      } else {
        setError(body);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="relative pb-6 md:p-10 lg:px-20 max-w-[1200px] min-h-[100dvh] w-full mx-auto border-x border-gray-300">
      <nav className="p-6 md:p-0 flex justify-between items-center bg-white sticky top-0 border-b md:border-none">
        <h3 className="font-bold md:font-extrabold text-xl md:text-2xl">
          <span className="text-primary">Insta</span> Meet
        </h3>
      </nav>
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 mt-6 md:mt-0 gap-10 md:gap-4 md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full lg:px-20 md:px-10">
        <section className="space-y-8">
          <article className="space-y-4">
            <h1 className="text-center md:text-left text-xl md:text-2xl lg:text-4xl font-bold md:font-extrabold">
              Instant Video Meetings, Anytime, Anywhere
            </h1>
            <p className="text-center md:text-left font-normal text-gray-500 text-sm lg:text-base leading-relaxed">
              No more waiting around for meetings to start. Our app lets you
              connect with a single click, ensuring instant face time whenever
              you need it.
            </p>
          </article>
          <article className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-2">
            <Button
              type="button"
              aria-label="start-meet"
              className="capitalize w-32"
              onClick={handleNewMeet}
            >
              new meeting
            </Button>
            <div className="w-full md:w-[1px] md:h-9 bg-gray-200 h-[1px] relative before:absolute before:p-1 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['or'] md:before:content-[''] before:bg-white" />

            {/* <div className="h-9 bg-gray-200 w-[1px]" /> */}
            <form onSubmit={handleJoinRoom} className="flex items-start gap-1">
              <div>
                <Input
                  name="code"
                  placeholder="Enter meeting code"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                {error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : null}
              </div>
              <Button
                type="submit"
                aria-label="join-now"
                className="capitalize w-32"
                variant="ghost"
              >
                join now
              </Button>
            </form>
          </article>
        </section>
        <img
          src={IMAGES.hero}
          alt="hero"
          className="!w-full aspect-[5/3] object-cover"
        />
      </div>
    </main>
  );
}
