export const bookingLeadTimeHours = 48;

export function getBookingCutoff(now = new Date()) {
  // Round up to a minute because the booking form accepts minute precision.
  return new Date(Math.ceil(now.getTime() / 60000) * 60000 + bookingLeadTimeHours * 60 * 60 * 1000);
}

export function getEarliestBookingDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(getBookingCutoff(now));
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatBookingCutoff(now = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(getBookingCutoff(now));
}
