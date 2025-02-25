import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { useIsVisible } from "@/lib/hooks/useIsVisible";

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  ignoreError?: boolean;
}

export default function ImageWithFallback({
  fallback,
  src,
  className,
  ignoreError,
  ...props
}: Props) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [display, setDisplay] = useState("none");
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgContRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsVisible(imgContRef);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  useEffect(() => {
    if (isVisible && !loaded) {
      preloadImage();
    }
  }, [imgSrc, isVisible]);

  const onImgLoad = () => {
    setLoaded(true);
    setDisplay("block");
  };

  const onImgLoadError = () => {
    setLoaded(true);
    setDisplay("none");
    setError(true);
  };

  const preloadImage = () => {
    if (!imgSrc) {
      setError(true);
      return
    };
    const img = new Image();
    img.src = imgSrc;
    img.onload = onImgLoad;
    img.onerror = onImgLoadError;
  };

  return (
    <div
      ref={imgContRef}
      className={className}
      style={{
        backgroundImage: error || ignoreError ? `url(${fallback})` : undefined,
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      <img
        src={loaded ? imgSrc : undefined}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          ...props.style,
          display,
        }}
        {...props}
        alt={props.alt || ""}
        draggable={false}
      />
    </div>
  );
}
