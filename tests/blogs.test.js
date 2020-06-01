const Page = require('./helpers/page');

let page;

beforeEach(async () => {  
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close();
});


describe('When logged in', async () => {
  beforeEach(async () => {  
    await page.login();
    await page.click('a.btn-floating');
  });

  test.only('can see blog create from', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title')
  });

  describe('And using valid inputs', async () => {
    beforeEach(async () => {  
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My content');
      await page.click('form button');
    });

    test('Submitting takes the use to the review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries')
    });

    test('Submitting then saving adds blog to index screen', async () => {
      await page.click('button.green');
      await this.page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My title')
      expect(content).toEqual('My content')
    });

  });
  describe('And using invalid inputs', async () => {
    beforeEach(async () => {  
      await page.click('form button');
    });

    test('the test form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  })
});


describe('When not logged in', async () => {

  const actions = [
    {
      path: '/api/blog',
      method: 'post',
      data: { title: 'My title', content: 'My content'},
    },

    {
      path: '/api/blog',
      method: 'get',
    }
  ];

  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(execRequests);
    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!'});
    }
  });
});