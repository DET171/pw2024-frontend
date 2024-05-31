/**
 * round.ts
 * Function to round a number to a specified precision
 * @param {number} num - the number to round
 * @param {number} [precision=2] - the number of decimal places to round to
 * @returns number
*/
export const round = (num: number, precision: number = 2) => {
	return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision);
};