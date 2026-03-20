import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    service = new SearchService();
  });

  it('should be created with empty search term', () => {
    expect(service.searchTerm).toBe('');
  });

  it('should update searchTerm when setSearchTerm is called', () => {
    service.setSearchTerm('pasta');
    expect(service.searchTerm).toBe('pasta');
  });

  it('should emit on searchTermChange', () => {
    const values: string[] = [];
    service.searchTermChange.subscribe(v => values.push(v));

    service.setSearchTerm('cake');
    service.setSearchTerm('pie');

    expect(values).toEqual(['cake', 'pie']);
  });

  it('should update searchTerm to latest value', () => {
    service.setSearchTerm('first');
    service.setSearchTerm('second');
    expect(service.searchTerm).toBe('second');
  });
});
