const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'src', 'views');
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.vue') && f !== 'Dashboard.vue' && f !== 'Login.vue');

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace search icon emoji
  if (content.includes('<span>🔍</span>') || content.includes('<span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5;">🔍</span>')) {
    content = content.replace(/<span[^>]*>🔍<\/span>/, '<Search class="search-icon" :size="18" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; color: var(--text-primary);" />');
    changed = true;
  }

  // Replace plus emoji in Add buttons
  if (content.includes('<span>➕</span>')) {
    content = content.replace(/<span>➕<\/span>/g, '<Plus :size="18" />');
    changed = true;
  }
  
  // Replace refresh emoji
  if (content.includes('<span>🔄</span>')) {
    content = content.replace(/<span>🔄<\/span>/g, '<RefreshCw :size="18" />');
    changed = true;
  }

  // Improve input style
  if (content.includes('class="search-input"')) {
    content = content.replace(/class="search-input"[^>]*>/, 'class="form-control" style="width: 100%; padding-left: 38px; border-radius: 20px;">');
    changed = true;
  }

  // Add Lucide imports if changed
  if (changed) {
    const importMatch = content.match(/import \{([^}]+)\} from 'lucide-vue-next'/);
    let neededImports = ['Search'];
    if (content.includes('<Plus ')) neededImports.push('Plus');
    if (content.includes('<RefreshCw ')) neededImports.push('RefreshCw');

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
