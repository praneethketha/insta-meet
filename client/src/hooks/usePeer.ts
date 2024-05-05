import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";

const usePeer = () => {
    const {roomId} = useParams();
    const [peer, setPeer] = useState<Peer>();
    const [myId, setMyId] = useState("");
    const isPeerSet = useRef(false);

    useEffect(() => {
      if (isPeerSet.current || !roomId) return;
      isPeerSet.current = true;
      let myPeer;
      (async function initPeer() {
        myPeer = new Peer();
        setPeer(myPeer);

        myPeer.on("open", (id) => {
          setMyId(id);
        });
      })();
    }, [roomId]);

    return {
      peer,
      myId,
    };
}

export default usePeer;