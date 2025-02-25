import styles from "./Chat.module.scss";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import SendIcon from "@/assets/icons/sendIcon.svg";
import { useRoomContext } from "@dtelecom/components-react";
import { Observable } from "rxjs";
import { IChatMessage, ISetupDataMessageHandler } from "./setupDataMessageHandler";
import { UserResponse } from "@/api/user";
import { clsx } from "clsx";
import { giftsItems } from "../GiftsButton/GiftsButton";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { createPortal } from "react-dom";
import { UserDrawer } from "@/components/UserDrawer/UserDrawer";

interface IChatProps {
  chatOpen: boolean;
  onClose: () => void;
  roomId: number;
  isStreamer: boolean;
  onGiftMessageClick: () => void;
  setup?: ISetupDataMessageHandler;
}

export function useObservableState<T>(
  observable: Observable<T> | undefined,
  startWith: T
) {
  const [state, setState] = React.useState<T>(startWith);
  React.useEffect(() => {
    // observable state doesn't run in SSR
    if (typeof window === "undefined" || !observable) return;
    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable]);
  return state;
}

export const Chat = ({
  roomId,
  chatOpen,
  onClose,
  isStreamer,
  onGiftMessageClick,
  setup
}: IChatProps) => {
  const { t } = useTranslation();
  const room = useRoomContext();
  const allMsg = useObservableState(setup?.messageObservable, []);

  const user = useAppSelector((state) => state.user);
  const [userDrawerOpen, setUserDrawerOpen] = useState<UserResponse>();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [topPos, setTopPos] = useState(0);

  const preventBlur = useRef(false);

  const chatFollowMode = useRef(true);

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const messages = useMemo(() => {
    const msgs = allMsg.filter((msg) =>
      ["chat", "join", "gift"].includes(msg.type || "")
    );

    return msgs.slice(Math.max(msgs.length - 100, 0));
  }, [allMsg]);

  const scrollRestoreTimer = useRef<any>();

  useEffect(() => {
    if (chatFollowMode.current) {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }

    const onScroll = () => {
      if (scrollRestoreTimer.current) {
        clearTimeout(scrollRestoreTimer.current);
      }

      if (
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollHeight -
        messagesContainerRef.current.scrollTop -
        messagesContainerRef.current.clientHeight >
        50
      ) {
        chatFollowMode.current = false;

        scrollRestoreTimer.current = setTimeout(() => {
          chatFollowMode.current = true;
        }, 20000);
      } else {
        chatFollowMode.current = true;
      }
    };
    messagesContainerRef.current?.addEventListener("scroll", onScroll);

    return () => {
      messagesContainerRef.current?.removeEventListener("scroll", onScroll);
    };
  }, [messages]);

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (preventBlur.current) {
      inputRef.current?.focus();
      preventBlur.current = false;
      return;
    }

    if (!event.relatedTarget || (event.relatedTarget as HTMLButtonElement).type !== "submit") {
      onClose();
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;

        messagesContainerRef.current?.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 0);
    }
  };

  useEffect(() => {
    document.body.style.overflow = chatOpen ? "hidden" : "initial";
    if (chatOpen) {
      inputRef.current?.focus();
    }

    resizeHandler();
    const interval = isIos
      ? setInterval(() => {
        resizeHandler();
      }, 100)
      : undefined;

    return () => {
      clearInterval(interval);
    };
  }, [chatOpen]);

  function resizeHandler() {
    if (!window.visualViewport) return;

    let top = window.visualViewport.height;
    if (isIos) {
      top = window.scrollY;
    }

    if (topPos === top) return;
    setTopPos(top);
  }

  const sendMessage = async () => {
    if (!text) return;
    setText("");
    // await chatApi.sendMessage(roomId, text);
    const message: IChatMessage = {
      sender: user,
      payload: text,
      type: "chat",
      ts: new Date().getTime()
    };

    const encodedText = new TextEncoder().encode(JSON.stringify(message));
    await room.localParticipant.publishData(encodedText, 0);
    if (setup?.addMessage) {
      setup?.addMessage(message);
    }
  };

  const onMessageTextClick = (msg: IChatMessage) => {
    switch (msg.type) {
      case "gift":
        onGiftMessageClick();
        break;
      default:
        onOpenUser(msg);
        break;
    }
  };

  const onOpenUser = (msg: IChatMessage) => {
    console.log(msg);
    if (msg.sender) {
      setUserDrawerOpen(msg.sender);
    }
  };

  return (
    <div
      style={{
        top: isIos ? topPos : undefined,
        height: isIos ? "var(--tg-viewport-height)" : undefined
      }}
      ref={containerRef}
      className={styles.container}
    >
      <div
        className={clsx(
          styles.chatContainer,
          chatOpen ? styles.chatContainerOpen : "",
          isStreamer ? styles.chatContainerStreamer : ""
        )}
        ref={messagesContainerRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx + msg.ts}
            className={styles.messageContainer}
          >
            <div className={styles.message}>
              <div className={styles.textbox}>
                {renderMessageText(
                  msg,
                  t,
                  roomId,
                  onMessageTextClick,
                  () => onOpenUser(msg)
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: !chatOpen ? "none" : undefined
        }}
        className={styles.inputContainer}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage();
            inputRef.current?.focus();
          }}
        >
          <input
            autoCorrect={"off"}
            spellCheck={"false"}
            autoComplete={"off"}
            ref={inputRef}
            className={styles.input}
            type="text"
            value={text}
            onChange={(e) => {
              // max length 500
              setText(e.target.value.slice(0, 500));
            }}
            onBlur={onBlur}
          />

          <button
            tabIndex={-1}
            type={"submit"}
            className={styles.sendButton}
            onTouchEnd={() => {
              preventBlur.current = true;
            }}
          >
            <SendIcon />
          </button>
        </form>
      </div>

      {userDrawerOpen &&
        createPortal(
          <UserDrawer
            roomId={roomId}
            streamView
            user={userDrawerOpen}
            onClose={() => setUserDrawerOpen(undefined)}
          />,
          document.body
        )}

    </div>
  );
};

