import { DatabaseService } from './database.service';
import { of } from 'rxjs';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let firestoreMock: any;
  let authServiceMock: any;
  let storageServiceMock: any;
  let mockDoc: any;
  let mockCollection: any;

  beforeEach(() => {
    mockDoc = {
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
      get: jasmine.createSpy('get').and.returnValue(of({
        data: () => ({ categories: [] }),
        ref: { update: jasmine.createSpy('refUpdate').and.returnValue(Promise.resolve()) }
      })),
      ref: { id: 'cat1' }
    };

    mockCollection = {
      doc: jasmine.createSpy('doc').and.returnValue(mockDoc),
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
      ref: {
        where: jasmine.createSpy('where').and.returnValue({
          where: jasmine.createSpy('where').and.returnValue({
            get: jasmine.createSpy('get').and.returnValue(Promise.resolve({ docs: [] }))
          })
        })
      }
    };

    firestoreMock = {
      collection: jasmine.createSpy('collection').and.returnValue(mockCollection)
    };

    authServiceMock = {
      loggedInUserId: 'user123',
      logout$: of()
    };

    storageServiceMock = {
      removeImage: jasmine.createSpy('removeImage').and.returnValue(Promise.resolve())
    };

    service = new DatabaseService(firestoreMock, authServiceMock, storageServiceMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize categories$ and recipes$ collections', () => {
    expect(firestoreMock.collection).toHaveBeenCalledTimes(2);
  });

  describe('getCategories', () => {
    it('should return an observable from firestore collection', () => {
      service.getCategories().subscribe(categories => {
        expect(categories).toEqual([]);
      });
      expect(firestoreMock.collection).toHaveBeenCalled();
    });
  });

  describe('getRecipes', () => {
    it('should return an observable from firestore collection', () => {
      service.getRecipes().subscribe(recipes => {
        expect(recipes).toEqual([]);
      });
    });
  });

  describe('editCategory', () => {
    it('should call update with name and color', async () => {
      await service.editCategory({ id: 'cat1', name: 'Updated', color: '#fff' });

      expect(mockCollection.doc).toHaveBeenCalledWith('cat1');
      expect(mockDoc.update).toHaveBeenCalledWith({ name: 'Updated', color: '#fff' });
    });

    it('should return the category id', async () => {
      const result = await service.editCategory({ id: 'cat1', name: 'Test', color: '#000' });
      expect(result).toBe('cat1');
    });
  });

  describe('editRecipe', () => {
    it('should call update on the recipe doc', async () => {
      const recipe = { title: 'Pasta' } as any;
      await service.editRecipe('r1', recipe);

      expect(mockCollection.doc).toHaveBeenCalledWith('r1');
      expect(mockDoc.update).toHaveBeenCalledWith({ title: 'Pasta' });
    });
  });

  describe('editRecipeImage', () => {
    it('should update only the image field', async () => {
      await service.editRecipeImage('r1', 'https://img.url');

      expect(mockDoc.update).toHaveBeenCalledWith({ image: 'https://img.url' });
    });
  });

  describe('addCategory', () => {
    it('should set category with uid from auth service', async () => {
      const category = { name: 'Desserts', color: '#f00' } as any;
      await service.addCategory('cat-new', category);

      expect(mockCollection.doc).toHaveBeenCalledWith('cat-new');
      expect(mockDoc.set).toHaveBeenCalledWith({
        name: 'Desserts',
        color: '#f00',
        uid: 'user123'
      });
    });
  });

  describe('addRecipe', () => {
    it('should set recipe with uid from auth service', async () => {
      const recipe = { title: 'Cake' } as any;
      await service.addRecipe('r-new', recipe);

      expect(mockCollection.doc).toHaveBeenCalledWith('r-new');
      expect(mockDoc.set).toHaveBeenCalledWith({
        title: 'Cake',
        uid: 'user123'
      });
    });
  });

  describe('deleteRecipe', () => {
    it('should remove image and delete document', async () => {
      await service.deleteRecipe('r1', 'https://img.url');

      expect(storageServiceMock.removeImage).toHaveBeenCalledWith('https://img.url');
      expect(mockDoc.delete).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete the category document', async () => {
      await service.deleteCategory('cat1');

      expect(mockDoc.delete).toHaveBeenCalled();
    });
  });

  describe('getCategoryRef', () => {
    it('should return a document reference', () => {
      const ref = service.getCategoryRef('cat1');

      expect(mockCollection.doc).toHaveBeenCalledWith('cat1');
      expect(ref).toBeDefined();
    });
  });
});
