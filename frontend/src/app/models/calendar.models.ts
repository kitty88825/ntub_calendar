export interface Calendar {
  id?: number;
  name: string;
  display: string;
  description?: string;
  color: string;
  permissions: [{
    authority: string;
    group: [];
    groupName: string;
    id?: number;
    role: string;
  }];
}
