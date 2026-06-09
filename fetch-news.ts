import fs from 'fs';
import https from 'https';

function fetchAPI(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function stripHtml(html: string) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '-').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');
}

async function run() {
    console.log('Fetching WP API posts directly...');
    let page = 1;
    let allPosts: any[] = [];
    while (true) {
        const u = `https://barilgaexpo.mn/wp-json/wp/v2/posts?per_page=100&_embed=true&page=${page}`;
        console.log(u);
        try {
            const posts = await fetchAPI(u);
            if (!posts || posts.length === 0 || posts.code === 'rest_post_invalid_page_number') break;
            allPosts = allPosts.concat(posts);
            page++;
        } catch (e) {
            console.error(e);
            break;
        }
    }
    
    console.log(`Found ${allPosts.length} posts from API.`);
    const data = [];
    let id = 1;

    for (const post of allPosts) {
        const dateObj = new Date(post.date);
        const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;
        
        // Try to get featured image
        let imageUrl = '';
        if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            imageUrl = post._embedded['wp:featuredmedia'][0].source_url || '';
        }

        const title = stripHtml(post.title.rendered);
        const excerpt = stripHtml(post.excerpt.rendered);
        let contentHtml = post.content.rendered;
        
        // remove tags but keep paragraphs separated by double newline
        let content = contentHtml.replace(/<\/p>/g, '\n\n').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&#8211;/g, '-').replace(/&#160;/g, ' ')
           .split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0).join('\n\n');

        data.push({
            id: id++,
            title: title,
            description: excerpt || content.substring(0, 150) + '...',
            content: content,
            date: dateStr,
            image: imageUrl,
            link: post.link,
        });
    }

    if (!fs.existsSync('src/data')) {
        fs.mkdirSync('src/data', { recursive: true });
    }

    const fileContent = `export const newsItems = ${JSON.stringify(data, null, 2)};`;
    fs.writeFileSync('src/data/newsItems.ts', fileContent);
    console.log(`Done writing src/data/newsItems.ts! Got ${data.length} items.`);
}
run();
