import { Octokit } from "octokit";
import fs from "node:fs/promises";
import path from "node:path";

const OWNER = "JBorrsad";
const BRANCH = "main";
const PUBLIC_IMAGES_DIR = "public/projects";

// Verifica que el token esté configurado
if (!process.env.GH_TOKEN) {
	console.warn("⚠️  GH_TOKEN no está configurado. Solo se pueden acceder a repositorios públicos.");
	console.warn("   Para acceder a repositorios privados, configura la variable de entorno GH_TOKEN");
}

const octo = new Octokit({ auth: process.env.GH_TOKEN });

interface ProjectMeta {
    publish: boolean;
    title: string;
    short: string;
    cover: string;
    order: number;
    tags: string[];
    readmePath?: string;
}

interface Project {
    slug: string;
    title: string;
    description: string;
    tags: string[];
    order: number;
    repoUrl: string;
    homepage: string | null;
    cover: string;
    readme: string | null;
    pushedAt: string | null;
}

async function getFileText(owner: string, repo: string, path: string): Promise<string | null> {
	try {
		const { data } = await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
			owner,
			repo,
			path,
			ref: BRANCH
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

async function downloadImage(owner: string, repo: string, filePath: string, destPath: string): Promise<boolean> {
	try {
		console.log(`   📥 Descargando imagen: ${filePath}`);
		
		const { data } = await octo.request("GET /repos/{owner}/{repo}/contents/{path}", {
			owner,
			repo,
			path: filePath,
			ref: BRANCH
		});

		if ("download_url" in data && data.download_url) {
			// Usar el token para autenticación al descargar la imagen
			const headers: HeadersInit = {};
			if (process.env.GH_TOKEN) {
				headers['Authorization'] = `token ${process.env.GH_TOKEN}`;
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

	// Crear carpeta para imágenes si no existe
	await fs.mkdir(PUBLIC_IMAGES_DIR, { recursive: true });
	console.log(`📁 Carpeta de imágenes lista: ${PUBLIC_IMAGES_DIR}`);

	// Usar /user/repos en lugar de /users/{username}/repos para obtener TODOS los repos (incluyendo privados)
	const repos = await octo.request("GET /user/repos", {
		per_page: 100,
		sort: "updated",
		affiliation: "owner" // Solo repos propios (incluye públicos y privados)
	});

	console.log(`📦 Total de repositorios encontrados: ${repos.data.length}`);

	const projects: Project[] = [];

	for (const r of repos.data) {
		const repo = r.name;
		console.log(`\n🔎 Revisando repositorio: ${repo}`);

		// Intenta cargar meta.json desde la carpeta .portfolio
		const metaRaw = await getFileText(OWNER, repo, ".portfolio/meta.json");

		if (!metaRaw) {
			console.log(`   ⏭️  No tiene .portfolio/meta.json`);
			continue; // Si no existe, ignoramos este repo
		}

		console.log(`   ✅ Encontrado .portfolio/meta.json`);

		let meta: ProjectMeta;
		try {
			meta = JSON.parse(metaRaw);
		} catch (error) {
			console.warn(`⚠️  Error parseando meta.json en ${repo}:`, error);
			continue;
		}

		// Si publish es false, no lo incluimos
		if (!meta.publish) {
			console.log(`⏭️  Proyecto ${repo} marcado como no publicado, omitiendo...`);
			continue;
		}

		// Descargar la imagen de portada
		const coverFileName = meta.cover || "cover.jpg";
		const coverPath = `.portfolio/${coverFileName}`;
		const ext = path.extname(coverFileName);
		const localImageName = `${repo}${ext}`;
		const localImagePath = path.join(PUBLIC_IMAGES_DIR, localImageName);

		const imageDownloaded = await downloadImage(OWNER, repo, coverPath, localImagePath);
		
		// Si la imagen se descargó, usar ruta local; si no, usar URL de GitHub como fallback
		const coverUrl = imageDownloaded 
			? `/projects/${localImageName}`
			: `https://raw.githubusercontent.com/${OWNER}/${repo}/${BRANCH}/.portfolio/${coverFileName}`;

		// Lee el README si se especificó
		const readmePath = meta.readmePath || "README.md";
		const readme = await getFileText(OWNER, repo, readmePath);

		projects.push({
			slug: repo,
			title: meta.title || repo,
			description: meta.short || r.description || "",
			tags: meta.tags || [],
			order: meta.order ?? 999,
			repoUrl: r.html_url,
			homepage: r.homepage,
			cover: coverUrl,
			readme,
			pushedAt: r.pushed_at
		});

		console.log(`✅ Proyecto añadido: ${meta.title}`);
	}

	// Ordena según el campo order
	projects.sort((a, b) => a.order - b.order);

	// Crea la carpeta src/data si no existe
	await fs.mkdir("src/data", { recursive: true });

	// Guarda el JSON
	await fs.writeFile(
		"src/data/projects.json",
		JSON.stringify(projects, null, 2),
		"utf8"
	);

	console.log(`\n🎉 Generados ${projects.length} proyectos en src/data/projects.json`);
}

main().catch((error) => {
	console.error("❌ Error al obtener proyectos:", error);
	process.exit(1);
});

