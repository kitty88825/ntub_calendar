export interface Event {
  id?: number;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
  main_calendar_id: number;
  invite_calendars_id?: [];
  attachments?: File;
  attribute: string;
  participants?: [];
}
