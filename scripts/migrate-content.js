/**
 * Migration Script for CSS Laboratory Website
 *
 * Converts existing Excel/CSV content to Markdown with YAML frontmatter.
 * Run once with: npm run migrate
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');

/**
 * Parse CSV text handling quoted fields
 */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  // Remove BOM if present
  if (lines[0].charCodeAt(0) === 0xFEFF) {
    lines[0] = lines[0].slice(1);
  }
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const row = {};
    const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    for (let j = 0; j < headers.length; j++) {
      if (values[j]) {
        let value = values[j].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        row[headers[j]] = value;
      }
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Convert a value to YAML-safe format
 */
function yamlValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  // Escape special characters
  const str = String(value);
  if (str.includes(':') || str.includes('#') || str.includes("'") || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return str;
}

/**
 * Generate YAML frontmatter from object
 */
function toFrontmatter(obj) {
  let yaml = '---\n';
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          // Handle array of objects (e.g., details with key/value)
          yaml += `  -\n`;
          for (const [k, v] of Object.entries(item)) {
            yaml += `    ${k}: ${yamlValue(v)}\n`;
          }
        } else {
          yaml += `  - ${yamlValue(item)}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${key}:\n`;
      for (const [k, v] of Object.entries(value)) {
        yaml += `  ${k}: ${yamlValue(v)}\n`;
      }
    } else {
      yaml += `${key}: ${yamlValue(value)}\n`;
    }
  }
  yaml += '---\n';
  return yaml;
}

/**
 * Create a safe filename from a string
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Parse various date formats into YYYY-MM-DD
 */
function parseDate(dateStr) {
  if (!dateStr) return '2025-01-01';
  const str = String(dateStr).trim();

  // Already in YYYY-MM-DD or YYYY/MM/DD format
  if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(str)) {
    return str.replace(/\//g, '-');
  }

  // Try "Month DD, YYYY" format (e.g., "April 10, 2025")
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];
  const match = str.match(/^(\w+)\s+(\d{1,2}),?\s*(\d{4})$/i);
  if (match) {
    const monthIndex = monthNames.indexOf(match[1].toLowerCase());
    if (monthIndex !== -1) {
      const month = String(monthIndex + 1).padStart(2, '0');
      const day = String(match[2]).padStart(2, '0');
      return `${match[3]}-${month}-${day}`;
    }
  }

  // Try Date parsing as fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '2025-01-01';
}

/**
 * Migrate blog posts from CSV
 */
function migrateBlog() {
  console.log('Migrating blog...');
  const csvPath = path.join(DATA_DIR, 'blog/blogInfo.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  No blog data found');
    return;
  }

  const text = fs.readFileSync(csvPath, 'utf-8');
  const posts = parseCSV(text);

  posts.forEach((post, index) => {
    if (!post.title) return;

    const date = post.date || '2025-01-01';
    const slug = slugify(post.title);
    const filename = `${date.replace(/\//g, '-')}-${slug}.md`;

    const frontmatter = {
      title: post.title,
      date: date.replace(/\//g, '-'),
      description: post.description,
      image: post.image,
      url: post.url,
      tags: post.tags ? post.tags.split(';').map(t => t.trim()) : []
    };

    const content = toFrontmatter(frontmatter);
    const outputPath = path.join(CONTENT_DIR, 'blog', filename);
    fs.writeFileSync(outputPath, content);
    console.log(`  Created: ${filename}`);
  });
}

/**
 * Migrate news from Excel
 */
function migrateNews() {
  console.log('Migrating news...');
  const xlsxPath = path.join(DATA_DIR, 'news/latest_news.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.log('  No news data found');
    return;
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: ['date', 'title', 'description', 'read_more_link'] });

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const item = data[i];
    if (!item.title || !item.title.trim()) continue;

    const date = parseDate(item.date);
    const slug = slugify(item.title);
    const filename = `${date}-${slug}.md`;

    const frontmatter = {
      title: item.title,
      date: date,
      description: item.description,
      read_more_link: item.read_more_link
    };

    const content = toFrontmatter(frontmatter);
    const outputPath = path.join(CONTENT_DIR, 'news', filename);
    fs.writeFileSync(outputPath, content);
    console.log(`  Created: ${filename}`);
  }
}

/**
 * Migrate publications from Excel
 */
function migratePublications() {
  console.log('Migrating publications...');
  const xlsxPath = path.join(DATA_DIR, 'research/paper_info.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.log('  No publications data found');
    return;
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  data.forEach((pub, index) => {
    if (!pub.title || !pub.title.trim()) return;

    const year = pub.year || '2024';
    const slug = slugify(pub.title);
    const filename = `${year}-${slug}.md`;

    const frontmatter = {
      title: pub.title,
      authors: pub.authors ? pub.authors.split(',').map(a => a.trim()) : [],
      journal: pub.journal,
      year: parseInt(year) || 2024,
      link: pub.link,
      research_area: pub.research_area
    };

    const content = toFrontmatter(frontmatter);
    const outputPath = path.join(CONTENT_DIR, 'publications', filename);
    fs.writeFileSync(outputPath, content);
    console.log(`  Created: ${filename}`);
  });
}

/**
 * Migrate research projects from Excel
 */
function migrateResearch() {
  console.log('Migrating research...');
  const xlsxPath = path.join(DATA_DIR, 'research/research_focus.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.log('  No research data found');
    return;
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: ['icon', 'title', 'description', 'anchor', 'detailed_description', 'team_members', 'tags', 'image_path', 'read_more_link']
  });

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const project = data[i];
    if (!project.title || !project.title.trim()) continue;

    const slug = slugify(project.title);
    const filename = `${String(i).padStart(2, '0')}-${slug}.md`;

    const frontmatter = {
      title: project.title,
      icon: project.icon,
      description: project.description,
      anchor: project.anchor,
      team_members: project.team_members ? project.team_members.split(';').map(m => m.trim()) : [],
      tags: project.tags ? project.tags.split(';').map(t => t.trim()) : [],
      image: project.image_path,
      read_more_link: project.read_more_link,
      order: i
    };

    // Use detailed_description as body content
    const body = project.detailed_description || '';
    const content = toFrontmatter(frontmatter) + '\n' + body;

    const outputPath = path.join(CONTENT_DIR, 'research', filename);
    fs.writeFileSync(outputPath, content);
    console.log(`  Created: ${filename}`);
  }
}