function renderMessageText(
  msg: IChatMessage,
  t: TFunction<"translation", undefined>,
  roomId: number,
  // eslint-disable-next-line no-unused-vars
  onClick: (msg: IChatMessage) => void,
  onOpenUser: () => void
) {
  const hostText = roomId === msg.sender.id ? " " + t("chat.streamer") : "";
  if (msg.type === "chat" && typeof msg.payload === "string") {
    return (
      <span className={styles.messageText}>
        <span onClick={onOpenUser}>
          {msg.sender.name}
          {hostText}
          :
        </span>
        &nbsp;
        <span
          onClick={onClick ? () => onClick(msg) : onOpenUser}
          style={{
            color: "#FFFFFF"
          }}
        >
          {msg.payload}
        </span>
      </span>
    );
  }

  if (
    msg.type === "gift" &&
    msg.payload !== undefined &&
    typeof msg.payload !== "string" &&
    // @ts-ignore
    msg.payload.type in giftsItems
  ) {
    const message = msg.payload as { type: string; count: number };
    const gift = giftsItems[message.type as keyof typeof giftsItems];
    if (!gift) return "";

    return (
      <span
        style={{
          alignItems: "center"
        }}
        className={styles.messageText}
      >
        <span onClick={onOpenUser}>
          {msg.sender.name}
          {hostText}
          :
        </span>
        &nbsp;
        <span
          onClick={() => onClick(msg)}
          style={{
            color: "#72E655",
            display: "inline",
            alignItems: "center",
            gap: "8px"
            // whiteSpace: "nowrap",
          }}
        >
          {t("common.sentGift", {
            giftName: t(gift.translationKey, gift.name)
          })}
          <img
            src={gift.imgUrl as string}
            alt={message.type}
            style={{
              width: 16,
              height: 16,
              margin: "0 8px",
              verticalAlign: "middle"
            }}
          />
          x{message.count}
        </span>
      </span>
    );
  }

  return "";
}
