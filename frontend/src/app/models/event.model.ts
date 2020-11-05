export interface Event {
  id?: number;
  title: string;
  startAt: string;
  endAt: string;
  description?: string;
  location?: string;
  natrue: string;
  main_calendar_id: number;
  invite_calendars_id: [];
  eventinvitecalendarSet: [{
    calendar: {
      id: number,
      name: string,
      description: string,
      display: string,
      color: string,
      permissions: [{
        id: number,
        group: number,
        group_name: string,
        role: string,
        anthority: string
      }]
    },
    mainCalendar: {
      id: number,
      name: string,
      description: string,
      display: string,
      color: string,
      permissions: [{
        id: number,
        group: number,
        group_name: string,
        role: string,
        anthority: string
      }]
    },
    response: string
  }];
  eventparticipantSet: [{
    user: string,
    role: string,
    response: string
  }];
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
