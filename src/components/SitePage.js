const template = document.createElement("template")
template.innerHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
        rel="stylesheet" />
    <link rel="stylesheet" href="../style/style.css" />
    <link rel="stylesheet" href="../style/blog.css" />
    <body class="h-screen lg:mx-36 my-5">
        <div class="grid justify-items-center">
            <div class="grid w-full max-w-screen-lg">
                <page-header/>
            </div>
            <div class="divider divider-secondary w-full max-w-screen-lg"></div>
            <slot name="content"></slot>
        </div>
    </body>
`


class SitePage extends HTMLElement {
    constructor() {
        super()
        const shadow = this.attachShadow({mode: "open"})
        shadow.append(template.content.cloneNode(true))
    }
}

customElements.define("site-page", SitePage)