import { TestBed } from '@angular/core/testing';

import { RecipeImageService } from './recipe-image.service';

describe('RecipeImageService', () => {
  let service: RecipeImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
