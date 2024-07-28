import { attrTextContent } from "./helper.js"

class NavBar extends HTMLElement {
    constructor() {
        super()
        this.innerHTML = `
            <nav class="font-monospace join join-horizontal">
                <a href="/blog" class="btn btn-info ${attrTextContent("size", this)} join-item">blog</a>
                <!-- <a href="#" class="btn ${attrTextContent("size", this)} btn-info join-item">videos</a>
                <a href="#" class="btn ${attrTextContent("size", this)} btn-info join-item">software</a> -->
                <a href="mailto:cullen.mcclellan@mcullenm.dev" class="btn ${attrTextContent("size", this)} btn-error join-item">contact</a>
            </nav>
        `
    }
}

customElements.define("nav-bar", NavBar)