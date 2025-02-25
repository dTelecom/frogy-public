import React, { useEffect, useState } from "react";
import styles from "./GiftsButton.module.scss";
import { useTranslation } from "react-i18next";
import { Sheet } from "react-modal-sheet";

import CloseIcon from "@/assets/icons/close.svg";
import { createPortal } from "react-dom";
import TeddyBear from "@/assets/img/gifts/TeddyBear.webp";
import Heart from "@/assets/img/gifts/Heart.webp";
import Kiss from "@/assets/img/gifts/Kiss.webp";
import Microphone from "@/assets/img/gifts/Microphone.webp";
import Ring from "@/assets/img/gifts/Ring.webp";
import SingleRose from "@/assets/img/gifts/SingleRose.webp";
import Star from "@/assets/img/gifts/Star.webp";
import Trophy from "@/assets/img/gifts/Trophy.webp";

import SmallStarIcon from "@/assets/icons/smallStarIcon.svg";
import giftButtonImage from "@/assets/img/giftButton.webp";
import { clsx } from "clsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { userApi } from "@/api";
import { UserResponse } from "@/api/user";
import { getUser } from "@/store/features/userSlice";
import { toast } from "react-toastify";
import { Toast } from "@/components/Toast/Toast";
import { eventEmitter } from "@/lib/events";
import { RechargeDrawer } from "@/components/GiftsButton/GiftsButton";
import { useRoomContext } from "@dtelecom/components-react";
import {
  IChatMessage,
  ISetupDataMessageHandler
} from "@/components/pages/StreamPage/components/Chat/setupDataMessageHandler";

interface GiftsButtonProps {
  streamerId: UserResponse["id"];
  setup?: ISetupDataMessageHandler;
}

export const GiftsButton = ({ streamerId, setup }: GiftsButtonProps) => {
  const [showGifts, setShowGifts] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);

  useEffect(() => {
    const func = () => {
      setShowGifts(true);
    };
    eventEmitter.on("stream.showGifts", func);
    return () => {
      eventEmitter.off("stream.showGifts", func);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setShowGifts(true)}
        className={styles.giftsButton}
      >
        <img
          src={giftButtonImage.src}
          alt={"gift button"}
        />
      </button>

      {rechargeModalVisible && (
        <RechargeDrawer onClose={() => setRechargeModalVisible(false)} />
      )}
      {showGifts &&
        !rechargeModalVisible &&
        createPortal(
          <GiftsDrawer
            streamerId={streamerId}
            onRechargeOpen={() => setRechargeModalVisible(true)}
            onClose={() => setShowGifts(false)}
            setup={setup}
          />,
          document.body
        )}
    </>
  );
};

interface GiftsDrawerProps {
  onClose: () => void;
  onRechargeOpen: () => void;
  streamerId: UserResponse["id"];
  setup?: ISetupDataMessageHandler;
}

