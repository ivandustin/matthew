const fs             = require('fs')
const path           = require('path')
const JSON_EXTENSION = '.json'
const ROOT           = path.join(__dirname, '..')
const VAR            = path.join(ROOT, 'var')
const INPUT          = path.join(VAR, 'chapters' + JSON_EXTENSION)
const OUTPUT         = path.join(VAR, 'chapters-clean' + JSON_EXTENSION)
const SPECIAL        = ['»', '⇔', '*']

function main() {
    let content  = fs.readFileSync(INPUT).toString()
    let chapters = JSON.parse(content)
    chapters.forEach(function(chapter) {
        chapter.groups.forEach(function(group) {
            group.title = clean(group.title.replace('(', ' ('))
            group.verses.forEach(function(verse) {
                verse.words.forEach(function(word) {
                    word.phoneme     = clean(word.phoneme)
                    word.original    = clean(word.original)
                    word.translation = clean(word.translation)
                    word.punctuation = clean(word.punctuation)
                })
            })
        })
    })
    chapters = chapters.sort((a, b)=> a.chapter - b.chapter)
    save(chapters)
}

function clean(str) {
    str = str.replace(/\s/g, ' ').trim()
    SPECIAL.forEach((c)=> str.replace(c, ''))
    return str
}

function save(chapters) {
    let content = JSON.stringify(chapters, null, 4)
    fs.writeFileSync(OUTPUT, content)
}

main()
