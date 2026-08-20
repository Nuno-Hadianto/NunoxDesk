const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.vue'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const editRegex = /<button\s+([^>]*@click="edit[^>]*)[^>]*>(?:<span[^>]*>✏️<\/span>\s*|✏️\s*|)(Edit)<\/button>/g;
  if (editRegex.test(content)) {
    content = content.replace(editRegex, '<button $1 style="display: inline-flex; align-items: center; gap: 6px;"><Edit :size="14" /> $2</button>');
    changed = true;
  }

  const deleteRegex = /<button\s+([^>]*@click="delete[^>]*)[^>]*>(?:<span[^>]*>🗑️<\/span>\s*|🗑️\s*|)(Hapus)<\/button>/g;
  if (deleteRegex.test(content)) {
    content = content.replace(deleteRegex, '<button $1 style="display: inline-flex; align-items: center; gap: 6px;"><Trash2 :size="14" /> $2</button>');
    changed = true;
  }

  // Add Lucide imports if changed
  if (changed) {
    const importMatch = content.match(/import \{([^}]+)\} from 'lucide-vue-next'/);
    let neededImports = ['Edit', 'Trash2'];

    if (importMatch) {
      let existing = importMatch[1].split(',').map(s => s.trim());
      for (const imp of neededImports) {
        if (!existing.includes(imp)) {
          existing.push(imp);
        }
      }
      content = content.replace(importMatch[0], `import { ${existing.join(', ')} } from 'lucide-vue-next'`);
    } else {
      // Need to add import
      if (content.includes('<script setup')) {
        content = content.replace(/<script setup[^>]*>/, `$&
import { ${neededImports.join(', ')} } from 'lucide-vue-next'`);
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
}
