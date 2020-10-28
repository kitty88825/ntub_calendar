import { NumberValueAccessor } from '@angular/forms';

export interface Calendar {
  id?: number;
  name: string;
  display: string;
  description?: string;
  color: string;
  permissions: [{
    authority: string;
    group: NumberValueAccessor;
    groupName: string;
    id?: number;
    role: string;
  }]
}
