import { Octokit } from "octokit";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import dotenv from "dotenv";

// Cargar variables de entorno del archivo .env
dotenv.config();

const OWNER = "JBorrsad";
const PUBLIC_IMAGES_DIR = "public/projects";
const PUBLIC_ICONS_DIR = "public/icons"; // Nueva carpeta para iconos

// Mapa para corregir nombres que no coinciden con Simple Icons
const ICON_ALIASES: Record<string, string> = {
	"c#": "csharp",
	".net": "dotnet",
	"c++": "cplusplus",
	"vue": "vueDotjs",
	"maps": "googlemaps",
	"react": "react",
	"react native": "react",
	"nextjs": "nextdotjs",
	"next.js": "nextdotjs",
	"spring boot": "spring",
	"spring": "spring",
	"tailwind": "tailwindcss",
	"tailwind css": "tailwindcss"
};

// Verifica que el token esté configurado
const TOKEN = process.env.GH_READ_TOKEN || process.env.PORTFOLIO_READ_TOKEN || process.env.GH_TOKEN;
if (!TOKEN) {
    console.warn("⚠️  GH_READ_TOKEN no está configurado. Solo se pueden acceder a repositorios públicos.");
    console.warn("   Para acceder a repositorios privados, configura la variable de entorno GH_READ_TOKEN");
}

const octo = new Octokit({ auth: TOKEN });

interface ProjectMeta {
    title?: string;
    description?: string;
    short?: string; // Formato viejo: descripción corta
    website?: string;
    homepage?: string; // Formato viejo: URL del proyecto
    coverImage?: string; // Formato nuevo: ruta a la imagen
    cover?: string; // Formato viejo: nombre del archivo en .portfolio/
    tags?: string[];
}

interface ProjectTag {
	name: string;
	iconPath: string;
	slug: string;
}

interface Project {
    repo: string;
    title: string;
    description: string;
    website: string;
    coverImage?: string;
    tags: ProjectTag[];
    stars: number;
    lastCommitDate: string;
    lastCommitDateFormatted: string;
    repoUrl: string;
}

async function getFileText(owner: string, repo: string, filePath: string, ref: string): Promise<string | null> {
    try {
        const { data } = await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path: filePath,
            ref
        });

        if ("download_url" in data && data.download_url) {
            const res = await fetch(data.download_url);
            const buffer = await res.arrayBuffer();
            // Intentar decodificar como UTF-8, con fallback
            const decoder = new TextDecoder('utf-8', { fatal: false });
            return decoder.decode(buffer);
        }
    } catch (error) {
        return null;
    }
    return null;
}

async function getProjectMeta(owner: string, repo: string, ref: string): Promise<ProjectMeta | null> {
    // Intenta descargar meta.json, meta.yml, meta.yaml en ese orden
    const metaPaths = [".portfolio/meta.json", ".portfolio/meta.yml", ".portfolio/meta.yaml"];

    for (const metaPath of metaPaths) {
        const content = await getFileText(owner, repo, metaPath, ref);
        if (content) {
            try {
                if (metaPath.endsWith(".json")) {
                    return JSON.parse(content) as ProjectMeta;
                } else {
                    return yaml.load(content) as ProjectMeta;
                }
            } catch (error) {
                console.warn(`   ⚠️  Error parseando ${metaPath}: ${error}`);
            }
        }
    }

    return null;
}

