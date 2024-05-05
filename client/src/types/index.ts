import { MediaConnection } from "peerjs";

export type Controls = {
  muted: boolean;
  playing: boolean;
};

export type PeerInfo = {
  url?: MediaStream;
  muted?: boolean;
  playing?: boolean;
  userName?: string;
  call?: MediaConnection;
};

export type Player = {
  [key: string]: PeerInfo;
};

export type UserData = {
  userId: string;
  userName: string;
  controls: Controls;
};