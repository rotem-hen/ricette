import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should start with no toasts', () => {
    expect(service.toasts.length).toBe(0);
  });

  it('should add a toast', () => {
    service.show('Hello', { classname: 'bg-success' });
    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0].textOrTpl).toBe('Hello');
    expect(service.toasts[0].classname).toBe('bg-success');
  });

  it('should not add a second toast while one exists', () => {
    service.show('First');
    service.show('Second');
    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0].textOrTpl).toBe('First');
  });

  it('should allow adding after remove', () => {
    service.show('First');
    service.remove(service.toasts[0]);
    service.show('Second');
    expect(service.toasts.length).toBe(1);
    expect(service.toasts[0].textOrTpl).toBe('Second');
  });

  it('should remove a specific toast', () => {
    service.show('Toast1');
    const toast = service.toasts[0];
    service.remove(toast);
    expect(service.toasts.length).toBe(0);
  });

  it('should removeAll toasts', () => {
    service.show('Toast1');
    service.removeAll();
    expect(service.toasts.length).toBe(0);
  });
});
