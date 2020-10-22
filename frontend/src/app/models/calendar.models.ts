import { NumberValueAccessor } from '@angular/forms';

export interface Calendar {
  id?: number;
  name: string;
  display: string;
  description?: string;
  color: string;
  permission: [{
    anthority: string;
    group: NumberValueAccessor;
    groupName: string;
    id?: number;
    role: string;
  }]
}
