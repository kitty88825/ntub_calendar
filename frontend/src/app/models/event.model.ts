export interface Event {
  id?: number;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
  calendars_id: number;
  calendars: [{
    color: string;
    description?: string,
    display: string,
    id?: number,
    name: string,
    permissions: [{
      authority: string,
      group: number,
      groupName: string,
      id?: number,
      role: string
    }]
  }];
  attachments?: File;
  attribute: string;
  participants?: [];
}
