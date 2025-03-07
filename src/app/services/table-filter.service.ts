import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoletaFilterService {
  private filterSource = new Subject<any>();
  filter$ = this.filterSource.asObservable();

  setFilter(filter: any) {
    this.filterSource.next(filter);
  }
}
