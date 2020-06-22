/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*

Refactored from https://github.com/sveinn-steinarsson/flot-downsample/blob/master/jquery.flot.downsample.js
Copyright (c) 2020 by Donovan Adams

 * The MIT License
Copyright (c) 2013 by Sveinn Steinarsson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

export const largestTriangleThreeBuckets = (
	data: any,
	threshold: number,
): any => {
	const dataLength = data.length;
	if (threshold >= dataLength || threshold === 0) {
		return data; // Nothing to do
	}

	const sampled: any = [];
	let sampledIndex = 0;

	// Bucket size. Leave room for start and end data points
	const every = (dataLength - 2) / (threshold - 2);

	let a = 0; // Initially a is the first point in the triangle
	let maxAreaPoint: number[] = [];
	let maxArea;
	let area;
	let nextA = 0;

	sampled[sampledIndex += 1] = data[a]; // Always add the first point

	for (let i = 0; i < threshold - 2; i += 1) {
		// Calculate point average for next bucket (containing c)
		let avgX = 0;
		let avgY = 0;
		let avgRangeStart = Math.floor((i + 1) * every) + 1;
		let avgRangeEnd = Math.floor((i + 2) * every) + 1;

		avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

		const avgRangeLength = avgRangeEnd - avgRangeStart;

		for (; avgRangeStart < avgRangeEnd; avgRangeStart += 1) {
			avgX += data[avgRangeStart][0] * 1; // * 1 enforces Number (value may be Date)
			avgY += data[avgRangeStart][1] * 1;
		}
		avgX /= avgRangeLength;
		avgY /= avgRangeLength;

		// Get the range for this bucket
		let rangeOffs = Math.floor((i + 0) * every) + 1;
		const rangeTo = Math.floor((i + 1) * every) + 1;

		// Point a
		const pointAX = data[a][0] * 1; // enforce Number (value may be Date)
		const pointAY = data[a][1] * 1;

		area = -1;
		maxArea = area;

		for (; rangeOffs < rangeTo; rangeOffs += 1) {
			// Calculate triangle area over three buckets
			area = Math.abs((pointAX - avgX) * (data[rangeOffs][1] - pointAY)
				- (pointAX - data[rangeOffs][0]) * (avgY - pointAY)) * 0.5;
			if (area > maxArea) {
				maxArea = area;
				maxAreaPoint = data[rangeOffs];
				nextA = rangeOffs; // Next a is this b
			}
		}

		sampled[sampledIndex += 1] = maxAreaPoint; // Pick this point from the bucket
		a = nextA; // This a is the next a (chosen b)
	}

	sampled[sampledIndex += 1] = data[dataLength - 1]; // Always add last

	return sampled;
};

export const reduceValues = (
	arr: Float32Array,
	val: number,
	threshold: number,
): Float32Array => arr.map((item) => Math.ceil((item * val) / threshold));

export const downSampleArray = (array: Float32Array, newLength: number): Float32Array => {
	if (newLength >= array.length) {
		return array.slice();
	}
	const factor = array.length / (array.length - newLength);
	return array.filter((e, i) => Math.floor(i % factor));
};

export default {
	largestTriangleThreeBuckets,
	reduceValues,
	downSampleArray,
};
