// @ts-nocheck

function importAll(r) {
  const images = {};
  r.keys().map((item) => {
    images[item.replace("./", "/")] = r(item);
  });
  return images;
}

const images = importAll(require.context("./", false, /\.(webp|jpe?g|gif)$/));

// preview images preload disabled
// const previewImages = importAll(
//   require.context("./intro", false, /\.(webp|jpe?g|gif)$/)
// );

const preloadImageWithPromise = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

export const preloadMultipleImages = async () => {
  // if (process.env.NODE_ENV === "development") return;

  const imagesArray = Object.values(images);
  let array = [...new Set(imagesArray)];

  // preview images preload disabled
  // if (!localStorage.getItem("showIntro")) {
  //   const previewImagesArray = Object.values(previewImages);
  //   array.push(...previewImagesArray);
  // }

  array = array.filter((item) => item.includes && !item.includes("data:image"));

  try {
    await Promise.all(array.map((src) => preloadImageWithPromise(src)));
    console.log("All images have been preloaded");
  } catch (error) {
    console.error("An error occurred while preloading images", error);
  }
};
