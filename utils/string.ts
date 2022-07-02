export function diffStrings(string: string, compareString: string): string {
  const oldStringArray = string.split("");
  const compareStringArray = compareString.split("");

  const newStringArr = oldStringArray.reduce((sum, pixel, index) => {
    const prevVal = sum[sum.length - 1];
    const mirror = compareStringArray[index];

    if (mirror === pixel) {
      if (prevVal && typeof prevVal === "number") {
        return [...sum.slice(0, sum.length - 1), prevVal + 1];
      } else if (prevVal && prevVal === "-") {
        return [...sum, 2];
      } else {
        return [...sum, "-"];
      }
    } else {
      return [...sum, pixel];
    }
  }, [] as (string | number)[]);

  return newStringArr.join("");
}

// export function undiffStrings(string: string, compareString?: string): string {
//     if (!compareString) {
//         return string;
//     }

//     const oldStringArray = string.split("");
//     const compareStringArray = compareString.split("");

//     const newStringArr = oldStringArray.reduce((sum, pixel, index) => {
//         const nextVal = sum[sum.length + 1];
//         const mirror = compareStringArray[index];

//         if (pixel === "-") {

//         if (mirror === pixel) {
//           if (prevVal && typeof prevVal === "number") {
//             return [...sum.slice(0, sum.length - 1), prevVal + 1];
//           } else if (prevVal && prevVal === "-") {
//             return [...sum, 2];
//           } else {
//             return [...sum, "-"];
//           }
//         } else {
//           return [...sum, pixel];
//         }
//       }, [] as (string | number)[]);

//       return newStringArr.join("");
// }