/**
 * Migrate resources (datasets and tools) from CSV
 */
function migrateResources() {
  console.log('Migrating resources...');
  const csvPath = path.join(DATA_DIR, 'resources/ResourceInfo.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  No resources data found');
    return;
  }

  const text = fs.readFileSync(csvPath, 'utf-8');
  const resources = parseCSV(text);

  resources.forEach((resource, index) => {
    if (!resource.name) return;

    const type = (resource.type || 'dataset').toLowerCase();
    const slug = slugify(resource.name);
    const filename = `${slug}.md`;
    const folder = type === 'tool' ? 'tools' : 'datasets';

    // Load details from card_info CSV if exists
    let details = [];
    if (resource.card_info && fs.existsSync(path.join(ROOT_DIR, resource.card_info))) {
      const detailText = fs.readFileSync(path.join(ROOT_DIR, resource.card_info), 'utf-8');
      const detailRows = parseCSV(detailText);
      details = detailRows.map(row => ({ key: row.key, value: row.value }));
    }

    const frontmatter = {
      name: resource.name,
      type: type,
      description: resource.description,
      link: resource.link,
      image: resource.image,
      details: details.length > 0 ? details : undefined
    };

    const content = toFrontmatter(frontmatter);
    const outputPath = path.join(CONTENT_DIR, 'resources', folder, filename);
    fs.writeFileSync(outputPath, content);
    console.log(`  Created: ${folder}/${filename}`);
  });
}

/**
 * Migrate members from Excel files
 */
function migrateMembers() {
  console.log('Migrating members...');
  const membersDir = path.join(DATA_DIR, 'members');
  if (!fs.existsSync(membersDir)) {
    console.log('  No members data found');
    return;
  }

  const categoryMap = {
    'Faculty.xlsx': 'faculty',
    'Postdocs.xlsx': 'postdocs',
    'Graduate_Students.xlsx': 'graduate',
    'Undergraduate_Students.xlsx': 'undergraduate',
    'Collaborators.xlsx': 'collaborators',
    'Others.xlsx': 'others'
  };

  const files = fs.readdirSync(membersDir);
  files.forEach(file => {
    if (!file.endsWith('.xlsx') || file.startsWith('~$')) return;

    const category = categoryMap[file] || 'others';
    const xlsxPath = path.join(membersDir, file);

    try {
      const workbook = XLSX.readFile(xlsxPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      data.forEach((member, index) => {
        const name = member.name || member.Name || member['Member Name'];
        if (!name || !name.trim()) return;

        const slug = slugify(name);
        const filename = `${slug}.md`;

        const frontmatter = {
          name: name,
          role: member.role || member.Role || member.Position || member.Title,
          bio: member.bio || member.Bio || member.Biography || member.Description,
          image: member.image || member.Image || member['Image Path'],
          email: member.email || member.Email,
          website: member.website || member.Website,
          twitter: member.twitter || member.Twitter,
          linkedin: member.linkedin || member.LinkedIn,
          github: member.github || member.GitHub,
          google_scholar: member.google_scholar || member['Google Scholar'],
          order: index + 1
        };

        const content = toFrontmatter(frontmatter);
        const outputPath = path.join(CONTENT_DIR, 'members', category, filename);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, content);
        console.log(`  Created: ${category}/${filename}`);
      });
    } catch (error) {
      console.log(`  Error reading ${file}: ${error.message}`);
    }
  });
}

/**
 * Migrate homepage about content
 */
function migrateHomepage() {
  console.log('Migrating homepage...');
  const xlsxPath = path.join(DATA_DIR, 'homepage/about.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.log('  No homepage data found');
    return;
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: ['text'] });

  // Skip header row and collect paragraphs
  const paragraphs = [];
  let title = '';
  for (let i = 1; i < data.length; i++) {
    if (!data[i] || !data[i].text || !data[i].text.trim()) break;
    if (i === 1) {
      title = data[i].text;
    } else {
      paragraphs.push(data[i].text);
    }
  }

  const frontmatter = {
    title: title,
    order: 1
  };

  const body = paragraphs.join('\n\n');
  const content = toFrontmatter(frontmatter) + '\n' + body;

  const outputPath = path.join(CONTENT_DIR, 'homepage', 'about.md');
  fs.writeFileSync(outputPath, content);
  console.log(`  Created: about.md`);
}

/**
 * Main migration function
 */
function migrate() {
  console.log('Starting content migration...\n');

  // Ensure content directories exist
  const dirs = [
    'content/news',
    'content/blog',
    'content/publications',
    'content/research',
    'content/resources/datasets',
    'content/resources/tools',
    'content/members/faculty',
    'content/members/postdocs',
    'content/members/graduate',
    'content/members/undergraduate',
    'content/members/collaborators',
    'content/members/others',
    'content/homepage'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Run migrations
  migrateBlog();
  migrateNews();
  migratePublications();
  migrateResearch();
  migrateResources();
  migrateMembers();
  migrateHomepage();

  console.log('\nMigration complete!');
  console.log('Run "npm run build" to generate JSON files.');
}

// Run migration
migrate();
