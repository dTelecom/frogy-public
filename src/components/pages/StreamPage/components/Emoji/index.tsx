import { useChat } from "@dtelecom/components-react";
import styles from "../../StreamPage.module.scss";
import * as React from "react";
import { useCallback, useEffect, useRef } from "react";

function createEmoji(emoji: string) {
  const emojiSpan = document.createElement("span");
  emojiSpan.classList.add("emoji");
  emojiSpan.textContent = emoji;
  emojiSpan.style.left = `calc(${Math.random() * 100}% - 16px)`; // Random horizontal position
  emojiSpan.style.animationDelay = `${Math.random()}s`; // Random delay
  const emojiContainer = document.getElementById("emojiContainer");
  emojiContainer?.appendChild(emojiSpan);

  setTimeout(() => {
    emojiSpan.remove();
  }, 4000);
}

const emoji = ["🎉", "❤️", "😂", "👍"];

export const EmojiButtons = () => {
  const { sendTranscription } = useChat();

  const accum = useRef<string[]>([]);
  const accumTimeout = useRef<NodeJS.Timeout | null>(null);
  const EMOJI_BATCH_COUNT = 10;

  const onClick = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
    emoj: string
  ) => {
    e.preventDefault();

    if (sendTranscription) {
      createEmoji(emoj);

      if (accum.current.length === 0) {
        sendTranscription(emoj, "emoji");
      }

      accum.current.push(emoj);
      if (accum.current.length >= EMOJI_BATCH_COUNT) {
        const uniqueEmojis = new Set(accum.current);
        accum.current = [];
        uniqueEmojis.forEach((emoji) => {
          sendTranscription(emoji, "emoji");
        });
      }

      if (accumTimeout.current) {
        clearTimeout(accumTimeout.current);
      }
      if (accum.current.length > 1) {
        accumTimeout.current = setTimeout(() => {
          const uniqueEmojis = new Set(accum.current);
          accum.current = [];
          uniqueEmojis.forEach((emoji) => {
            sendTranscription(emoji, "emoji");
          });
        }, 1000);
      } else {
        accumTimeout.current = setTimeout(() => {
          accum.current = [];
        }, 1000);
      }
    }
  };

  return (
    <>
      <div className={styles.clickerContainer}>
        {emoji.map((emoj) => (
          <button
            key={emoj}
            className={styles.clickerButton}
            onMouseUp={(e) => onClick(e, emoj)}
            onTouchEnd={(e) => onClick(e, emoj)}
          >
            {emoj}
          </button>
        ))}
      </div>
    </>
  );
};

export const EmojiFountain = () => {
  const { transcriptions } = useChat();

  const accum = useRef<string[]>([]);
  const accumTimeout = useRef<NodeJS.Timeout | null>(null);
  const EMOJI_BATCH_COUNT = 10;

  const debounceCreateEmoji = useCallback((emoji: string) => {
    if (accum.current.length === 0) {
      createEmoji(emoji);
    }
    accum.current.push(emoji);
    if (accum.current.length >= EMOJI_BATCH_COUNT) {
      const uniqueEmojis = new Set(accum.current);
      accum.current = [];
      uniqueEmojis.forEach((emoji) => {
        createEmoji(emoji);
      });
    }

    if (accumTimeout.current) {
      clearTimeout(accumTimeout.current);
    }
    if (accum.current.length > 1) {
      accumTimeout.current = setTimeout(() => {
        const uniqueEmojis = new Set(accum.current);
        accum.current = [];
        uniqueEmojis.forEach((emoji) => {
          createEmoji(emoji);
        });
      }, 1000);
    } else {
      accumTimeout.current = setTimeout(() => {
        accum.current = [];
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const transcription = transcriptions[transcriptions.length - 1];
    if (transcription && transcription.transcription) {
      debounceCreateEmoji(
        transcription.transcription
      );
    }

  }, [transcriptions]);

  return <div
    id={"emojiContainer"}
    className={styles.emojiContainer}
  ></div>;
};