// --- NUEVA FUNCIÓN: Descargar Icono desde Simple Icons ---
async function ensureIconExists(tagName: string): Promise<string> {
	// 1. Normalizar nombre (ej: "Spring Boot" -> "springboot")
	let slug = tagName.toLowerCase().replace(/[\s\.]/g, '').replace(/[#]/g, 'sharp');
	
	// 2. Aplicar alias manuales si existen
	const tagLower = tagName.toLowerCase();
	if (ICON_ALIASES[tagLower]) {
		slug = ICON_ALIASES[tagLower];
	}
	
	const fileName = `${slug}.svg`;
	const localPath = path.join(PUBLIC_ICONS_DIR, fileName);
	const publicUrl = `/icons/${fileName}`;
	
	// Si ya existe, no lo descargamos de nuevo
	try {
		await fs.access(localPath);
		return publicUrl;
	} catch {
		// No existe, intentamos descargarlo
	}
	
	console.log(`   ⬇️  Buscando icono para: ${tagName} (${slug})...`);
	
	try {
		// Intentamos descargar desde Simple Icons CDN
		// Usamos el CDN que devuelve SVG directamente
		const res = await fetch(`https://cdn.simpleicons.org/${slug}`);
		if (res.ok) {
			const contentType = res.headers.get('content-type');
			if (contentType?.includes('svg') || contentType?.includes('image')) {
				const svgContent = await res.text();
				// Verificar que el contenido sea SVG válido
				if (svgContent.trim().startsWith('<svg') || svgContent.trim().startsWith('<?xml')) {
					await fs.writeFile(localPath, svgContent, 'utf8');
					console.log(`   ✅ Icono descargado: ${fileName}`);
					return publicUrl;
				}
			}
		}
		// Si falla el CDN, intentar la API directa de Simple Icons
		const res2 = await fetch(`https://simpleicons.org/icons/${slug}.svg`);
		if (res2.ok) {
			const svgContent = await res2.text();
			if (svgContent.trim().startsWith('<svg') || svgContent.trim().startsWith('<?xml')) {
				await fs.writeFile(localPath, svgContent, 'utf8');
				console.log(`   ✅ Icono descargado (API directa): ${fileName}`);
				return publicUrl;
			}
		}
		console.warn(`   ⚠️  No se encontró icono para "${tagName}" en Simple Icons (slug: ${slug})`);
		return ""; 
	} catch (e) {
		console.error(`   ❌ Error descargando icono ${slug}:`, e instanceof Error ? e.message : e);
		return "";
	}
}

async function downloadImage(owner: string, repo: string, filePath: string, destPath: string, ref: string): Promise<boolean> {
    try {
        console.log(`   📥 Descargando imagen: ${filePath}`);

        const { data } = await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo,
            path: filePath,
            ref
        });

        if ("download_url" in data && data.download_url) {
            // Usar el token para autenticación al descargar la imagen
            const headers: HeadersInit = {};
            if (TOKEN) {
                headers['Authorization'] = `token ${TOKEN}`;
            }

            const res = await fetch(data.download_url, { headers });

            if (!res.ok) {
                console.warn(`   ⚠️  Error descargando imagen: ${res.status} ${res.statusText}`);
                return false;
            }

            const buffer = await res.arrayBuffer();
            await fs.writeFile(destPath, Buffer.from(buffer));
            console.log(`   ✅ Imagen guardada en: ${destPath}`);
            return true;
        }
    } catch (error) {
        console.warn(`   ⚠️  Error descargando imagen:`, error);
        return false;
    }
    return false;
}

