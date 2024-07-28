class PageHeader extends HTMLElement {
    constructor() {
        super()
        this.innerHTML =
           `<div class="flex flex-col lg:flex-row items-center justify-normal w-full p-2 pt-4 gap-4 lg:justify-between">
                <a href="/">
                    <img class="w-16 h-16 md:h-24 md:w-24" src="../assets/personalLogo.svg" />
                </a>
                <nav-bar size="btn-sm" />
            </div>`

    }
}

customElements.define("page-header", PageHeader)