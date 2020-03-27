const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://127.0.0.1:3000');
});

afterEach(async () => {
    await page.close()
});

describe('When logged in', () => {
    beforeEach(async ()=> {
       await page.login();
       await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const label = await page.getContentOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            const title = await page.getContentOf('.title .red-text');
            const content = await page.getContentOf('.content .red-text');

            expect(title).toEqual('You must provide a value');
            expect(content).toEqual('You must provide a value');
        })
    });

    describe('Using a valid inputs', () => {

        beforeEach(async () => {
            await page.type('.title input', 'My Test Title');
            await page.type('.content input', 'My Test Content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const titleForm = await page.getContentOf('form h5');
            expect(titleForm).toEqual('Please confirm your entries');
        });

        test('Submitting and saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentOf('.card-title');
            const content = await page.getContentOf('p');

            expect(title).toEqual('My Test Title');
            expect(content).toEqual('My Test Content');
        });
    })
});

describe('When user not logged in', () => {
    test('User connot post a new blog post', async () => {
        const result = await page.post('/api/blogs',{title: 'My Title', content: 'My Content'});
        expect(result).toEqual({error: 'You must log in!'})
    });

    test('User connot get the list of blogs', async () => {
        const result = await page.get('/api/blogs');
        expect(result).toEqual({error: 'You must log in!'})
    });

});