const { JSDOM }      = require('jsdom')
const fs             = require('fs')
const path           = require('path')
const HTM_EXTENSION  = '.htm'
const JSON_EXTENSION = '.json'
const ROOT           = path.join(__dirname, '..')
const VAR            = path.join(ROOT, 'var')
const HTM            = path.join(VAR, 'htm')
const OUTPUT         = path.join(VAR, 'chapters' + JSON_EXTENSION)

function main() {
    let filenames = fs.readdirSync(HTM)
    let chapters  = filenames.map(filename => parse(path.join(HTM, filename)))
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
            let title  = child.textContent
            let verses = []
            let length = groups.push({ title, verses })
            let index  = length - 1
            group      = groups[index]
        } else if (child.tagName == 'TABLE') {
            let verse  = parseInt(child.querySelector('.refmain').textContent)
            let words  = []
            let tables = child.querySelectorAll('table')

            for (let table of tables) {
                let phoneme     = table.querySelector('.translit').textContent
                let original    = table.querySelector('.greek').textContent
                let translation = table.querySelector('.eng').textContent
                let punctuation = table.querySelector('.punct') ? table.querySelector('.punct').textContent : ''

                words.push({ phoneme, original, translation, punctuation })
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

main()
