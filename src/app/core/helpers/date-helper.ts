export class DateHelper {
  // Converts UTC date (string or Date) to local Date object
  static utcToLocalDate(input: string | Date): Date {
    let date: Date;

    if (typeof input === 'string') {
      // Append 'Z' if not present to indicate UTC time
      const adjustedDateString = input.endsWith('Z') ? input : input + 'Z';
      date = new Date(Date.parse(adjustedDateString));
    } else {
      // If already a Date object, convert to local
      date = input;
    }

    return date;
  }

  // Converts UTC date (string or Date) to a local formatted string using default JS methods
  static utcToLocalString(input: string | Date): string {
    const date = this.utcToLocalDate(input);

    // Use toLocaleString() to get the formatted local string
    return date.toLocaleString();
  }

  static toShortDate(input: string | Date) : string{
    console.log(input);
    const date = this.utcToLocalDate(input);

    // Use toLocaleDateString() to get the short local date string
    console.log(date);
    return date.toLocaleDateString();

  }
}
