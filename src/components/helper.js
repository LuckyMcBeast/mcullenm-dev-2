export function attrTextContent(name, htmlElement) {
    return htmlElement.attributes.getNamedItem(name).textContent
}