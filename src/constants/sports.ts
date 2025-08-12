export const SPORTS = [
  'Baseball',
  'Basketball',
  'Football',
  'Soccer',
  'Lacrosse',
  'Hockey',
  'Tennis',
  'Golf',
  'Track & Field',
  'Cross Country',
  'Swimming',
  'Wrestling',
  'Volleyball',
  'Softball',
  'Field Hockey',
  'Water Polo',
  'Gymnastics',
  'Cheerleading',
  'Dance',
  'Other'
] as const;

export type Sport = typeof SPORTS[number]; 