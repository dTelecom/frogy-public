import React, { useEffect, useState } from "react";
import styles from "./GiftsButton.module.scss";
import { useTranslation } from "react-i18next";
import { Sheet } from "react-modal-sheet";
import CloseIcon from "/src/assets/icons/close.svg";
import TeddyBear from "/src/assets/img/gifts/TeddyBear.webp";
import Heart from "/src/assets/img/gifts/Heart.webp";
import Kiss from "/src/assets/img/gifts/Kiss.webp";
import Microphone from "/src/assets/img/gifts/Microphone.webp";
import Ring from "/src/assets/img/gifts/Ring.webp";
import SingleRose from "/src/assets/img/gifts/SingleRose.webp";
import Star from "/src/assets/img/gifts/Star.webp";
import Trophy from "/src/assets/img/gifts/Trophy.webp";
import SmallStarIcon from "/src/assets/icons/smallStarIcon.svg";
import { clsx } from "clsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { userApi } from "@/api";
import { UserResponse } from "@/api/user";
import { getUser } from "@/store/features/userSlice";
import { toast } from "react-toastify";
import { Toast } from "@/components/Toast/Toast";
import { formatNumber } from "@/lib/points";

interface GiftsDrawerProps {
  onClose: () => void;
  onRechargeOpen: () => void;
  streamerId: UserResponse["id"];
}

const GiftsDrawer = ({
  onClose,
  onRechargeOpen,
  streamerId
}: GiftsDrawerProps) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [selectedGift, setSelectedGift] = useState<GiftItemType>("SingleRose");
  const [amount, setAmount] = useState(1);
  const dispatch = useAppDispatch();

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
    if (user.starsBalance < giftsItems[selectedGift].price * amount) {
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
                            {/*@ts-ignore*/}
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

interface RechargeDrawerProps {
  onClose: () => void;
}

const rechargeAmounts = [50, 100, 250, 500, 1000, 2500, 10000, 35000];

export const RechargeDrawer = ({ onClose }: RechargeDrawerProps) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const [selectedAmount, setSelectedAmount] = useState(250);
  const dispatch = useAppDispatch();


  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const onRecharge = async () => {
    await userApi.purchase(selectedAmount);
    dispatch(getUser());
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

              <h2 className={styles.title}>{t("common.recharge")}</h2>

              <div className={styles.balances}>
                <div className={styles.balance}>
                  <span>{t("recharge.balanceStars")}</span>
                  <div>
                    <SmallStarIcon />
                    {user.starsBalance}
                  </div>
                </div>
              </div>

              <div className={styles.giftsContainer}>
                {rechargeAmounts.map(
                  (key) => {
                    const formattedAmount = key
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    const selected = selectedAmount === key;
                    return (
                      <div
                        key={key}
                        className={styles.giftWrapper}
                      >
                        <div
                          onClick={() => {
                            setSelectedAmount(key);

                          }}
                          className={clsx(
                            styles.gift,
                            selected && styles.selectedGift
                          )}
                        >
                          <div className={styles.rechargeStar}>
                            <SmallStarIcon />
                          </div>
                          <div className={styles.rechargeInfo}>
                            <span className={styles.giftName}>
                              {formattedAmount}
                            </span>
                            <span className={styles.giftPrice}>
                             {formatNumber(key, 1)}
                              &nbsp;
                              {t("recharge.tgStars")}
                            </span>
                          </div>
                          {selected && (
                            <svg
                              className={styles.selectedRechargeIcon}
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M0 0H18V18H5C2.23857 18 0 15.7614 0 13V0Z"
                                fill="#72E655"
                              />
                              <rect
                                width="12"
                                height="12"
                                transform="translate(3 3)"
                                fill="#72E655"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12.4749 5.41955C12.7955 5.68185 12.8428 6.15437 12.5805 6.47495L8.38399 11.604C7.95983 12.1224 7.20241 12.2143 6.66654 11.8124L5.05 10.6C4.71863 10.3515 4.65147 9.88139 4.9 9.55002C5.14853 9.21865 5.61863 9.15149 5.95 9.40002L7.37481 10.4686L11.4195 5.52509C11.6818 5.20451 12.1543 5.15726 12.4749 5.41955Z"
                                fill="#19191E"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className={styles.divider}></div>

              <div className={styles.controlsContainer}>
                <div className={styles.rechargeTotal}>
                  <div className={styles.rechargeTotalFirst}>
                    <SmallStarIcon />
                    {(
                      (selectedAmount) + ""
                    ).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </div>
                  <div className={styles.subtext}>
                    <span className={styles.greenText}>
                      {t("common.total")}:&nbsp;
                    </span>
                    {(selectedAmount) +
                      " " +
                      (t("recharge.telegramStars"))}
                  </div>
                </div>

                <button
                  onClick={onRecharge}
                  className={styles.rechargeConfirmButton}
                >
                  {t("common.rechargeButton")}
                </button>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </div>
  );
};
type GiftItemType = "Star" | "SingleRose" | "Heart" | "TeddyBear" | "Trophy" | "Kiss" | "Microphone" | "Ring";
export const giftsItems: Record<GiftItemType, any> = {
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

const sortedGiftsByPriceKeys = (Object.keys(giftsItems) as GiftItemType[]).sort(
  (a, b) => giftsItems[a].price - giftsItems[b].price
) as GiftItemType[];

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
