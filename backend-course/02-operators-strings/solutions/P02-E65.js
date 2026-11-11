const ratingsSumInput = " 431 ";
const ratingsCountInput = "97";
const average = Number(ratingsSumInput) / Number(ratingsCountInput);
const stars = Math.round(average);
console.log(`ממוצע: ${average.toFixed(1)}`);
console.log(`כוכבים: ${stars}`);
console.log("".padStart(stars, "★"));
