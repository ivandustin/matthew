const package        = require('./../package.json')
const fs             = require('fs')
const path           = require('path')
const { JSDOM }      = require('jsdom')
const HTM_EXTENSION  = '.htm'
const JSON_EXTENSION = '.json'
const ROOT           = path.join(__dirname, '..')
const VAR            = path.join(ROOT, 'var')
const HTM            = path.join(VAR, 'htm')
const OUTPUT         = path.join(ROOT, package.name + JSON_EXTENSION)

function main() {
    let filenames = fs.readdirSync(HTM)
    let chapters  = filenames.map(filename => parse(path.join(HTM, filename)))
    chapters      = chapters.sort((a, b)=> a.chapter - b.chapter)
    save(chapters)
}

function parse(filepath) {
    let chapter  = parseInt(path.basename(filepath, HTM_EXTENSION))
    let dom      = new JSDOM(fs.readFileSync(filepath).toString())
    let document = dom.window.document
    let children = document.querySelector('.maintable2 > table .chap').children
    let groups   = []
    let group    = undefined

    for (let child of children) {
        if (child.className == 'hdg') {
            let title  = removeChildren(child).textContent.clean()
            let verses = []
            let length = groups.push({ title, verses })
            let index  = length - 1
            group      = groups[index]
        } else if (child.tagName == 'TABLE') {
            let verse  = parseInt(child.querySelector('.refmain').textContent)
            let words  = []
            let tables = child.querySelectorAll('table')

            for (let table of tables) {
                let original        = table.querySelector('.greek').textContent.clean()
                let transliteration = table.querySelector('.translit').textContent.clean()
                let translation     = table.querySelector('.eng').textContent.clean()
                let punctuation     = table.querySelector('.punct') ? table.querySelector('.punct').textContent.clean() : ''

                words.push({ original, transliteration, translation, punctuation })
            }

            group.verses.push({ verse, words })
        }
    }

    return { chapter, groups }
}

function save(chapters) {
    let content = JSON.stringify(chapters, null, 4)
    fs.writeFileSync(OUTPUT, content)
}

String.prototype.clean = function() {
    return this.replace(/\s/g, ' ').trim()
}

function removeChildren(element) {
    Array.from(element.children).forEach((child)=> element.removeChild(child))
    return element
}

main()
