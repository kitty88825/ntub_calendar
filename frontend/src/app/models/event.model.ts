export interface Event {
  id?: number;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
  calendars: number[];
  attachments?: File;
  attribute: string;
  participants?: [];
}
