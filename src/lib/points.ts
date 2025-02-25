export function formatNumber(num: number, digits = 2): string {
  const numFloat = parseFloat(num + "");
  const magnitude = Math.floor(Math.log10(numFloat) / 3);

  let formattedNum = numFloat.toFixed(digits);

  if (magnitude > 0) {
    formattedNum = (numFloat / 1000 ** magnitude).toFixed(digits);
  }

  if (digits > 0) {
    formattedNum = formattedNum.replace(/\.0+$/, "");
  }

  if (magnitude === 1) {
    return formattedNum + "K";
  } else if (magnitude === 2) {
    return formattedNum + "M";
  } else if (magnitude === 3) {
    return formattedNum + "B";
  } else if (magnitude === 4) {
    return formattedNum + "T";
  } else if (magnitude > 4) {
    return formattedNum + "e" + magnitude * 3;
  } else {
    if (isNaN(Number(formattedNum))) {
      return "0";
    }
    return formattedNum.toString();
  }
}

export const formatBigNumber = (num: number, digits = 2): string => {
  if (num < 1e7) return num.toFixed(digits).toString();
  if (num < 1e9) return (num / 1e6).toFixed(digits) + "M";
  if (num < 1e12) return (num / 1e9).toFixed(digits) + "B";
  return (num / 1e12).toFixed(digits) + "T";
};
