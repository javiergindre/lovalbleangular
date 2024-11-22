
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';

export class LookupDataManager<T> {
  selectedItem: T | null = null;
  items: T[] = [];
  loading = false;
  searchTerm = '';
  totalElements = 0;
  pageSize = 10;
  currentPage = 1;

  private searchSubject = new Subject<string>();
  private filterSubject = new BehaviorSubject<string | null>(null);

  search$ = this.searchSubject.asObservable().pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor(
    private fetchFn: (page: number, pageSize: number, searchTerm: string, filter: string | null) => Observable<{ data: T[], total: number }>
  ) {
    this.search$.pipe(
      switchMap(term => this.fetch(1, this.pageSize, term, this.filterSubject.value))
    ).subscribe();

    this.filterSubject.pipe(
      switchMap(filter => this.fetch(1, this.pageSize, this.searchTerm, filter))
    ).subscribe();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.items = [];
    this.searchSubject.next(term);
  }

  onScrollToEnd() {
    if (!this.loading) {
      this.currentPage += 1;
      this.fetch(this.currentPage, this.pageSize, this.searchTerm, this.filterSubject.value).subscribe();
    }
  }

  updateFilter(filter: string | null) {
    this.filterSubject.next(filter);
    this.currentPage = 1;
    this.items = [];
  }

  private fetch(page: number, pageSize: number, searchTerm: string, filter: string | null): Observable<{ data: T[], total: number }> {
    this.loading = true;
    return this.fetchFn(page, pageSize, searchTerm, filter).pipe(
      tap(result => {
        if (page === 1) {
          this.items = result.data;
        } else {
          this.items = [...this.items, ...result.data];
        }
        this.totalElements = result.total;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Error fetching data:', error);
        this.loading = false;
        throw error;
      })
    );
  }

  reset() {
    this.selectedItem = null;
    this.items = [];
    this.totalElements = 0;
    this.currentPage = 1;
    this.searchTerm = '';
    this.filterSubject.next(null);
  }
}