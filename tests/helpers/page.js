const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return browser[property] || customPage[property] || page[property] ;
            }
        })
    }
    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();

        const {session: sessionString, sig} = sessionFactory(user);

        await this.page.setCookie({name: 'session', value: sessionString});
        await this.page.setCookie({name: 'session.sig', value: sig});

        await this.page.goto('http://127.0.0.1:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentOf(selector){
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        }, path);
    }

    post(path, body) {
        return this.page.evaluate((_path, _body) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_body)
            }).then(res => res.json());
        }, path, body);
    }
}

module.exports = CustomPage;