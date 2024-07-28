import { attrTextContent } from "./helper.js"

class BlogItem extends HTMLElement {
    constructor() {
        super()
        this.innerHTML = `
            <a href=${attrTextContent("href", this)}>
                    <li class="flex flex-col-reverse md:flex-row md:gap-4 justify-between">
                        <p class="text-primary">${attrTextContent("date", this)}</p>
                        <p class="md:text-right text-warning">
                            ${this.innerText}
                        </p>
                    </li>
                </a>
        `
    }
}

customElements.define("blog-item", BlogItem)