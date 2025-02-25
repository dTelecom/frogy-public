import { Room, RoomEvent } from "@dtelecom/livekit-client";
import { filter, map, Observable, scan, Subject, takeUntil } from "rxjs";
import { RoomEventCallbacks } from "@dtelecom/livekit-client/dist/src/room/Room";
import { UserResponse } from "@/api/user";

export interface IChatMessage {
  sender: UserResponse;
  payload?:
    | string
    | { count: number; from: number; to: number; type: string; value: number }
    | { id: number; amount: number }[];
  type: "join" | "chat" | "roomTop" | "gift";
  ts: number;
}

export function roomEventSelector<T extends RoomEvent>(room: Room, event: T) {
  const observable = new Observable<Parameters<RoomEventCallbacks[T]>>(
    (subscribe) => {
      const update = (...params: Parameters<RoomEventCallbacks[T]>) => {
        subscribe.next(params);
      };
      // @ts-ignore
      room.on(event, update);

      const unsubscribe = () => {
        // @ts-ignore
        room.off(event, update);
      };
      return unsubscribe;
    }
  );

  return observable;
}

export function createDataObserver(room: Room) {
  return roomEventSelector(room, RoomEvent.DataReceived);
}

const decoder = new TextDecoder();
const onDestroyObservable = new Subject<void>();
const messageSubject = new Subject<{
  payload: Uint8Array;
}>();

export interface ISetupDataMessageHandler {
  messageObservable?: Observable<IChatMessage[]>;
  addMessage?: (message: IChatMessage) => void;
}
export function setupDataMessageHandler<T extends string>(
  room: Room,
  topic?: T | T[]
) {
  const messageObservable = createDataObserver(room).pipe(
    filter(([, , , messageTopic]) => {
      if (Array.isArray(topic)) return topic.includes(messageTopic as T);

      return topic === undefined || messageTopic === topic;
    }),
    map((arr) => {
      console.log("arr", arr);
      return {
        payload: arr[0],
      };
    })
  );

  messageObservable
    .pipe(takeUntil(onDestroyObservable))
    .subscribe(messageSubject);

  const observable = messageSubject.pipe(
    map((msg) => {
      const parsedMessage = JSON.parse(
        decoder.decode(msg.payload)
      ) as IChatMessage;
      console.log("parsedMessage", parsedMessage);
      const newMessage: IChatMessage = {
        ...parsedMessage,
        ts: new Date().getTime(),
      };
      return newMessage;
    }),
    scan<IChatMessage, IChatMessage[]>((acc, value) => [...acc, value], []),
    takeUntil(onDestroyObservable)
  );
  // method to add messages locally to the observable
  const addMessage = (message: IChatMessage) => {
    messageSubject.next({
      payload: new TextEncoder().encode(JSON.stringify(message)),
    });
  };

  return { messageObservable: observable, addMessage };
}
