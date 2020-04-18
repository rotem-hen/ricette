import { RicettePage } from './app.po';

describe('my-recipes App', () => {
  let page: RicettePage;

  beforeEach(() => {
    page = new RicettePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
