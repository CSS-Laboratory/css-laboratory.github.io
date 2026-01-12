/**
 * Content Build Script for CSS Laboratory Website
 *
 * Scans the content/ directory, parses Markdown files with YAML frontmatter,
 * and generates JSON index files in _generated/
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const OUTPUT_DIR = path.join(ROOT_DIR, '_generated');

// Collection configurations
const COLLECTIONS = {
  news: {
    pattern: 'news/*.md',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  blog: {
    pattern: 'blog/*.md',
    sortBy: 'date',
    sortOrder: 'desc'
  },
  publications: {
    pattern: 'publications/*.md',
    sortBy: 'year',
    sortOrder: 'desc'
  },
  members: {
    pattern: 'members/**/*.md',
    groupBy: 'category',
    categoryOrder: ['faculty', 'postdocs', 'graduate', 'undergraduate', 'collaborators', 'others'],
    sortBy: 'order'
  },
  resources: {
    pattern: 'resources/**/*.md',
    groupBy: 'type'
  },
  research: {
    pattern: 'research/*.md',
    sortBy: 'order',
    sortOrder: 'asc'
  },
  homepage: {
    pattern: 'homepage/*.md',
    sortBy: 'order',
    sortOrder: 'asc'
  }
};

/**
 * Parse a single Markdown file with frontmatter
 */
function parseMarkdownFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);

    // Skip drafts
    if (frontmatter.draft === true) {
      return null;
    }

    // Infer category from path for members
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const pathParts = relativePath.split(path.sep);
    if (pathParts[0] === 'members' && pathParts.length > 2) {
      frontmatter.category = frontmatter.category || pathParts[1];
    }

    // Infer type from path for resources
    if (pathParts[0] === 'resources' && pathParts.length > 2) {
      frontmatter.type = frontmatter.type || pathParts[1];
      // Normalize type names
      if (frontmatter.type === 'datasets') frontmatter.type = 'dataset';
      if (frontmatter.type === 'tools') frontmatter.type = 'tool';
    }

    return {
      ...frontmatter,
      content: content.trim() || undefined,
      _sourceFile: relativePath
    };
  } catch (error) {
    console.error(`  Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Sort items by specified field
 */
function sortItems(items, sortBy, sortOrder = 'asc') {
  return items.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle date sorting
    if (sortBy === 'date') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    // Handle numeric sorting
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    }

    // Handle string/default sorting
    const comparison = String(aVal || '').localeCompare(String(bVal || ''));
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

/**
 * Process a collection of content files
 */
async function processCollection(name, config) {
  const pattern = path.join(CONTENT_DIR, config.pattern);
  const files = await glob(pattern);

  if (files.length === 0) {
    console.log(`  No files found for ${name}`);
    return config.groupBy ? {} : [];
  }

  let items = files
    .map(file => parseMarkdownFile(file))
    .filter(item => item !== null);

  // Sort items
  if (config.sortBy) {
    items = sortItems(items, config.sortBy, config.sortOrder);
  }

  // Group items if specified
  if (config.groupBy) {
    const grouped = {};

    // Initialize groups in order if categoryOrder is specified
    if (config.categoryOrder) {
      config.categoryOrder.forEach(cat => {
        grouped[cat] = [];
      });
    }

    items.forEach(item => {
      const group = item[config.groupBy] || 'other';
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(item);
    });

    // Sort within each group if needed
    if (config.sortBy) {
      Object.keys(grouped).forEach(group => {
        grouped[group] = sortItems(grouped[group], config.sortBy, config.sortOrder);
      });
    }

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) delete grouped[key];
    });

    return grouped;
  }

  return items;
}

/**
 * Main build function
 */
async function build() {
  console.log('Building content...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No content/ directory found. Creating empty JSON files...\n');
    for (const name of Object.keys(COLLECTIONS)) {
      const outputPath = path.join(OUTPUT_DIR, `${name}.json`);
      fs.writeFileSync(outputPath, '[]', 'utf-8');
    }
    console.log('Build complete (no content to process).');
    return;
  }

  // Process each collection
  for (const [name, config] of Object.entries(COLLECTIONS)) {
    console.log(`Processing ${name}...`);

    try {
      const data = await processCollection(name, config);
      const outputPath = path.join(OUTPUT_DIR, `${name}.json`);

      fs.writeFileSync(
        outputPath,
        JSON.stringify(data, null, 2),
        'utf-8'
      );

      const count = Array.isArray(data)
        ? data.length
        : Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`  -> ${name}.json (${count} items)\n`);
    } catch (error) {
      console.error(`  Error processing ${name}:`, error.message, '\n');
    }
  }

  console.log('Build complete!');
}

// Run build
build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
