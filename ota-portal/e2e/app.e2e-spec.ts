import { OtaPortalPage } from './app.po';

describe('ota-portal App', () => {
  let page: OtaPortalPage;

  beforeEach(() => {
    page = new OtaPortalPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