const GiftsDrawer = ({
  onClose,
  onRechargeOpen,
  streamerId,
  setup
}: GiftsDrawerProps) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [selectedGift, setSelectedGift] = useState("SingleRose");
  const [amount, setAmount] = useState(1);
  const dispatch = useAppDispatch();
  const room = useRoomContext();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onGiftSend = async () => {
    if (!selectedGift) {
      return;
    }
    const gift: GiftItem | false | undefined = giftsItems.hasOwnProperty(selectedGift) && giftsItems[selectedGift];
    if (!gift) return;

    if (user.starsBalance < gift.price * amount) {
      toast(
        <Toast
          type={"warning"}
          message={t(
            "toast.needRecharge",
            "You don’t have enough Stars to send a gift"
          )}
        />
      );
      onRechargeOpen();
      return;
    }

    await userApi.sendGift(streamerId, selectedGift, amount);
    const message: IChatMessage = {
      sender: user,
      payload: {
        type: selectedGift,
        count: amount,
        from: user.id,
        to: streamerId,
        value: gift.price * amount
      },
      type: "gift",
      ts: new Date().getTime()
    };

    const encodedText = new TextEncoder().encode(JSON.stringify(message));
    await room.localParticipant.publishData(encodedText, 0);
    if (setup?.addMessage) {
      setup.addMessage(message);
    }
    dispatch(getUser());
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={styles.wrapper}
    >
      <Sheet
        style={{
          zIndex: 101
        }}
        detent={"content-height"}
        isOpen={true}
        onClose={onClose}
      >
        <Sheet.Container>
          <Sheet.Content>
            <div className={styles.container}>
              <button
                className={styles.close}
                onClick={onClose}
              >
                <CloseIcon />
              </button>

              <h2 className={styles.title}>{t("common.gifts")}</h2>

              <div className={styles.giftsContainer}>
                {sortedGiftsByPriceKeys.map((key) => {
                  const gift = giftsItems[key];
                  if (!gift) return null;

                  return (
                    <div
                      key={key}
                      className={styles.giftWrapper}
                    >
                      <div
                        onClick={() => {
                          setSelectedGift(key);
                        }}
                        className={clsx(
                          styles.gift,
                          selectedGift === key && styles.selectedGift
                        )}
                      >
                        <img
                          src={gift.imgUrl}
                          alt={gift.name}
                          className={styles.giftImg}
                        />
                        <div className={styles.giftInfo}>
                          <span className={styles.giftName}>
                            {t(gift.translationKey, gift.name)}
                          </span>
                          <span className={styles.giftPrice}>
                            <SmallStarIcon
                              width={11}
                              height={10}
                            />{" "}
                            {gift.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.controlsContainer}>
                <SmallBtnWithArrow
                  value={user.starsBalance + ""}
                  onRechargeOpen={onRechargeOpen}
                />

                <div className={styles.amountContainer}>
                  {[1, 10, 99, 369, 999].map((a) => (
                    <button
                      key={a}
                      className={clsx(
                        styles.amountButton,
                        a === amount ? styles.selectedAmount : ""
                      )}
                      onClick={() => setAmount(a)}
                    >
                      {a}
                    </button>
                  ))}
                  <button
                    onClick={onGiftSend}
                    className={styles.sendButton}
                  >
                    {t("common.send")}
                  </button>
                </div>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </div>
  );
};

interface GiftItem {
  imgUrl: string;
  name: string;
  key: string;
  price: number;
  translationKey: string;
}

export const giftsItems: Record<string, GiftItem> = {
  Star: {
    imgUrl: Star.src,
    key: "Star",
    name: "Star",
    price: 1,
    translationKey: "gifts.star"
  },
  SingleRose: {
    imgUrl: SingleRose.src,
    name: "Single Rose",
    key: "SingleRose",
    price: 5,
    translationKey: "gifts.singleRose"
  },
  Heart: {
    imgUrl: Heart.src,
    name: "Heart",
    key: "Heart",
    price: 10,
    translationKey: "gifts.heart"
  },
  TeddyBear: {
    imgUrl: TeddyBear.src,
    name: "Teddy Bear",
    key: "TeddyBear",
    price: 25,
    translationKey: "gifts.teddyBear"
  },

  Trophy: {
    imgUrl: Trophy.src,
    name: "Trophy",
    key: "Trophy",
    price: 50,
    translationKey: "gifts.trophy"
  },
  Kiss: {
    imgUrl: Kiss.src,
    name: "Kiss",
    key: "Kiss",
    price: 100,
    translationKey: "gifts.kiss"
  },
  Microphone: {
    imgUrl: Microphone.src,
    name: "Microphone",
    key: "Microphone",
    price: 200,
    translationKey: "gifts.microphone"
  },
  Ring: {
    imgUrl: Ring.src,
    name: "Ring",
    key: "Ring",
    price: 369,
    translationKey: "gifts.ring"
  }
};

const sortedGiftsByPriceKeys = Object.keys(giftsItems)
  .filter((key) => giftsItems[key])
  .sort(
    (a, b) => giftsItems[a]!.price - giftsItems[b]!.price
  );

export const SmallBtnWithArrow = ({
  onRechargeOpen,
  text,
  style,
  icon = <SmallStarIcon />,
  value,
  showArrow = true
}: {
  onRechargeOpen: () => void;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  text?: string;
  value?: string;
  showArrow?: boolean;
}) => {
  return (
    <button
      style={style}
      onClick={() => {
        onRechargeOpen();
      }}
      className={styles.rechargeButton}
    >
      {icon}
      {value}
      {text ? <span>{text}</span> : null}
      {showArrow && (
        <svg
          width="6"
          height="8"
          viewBox="0 0 6 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.96967 0.46967C0.676777 0.762563 0.676777 1.23744 0.96967 1.53033L3.43934 4L0.96967 6.46967C0.676777 6.76256 0.676777 7.23744 0.96967 7.53033C1.26256 7.82322 1.73744 7.82322 2.03033 7.53033L5.03033 4.53033C5.32322 4.23744 5.32322 3.76256 5.03033 3.46967L2.03033 0.46967C1.73744 0.176777 1.26256 0.176777 0.96967 0.46967Z"
            fill="white"
          />
        </svg>
      )}
    </button>
  );
};