async function main() {
    console.log("🔍 Buscando repositorios de GitHub...");
    console.log(`👤 Usuario: ${OWNER}`);

    // Crear carpetas necesarias
    await fs.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });
    await fs.mkdir(PUBLIC_ICONS_DIR, { recursive: true });
    console.log(`📁 Carpeta de imágenes lista: ${PUBLIC_IMAGES_DIR}`);
    console.log(`📁 Carpeta de iconos lista: ${PUBLIC_ICONS_DIR}`);

    // Buscar automáticamente TODOS los repositorios con .portfolio
    let targetRepos: string[] = [];

    console.log("🔍 Buscando automáticamente todos los repositorios con carpeta .portfolio...");

    try {
        const repos = await octo.request("GET /user/repos", {
            per_page: 100,
            sort: "updated",
            affiliation: "owner" // Solo repos propios (incluye públicos y privados)
        });

        // Filtrar los que contengan .portfolio
        for (const r of repos.data) {
            if (r.default_branch) {
                const meta = await getProjectMeta(OWNER, r.name, r.default_branch);
                if (meta) {
                    targetRepos.push(`${OWNER}/${r.name}`);
                    console.log(`   ✅ Encontrado: ${OWNER}/${r.name}`);
                }
            }
        }
        console.log(`\n📦 Total: ${targetRepos.length} repositorios con .portfolio`);
    } catch (error) {
        console.error("❌ Error al buscar repositorios:", error);
        throw error;
    }

    const projects: Project[] = [];

    for (const repoFullName of targetRepos) {
        const [owner, repo] = repoFullName.split("/");
        console.log(`\n🔎 Revisando repositorio: ${repoFullName}`);

        // Obtener información del repositorio
        let repoData;
        try {
            const { data } = await octo.request("GET /repos/{owner}/{repo}", {
                owner,
                repo
            });
            repoData = data;
        } catch (error) {
            console.warn(`   ⚠️  Error obteniendo datos del repositorio: ${error}`);
            continue;
        }

        const defaultBranch = repoData.default_branch;

        // Intenta cargar meta desde .portfolio
        const meta = await getProjectMeta(owner, repo, defaultBranch);

        if (!meta) {
            console.log(`   ⏭️  No tiene archivos .portfolio/meta.*`);
            continue;
        }

        console.log(`   ✅ Encontrado metadata de .portfolio`);

        // Obtener la fecha del último commit de forma precisa
        let lastCommitDate = repoData.pushed_at;
        try {
            const { data: commits } = await octo.request("GET /repos/{owner}/{repo}/commits", {
                owner,
                repo,
                sha: defaultBranch,
                per_page: 1,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (commits.length > 0) {
                // Usar author.date que es la fecha original del commit
                // (committer.date puede cambiar en rebases/merges)
                const commitDate = commits[0].commit.author?.date || commits[0].commit.committer?.date;
                if (commitDate) {
                    lastCommitDate = commitDate;
                    const formattedDate = new Date(commitDate).toLocaleString('es-ES', {
                        timeZone: 'Europe/Madrid',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    console.log(`   📅 Último commit: ${formattedDate} (${commits[0].sha.substring(0, 7)})`);
                }
            }
        } catch (error) {
            console.warn(`   ⚠️  Error obteniendo commits:`, error instanceof Error ? error.message : error);
            console.warn(`   ℹ️  Usando pushed_at como fallback: ${repoData.pushed_at}`);
        }

        // Resolver website con prioridad (compatible con formato viejo y nuevo)
        const website = meta.website || meta.homepage || repoData.homepage || repoData.html_url;

        // Resolver descripción (compatible con formato viejo y nuevo)
        const description = meta.description || meta.short || repoData.description || "";

        // Procesar Tags e Iconos automáticamente
        const rawTags: string[] = meta.tags || [];
        const processedTags: ProjectTag[] = [];

        for (const tag of rawTags) {
            const iconPath = await ensureIconExists(tag);
            processedTags.push({
                name: tag,
                slug: tag.toLowerCase().replace(/[\s\.]/g, '').replace(/[#]/g, 'sharp'),
                iconPath: iconPath
            });
        }

        // Resolver coverImage (compatible con formato viejo y nuevo)
        let coverImage: string | undefined = undefined;
        let imagePath = meta.coverImage || (meta.cover ? `.portfolio/${meta.cover}` : null);

        if (imagePath) {
            // Verificar si es URL absoluta
            if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                coverImage = imagePath;
            } else {
                // Es ruta relativa, asegurarse de que tenga el prefijo .portfolio/
                if (!imagePath.startsWith(".portfolio/")) {
                    imagePath = `.portfolio/${imagePath}`;
                }

                // Descargar la imagen
                const coverFileName = path.basename(imagePath);
                const ext = path.extname(coverFileName);
                const localImageName = `${repo}${ext}`;
                const localImagePath = path.join(PUBLIC_IMAGES_DIR, localImageName);

                const imageDownloaded = await downloadImage(owner, repo, imagePath, localImagePath, defaultBranch);

                if (imageDownloaded) {
                    coverImage = `/projects/${localImageName}`;
                    console.log(`   🖼️  Imagen descargada: ${localImageName}`);
                } else {
                    // Fallback a URL raw de GitHub
                    coverImage = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${imagePath}`;
                    console.log(`   🔗 Usando URL remota para imagen`);
                }
            }
        }

        // Formatear la fecha con zona horaria de Madrid
        const formattedDate = new Date(lastCommitDate).toLocaleString('es-ES', {
            timeZone: 'Europe/Madrid',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ' •');

        const project: Project = {
            repo: repoFullName,
            title: meta.title || repoData.name,
            description,
            website,
            coverImage,
            tags: processedTags, // Usamos los tags procesados con iconos
            stars: repoData.stargazers_count,
            lastCommitDate,
            lastCommitDateFormatted: formattedDate,
            repoUrl: repoData.html_url
        };

        projects.push(project);
        console.log(`✅ Proyecto añadido: ${project.title}`);
    }

    // Ordenar descendente por lastCommitDate
    projects.sort((a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime());

    // Crea la carpeta src/data si no existe
    await fs.mkdir("src/data", { recursive: true });

    // Guarda el JSON con salida determinista
    await fs.writeFile(
        "src/data/projects.generated.json",
        JSON.stringify(projects, null, 2),
        "utf8"
    );

    console.log(`\n🎉 Generados ${projects.length} proyectos en src/data/projects.generated.json`);
}

main().catch((error) => {
    console.error("❌ Error al obtener proyectos:", error);
    process.exit(1);
});

