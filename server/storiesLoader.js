const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { v4: uuid } = require('uuid');
const db = require('./db');

function loadMarkdownStories(){
  const dir = path.join(__dirname,'stories');
  if(!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.md'));
  const insert = db.prepare('INSERT OR IGNORE INTO stories (id,slug,title,excerpt,content_md) VALUES (?,?,?,?,?)');
  for(const file of files){
    const raw = fs.readFileSync(path.join(dir,file),'utf8');
    const parsed = matter(raw);
    const slug = file.replace(/\.md$/,'');
    const title = parsed.data.title || slug;
    const excerpt = parsed.data.excerpt || parsed.content.slice(0,140);
    insert.run(uuid(), slug, title, excerpt, raw);
  }
}

module.exports = { loadMarkdownStories };
