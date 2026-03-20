import { EditModeService } from './edit-mode.service';

describe('EditModeService', () => {
  let service: EditModeService;

  beforeEach(() => {
    service = new EditModeService();
  });

  it('should be created with editMode off', () => {
    expect(service.isEditMode).toBeFalse();
  });

  it('should toggle edit mode on', () => {
    service.toggleEditMode(true);
    expect(service.isEditMode).toBeTrue();
  });

  it('should toggle edit mode off', () => {
    service.toggleEditMode(true);
    service.toggleEditMode(false);
    expect(service.isEditMode).toBeFalse();
  });

  it('should toggle without argument (flip)', () => {
    service.toggleEditMode();
    expect(service.isEditMode).toBeTrue();
    service.toggleEditMode();
    expect(service.isEditMode).toBeFalse();
  });

  it('should emit on editModeChange subject', () => {
    const values: boolean[] = [];
    service.editModeChange.subscribe(v => values.push(v));

    service.toggleEditMode(true);
    service.toggleEditMode(false);
    service.toggleEditMode();

    expect(values).toEqual([true, false, true]);
  });
});
