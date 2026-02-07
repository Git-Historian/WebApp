import type { TimelineData } from "./types";

export function transformData(data: TimelineData, minGap = 5): TimelineData {
  let previousIndex = 0;

  return data.map((item, index) => {
    if (index !== 0) {
      const previousYear = data[index - 1].year;
      const currentYear = item.year;

      const yearDifference = currentYear - previousYear;
      if (yearDifference >= minGap) {
        item.degree = previousIndex + yearDifference;
      } else {
        item.degree = previousIndex + minGap + yearDifference;
      }
    } else {
      item.degree = 0;
    }

    previousIndex = item.degree;
    return item;
  });
}
